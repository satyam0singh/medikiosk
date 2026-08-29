import { query } from '../../database/postgres';
import {
  AyushAssessment,
  VerificationStatus,
  ProvenanceType,
} from '@medikiosk/shared-types';

export interface ComputePrakritiInput {
  encounterId: string;
  patientId: string;
  vataAnswers: number;
  pittaAnswers: number;
  kaphaAnswers: number;
  agniType?: 'MANDA' | 'TIKSHNA' | 'VISHAMA' | 'SAMA';
  bowelHabits?: string;
  dietaryHabits?: string;
  sleepPattern?: string;
}

export class AyushService {
  public static async assessPrakriti(data: ComputePrakritiInput): Promise<AyushAssessment> {
    const total = (data.vataAnswers || 0) + (data.pittaAnswers || 0) + (data.kaphaAnswers || 0);
    const totalQuestions = Math.max(1, total);

    const vataScore = Math.round(((data.vataAnswers || 0) / totalQuestions) * 100);
    const pittaScore = Math.round(((data.pittaAnswers || 0) / totalQuestions) * 100);
    const kaphaScore = Math.round(((data.kaphaAnswers || 0) / totalQuestions) * 100);

    let dominantPrakriti: 'VATA' | 'PITTA' | 'KAPHA' | 'VATA_PITTA' | 'PITTA_KAPHA' | 'VATA_KAPHA' | 'TRIDOSHA' = 'VATA_PITTA';

    if (vataScore > 50) dominantPrakriti = 'VATA';
    else if (pittaScore > 50) dominantPrakriti = 'PITTA';
    else if (kaphaScore > 50) dominantPrakriti = 'KAPHA';
    else if (vataScore >= 35 && pittaScore >= 35) dominantPrakriti = 'VATA_PITTA';
    else if (pittaScore >= 35 && kaphaScore >= 35) dominantPrakriti = 'PITTA_KAPHA';
    else if (vataScore >= 35 && kaphaScore >= 35) dominantPrakriti = 'VATA_KAPHA';
    else dominantPrakriti = 'TRIDOSHA';

    const assessment: AyushAssessment = {
      prakriti: {
        vataScore,
        pittaScore,
        kaphaScore,
        dominantPrakriti,
      },
      vikriti: {
        doshaImbalance: vataScore > pittaScore ? ['Vata Vriddhi', 'Pitta Anubandha'] : ['Pitta Vriddhi'],
        manifestation: 'Atypical digestive disturbances with sleep irregularities and joint tightness',
      },
      dashavidha: {
        anala: data.agniType || 'VISHAMA',
        prakriti: dominantPrakriti,
        vaya: 'MADHYA',
        sattva: 'MADHYAMA',
        ahara: 'MADHYAMA',
      },
      aharaVihara: {
        dietaryHabits: data.dietaryHabits || 'Irregular meal timings, spicy/dry food intake',
        sleepPattern: data.sleepPattern || 'Disturbed sleep, late bedtimes',
        bowelHabits: data.bowelHabits || 'Constipated / irregular evacuation',
      },
      verificationStatus: VerificationStatus.PENDING,
    };

    // Save in clinical_facts with Provenance
    await query(
      `INSERT INTO clinical_facts (
         patient_id, encounter_id, field, value, source_type, confidence, verification_status
       ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        data.patientId,
        data.encounterId,
        'ayush.assessment',
        JSON.stringify(assessment),
        ProvenanceType.PATIENT_REPORTED,
        0.95,
        VerificationStatus.PENDING,
      ]
    );

    return assessment;
  }

  public static async getByEncounter(encounterId: string): Promise<AyushAssessment | null> {
    const res = await query(
      `SELECT value FROM clinical_facts WHERE encounter_id = $1 AND field = 'ayush.assessment' ORDER BY created_at DESC LIMIT 1`,
      [encounterId]
    );

    const row = res.rows[0];
    if (!row) return null;
    const val = row.value;
    return typeof val === 'string' ? JSON.parse(val) : val;
  }
}
