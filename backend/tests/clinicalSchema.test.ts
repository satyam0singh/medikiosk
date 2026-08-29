import {
  CreatePatientSchema,
  RecordConsentSchema,
  ClinicalFactInputSchema,
  SymptomFactSchema,
  MedicationFactSchema,
  AiSymptomExtractionResultSchema,
} from '@medikiosk/clinical-schema';
import {
  ProvenanceType,
  VerificationStatus,
  ConsentStatus,
  LanguageCode,
  RedFlagSeverity,
} from '@medikiosk/shared-types';

describe('Clinical Schema & Boundary Validation', () => {
  it('should validate a valid patient creation payload', () => {
    const validPatient = {
      fullName: 'Ramesh Kumar',
      gender: 'MALE' as const,
      dateOfBirth: '1972-04-15',
      age: 54,
      contactNumber: '+91 98765 43210',
      preferredLanguage: LanguageCode.HI,
      address: {
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110076',
      },
    };

    const parsed = CreatePatientSchema.safeParse(validPatient);
    expect(parsed.success).toBe(true);
  });

  it('should reject invalid PIN code in patient address', () => {
    const invalidPatient = {
      fullName: 'Ramesh Kumar',
      gender: 'MALE' as const,
      address: {
        pincode: '12345', // Invalid 5 digits
      },
    };

    const parsed = CreatePatientSchema.safeParse(invalidPatient);
    expect(parsed.success).toBe(false);
  });

  it('should validate a valid consent record payload', () => {
    const consentPayload = {
      patientId: 'b0000000-0000-0000-0000-000000000001',
      status: ConsentStatus.GRANTED,
      scope: ['CLINICAL_INTAKE', 'DOCUMENT_OCR'],
      capturedVia: 'TOUCH_SCREEN' as const,
    };

    const parsed = RecordConsentSchema.safeParse(consentPayload);
    expect(parsed.success).toBe(true);
  });

  it('should validate clinical fact with provenance & confidence', () => {
    const factPayload = {
      patientId: 'b0000000-0000-0000-0000-000000000001',
      encounterId: 'c0000000-0000-0000-0000-000000000001',
      field: 'symptom.chest_pain',
      value: { character: 'burning', onset: 'yesterday' },
      sourceType: ProvenanceType.PATIENT_REPORTED,
      confidence: 0.95,
      verificationStatus: VerificationStatus.PENDING,
    };

    const parsed = ClinicalFactInputSchema.safeParse(factPayload);
    expect(parsed.success).toBe(true);
  });

  it('should validate individual symptom and medication fact schemas', () => {
    const validSymptom = {
      name: 'Retro-sternal burning pain',
      severityScale: 6,
      character: 'burning',
      provenance: {
        sourceType: ProvenanceType.PATIENT_REPORTED,
        confidence: 0.95,
        verificationStatus: VerificationStatus.PENDING,
      },
    };
    expect(SymptomFactSchema.safeParse(validSymptom).success).toBe(true);

    const validMedication = {
      drugName: 'Amlodipine 5mg',
      dosage: '5mg',
      frequency: 'OD',
      isCurrent: true,
      provenance: {
        sourceType: ProvenanceType.DOCUMENT_OCR,
        confidence: 0.92,
        verificationStatus: VerificationStatus.PENDING,
      },
    };
    expect(MedicationFactSchema.safeParse(validMedication).success).toBe(true);
  });

  it('should validate AI structured extraction result', () => {
    const aiOutput = {
      chiefComplaint: {
        raw: 'Kal raat se chest mein dard hai',
        normalized: 'Chest pain',
        confidence: 0.95,
      },
      symptoms: [
        {
          name: 'Chest Pain',
          character: 'Burning',
          severityScale: 7,
          provenance: {
            sourceType: ProvenanceType.PATIENT_REPORTED,
            confidence: 0.93,
            verificationStatus: VerificationStatus.PENDING,
          },
        },
      ],
      extractedMedications: [
        {
          drugName: 'Amlodipine 5mg',
          dosage: '5mg',
          frequency: 'OD',
          isCurrent: true,
          provenance: {
            sourceType: ProvenanceType.DOCUMENT_OCR,
            confidence: 0.91,
            verificationStatus: VerificationStatus.PENDING,
          },
        },
      ],
      extractedAllergies: [],
      missingClinicalFields: ['radiation'],
      potentialRedFlags: [
        {
          ruleCode: 'RF_CARD_001',
          reason: 'Severe chest pain reported',
          severity: RedFlagSeverity.CRITICAL_EMERGENCY,
        },
      ],
    };

    const parsed = AiSymptomExtractionResultSchema.safeParse(aiOutput);
    expect(parsed.success).toBe(true);
  });
});
