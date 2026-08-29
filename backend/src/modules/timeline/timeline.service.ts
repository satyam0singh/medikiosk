import { query } from '../../database/postgres';
import {
  TimelineEvent,
  TimelineEventType,
  ProvenanceType,
  VerificationStatus,
} from '@medikiosk/shared-types';

export interface CreateTimelineEventInput {
  patientId: string;
  encounterId?: string;
  eventDate: string;
  isDateEstimated?: boolean;
  eventType: TimelineEventType;
  title: string;
  description?: string;
  sourceType?: ProvenanceType;
  sourceDocumentId?: string;
  sourcePage?: number;
  confidence?: number;
}

export class TimelineService {
  public static async getByPatientId(patientId: string): Promise<TimelineEvent[]> {
    const res = await query(
      `SELECT id, patient_id, encounter_id, event_date, is_date_estimated,
              event_type, title, description, source_type, source_document_id,
              source_page, confidence, verification_status, created_at
       FROM timeline_events
       WHERE patient_id = $1
       ORDER BY event_date ASC, created_at ASC`,
      [patientId]
    );

    return res.rows.map(this.mapRowToTimelineEvent);
  }

  public static async getByEncounterId(encounterId: string): Promise<TimelineEvent[]> {
    const res = await query(
      `SELECT id, patient_id, encounter_id, event_date, is_date_estimated,
              event_type, title, description, source_type, source_document_id,
              source_page, confidence, verification_status, created_at
       FROM timeline_events
       WHERE encounter_id = $1
       ORDER BY event_date ASC, created_at ASC`,
      [encounterId]
    );

    return res.rows.map(this.mapRowToTimelineEvent);
  }

  public static async create(data: CreateTimelineEventInput): Promise<TimelineEvent> {
    const res = await query(
      `INSERT INTO timeline_events (
         patient_id, encounter_id, event_date, is_date_estimated, event_type,
         title, description, source_type, source_document_id, source_page,
         confidence, verification_status
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING id, patient_id, encounter_id, event_date, is_date_estimated,
                 event_type, title, description, source_type, source_document_id,
                 source_page, confidence, verification_status, created_at`,
      [
        data.patientId,
        data.encounterId || null,
        data.eventDate,
        data.isDateEstimated ?? false,
        data.eventType,
        data.title,
        data.description || null,
        data.sourceType || ProvenanceType.PATIENT_REPORTED,
        data.sourceDocumentId || null,
        data.sourcePage || null,
        data.confidence ?? 1.0,
        VerificationStatus.PENDING,
      ]
    );

    return this.mapRowToTimelineEvent(res.rows[0]);
  }

  private static mapRowToTimelineEvent(r: any): TimelineEvent {
    return {
      id: r.id,
      patientId: r.patient_id,
      encounterId: r.encounter_id,
      eventDate: r.event_date ? (typeof r.event_date === 'string' ? r.event_date : r.event_date.toISOString().split('T')[0]) : '',
      isDateEstimated: r.is_date_estimated,
      eventType: r.event_type as TimelineEventType,
      title: r.title,
      description: r.description,
      sourceType: r.source_type as ProvenanceType,
      sourceDocumentId: r.source_document_id,
      sourcePage: r.source_page,
      confidence: parseFloat(r.confidence),
      verificationStatus: r.verification_status as VerificationStatus,
      hasConflict: false,
      createdAt: r.created_at.toISOString(),
    };
  }
}
