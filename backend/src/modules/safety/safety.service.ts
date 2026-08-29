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

  public static async listAlerts(isAcknowledged?: boolean): Promise<RedFlagAlert[]> {
    let sql = `
      SELECT id, encounter_id, patient_id, rule_id, severity, alert_message,
             trigger_facts, is_acknowledged, acknowledged_by_user_id,
             acknowledged_at, created_at
      FROM red_flag_events
    `;
    const params: unknown[] = [];

    if (typeof isAcknowledged === 'boolean') {
      sql += ' WHERE is_acknowledged = $1';
      params.push(isAcknowledged);
    }

    sql += ' ORDER BY created_at DESC LIMIT 50';

    const res = await query(sql, params);
    return res.rows.map(this.mapRowToAlert);
  }

  public static async acknowledgeAlert(alertId: string, userId: string): Promise<RedFlagAlert> {
    const res = await query(
      `UPDATE red_flag_events
       SET is_acknowledged = TRUE,
           acknowledged_by_user_id = $1,
           acknowledged_at = NOW()
       WHERE id = $2
       RETURNING id, encounter_id, patient_id, rule_id, severity, alert_message,
                 trigger_facts, is_acknowledged, acknowledged_by_user_id,
                 acknowledged_at, created_at`,
      [userId, alertId]
    );

    if (res.rows.length === 0) {
      throw new AppError(`Alert not found with id ${alertId}`, 404, 'ALERT_NOT_FOUND');
    }

    return this.mapRowToAlert(res.rows[0]);
  }

  private static mapRowToAlert(r: any): RedFlagAlert {
    return {
      id: r.id,
      encounterId: r.encounter_id,
      patientId: r.patient_id,
      ruleId: r.rule_id,
      severity: r.severity as RedFlagSeverity,
      alertMessage: r.alert_message,
      triggerFacts: typeof r.trigger_facts === 'string' ? JSON.parse(r.trigger_facts) : r.trigger_facts,
      isAcknowledged: r.is_acknowledged,
      acknowledgedByUserId: r.acknowledged_by_user_id,
      acknowledgedAt: r.acknowledged_at ? r.acknowledged_at.toISOString() : undefined,
      createdAt: r.created_at.toISOString(),
    };
  }
}
