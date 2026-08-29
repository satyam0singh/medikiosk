import { query } from '../../database/postgres';
import { Patient, LanguageCode, TimelineEvent } from '@medikiosk/shared-types';
import { AppError } from '../../middleware/errorHandler';

export interface CreatePatientInput {
  abhaId?: string;
  hospitalPatientId?: string;
  fullName: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  dateOfBirth?: string;
  age?: number;
  contactNumber?: string;
  preferredLanguage?: LanguageCode;
  address?: Record<string, unknown>;
}

export class PatientsService {
  public static async search(term: string): Promise<Patient[]> {
    const cleanTerm = term.trim();
    if (!cleanTerm) return [];

    const res = await query(
      `SELECT id, abha_id, hospital_patient_id, full_name, gender, date_of_birth, age,
              contact_number, preferred_language, address, created_at, updated_at
       FROM patients
       WHERE abha_id ILIKE $1
          OR hospital_patient_id ILIKE $1
          OR contact_number ILIKE $1
          OR full_name ILIKE $2
       ORDER BY full_name ASC
       LIMIT 20`,
      [`%${cleanTerm}%`, `%${cleanTerm}%`]
    );

    return res.rows.map(this.mapRowToPatient);
  }

  public static async getById(id: string): Promise<Patient> {
    const res = await query(
      `SELECT id, abha_id, hospital_patient_id, full_name, gender, date_of_birth, age,
              contact_number, preferred_language, address, created_at, updated_at
       FROM patients
       WHERE id = $1`,
      [id]
    );

    if (res.rows.length === 0) {
      throw new AppError(`Patient not found with id ${id}`, 404, 'PATIENT_NOT_FOUND');
    }

    return this.mapRowToPatient(res.rows[0]);
  }

  public static async create(data: CreatePatientInput): Promise<Patient> {
    // Check if ABHA or MRN duplicate exists
    if (data.abhaId) {
      const existing = await query('SELECT id FROM patients WHERE abha_id = $1', [data.abhaId]);
      if (existing.rows.length > 0) {
        throw new AppError('A patient with this ABHA ID already exists', 409, 'DUPLICATE_ABHA_ID');
      }
    }

    const res = await query(
      `INSERT INTO patients (
         abha_id, hospital_patient_id, full_name, gender, date_of_birth, age,
         contact_number, preferred_language, address
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, abha_id, hospital_patient_id, full_name, gender, date_of_birth, age,
                 contact_number, preferred_language, address, created_at, updated_at`,
      [
        data.abhaId || null,
        data.hospitalPatientId || `MRN-${Date.now().toString().slice(-6)}`,
        data.fullName,
        data.gender,
        data.dateOfBirth || null,
        data.age || null,
        data.contactNumber || null,
        data.preferredLanguage || LanguageCode.EN,
        JSON.stringify(data.address || {}),
      ]
    );

    return this.mapRowToPatient(res.rows[0]);
  }

  public static async getTimeline(patientId: string): Promise<TimelineEvent[]> {
    await this.getById(patientId); // verify patient exists

    const res = await query(
      `SELECT id, patient_id, encounter_id, event_date, is_date_estimated, event_type,
              title, description, source_type, source_document_id, source_page,
              confidence, verification_status, has_conflict, conflict_details,
              metadata, created_at
       FROM timeline_events
       WHERE patient_id = $1
       ORDER BY event_date DESC NULLS LAST, created_at DESC`,
      [patientId]
    );

    return res.rows.map((r) => ({
      id: r.id,
      patientId: r.patient_id,
      encounterId: r.encounter_id,
      eventDate: r.event_date ? r.event_date.toISOString().split('T')[0] : undefined,
      isDateEstimated: r.is_date_estimated,
      eventType: r.event_type,
      title: r.title,
      description: r.description,
      sourceType: r.source_type,
      sourceDocumentId: r.source_document_id,
      sourcePage: r.source_page,
      confidence: parseFloat(r.confidence),
      verificationStatus: r.verification_status,
      hasConflict: r.has_conflict,
      conflictDetails: r.conflict_details,
      metadata: r.metadata,
      createdAt: r.created_at.toISOString(),
    }));
  }

  private static mapRowToPatient(r: any): Patient {
    return {
      id: r.id,
      abhaId: r.abha_id,
      hospitalPatientId: r.hospital_patient_id,
      fullName: r.full_name,
      gender: r.gender,
      dateOfBirth: r.date_of_birth ? r.date_of_birth.toISOString().split('T')[0] : undefined,
      age: r.age,
      contactNumber: r.contact_number,
      preferredLanguage: r.preferred_language as LanguageCode,
      address: r.address,
      createdAt: r.created_at.toISOString(),
      updatedAt: r.updated_at.toISOString(),
    };
  }
}
