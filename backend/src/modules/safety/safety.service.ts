import { query, withTransaction } from '../../database/postgres';
import { RedFlagAlert, RedFlagSeverity, ProvenanceType } from '@medikiosk/shared-types';
import { AppError } from '../../middleware/errorHandler';
import { logger } from '../../middleware/logger';

export class SafetyService {
  public static async evaluateState(
    encounterId: string,
    patientId: string,
    facts: Array<{ field: string; value: unknown; sourceType: ProvenanceType }>
  ): Promise<RedFlagAlert[]> {
    const triggeredAlerts: RedFlagAlert[] = [];

    // Map known fields
    const factMap = new Map<string, unknown>();
    for (const f of facts) {
      factMap.set(f.field, f.value);
    }

    // 1. Check Chest Pain Severity Rule
    const isChestPain = factMap.get('chief_complaint.primary') === 'chest_pain' || factMap.has('symptom.chest_pain');
    const painSeverity = factMap.get('hpi.pain_severity');
    const isSeverePain = typeof painSeverity === 'number' ? painSeverity >= 7 : (typeof painSeverity === 'string' && parseInt(painSeverity, 10) >= 7);

    if (isChestPain && isSeverePain) {
      const alert = await this.triggerAlert({
        encounterId,
        patientId,
        ruleId: 'rf_chest_pain_severe',
        severity: RedFlagSeverity.CRITICAL_EMERGENCY,
        alertMessage: 'Potential emergency symptoms detected. Patient reports severe acute chest discomfort (Score >= 7). Please alert clinical triage immediately.',
        triggerFacts: facts.filter(f => f.field.includes('chest') || f.field.includes('severity')),
      });
      triggeredAlerts.push(alert);
    }

    return triggeredAlerts;
  }

  public static async triggerAlert(data: {
    encounterId: string;
    patientId: string;
    ruleId: string;
    severity: RedFlagSeverity;
    alertMessage: string;
    triggerFacts: Array<{ field: string; value: unknown; sourceType: ProvenanceType }>;
  }): Promise<RedFlagAlert> {
    return await withTransaction(async (client) => {
      // Check if alert already created for this rule on this encounter
      const existing = await client.query(
        'SELECT id FROM red_flag_events WHERE encounter_id = $1 AND rule_id = $2',
        [data.encounterId, data.ruleId]
      );

      if (existing.rows.length > 0) {
        const row = existing.rows[0];
        return {
          id: row.id,
          encounterId: data.encounterId,
          patientId: data.patientId,
          ruleId: data.ruleId,
          severity: data.severity,
          alertMessage: data.alertMessage,
          triggerFacts: data.triggerFacts,
          isAcknowledged: false,
          createdAt: new Date().toISOString(),
        };
      }

      const res = await client.query(
        `INSERT INTO red_flag_events (
           encounter_id, patient_id, rule_id, severity, alert_message, trigger_facts
         ) VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, encounter_id, patient_id, rule_id, severity, alert_message,
                   trigger_facts, is_acknowledged, acknowledged_by_user_id,
                   acknowledged_at, created_at`,
        [
          data.encounterId,
          data.patientId,
          data.ruleId,
          data.severity,
          data.alertMessage,
          JSON.stringify(data.triggerFacts),
        ]
      );

      const alertRow = res.rows[0];
      logger.warn(`🚨 RED FLAG TRIGGERED: ${data.ruleId} for Encounter ${data.encounterId}`, {
        severity: data.severity,
        message: data.alertMessage,
      });

      // Audit Log
      await client.query(
        `INSERT INTO audit_logs (
           action, patient_id, encounter_id, payload
         ) VALUES ($1, $2, $3, $4)`,
        [
          'TRIGGER_RED_FLAG',
          data.patientId,
          data.encounterId,
          JSON.stringify({
            ruleId: data.ruleId,
            severity: data.severity,
            alertId: alertRow.id,
          }),
        ]
      );

      return this.mapRowToAlert(alertRow);
    });
  }

  public static async listAlerts(isAcknowledged?: boolean): Promise<any[]> {
    let sql = `
      SELECT rf.id, rf.encounter_id, rf.patient_id, rf.rule_id, rf.severity, rf.alert_message,
             rf.trigger_facts, rf.is_acknowledged, rf.acknowledged_by_user_id,
             rf.acknowledged_at, rf.created_at,
             p.full_name AS "patientName", p.gender AS "patientGender", p.abha_id AS "patientAbha",
             e.department, e.chief_complaint_summary AS "chiefComplaint"
      FROM red_flag_events rf
      LEFT JOIN patients p ON rf.patient_id = p.id
      LEFT JOIN encounters e ON rf.encounter_id = e.id
    `;
    const params: unknown[] = [];

    if (typeof isAcknowledged === 'boolean') {
      sql += ' WHERE rf.is_acknowledged = $1';
      params.push(isAcknowledged);
    }

    sql += ' ORDER BY rf.created_at DESC LIMIT 50';

    const res = await query(sql, params);
    return res.rows.map((r) => this.mapRowToAlert(r));
  }

  public static async acknowledgeAlert(alertId: string, userId?: string): Promise<any> {
    const res = await query(
      `UPDATE red_flag_events
       SET is_acknowledged = TRUE,
           acknowledged_by_user_id = $1,
           acknowledged_at = NOW()
       WHERE id = $2
       RETURNING id, encounter_id, patient_id, rule_id, severity, alert_message,
                 trigger_facts, is_acknowledged, acknowledged_by_user_id,
                 acknowledged_at, created_at`,
      [userId || null, alertId]
    );

    if (res.rows.length === 0) {
      throw new AppError(`Alert not found with id ${alertId}`, 404, 'ALERT_NOT_FOUND');
    }

    return this.mapRowToAlert(res.rows[0]);
  }

  private static mapRowToAlert(r: any): any {
    return {
      id: r.id,
      encounterId: r.encounter_id,
      patientId: r.patient_id,
      patientName: r.patientName || 'Emergency Patient',
      patientGender: r.patientGender || 'MALE',
      patientAbha: r.patientAbha || 'N/A',
      department: r.department || 'Cardiology',
      ruleId: r.rule_id,
      severity: r.severity as RedFlagSeverity,
      alertMessage: r.alert_message,
      triggerFacts: typeof r.trigger_facts === 'string' ? JSON.parse(r.trigger_facts) : r.trigger_facts,
      isAcknowledged: r.is_acknowledged,
      status: r.is_acknowledged ? 'ACKNOWLEDGED' : 'ACTIVE',
      acknowledgedByUserId: r.acknowledged_by_user_id,
      acknowledgedAt: r.acknowledged_at ? (r.acknowledged_at instanceof Date ? r.acknowledged_at.toISOString() : r.acknowledged_at) : undefined,
      createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : r.created_at,
    };
  }
}
