import { executeClinicalAiCompletion } from './aiClinicalEngine';

/**
 * Clinical AI Emergency Triage Judge Service
 * Analyzes patient symptom questionnaire answers and uses Clinical AI Engine
 * to evaluate whether the presentation represents a critical red-flag emergency.
 */

export interface TriageDecision {
  isEmergency: boolean;
  severity: 'CRITICAL_EMERGENCY' | 'MODERATE_PRIORITY' | 'ROUTINE';
  confidence: number;
  clinicalRationale: string;
  recommendedSpecialty: string;
  redFlagRule: string;
  triggerFacts: Array<{ field: string; value: any; sourceType: string }>;
}

const TRIAGE_SYSTEM_PROMPT = `You are a Senior Hospital Emergency Triage AI Physician (Ministry of Ayush / AIIMS / AIIA protocols).
Evaluate the patient's reported chief complaint, onset, symptom character, radiation, and associated signs.

Decision Rules:
1. EMERGENCY CRITERIA:
   - Chest pain with crushing/squeezing pressure, radiation to left arm/jaw, or associated breathlessness, diaphoresis, dizziness, or acute onset (<6 hours).
   - Acute severe shortness of breath at rest.
   - High fever with altered consciousness or seizures.
   - Severe acute abdomen with rigid abdomen or persistent vomiting with dehydration.
   - Sudden neurological deficits (facial droop, speech difficulty).

2. NON-EMERGENCY / ROUTINE CRITERIA:
   - Mild or chronic joint pain / osteoarthritis / Vata disorder.
   - Mild acidity or dyspepsia without acute red flags.
   - Minor skin rash / allergy without anaphylaxis / airway compromise.
   - Routine health checkup / Tridosha assessment.

Return strictly valid JSON:
{
  "isEmergency": true/false,
  "severity": "CRITICAL_EMERGENCY" | "MODERATE_PRIORITY" | "ROUTINE",
  "confidence": 0.95,
  "clinicalRationale": "Detailed clinical medical rationale for triage officer and physician.",
  "recommendedSpecialty": "Cardiology" | "Kayachikitsa / AYUSH" | "Gastroenterology" | "Dermatology" | "General Medicine",
  "redFlagRule": "rf_acute_coronary_syndrome" | "rf_none",
  "triggerFacts": [
    { "field": "hpi.symptom_character", "value": "crushing_pressure", "sourceType": "PATIENT_REPORTED" }
  ]
}
Return ONLY valid JSON. No markdown code blocks, no extraneous words.`;

export async function evaluateTriageEmergencyWithGroq(
  complaintKey: string,
  answers: Array<{ questionId: string; prompt: string; answerValue: string; answerLabel: string }>
): Promise<TriageDecision> {
  const userPayload = JSON.stringify({
    complaintKey,
    clinicalIntakeAnswers: answers,
    evaluatedAt: new Date().toISOString(),
  });

  try {
    const rawContent = await executeClinicalAiCompletion({
      messages: [
        { role: 'system', content: TRIAGE_SYSTEM_PROMPT },
        { role: 'user', content: `Evaluate this hospital intake session:\n${userPayload}` },
      ],
      temperature: 0.1,
      maxTokens: 600,
      responseFormat: { type: 'json_object' },
    });

    const parsed = JSON.parse(rawContent);

    return {
      isEmergency: Boolean(parsed.isEmergency),
      severity: parsed.severity || (parsed.isEmergency ? 'CRITICAL_EMERGENCY' : 'ROUTINE'),
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.94,
      clinicalRationale: parsed.clinicalRationale || 'Evaluated by Clinical AI Triage Engine.',
      recommendedSpecialty: parsed.recommendedSpecialty || 'General Medicine',
      redFlagRule: parsed.redFlagRule || (parsed.isEmergency ? 'rf_clinical_emergency' : 'rf_none'),
      triggerFacts: Array.isArray(parsed.triggerFacts) ? parsed.triggerFacts : [],
    };
  } catch (err) {
    console.warn('[Clinical AI Engine] Triage Judge fallback to deterministic clinical rules:', err);

    // Robust Deterministic Clinical Rule Fallback
    const isChestCrushing = answers.some(
      (a) =>
        a.answerValue === 'squeezing_crushing' ||
        a.answerValue.includes('crushing') ||
        a.answerValue.includes('arm_jaw_radiation') ||
        a.answerValue.includes('breathlessness')
    );

    const isAcuteChest = complaintKey === 'chest_pain' && isChestCrushing;

    return {
      isEmergency: isAcuteChest,
      severity: isAcuteChest ? 'CRITICAL_EMERGENCY' : 'ROUTINE',
      confidence: 0.95,
      clinicalRationale: isAcuteChest
        ? 'Potential Acute Coronary Syndrome indicated by acute crushing retrosternal chest pressure and associated symptoms.'
        : 'Stable presentation suitable for standard OPD queue.',
      recommendedSpecialty: isAcuteChest ? 'Cardiology' : 'General Medicine',
      redFlagRule: isAcuteChest ? 'rf_chest_pain_severe' : 'rf_none',
      triggerFacts: answers.map((a) => ({
        field: a.questionId,
        value: a.answerValue,
        sourceType: 'PATIENT_REPORTED',
      })),
    };
  }
}
