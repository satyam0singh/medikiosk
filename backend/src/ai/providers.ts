import {
  LanguageCode,
  MedicationFact,
  AllergyFact,
  SymptomFact,
  ProvenanceType,
  VerificationStatus,
  RedFlagSeverity,
} from '@medikiosk/shared-types';

// ============================================================================
// 1. ASR Provider Interface & Implementation
// ============================================================================

export interface AsrTranscriptionInput {
  audioBuffer: Buffer;
  audioMimeType: string;
  expectedLanguage?: LanguageCode;
}

export interface AsrTranscriptionResult {
  transcript: string;
  detectedLanguage: LanguageCode;
  confidence: number;
  wordTimestamps?: Array<{ word: string; start: number; end: number }>;
}

export interface IAsrProvider {
  transcribe(input: AsrTranscriptionInput): Promise<AsrTranscriptionResult>;
}

export class MockAsrProvider implements IAsrProvider {
  async transcribe(input: AsrTranscriptionInput): Promise<AsrTranscriptionResult> {
    return {
      transcript: 'Kal raat se chest mein continuous burning sensation hai aur khana khane ke baad badh jaata hai',
      detectedLanguage: input.expectedLanguage || LanguageCode.HINGLISH,
      confidence: 0.94,
    };
  }
}

// ============================================================================
// 2. TTS Provider Interface & Implementation
// ============================================================================

export interface TtsSynthesisInput {
  text: string;
  language: LanguageCode;
  gender?: 'MALE' | 'FEMALE';
}

export interface TtsSynthesisResult {
  audioBuffer: Buffer;
  audioMimeType: string;
  durationMs?: number;
}

export interface ITtsProvider {
  synthesize(input: TtsSynthesisInput): Promise<TtsSynthesisResult>;
}

export class MockTtsProvider implements ITtsProvider {
  async synthesize(_input: TtsSynthesisInput): Promise<TtsSynthesisResult> {
    // Return empty mock audio buffer
    return {
      audioBuffer: Buffer.from('RIFF_MOCK_WAV_AUDIO_PAYLOAD'),
      audioMimeType: 'audio/wav',
      durationMs: 2500,
    };
  }
}

// ============================================================================
// 3. OCR Provider Interface & Implementation
// ============================================================================

export interface OcrProcessingInput {
  fileBuffer: Buffer;
  mimeType: string;
  fileName: string;
}

export interface OcrProcessingResult {
  rawText: string;
  confidence: number;
  pageCount: number;
  layoutBlocks?: Array<{ text: string; confidence: number; boundingBox?: number[] }>;
}

export interface IOcrProvider {
  processDocument(input: OcrProcessingInput): Promise<OcrProcessingResult>;
}

export class MockOcrProvider implements IOcrProvider {
  async processDocument(_input: OcrProcessingInput): Promise<OcrProcessingResult> {
    return {
      rawText: `
        ALL INDIA INSTITUTE OF AYURVEDA - OPD PRESCRIPTION
        Date: 2025-11-14
        Patient: Ramesh Kumar (Age: 54/M)
        Rx:
        1. Tab Amlodipine 5mg - 1 Tab OD x 30 days (Morning after food)
        2. Tab Telmisartan 40mg - 1 Tab OD x 30 days
        3. Cap Omeprazole 20mg - 1 Cap OD before breakfast
        Advice: Lipid Profile, ECG, Fasting Blood Sugar
        Next Followup: 1 month
      `.trim(),
      confidence: 0.92,
      pageCount: 1,
    };
  }
}

// ============================================================================
// 4. Clinical NER / LLM Extraction Interface
// ============================================================================

export interface ClinicalExtractionInput {
  patientSpeechOrText: string;
  conversationHistory?: Array<{ role: 'system' | 'patient'; content: string }>;
  currentSymptomState?: SymptomFact[];
}

export interface ClinicalExtractionResult {
  chiefComplaint: {
    raw: string;
    normalized: string;
    confidence: number;
  };
  symptoms: SymptomFact[];
  extractedMedications: MedicationFact[];
  extractedAllergies: AllergyFact[];
  missingClinicalFields: string[];
  potentialRedFlags: Array<{
    ruleCode: string;
    reason: string;
    severity: RedFlagSeverity;
  }>;
}

export interface ILlmProvider {
  extractClinicalEntities(input: ClinicalExtractionInput): Promise<ClinicalExtractionResult>;
  generateControlledSummary(state: Record<string, unknown>): Promise<string>;
}

export class MockLlmProvider implements ILlmProvider {
  async extractClinicalEntities(input: ClinicalExtractionInput): Promise<ClinicalExtractionResult> {
    return {
      chiefComplaint: {
        raw: input.patientSpeechOrText,
        normalized: 'Chest burning sensation after meals',
        confidence: 0.95,
      },
      symptoms: [
        {
          name: 'Chest Discomfort / Burning',
          location: 'Retro-sternal',
          character: 'Burning / Acidity',
          severityScale: 6,
          onsetDuration: 'Since yesterday night',
          aggravatingFactors: ['After eating heavy meals'],
          relievingFactors: ['Resting'],
          associatedSymptoms: ['Mild nausea'],
          provenance: {
            sourceType: ProvenanceType.PATIENT_REPORTED,
            confidence: 0.94,
            verificationStatus: VerificationStatus.PENDING,
          },
        },
      ],
      extractedMedications: [],
      extractedAllergies: [],
      missingClinicalFields: ['radiation', 'prior_cardiac_history'],
      potentialRedFlags: [],
    };
  }

  async generateControlledSummary(_state: Record<string, unknown>): Promise<string> {
    return `Patient presented with retro-sternal burning chest discomfort starting yesterday night, aggravated postprandially. No known drug allergies reported. Prior history includes essential hypertension on Amlodipine 5mg. Vital red flags evaluated: no radiation to left arm or syncope reported.`;
  }
}

// ============================================================================
// 5. AI Service Registry
// ============================================================================

export class AiServiceRegistry {
  private static asrProvider: IAsrProvider = new MockAsrProvider();
  private static ttsProvider: ITtsProvider = new MockTtsProvider();
  private static ocrProvider: IOcrProvider = new MockOcrProvider();
  private static llmProvider: ILlmProvider = new MockLlmProvider();

  public static getAsr(): IAsrProvider { return this.asrProvider; }
  public static getTts(): ITtsProvider { return this.ttsProvider; }
  public static getOcr(): IOcrProvider { return this.ocrProvider; }
  public static getLlm(): ILlmProvider { return this.llmProvider; }

  public static setAsr(provider: IAsrProvider): void { this.asrProvider = provider; }
  public static setTts(provider: ITtsProvider): void { this.ttsProvider = provider; }
  public static setOcr(provider: IOcrProvider): void { this.ocrProvider = provider; }
  public static setLlm(provider: ILlmProvider): void { this.llmProvider = provider; }
}
