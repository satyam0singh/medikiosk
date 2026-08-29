import { query } from '../../database/postgres';
import { Encounter, EncounterStatus } from '@medikiosk/shared-types';
import { AppError } from '../../middleware/errorHandler';

export interface CreateEncounterInput {
  patientId: string;
  physicianId?: string;
  department?: string;
  encounterType?: 'OPD_GENERAL' | 'OPD_AYUSH' | 'EMERGENCY' | 'TELECONSULT';
  chiefComplaintSummary?: string;
}

export class EncountersService {
  public static async create(data: CreateEncounterInput): Promise<Encounter> {
    // Verify patient exists
    const patCheck = await query('SELECT id FROM patients WHERE id = $1', [data.patientId]);
    if (patCheck.rows.length === 0) {
      throw new AppError(`Patient not found with id ${data.patientId}`, 404, 'PATIENT_NOT_FOUND');
    }

    const res = await query(
      `INSERT INTO encounters (
         patient_id, physician_id, status, department, encounter_type, chief_complaint_summary
       ) VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, patient_id, physician_id, status, department, encounter_type,
                 chief_complaint_summary, started_at, completed_at, created_at, updated_at`,
      [
        data.patientId,
        data.physicianId || null,
        EncounterStatus.CREATED,
        data.department || 'General Medicine',
        data.encounterType || 'OPD_GENERAL',
        data.chiefComplaintSummary || null,
      ]
    );

    return this.mapRowToEncounter(res.rows[0]);
  }

  public static async getById(id: string): Promise<Encounter> {
    const res = await query(
      `SELECT id, patient_id, physician_id, status, department, encounter_type,
              chief_complaint_summary, started_at, completed_at, created_at, updated_at
       FROM encounters
       WHERE id = $1`,
      [id]
    );

    if (res.rows.length === 0) {
      throw new AppError(`Encounter not found with id ${id}`, 404, 'ENCOUNTER_NOT_FOUND');
    }

    return this.mapRowToEncounter(res.rows[0]);
  }

  public static async updateStatus(
    id: string,
    status: EncounterStatus,
    physicianId?: string
  ): Promise<Encounter> {
    await this.getById(id);

    const completedAt = (status === EncounterStatus.COMPLETED || status === EncounterStatus.VERIFIED) ? new Date() : null;

    const res = await query(
      `UPDATE encounters
       SET status = $1,
           physician_id = COALESCE($2, physician_id),
           completed_at = COALESCE($3, completed_at),
           updated_at = NOW()
       WHERE id = $4
       RETURNING id, patient_id, physician_id, status, department, encounter_type,
                 chief_complaint_summary, started_at, completed_at, created_at, updated_at`,
      [status, physicianId || null, completedAt, id]
    );

    return this.mapRowToEncounter(res.rows[0]);
  }

  public static async listByPatient(patientId: string): Promise<Encounter[]> {
    const res = await query(
      `SELECT id, patient_id, physician_id, status, department, encounter_type,
              chief_complaint_summary, started_at, completed_at, created_at, updated_at
       FROM encounters
       WHERE patient_id = $1
       ORDER BY started_at DESC`,
      [patientId]
    );

    return res.rows.map(this.mapRowToEncounter);
  }

  public static async getClinicalBriefing(encounterId: string): Promise<{
    encounter: Encounter;
    patient: any;
    activeRedFlags: any[];
    facts: any[];
    medications: any[];
    allergies: any[];
    timeline: any[];
    documents: any[];
    summary: any;
  }> {
    const encounter = await this.getById(encounterId);

    // Fetch patient
    const patRes = await query(
      `SELECT id, abha_id, hospital_patient_id, full_name, gender, age, contact_number, preferred_language, created_at, updated_at
       FROM patients WHERE id = $1`,
      [encounter.patientId]
    );
    const patient = patRes.rows[0];

    // Fetch active red flags
    const alertsRes = await query(
      `SELECT id, encounter_id, patient_id, rule_id, severity, alert_message, trigger_facts, is_acknowledged, acknowledged_at, created_at
       FROM red_flag_events WHERE encounter_id = $1`,
      [encounterId]
    );

    // Fetch facts
    const factsRes = await query(
      `SELECT id, field, value, source_type, source_id, source_page, confidence, verification_status, created_at
       FROM clinical_facts WHERE encounter_id = $1 ORDER BY created_at ASC`,
      [encounterId]
    );

    // Fetch timeline
    const timelineRes = await query(
      `SELECT id, event_date, is_date_estimated, event_type, title, description, source_type, confidence, verification_status
       FROM timeline_events WHERE encounter_id = $1 OR patient_id = $2 ORDER BY event_date ASC`,
      [encounterId, encounter.patientId]
    );

    // Fetch documents
    const docsRes = await query(
      `SELECT id, file_name, mime_type, file_size_bytes, document_type, processing_state, uploaded_at, processed_at
       FROM documents WHERE encounter_id = $1`,
      [encounterId]
    );

    // Fetch summary
    const sumRes = await query(
      `SELECT summary_payload, is_physician_verified, status FROM clinical_summaries WHERE encounter_id = $1 ORDER BY version DESC LIMIT 1`,
      [encounterId]
    );
    const sumRow = sumRes.rows[0];
    const summary = sumRow
      ? (typeof sumRow.summary_payload === 'string' ? JSON.parse(sumRow.summary_payload) : sumRow.summary_payload)
      : null;

    const facts = factsRes.rows.map(r => ({
      id: r.id,
      field: r.field,
      value: typeof r.value === 'string' ? JSON.parse(r.value) : r.value,
      sourceType: r.source_type,
      sourceId: r.source_id,
      sourcePage: r.source_page,
      confidence: parseFloat(r.confidence),
      verificationStatus: r.verification_status,
      createdAt: r.created_at,
    }));

    return {
      encounter,
      patient,
      activeRedFlags: alertsRes.rows,
      facts,
      medications: summary?.currentMedications || [],
      allergies: summary?.allergies || [],
      timeline: timelineRes.rows,
      documents: docsRes.rows,
      summary,
    };
  }

  private static mapRowToEncounter(r: any): Encounter {
    return {
      id: r.id,
      patientId: r.patient_id,
      physicianId: r.physician_id,
      status: r.status as EncounterStatus,
      department: r.department,
      encounterType: r.encounter_type,
      chiefComplaintSummary: r.chief_complaint_summary,
      startedAt: r.started_at.toISOString(),
      completedAt: r.completed_at ? r.completed_at.toISOString() : undefined,
      createdAt: r.created_at.toISOString(),
      updatedAt: r.updated_at.toISOString(),
    };
  }
}
