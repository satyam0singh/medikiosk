import { z } from 'zod';
import {
  UserRole,
  ProvenanceType,
  VerificationStatus,
  ConfidenceLevel,
  EncounterStatus,
  ClinicalSessionState,
  ConsentStatus,
  DocumentType,
  DocumentProcessingState,
  RedFlagSeverity,
  TimelineEventType,
  LanguageCode,
} from '@medikiosk/shared-types';

// ============================================================================
// 1. Core Enums Schemas
// ============================================================================

export const UserRoleSchema = z.nativeEnum(UserRole);
export const ProvenanceTypeSchema = z.nativeEnum(ProvenanceType);
export const VerificationStatusSchema = z.nativeEnum(VerificationStatus);
export const ConfidenceLevelSchema = z.nativeEnum(ConfidenceLevel);
export const EncounterStatusSchema = z.nativeEnum(EncounterStatus);
export const ClinicalSessionStateSchema = z.nativeEnum(ClinicalSessionState);
export const ConsentStatusSchema = z.nativeEnum(ConsentStatus);
export const DocumentTypeSchema = z.nativeEnum(DocumentType);
export const DocumentProcessingStateSchema = z.nativeEnum(DocumentProcessingState);
export const RedFlagSeveritySchema = z.nativeEnum(RedFlagSeverity);
export const TimelineEventTypeSchema = z.nativeEnum(TimelineEventType);
export const LanguageCodeSchema = z.nativeEnum(LanguageCode);

// ============================================================================
// 2. Patient & Consent Schemas
// ============================================================================

export const CreatePatientSchema = z.object({
  abhaId: z.string().optional(),
  hospitalPatientId: z.string().optional(),
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(150),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be YYYY-MM-DD').optional(),
  age: z.number().int().min(0).max(130).optional(),
  contactNumber: z.string().regex(/^[0-9+ -]{7,15}$/, 'Invalid phone number format').optional(),
  preferredLanguage: LanguageCodeSchema.default(LanguageCode.EN),
  address: z.object({
    line1: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().regex(/^[0-9]{6}$/, 'Invalid 6-digit Indian PIN code').optional(),
  }).optional(),
});

export const RecordConsentSchema = z.object({
  patientId: z.string().uuid('Invalid patient UUID'),
  encounterId: z.string().uuid('Invalid encounter UUID').optional(),
  status: ConsentStatusSchema,
  scope: z.array(z.string()).min(1, 'At least one consent scope is required'),
  version: z.string().default('v1.0'),
  capturedVia: z.enum(['VOICE', 'TOUCH_SCREEN', 'PAPER_SIGNED']),
  auditSignature: z.string().optional(),
});

// ============================================================================
// 3. Clinical Session & Question Answers
// ============================================================================

export const CreateSessionSchema = z.object({
  encounterId: z.string().uuid('Invalid encounter UUID'),
  patientId: z.string().uuid('Invalid patient UUID'),
  selectedLanguage: LanguageCodeSchema.default(LanguageCode.EN),
  metadata: z.record(z.unknown()).optional().default({}),
});

export const RecordAnswerSchema = z.object({
  sessionId: z.string().uuid('Invalid session UUID'),
  questionId: z.string().min(1, 'Question ID is required'),
  rawText: z.string().optional(),
  selectedOptions: z.array(z.string()).optional(),
  audioRecordId: z.string().optional(),
  confidence: z.number().min(0).max(1).default(1.0),
  sourceType: ProvenanceTypeSchema.default(ProvenanceType.PATIENT_REPORTED),
});

// ============================================================================
// 4. Clinical Facts Schemas
// ============================================================================

export const ClinicalFactInputSchema = z.object({
  patientId: z.string().uuid(),
  encounterId: z.string().uuid(),
  field: z.string().min(1, 'Field name required'),
  value: z.unknown(),
  normalizedValue: z.unknown().optional(),
  sourceType: ProvenanceTypeSchema,
  sourceId: z.string().optional(),
  sourcePage: z.number().int().min(1).optional(),
  confidence: z.number().min(0).max(1),
  verificationStatus: VerificationStatusSchema.default(VerificationStatus.PENDING),
});

export const SymptomFactSchema = z.object({
  name: z.string().min(1, 'Symptom name required'),
  location: z.string().optional(),
  character: z.string().optional(),
  severityScale: z.number().min(1).max(10).optional(),
  onsetDuration: z.string().optional(),
  onsetDate: z.string().optional(),
  frequency: z.string().optional(),
  aggravatingFactors: z.array(z.string()).optional(),
  relievingFactors: z.array(z.string()).optional(),
  associatedSymptoms: z.array(z.string()).optional(),
  provenance: z.object({
    sourceType: ProvenanceTypeSchema,
    sourceId: z.string().optional(),
    confidence: z.number().min(0).max(1),
    verificationStatus: VerificationStatusSchema,
  }),
});

export const MedicationFactSchema = z.object({
  id: z.string().optional(),
  drugName: z.string().min(1, 'Drug name is required'),
  dosage: z.string().optional(),
  route: z.string().optional(),
  frequency: z.string().optional(),
  duration: z.string().optional(),
  indication: z.string().optional(),
  prescribedDate: z.string().optional(),
  isCurrent: z.boolean().default(true),
  provenance: z.object({
    sourceType: ProvenanceTypeSchema,
    sourceId: z.string().optional(),
    sourcePage: z.number().int().min(1).optional(),
    confidence: z.number().min(0).max(1),
    verificationStatus: VerificationStatusSchema,
  }),
});

export const AllergyFactSchema = z.object({
  id: z.string().optional(),
  allergen: z.string().min(1, 'Allergen name required'),
  allergyType: z.enum(['DRUG', 'FOOD', 'ENVIRONMENTAL', 'OTHER']),
  reaction: z.string().optional(),
  severity: z.enum(['MILD', 'MODERATE', 'SEVERE']),
  provenance: z.object({
    sourceType: ProvenanceTypeSchema,
    confidence: z.number().min(0).max(1),
    verificationStatus: VerificationStatusSchema,
  }),
});

export const InvestigationFactSchema = z.object({
  id: z.string().optional(),
  testName: z.string().min(1, 'Test name required'),
  category: z.enum(['BIOCHEMISTRY', 'HEMATOLOGY', 'RADIOLOGY', 'PATHOLOGY']).optional(),
  testDate: z.string().optional(),
  resultValue: z.string().optional(),
  unit: z.string().optional(),
  referenceRange: z.string().optional(),
  isAbnormal: z.boolean().optional(),
  provenance: z.object({
    sourceType: ProvenanceTypeSchema,
    sourceId: z.string().optional(),
    sourcePage: z.number().int().min(1).optional(),
    confidence: z.number().min(0).max(1),
    verificationStatus: VerificationStatusSchema,
  }),
});

// ============================================================================
// 5. AI Structured Extraction Schemas (Strict JSON)
// ============================================================================

export const AiSymptomExtractionResultSchema = z.object({
  chiefComplaint: z.object({
    raw: z.string(),
    normalized: z.string(),
    confidence: z.number().min(0).max(1),
  }),
  symptoms: z.array(SymptomFactSchema),
  extractedMedications: z.array(MedicationFactSchema).optional().default([]),
  extractedAllergies: z.array(AllergyFactSchema).optional().default([]),
  missingClinicalFields: z.array(z.string()).default([]),
  potentialRedFlags: z.array(
    z.object({
      ruleCode: z.string(),
      reason: z.string(),
      severity: RedFlagSeveritySchema,
    })
  ).default([]),
});

export const AiDocumentExtractionResultSchema = z.object({
  documentType: DocumentTypeSchema,
  overallConfidence: z.number().min(0).max(1),
  medications: z.array(MedicationFactSchema),
  investigations: z.array(InvestigationFactSchema),
  allergies: z.array(AllergyFactSchema),
  diagnoses: z.array(z.string()),
  dates: z.array(z.string()),
  lowConfidenceItems: z.array(
    z.object({
      field: z.string(),
      rawOcrText: z.string(),
      confidence: z.number(),
      reason: z.string(),
    })
  ).default([]),
});

// ============================================================================
// 6. Controlled Clinical Summary Schema
// ============================================================================

export const ControlledClinicalSummarySchema = z.object({
  chiefComplaint: z.string(),
  hpiNarrative: z.string(),
  symptoms: z.array(SymptomFactSchema),
  currentMedications: z.array(MedicationFactSchema),
  allergies: z.array(AllergyFactSchema),
  investigations: z.array(InvestigationFactSchema),
  timeline: z.array(
    z.object({
      eventDate: z.string().optional(),
      isDateEstimated: z.boolean(),
      eventType: TimelineEventTypeSchema,
      title: z.string(),
      description: z.string(),
      sourceType: ProvenanceTypeSchema,
      confidence: z.number(),
    })
  ),
  redFlagsDetected: z.array(
    z.object({
      severity: RedFlagSeveritySchema,
      message: z.string(),
      acknowledged: z.boolean(),
    })
  ),
  completenessScore: z.number().min(0).max(100),
  unansweredRequiredFields: z.array(z.string()),
  conflictsDetected: z.array(
    z.object({
      field: z.string(),
      sourceA: z.string(),
      sourceB: z.string(),
      description: z.string(),
    })
  ),
});

// ============================================================================
// 7. Physician Verification & Edit Payload Schema
// ============================================================================

export const PhysicianReviewSubmissionSchema = z.object({
  encounterId: z.string().uuid(),
  summaryId: z.string().uuid(),
  isApproved: z.boolean(),
  editedFields: z.record(
    z.object({
      oldValue: z.unknown(),
      newValue: z.unknown(),
    })
  ).default({}),
  clinicalNotes: z.string().max(2000).optional(),
  triageClassification: z.string().optional(),
});
