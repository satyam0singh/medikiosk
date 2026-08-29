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
