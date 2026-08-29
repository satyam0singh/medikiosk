import { query, withTransaction } from '../../database/postgres';
import {
  ClinicalSession,
  ClinicalSessionState,
  LanguageCode,
  ProvenanceType,
  VerificationStatus,
  SessionAnswer,
  ClinicalFact,
  RedFlagAlert,
} from '@medikiosk/shared-types';
import { AppError } from '../../middleware/errorHandler';
import { ConsentService } from '../consent/consent.service';
import { SafetyService } from '../safety/safety.service';
import { setSessionState } from '../../storage/redis';
import { QuestionsService } from '../questions/questions.service';

export interface CreateSessionInput {
  encounterId: string;
  patientId: string;
  selectedLanguage?: LanguageCode;
  metadata?: Record<string, unknown>;
}

export interface RecordAnswerInput {
  questionId: string;
  rawText?: string;
  selectedOptions?: string[];
  audioRecordId?: string;
  confidence?: number;
  sourceType?: ProvenanceType;
}

export class SessionsService {
  public static async create(data: CreateSessionInput): Promise<ClinicalSession> {
    // 1. Verify consent exists
    const consentCheck = await ConsentService.verifyConsent(data.patientId, 'CLINICAL_INTAKE');
    if (!consentCheck.isGranted) {
      throw new AppError(
        'Patient consent for CLINICAL_INTAKE is required before starting session',
        403,
        'CONSENT_REQUIRED'
      );
    }

    const res = await query(
      `INSERT INTO clinical_sessions (
         encounter_id, patient_id, current_state, selected_language, metadata
       ) VALUES ($1, $2, $3, $4, $5)
       RETURNING id, encounter_id, patient_id, current_state, selected_language,
                 is_degraded_mode, metadata, created_at, updated_at`,
      [
        data.encounterId,
        data.patientId,
        ClinicalSessionState.HISTORY_ACTIVE,
        data.selectedLanguage || LanguageCode.EN,
        JSON.stringify(data.metadata || {}),
      ]
    );

    const session = this.mapRowToSession(res.rows[0]);
    await setSessionState(session.id, session);
    return session;
  }

  public static async getById(id: string): Promise<{
    session: ClinicalSession;
    answers: SessionAnswer[];
    facts: ClinicalFact[];
    activeRedFlags: RedFlagAlert[];
  }> {
    const res = await query(
      `SELECT id, encounter_id, patient_id, current_state, selected_language,
              is_degraded_mode, metadata, created_at, updated_at
       FROM clinical_sessions
       WHERE id = $1`,
      [id]
    );

    if (res.rows.length === 0) {
      throw new AppError(`Session not found with id ${id}`, 404, 'SESSION_NOT_FOUND');
    }

    const session = this.mapRowToSession(res.rows[0]);

    // Fetch answers
    const answersRes = await query(
      `SELECT id, session_id, question_id, raw_text, selected_options,
              audio_record_id, confidence, source_type, captured_at
       FROM session_answers
       WHERE session_id = $1
       ORDER BY captured_at ASC`,
      [id]
    );

    const answers: SessionAnswer[] = answersRes.rows.map((r) => ({
      id: r.id,
      sessionId: r.session_id,
      questionId: r.question_id,
      rawText: r.raw_text,
      selectedOptions: typeof r.selected_options === 'string' ? JSON.parse(r.selected_options) : r.selected_options,
      audioRecordId: r.audio_record_id,
      confidence: parseFloat(r.confidence),
      sourceType: r.source_type as ProvenanceType,
      capturedAt: r.captured_at.toISOString(),
    }));

    // Fetch facts
    const factsRes = await query(
      `SELECT id, patient_id, encounter_id, field, value, normalized_value,
              source_type, source_id, source_page, confidence, verification_status,
              created_at, updated_at
       FROM clinical_facts
       WHERE encounter_id = $1
       ORDER BY created_at ASC`,
      [session.encounterId]
    );

    const facts: ClinicalFact[] = factsRes.rows.map((r) => ({
      id: r.id,
      patientId: r.patient_id,
      encounterId: r.encounter_id,
      field: r.field,
      value: r.value,
      normalizedValue: r.normalized_value,
      sourceType: r.source_type as ProvenanceType,
      sourceId: r.source_id,
      sourcePage: r.source_page,
      confidence: parseFloat(r.confidence),
      verificationStatus: r.verification_status as VerificationStatus,
      createdAt: r.created_at.toISOString(),
      updatedAt: r.updated_at.toISOString(),
    }));

    // Fetch active red flags
    const alertsRes = await query(
      `SELECT id, encounter_id, patient_id, rule_id, severity, alert_message,
              trigger_facts, is_acknowledged, acknowledged_at, created_at
       FROM red_flag_events
       WHERE encounter_id = $1`,
      [session.encounterId]
    );

    const activeRedFlags: RedFlagAlert[] = alertsRes.rows.map((r) => ({
      id: r.id,
      encounterId: r.encounter_id,
      patientId: r.patient_id,
      ruleId: r.rule_id,
      severity: r.severity,
      alertMessage: r.alert_message,
      triggerFacts: typeof r.trigger_facts === 'string' ? JSON.parse(r.trigger_facts) : r.trigger_facts,
      isAcknowledged: r.is_acknowledged,
      acknowledgedAt: r.acknowledged_at ? r.acknowledged_at.toISOString() : undefined,
      createdAt: r.created_at.toISOString(),
    }));

    return { session, answers, facts, activeRedFlags };
  }

  public static async recordAnswer(
    sessionId: string,
    data: RecordAnswerInput
  ): Promise<{ answer: SessionAnswer; triggeredAlerts: RedFlagAlert[]; isCompleted: boolean }> {
    return await withTransaction(async (client) => {
      // 1. Fetch session
      const sessionRes = await client.query(
        'SELECT id, encounter_id, patient_id, current_state FROM clinical_sessions WHERE id = $1',
        [sessionId]
      );
      if (sessionRes.rows.length === 0) {
        throw new AppError(`Session not found with id ${sessionId}`, 404, 'SESSION_NOT_FOUND');
      }
      const session = sessionRes.rows[0];

      // 2. Fetch target question
      const questionRes = await client.query(
        'SELECT id, target_field, prompt FROM questions WHERE id = $1',
        [data.questionId]
      );
      if (questionRes.rows.length === 0) {
        throw new AppError(`Question not found with id ${data.questionId}`, 404, 'QUESTION_NOT_FOUND');
      }
      const question = questionRes.rows[0];

      // 3. Insert Answer
      const answerInsertRes = await client.query(
        `INSERT INTO session_answers (
           session_id, question_id, raw_text, selected_options, audio_record_id,
           confidence, source_type
         ) VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, session_id, question_id, raw_text, selected_options,
                   audio_record_id, confidence, source_type, captured_at`,
        [
          sessionId,
          data.questionId,
          data.rawText || null,
          data.selectedOptions ? JSON.stringify(data.selectedOptions) : null,
          data.audioRecordId || null,
          data.confidence ?? 1.0,
          data.sourceType || ProvenanceType.PATIENT_REPORTED,
        ]
      );
      const answerRow = answerInsertRes.rows[0];

      // 4. Create/Upsert Clinical Fact with Provenance
      const factValue = data.selectedOptions && data.selectedOptions.length > 0
        ? data.selectedOptions[0]
        : data.rawText || null;

      await client.query(
        `INSERT INTO clinical_facts (
           patient_id, encounter_id, field, value, source_type, confidence, verification_status
         ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          session.patient_id,
          session.encounter_id,
          question.target_field,
          JSON.stringify(factValue),
          data.sourceType || ProvenanceType.PATIENT_REPORTED,
          data.confidence ?? 1.0,
          VerificationStatus.PENDING,
        ]
      );

      // 5. Fetch all facts accumulated so far for deterministic Safety Evaluation
      const allFactsRes = await client.query(
        'SELECT field, value, source_type FROM clinical_facts WHERE encounter_id = $1',
        [session.encounter_id]
      );
      const factsForSafety = allFactsRes.rows.map(r => ({
        field: r.field,
        value: typeof r.value === 'string' ? JSON.parse(r.value) : r.value,
        sourceType: r.source_type as ProvenanceType,
      }));

      const triggeredAlerts = await SafetyService.evaluateState(
        session.encounter_id,
        session.patient_id,
        factsForSafety
      );

      // 6. Check if more questions remain
      const nextQ = await QuestionsService.getNextQuestion(sessionId);
      const isCompleted = nextQ.isComplete;

      if (isCompleted) {
        await client.query(
          `UPDATE clinical_sessions
           SET current_state = $1, updated_at = NOW()
           WHERE id = $2`,
          [ClinicalSessionState.SUMMARY_GENERATION, sessionId]
        );
      }

      const answer: SessionAnswer = {
        id: answerRow.id,
        sessionId: answerRow.session_id,
        questionId: answerRow.question_id,
        rawText: answerRow.raw_text,
        selectedOptions: typeof answerRow.selected_options === 'string' ? JSON.parse(answerRow.selected_options) : answerRow.selected_options,
        audioRecordId: answerRow.audio_record_id,
        confidence: parseFloat(answerRow.confidence),
        sourceType: answerRow.source_type as ProvenanceType,
        capturedAt: answerRow.captured_at.toISOString(),
      };

      return { answer, triggeredAlerts, isCompleted };
    });
  }

  private static mapRowToSession(r: any): ClinicalSession {
    return {
      id: r.id,
      encounterId: r.encounter_id,
      patientId: r.patient_id,
      currentState: r.current_state as ClinicalSessionState,
      selectedLanguage: r.selected_language as LanguageCode,
      isDegradedMode: r.is_degraded_mode,
      metadata: typeof r.metadata === 'string' ? JSON.parse(r.metadata) : r.metadata,
      createdAt: r.created_at.toISOString(),
      updatedAt: r.updated_at.toISOString(),
    };
  }
}
