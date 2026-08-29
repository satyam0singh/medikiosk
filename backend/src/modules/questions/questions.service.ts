import { query } from '../../database/postgres';
import { ClinicalQuestion } from '@medikiosk/shared-types';
import { AppError } from '../../middleware/errorHandler';

export class QuestionsService {
  public static async getAllQuestions(): Promise<ClinicalQuestion[]> {
    const res = await query(
      `SELECT id, code, section, prompt, audio_urls, input_type, options,
              target_field, is_required, conditions, created_at
       FROM questions
       ORDER BY created_at ASC`
    );

    return res.rows.map(this.mapRowToQuestion);
  }

  public static async getNextQuestion(sessionId: string): Promise<{
    question: ClinicalQuestion | null;
    isComplete: boolean;
    progressPercentage: number;
    totalAnswered: number;
    remainingRequired: number;
  }> {
    // 1. Fetch Session
    const sessionRes = await query(
      'SELECT id, patient_id, encounter_id, current_state, selected_language FROM clinical_sessions WHERE id = $1',
      [sessionId]
    );

    if (sessionRes.rows.length === 0) {
      throw new AppError(`Session not found with id ${sessionId}`, 404, 'SESSION_NOT_FOUND');
    }

    // 2. Fetch all recorded answers for this session
    const answersRes = await query(
      'SELECT question_id, raw_text, selected_options FROM session_answers WHERE session_id = $1',
      [sessionId]
    );

    const answeredQuestionIds = new Set<string>(answersRes.rows.map(r => r.question_id));
    const answeredMap = new Map<string, { rawText?: string; selectedOptions?: string[] }>();
    for (const r of answersRes.rows) {
      const selectedOpts = typeof r.selected_options === 'string' ? JSON.parse(r.selected_options) : r.selected_options;
      answeredMap.set(r.question_id, { rawText: r.raw_text, selectedOptions: selectedOpts });
    }

    // 3. Fetch all questions
    const allQuestions = await this.getAllQuestions();

    // 4. Determine what chief complaint was selected if answered
    const ccAnswer = answeredMap.get('q_chief_complaint');
    const selectedChiefComplaint = ccAnswer?.selectedOptions?.[0] || 'other';

    // 5. Evaluate eligible questions based on conditions
    const eligibleQuestions: ClinicalQuestion[] = [];
    for (const q of allQuestions) {
      // If question is specific to a chief complaint
      if (q.id.startsWith('q_chest_') && selectedChiefComplaint !== 'chest_pain') {
        continue;
      }
      if (q.id.startsWith('q_fever_') && selectedChiefComplaint !== 'fever') {
        continue;
      }
      eligibleQuestions.push(q);
    }

    // 6. Find next unanswered question
    const nextUnanswered = eligibleQuestions.find(q => !answeredQuestionIds.has(q.id)) || null;

    const totalEligible = eligibleQuestions.length;
    const totalAnswered = eligibleQuestions.filter(q => answeredQuestionIds.has(q.id)).length;
    const remainingRequired = eligibleQuestions.filter(q => q.isRequired && !answeredQuestionIds.has(q.id)).length;

    const progressPercentage = totalEligible > 0 ? Math.round((totalAnswered / totalEligible) * 100) : 100;

    return {
      question: nextUnanswered,
      isComplete: nextUnanswered === null,
      progressPercentage,
      totalAnswered,
      remainingRequired,
    };
  }

  private static mapRowToQuestion(r: any): ClinicalQuestion {
    return {
      id: r.id,
      code: r.code,
      section: r.section,
      prompt: typeof r.prompt === 'string' ? JSON.parse(r.prompt) : r.prompt,
      audioUrl: r.audio_urls ? (typeof r.audio_urls === 'string' ? JSON.parse(r.audio_urls) : r.audio_urls) : undefined,
      inputType: r.input_type,
      options: r.options ? (typeof r.options === 'string' ? JSON.parse(r.options) : r.options) : undefined,
      targetField: r.target_field,
      isRequired: r.is_required,
      conditions: r.conditions ? (typeof r.conditions === 'string' ? JSON.parse(r.conditions) : r.conditions) : undefined,
    };
  }
}
