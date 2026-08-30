/**
 * MediKiosk Core Shared Domain Types & Contracts
 * Authoritative contracts for SIH26047 - LexCorps
 */

// ============================================================================
// 1. Core Enumerations
// ============================================================================

export enum UserRole {
  PATIENT = 'PATIENT',
  PHYSICIAN = 'PHYSICIAN',
  TRIAGE = 'TRIAGE',
  AYUSH_PRACTITIONER = 'AYUSH_PRACTITIONER',
  ADMIN = 'ADMIN',
  IT_ADMIN = 'IT_ADMIN',
}

export enum ProvenanceType {
  PATIENT_REPORTED = 'PATIENT_REPORTED',
  DOCUMENT_OCR = 'DOCUMENT_OCR',
  AI_EXTRACTED = 'AI_EXTRACTED',
  SYSTEM_RULE = 'SYSTEM_RULE',
  PHYSICIAN_VERIFIED = 'PHYSICIAN_VERIFIED',
}

export enum VerificationStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  MODIFIED = 'MODIFIED',
}

export enum ConfidenceLevel {
  HIGH = 'HIGH',       // >= 0.85
  MEDIUM = 'MEDIUM',   // 0.60 - 0.84
  LOW = 'LOW',         // < 0.60 (Requires Human Review)
}

export enum EncounterStatus {
  CREATED = 'CREATED',
  IN_PROGRESS = 'IN_PROGRESS',
  AWAITING_PHYSICIAN = 'AWAITING_PHYSICIAN',
  VERIFIED = 'VERIFIED',
  EXPORTED = 'EXPORTED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum ClinicalSessionState {
  CREATED = 'CREATED',
  IDENTIFICATION = 'IDENTIFICATION',
  CONSENT_PENDING = 'CONSENT_PENDING',
  CONSENTED = 'CONSENTED',
  LANGUAGE_SELECTED = 'LANGUAGE_SELECTED',
  HISTORY_ACTIVE = 'HISTORY_ACTIVE',
  SAFETY_REVIEW = 'SAFETY_REVIEW',
  DOCUMENT_CAPTURE = 'DOCUMENT_CAPTURE',
  DOCUMENT_PROCESSING = 'DOCUMENT_PROCESSING',
  VALIDATION = 'VALIDATION',
  SUMMARY_GENERATION = 'SUMMARY_GENERATION',
  PHYSICIAN_REVIEW = 'PHYSICIAN_REVIEW',
  VERIFIED = 'VERIFIED',
  EXPORTED = 'EXPORTED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum ConsentStatus {
  PENDING = 'PENDING',
  GRANTED = 'GRANTED',
  REVOKED = 'REVOKED',
  EXPIRED = 'EXPIRED',
}

export enum DocumentType {
  PRESCRIPTION = 'PRESCRIPTION',
  LAB_REPORT = 'LAB_REPORT',
  DISCHARGE_SUMMARY = 'DISCHARGE_SUMMARY',
  RADIOLOGY_REPORT = 'RADIOLOGY_REPORT',
  OTHER = 'OTHER',
}

export enum DocumentProcessingState {
  UPLOADED = 'UPLOADED',
  VALIDATED = 'VALIDATED',
  PROCESSING = 'PROCESSING',
  OCR_COMPLETE = 'OCR_COMPLETE',
  EXTRACTION_COMPLETE = 'EXTRACTION_COMPLETE',
  COMPLETED = 'COMPLETED',
  LOW_CONFIDENCE = 'LOW_CONFIDENCE',
  REVIEW_REQUIRED = 'REVIEW_REQUIRED',
  FAILED = 'FAILED',
}

export enum RedFlagSeverity {
  CRITICAL_EMERGENCY = 'CRITICAL_EMERGENCY', // Immediate clinical staff alert
  PRIORITY_URGENT = 'PRIORITY_URGENT',       // Priority queue placement
  WARNING = 'WARNING',                       // Highlight in physician dashboard
  INFO = 'INFO',                             // Information note
}

export enum TimelineEventType {
  CHIEF_COMPLAINT = 'CHIEF_COMPLAINT',
  SYMPTOM_ONSET = 'SYMPTOM_ONSET',
  MEDICATION_STARTED = 'MEDICATION_STARTED',
  MEDICATION_STOPPED = 'MEDICATION_STOPPED',
  LAB_INVESTIGATION = 'LAB_INVESTIGATION',
  HOSPITALIZATION = 'HOSPITALIZATION',
  SURGERY = 'SURGERY',
  DIAGNOSIS = 'DIAGNOSIS',
  ALLERGY_REACTION = 'ALLERGY_REACTION',
  CONSULTATION = 'CONSULTATION',
}

export enum LanguageCode {
  HI = 'hi',             // Hindi (हिन्दी)
  EN = 'en',             // English
  HINGLISH = 'hinglish', // Hinglish (हिंग्लिश)
  BN = 'bn',             // Bengali (বাংলা)
  MR = 'mr',             // Marathi (मराठी)
  TE = 'te',             // Telugu (తెలుగు)
  TA = 'ta',             // Tamil (தமிழ்)
  GU = 'gu',             // Gujarati (ગુજરાતી)
  UR = 'ur',             // Urdu (اردو)
  KN = 'kn',             // Kannada (ಕನ್ನಡ)
  OR = 'or',             // Odia (ଓଡ଼ିଆ)
  ML = 'ml',             // Malayalam (മലയാളം)
  PA = 'pa',             // Punjabi (ਪੰਜਾਬੀ)
  AS = 'as',             // Assamese (অসমীয়া)
  MAI = 'mai',           // Maithili (मैथिली)
  SAT = 'sat',           // Santali (ᱥᱟᱱᱛᱟᱲᱤ)
  KS = 'ks',             // Kashmiri (کٲشُر)
  NE = 'ne',             // Nepali (नेपाली)
  KOK = 'kok',           // Konkani (कोंकणी)
  SD = 'sd',             // Sindhi (سنڌي)
  DGO = 'dgo',           // Dogri (डोगरी)
  MNI = 'mni',           // Manipuri (ꯃꯤꯇꯩꯂꯣꯟ)
  BRX = 'brx',           // Bodo (बड़ो)
  SA = 'sa',             // Sanskrit (संस्कृतम्)
}

export interface IndicLanguageInfo {
  code: LanguageCode;
  name: string;
  nativeName: string;
  script: string;
  region: string;
  speechTag: string;
  bhashiniCode: string;
}

export const INDIC_LANGUAGES: IndicLanguageInfo[] = [
  { code: LanguageCode.HI, name: 'Hindi', nativeName: 'हिन्दी', script: 'Devanagari', region: 'North / Central India', speechTag: 'hi-IN', bhashiniCode: 'hi' },
  { code: LanguageCode.EN, name: 'English', nativeName: 'English (Indian)', script: 'Latin', region: 'Pan-India', speechTag: 'en-IN', bhashiniCode: 'en' },
  { code: LanguageCode.HINGLISH, name: 'Hinglish', nativeName: 'Hinglish (हिंग्लिश)', script: 'Latin / Devanagari', region: 'Urban Multilingual', speechTag: 'hi-IN', bhashiniCode: 'hi' },
  { code: LanguageCode.BN, name: 'Bengali', nativeName: 'বাংলা', script: 'Bengali', region: 'West Bengal, Tripura', speechTag: 'bn-IN', bhashiniCode: 'bn' },
  { code: LanguageCode.MR, name: 'Marathi', nativeName: 'मराठी', script: 'Devanagari', region: 'Maharashtra', speechTag: 'mr-IN', bhashiniCode: 'mr' },
  { code: LanguageCode.TE, name: 'Telugu', nativeName: 'తెలుగు', script: 'Telugu', region: 'Andhra Pradesh, Telangana', speechTag: 'te-IN', bhashiniCode: 'te' },
  { code: LanguageCode.TA, name: 'Tamil', nativeName: 'தமிழ்', script: 'Tamil', region: 'Tamil Nadu, Puducherry', speechTag: 'ta-IN', bhashiniCode: 'ta' },
  { code: LanguageCode.GU, name: 'Gujarati', nativeName: 'ગુજરાતી', script: 'Gujarati', region: 'Gujarat', speechTag: 'gu-IN', bhashiniCode: 'gu' },
  { code: LanguageCode.UR, name: 'Urdu', nativeName: 'اردو', script: 'Perso-Arabic', region: 'North / Deccan', speechTag: 'ur-IN', bhashiniCode: 'ur' },
  { code: LanguageCode.KN, name: 'Kannada', nativeName: 'ಕನ್ನಡ', script: 'Kannada', region: 'Karnataka', speechTag: 'kn-IN', bhashiniCode: 'kn' },
  { code: LanguageCode.OR, name: 'Odia', nativeName: 'ଓଡ଼ିଆ', script: 'Odia', region: 'Odisha', speechTag: 'or-IN', bhashiniCode: 'or' },
  { code: LanguageCode.ML, name: 'Malayalam', nativeName: 'മലയാളം', script: 'Malayalam', region: 'Kerala', speechTag: 'ml-IN', bhashiniCode: 'ml' },
  { code: LanguageCode.PA, name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', script: 'Gurmukhi', region: 'Punjab', speechTag: 'pa-IN', bhashiniCode: 'pa' },
  { code: LanguageCode.AS, name: 'Assamese', nativeName: 'অসমীয়া', script: 'Bengali-Assamese', region: 'Assam', speechTag: 'as-IN', bhashiniCode: 'as' },
  { code: LanguageCode.MAI, name: 'Maithili', nativeName: 'मैथिली', script: 'Devanagari', region: 'Bihar, Jharkhand', speechTag: 'mai-IN', bhashiniCode: 'mai' },
  { code: LanguageCode.SAT, name: 'Santali', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ', script: 'Ol Chiki', region: 'Jharkhand, Odisha', speechTag: 'sat-IN', bhashiniCode: 'sat' },
  { code: LanguageCode.KS, name: 'Kashmiri', nativeName: 'کٲشُر', script: 'Perso-Arabic', region: 'Jammu & Kashmir', speechTag: 'ks-IN', bhashiniCode: 'ks' },
  { code: LanguageCode.NE, name: 'Nepali', nativeName: 'नेपाली', script: 'Devanagari', region: 'Sikkim, North Bengal', speechTag: 'ne-NP', bhashiniCode: 'ne' },
  { code: LanguageCode.KOK, name: 'Konkani', nativeName: 'कोंकणी', script: 'Devanagari', region: 'Goa, Coastal Karnataka', speechTag: 'kok-IN', bhashiniCode: 'kok' },
  { code: LanguageCode.SD, name: 'Sindhi', nativeName: 'سنڌي', script: 'Perso-Arabic / Devanagari', region: 'Western India', speechTag: 'sd-IN', bhashiniCode: 'sd' },
  { code: LanguageCode.DGO, name: 'Dogri', nativeName: 'डोगरी', script: 'Devanagari', region: 'Jammu', speechTag: 'doi-IN', bhashiniCode: 'doi' },
  { code: LanguageCode.MNI, name: 'Manipuri', nativeName: 'ꯃꯤꯇꯩꯂꯣꯟ', script: 'Meetei Mayek', region: 'Manipur', speechTag: 'mni-IN', bhashiniCode: 'mni' },
  { code: LanguageCode.BRX, name: 'Bodo', nativeName: 'बड़ो', script: 'Devanagari', region: 'Assam Bodoland', speechTag: 'brx-IN', bhashiniCode: 'brx' },
  { code: LanguageCode.SA, name: 'Sanskrit', nativeName: 'संस्कृतम्', script: 'Devanagari', region: 'Classical / AYUSH Research', speechTag: 'sa-IN', bhashiniCode: 'sa' },
];

// ============================================================================
// 2. Identity & Patient Domain
// ============================================================================

export interface User {
  id: string;
  email: string;
  fullName: string;
  roles: UserRole[];
  isActive: boolean;
  hospitalId?: string;
  department?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DoctorSpecialist {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  department: string;
  specialtyTitle: string;
  roomNumber: string;
  isActive: boolean;
  avatarUrl?: string;
  availableSlotCount?: number;
}

export interface QueueFilter {
  department?: string;
  physicianId?: string;
  status?: EncounterStatus;
  search?: string;
}

export interface Patient {
  id: string;
  abhaId?: string;
  hospitalPatientId?: string;
  fullName: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  dateOfBirth?: string;
  age?: number;
  contactNumber?: string;
  preferredLanguage: LanguageCode;
  address?: {
    line1?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ConsentRecord {
  id: string;
  patientId: string;
  encounterId?: string;
  status: ConsentStatus;
  scope: string[]; // e.g. ['CLINICAL_INTAKE', 'DOCUMENT_OCR', 'AI_STRUCTURING', 'ABDM_SHARING']
  version: string;
  capturedVia: 'VOICE' | 'TOUCH_SCREEN' | 'PAPER_SIGNED';
  grantedAt: string;
  revokedAt?: string;
  ipAddress?: string;
  auditSignature?: string;
}

// ============================================================================
// 3. Clinical Sessions, Questions & Answers
// ============================================================================

export interface Encounter {
  id: string;
  patientId: string;
  physicianId?: string;
  status: EncounterStatus;
  department: string;
  encounterType: 'OPD_GENERAL' | 'OPD_AYUSH' | 'EMERGENCY' | 'TELECONSULT';
  chiefComplaintSummary?: string;
  startedAt: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClinicalSession {
  id: string;
  encounterId: string;
  patientId: string;
  currentState: ClinicalSessionState;
  selectedLanguage: LanguageCode;
  isDegradedMode: boolean;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionOption {
  id: string;
  label: Record<LanguageCode, string>;
  value: string;
  iconName?: string;
}

export interface ClinicalQuestion {
  id: string;
  code: string;
  section: 'CHIEF_COMPLAINT' | 'HPI' | 'PAST_HISTORY' | 'MEDICATIONS' | 'ALLERGIES' | 'AYUSH' | 'LIFESTYLE';
  prompt: Record<LanguageCode, string>;
  audioUrl?: Record<LanguageCode, string>;
  inputType: 'SINGLE_CHOICE' | 'MULTI_CHOICE' | 'VOICE_OR_TOUCH' | 'TEXT' | 'NUMERIC_SCALE' | 'BODY_LOCATION';
  options?: QuestionOption[];
  targetField: string;
  isRequired: boolean;
  conditions?: Array<{
    field: string;
    operator: 'EQUALS' | 'NOT_EQUALS' | 'CONTAINS' | 'EXISTS';
    value: unknown;
  }>;
}

export interface SessionAnswer {
  id: string;
  sessionId: string;
  questionId: string;
  rawText?: string;
  selectedOptions?: string[];
  audioRecordId?: string;
  confidence: number;
  sourceType: ProvenanceType;
  capturedAt: string;
}

// ============================================================================
// 4. Clinical Facts & Structured State
// ============================================================================

export interface ClinicalFact {
  id: string;
  patientId: string;
  encounterId: string;
  field: string; // e.g., 'hpi.pain_location', 'medication.name'
  value: unknown;
  normalizedValue?: unknown;
  sourceType: ProvenanceType;
  sourceId?: string;
  sourcePage?: number;
  confidence: number; // 0.00 to 1.00
  verificationStatus: VerificationStatus;
  verifiedByUserId?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SymptomFact {
  name: string;
  location?: string;
  character?: string;
  severityScale?: number; // 1-10
  onsetDuration?: string;
  onsetDate?: string;
  frequency?: string;
  aggravatingFactors?: string[];
  relievingFactors?: string[];
  associatedSymptoms?: string[];
  provenance: {
    sourceType: ProvenanceType;
    sourceId?: string;
    confidence: number;
    verificationStatus: VerificationStatus;
  };
}

export interface MedicationFact {
  id?: string;
  drugName: string;
  dosage?: string;
  route?: string; // ORAL, IV, TOPICAL, etc.
  frequency?: string; // e.g. "OD", "BD", "TDS"
  duration?: string;
  indication?: string;
  prescribedDate?: string;
  isCurrent: boolean;
  provenance: {
    sourceType: ProvenanceType;
    sourceId?: string;
    sourcePage?: number;
    confidence: number;
    verificationStatus: VerificationStatus;
  };
}

export interface AllergyFact {
  id?: string;
  allergen: string;
  allergyType: 'DRUG' | 'FOOD' | 'ENVIRONMENTAL' | 'OTHER';
  reaction?: string;
  severity: 'MILD' | 'MODERATE' | 'SEVERE';
  provenance: {
    sourceType: ProvenanceType;
    confidence: number;
    verificationStatus: VerificationStatus;
  };
}

export interface InvestigationFact {
  id?: string;
  testName: string;
  category?: 'BIOCHEMISTRY' | 'HEMATOLOGY' | 'RADIOLOGY' | 'PATHOLOGY';
  testDate?: string;
  resultValue?: string;
  unit?: string;
  referenceRange?: string;
  isAbnormal?: boolean;
  provenance: {
    sourceType: ProvenanceType;
    sourceId?: string;
    sourcePage?: number;
    confidence: number;
    verificationStatus: VerificationStatus;
  };
}

// ============================================================================
// 5. AYUSH Clinical Assessment Schema
// ============================================================================

export interface AyushAssessment {
  prakriti?: {
    vataScore: number;
    pittaScore: number;
    kaphaScore: number;
    dominantPrakriti: 'VATA' | 'PITTA' | 'KAPHA' | 'VATA_PITTA' | 'PITTA_KAPHA' | 'VATA_KAPHA' | 'TRIDOSHA';
  };
  vikriti?: {
    doshaImbalance: string[];
    manifestation: string;
  };
  ashtavidha?: {
    nadi?: string;
    mutra?: string;
    mala?: string;
    jihwa?: string;
    shabda?: string;
    sparsha?: string;
    drik?: string;
    akriti?: string;
  };
  dashavidha?: {
    dushya?: string;
    desha?: string;
    bala?: string;
    kala?: string;
    anala?: 'MANDA' | 'TIKSHNA' | 'VISHAMA' | 'SAMA';
    prakriti?: string;
    vaya?: 'BALA' | 'MADHYA' | 'VRIDDHA';
    sattva?: 'PRAVARA' | 'MADHYAMA' | 'AVARA';
    satmya?: string;
    ahara?: 'PRAVARA' | 'MADHYAMA' | 'AVARA';
  };
  aharaVihara?: {
    dietaryHabits?: string;
    sleepPattern?: string;
    physicalActivity?: string;
    bowelHabits?: string;
  };
  verificationStatus: VerificationStatus;
}

// ============================================================================
// 6. Documents & Extractions
// ============================================================================

export interface DocumentRecord {
  id: string;
  patientId: string;
  encounterId: string;
  fileName: string;
  mimeType: string;
  fileSizeBytes: number;
  storageKey: string;
  documentType: DocumentType;
  processingState: DocumentProcessingState;
  pageCount?: number;
  uploadedAt: string;
  processedAt?: string;
  errorMessage?: string;
}

export interface DocumentExtractionResult {
  id: string;
  documentId: string;
  rawOcrText: string;
  classifiedType: DocumentType;
  overallConfidence: number;
  extractedEntities: {
    medications: MedicationFact[];
    investigations: InvestigationFact[];
    allergies: AllergyFact[];
    diagnoses: string[];
    dates: string[];
  };
  lowConfidenceReasons?: string[];
  status: VerificationStatus;
  createdAt: string;
}

// ============================================================================
// 7. Safety, Red Flags & Timeline
// ============================================================================

export interface RedFlagRule {
  id: string;
  code: string;
  title: string;
  description: string;
  severity: RedFlagSeverity;
  category: 'CARDIOLOGY' | 'RESPIRATORY' | 'NEUROLOGY' | 'SURGICAL' | 'PEDIATRIC' | 'OBSTETRIC' | 'GENERAL';
  isEnabled: boolean;
  deterministicLogic: string; // Serialized expression or rule code
}

export interface RedFlagAlert {
  id: string;
  encounterId: string;
  patientId: string;
  ruleId: string;
  severity: RedFlagSeverity;
  alertMessage: string;
  triggerFacts: Array<{
    field: string;
    value: unknown;
    sourceType: ProvenanceType;
  }>;
  isAcknowledged: boolean;
  acknowledgedByUserId?: string;
  acknowledgedAt?: string;
  createdAt: string;
}

export interface TimelineEvent {
  id: string;
  patientId: string;
  encounterId?: string;
  eventDate?: string;
  isDateEstimated: boolean;
  eventType: TimelineEventType;
  title: string;
  description: string;
  sourceType: ProvenanceType;
  sourceDocumentId?: string;
  sourcePage?: number;
  confidence: number;
  verificationStatus: VerificationStatus;
  hasConflict: boolean;
  conflictDetails?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// ============================================================================
// 8. Clinical Summary & Physician Review
// ============================================================================

export interface ClinicalSummary {
  id: string;
  encounterId: string;
  patientId: string;
  chiefComplaint: string;
  hpiNarrative: string;
  symptoms: SymptomFact[];
  currentMedications: MedicationFact[];
  allergies: AllergyFact[];
  investigations: InvestigationFact[];
  timeline: TimelineEvent[];
  redFlags: RedFlagAlert[];
  ayushAssessment?: AyushAssessment;
  completenessScore: number; // 0-100%
  unansweredRequiredFields: string[];
  conflictingFactsCount: number;
  overallConfidence: number;
  isVerifiedByPhysician: boolean;
  generatedAt: string;
}

export interface ControlledClinicalSummary {
  encounterId: string;
  patientId: string;
  chiefComplaint: {
    primary: string;
    onset?: string;
    severity?: number;
    character?: string;
    radiation?: string;
    aggravatingFactors?: string[];
    relievingFactors?: string[];
  };
  hpiNarrative: string;
  currentMedications: MedicationFact[];
  allergies: AllergyFact[];
  pastMedicalHistory?: string[];
  ayushAssessment?: AyushAssessment;
  redFlags?: Array<{
    ruleId: string;
    severity: RedFlagSeverity;
    message: string;
    isAcknowledged: boolean;
  }>;
  uncertainties?: Array<{
    field: string;
    reason: string;
    suggestedAction: string;
  }>;
  suggestedInvestigations?: string[];
  provisionalDiagnosis?: string;
  icd10Codes?: string[];
  treatmentPlan?: string;
  generatedAt: string;
  isPhysicianVerified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface PhysicianReviewRecord {
  id: string;
  encounterId: string;
  physicianId: string;
  summaryId: string;
  isApproved: boolean;
  editedFields: Record<string, { oldValue: unknown; newValue: unknown }>;
  clinicalNotes?: string;
  triageClassification?: string;
  reviewedAt: string;
}

// ============================================================================
// 9. Audit Logging & Security
// ============================================================================

export interface AuditLogEntry {
  id: string;
  actorId?: string;
  actorRole?: UserRole;
  action: string; // e.g. 'LOGIN', 'VIEW_RECORD', 'RECORD_CONSENT', 'VERIFY_SUMMARY', 'TRIGGER_RED_FLAG'
  patientId?: string;
  encounterId?: string;
  ipAddress?: string;
  userAgent?: string;
  payload?: Record<string, unknown>; // PHI-safe masked data
  timestamp: string;
}

// ============================================================================
// 10. API Envelope & Health Contract
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
    version: string;
  };
}

export interface DependencyHealthStatus {
  status: 'UP' | 'DOWN' | 'DEGRADED';
  latencyMs?: number;
  message?: string;
  details?: Record<string, unknown>;
}

export interface SystemHealthReport {
  status: 'HEALTHY' | 'UNHEALTHY' | 'DEGRADED';
  version: string;
  environment: string;
  uptimeSeconds: number;
  timestamp: string;
  dependencies: {
    database: DependencyHealthStatus;
    redis: DependencyHealthStatus;
    storage: DependencyHealthStatus;
    aiProviders?: Record<string, DependencyHealthStatus>;
  };
}
