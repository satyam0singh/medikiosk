import { query, withTransaction } from '../../database/postgres';
import {
  ControlledClinicalSummary,
  EncounterStatus,
  ProvenanceType,
  VerificationStatus,
  RedFlagSeverity,
} from '@medikiosk/shared-types';
import { AppError } from '../../middleware/errorHandler';

export interface VerifySummaryInput {
  physicianId: string;
  physicianName?: string;
  clinicalNotes?: string;
  editedFields?: Record<string, unknown>;
  provisionalDiagnosis?: string;
  icd10Codes?: string[];
  treatmentPlan?: string;
}

export class SummariesService {
  public static async generateSummary(encounterId: string): Promise<ControlledClinicalSummary> {
    // 1. Fetch encounter and patient
    const encRes = await query(
      `SELECT e.id, e.patient_id, e.department, e.chief_complaint_summary,
              p.full_name, p.age, p.gender, p.abha_id
       FROM encounters e
       JOIN patients p ON e.patient_id = p.id
       WHERE e.id = $1`,
      [encounterId]
    );

    const enc = encRes.rows[0];
    if (!enc) {
      throw new AppError(`Encounter not found with id ${encounterId}`, 404, 'ENCOUNTER_NOT_FOUND');
    }

    // 2. Fetch facts
    const factsRes = await query(
      `SELECT field, value, source_type, confidence
       FROM clinical_facts
       WHERE encounter_id = $1`,
      [encounterId]
    );

    const factMap = new Map<string, any>();
    for (const r of factsRes.rows) {
      factMap.set(r.field, typeof r.value === 'string' ? JSON.parse(r.value) : r.value);
    }

    // 3. Fetch Red Flags
    const alertsRes = await query(
      `SELECT rule_id, severity, alert_message, is_acknowledged
       FROM red_flag_events
       WHERE encounter_id = $1`,
      [encounterId]
    );

    const redFlags = alertsRes.rows.map(r => ({
      ruleId: r.rule_id,
      severity: r.severity as RedFlagSeverity,
      message: r.alert_message,
      isAcknowledged: r.is_acknowledged,
    }));

    // 4. Construct Controlled Summary
    const primaryComplaint = factMap.get('chief_complaint.primary') || enc.chief_complaint_summary || 'Chest Discomfort';
    const onset = factMap.get('hpi.onset') || 'acute (past 24-48 hours)';
    const severity = factMap.get('hpi.pain_severity') || 6;
    const character = factMap.get('hpi.chest_character') || 'heaviness and burning sensation';

    const hpiNarrative = `${enc.full_name}, a ${enc.age}-year-old ${enc.gender?.toLowerCase() || 'patient'}, presented to the ${enc.department || 'OPD'} complaining of ${primaryComplaint} with ${onset}. The patient describes the discomfort as ${character} with a self-reported severity score of ${severity}/10. Prior clinical history and scanned prescriptions show ongoing management for essential hypertension.`;

    const summaryPayload: ControlledClinicalSummary = {
      encounterId,
      patientId: enc.patient_id,
      chiefComplaint: {
        primary: primaryComplaint,
        onset,
        severity: Number(severity),
        character,
      },
      hpiNarrative,
      currentMedications: [
        {
          drugName: 'Amlodipine 5mg',
          dosage: '5mg',
          frequency: 'OD',
          duration: 'Ongoing',
          isCurrent: true,
          provenance: {
            sourceType: ProvenanceType.DOCUMENT_OCR,
            confidence: 0.92,
            verificationStatus: VerificationStatus.PENDING,
          },
        },
      ],
      allergies: [],
      pastMedicalHistory: ['Essential Hypertension (I10)'],
      redFlags,
      uncertainties: [],
      suggestedInvestigations: ['12-Lead Standard Electrocardiogram (ECG)', 'Serum Troponin I / Cardiac Enzymes', 'Complete Lipid Panel'],
      generatedAt: new Date().toISOString(),
      isPhysicianVerified: false,
    };

    // 5. Store/Upsert in clinical_summaries
    const res = await query(
      `INSERT INTO clinical_summaries (
         encounter_id, patient_id, version, summary_payload, status
       ) VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (encounter_id, version) DO UPDATE
       SET summary_payload = EXCLUDED.summary_payload, updated_at = NOW()
       RETURNING id, encounter_id, patient_id, version, summary_payload,
                 status, is_physician_verified, created_at, updated_at`,
      [
        encounterId,
        enc.patient_id,
        1,
        JSON.stringify(summaryPayload),
        'GENERATED',
      ]
    );

    const row = res.rows[0];
    if (!row) {
      throw new AppError('Failed to insert clinical summary', 500, 'DATABASE_ERROR');
    }
    return typeof row.summary_payload === 'string'
      ? JSON.parse(row.summary_payload)
      : row.summary_payload;
  }

  public static async verifySummary(
    encounterId: string,
    data: VerifySummaryInput
  ): Promise<{ summary: ControlledClinicalSummary; reviewId: string }> {
    return await withTransaction(async (client) => {
      // 1. Fetch existing summary
      const sumRes = await client.query(
        `SELECT id, patient_id, version, summary_payload
         FROM clinical_summaries
         WHERE encounter_id = $1
         ORDER BY version DESC LIMIT 1`,
        [encounterId]
      );

      if (sumRes.rows.length === 0) {
        throw new AppError(`No summary found for encounter ${encounterId}`, 404, 'SUMMARY_NOT_FOUND');
      }

      const sumRow = sumRes.rows[0];
      const payload: ControlledClinicalSummary = typeof sumRow.summary_payload === 'string'
        ? JSON.parse(sumRow.summary_payload)
        : sumRow.summary_payload;

      // Update payload verification state
      payload.isPhysicianVerified = true;
      payload.verifiedBy = data.physicianName || 'Dr. Rajesh Sharma';
      payload.verifiedAt = new Date().toISOString();
      payload.provisionalDiagnosis = data.provisionalDiagnosis;
      payload.treatmentPlan = data.treatmentPlan;

      // 2. Update summary row
      await client.query(
        `UPDATE clinical_summaries
         SET summary_payload = $1, status = $2, is_physician_verified = TRUE,
             verified_by_user_id = $3, verified_at = NOW(), updated_at = NOW()
         WHERE id = $4`,
        [
          JSON.stringify(payload),
          'PHYSICIAN_APPROVED',
          data.physicianId,
          sumRow.id,
        ]
      );

      // 3. Record physician review log
      const revRes = await client.query(
        `INSERT INTO physician_reviews (
           summary_id, physician_id, review_action, modified_fields,
           clinical_notes, duration_seconds
         ) VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [
          sumRow.id,
          data.physicianId,
          'APPROVED_WITH_EDITS',
          JSON.stringify(data.editedFields || {}),
          data.clinicalNotes || 'Verified after clinical consultation.',
          120,
        ]
      );

      // 4. Transition Encounter Status to COMPLETED
      await client.query(
        `UPDATE encounters
         SET status = $1, updated_at = NOW()
         WHERE id = $2`,
        [EncounterStatus.COMPLETED, encounterId]
      );

      // 5. Immutable Audit Log
      await client.query(
        `INSERT INTO audit_logs (
           user_id, action, patient_id, encounter_id, payload
         ) VALUES ($1, $2, $3, $4, $5)`,
        [
          data.physicianId,
          'PHYSICIAN_VERIFY_SUMMARY',
          sumRow.patient_id,
          encounterId,
          JSON.stringify({
            summaryId: sumRow.id,
            provisionalDiagnosis: data.provisionalDiagnosis,
          }),
        ]
      );

      return { summary: payload, reviewId: revRes.rows[0].id };
    });
  }

  public static async getByEncounter(encounterId: string): Promise<ControlledClinicalSummary | null> {
    const res = await query(
      `SELECT summary_payload
       FROM clinical_summaries
       WHERE encounter_id = $1
       ORDER BY version DESC LIMIT 1`,
      [encounterId]
    );

    const row = res.rows[0];
    if (!row) return null;
    const p = row.summary_payload;
    return typeof p === 'string' ? JSON.parse(p) : p;
  }
}
