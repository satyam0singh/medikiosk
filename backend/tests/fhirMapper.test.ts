import { FhirMapper } from '@medikiosk/fhir-mapper';
import {
  Patient,
  Encounter,
  ClinicalSummary,
  ProvenanceType,
  VerificationStatus,
  LanguageCode,
  EncounterStatus,
} from '@medikiosk/shared-types';

describe('FHIR R4 Mapper', () => {
  const mockPatient: Patient = {
    id: 'b0000000-0000-0000-0000-000000000001',
    abhaId: '91-4829-1029-4820',
    hospitalPatientId: 'MRN-2026-00482',
    fullName: 'Ramesh Kumar',
    gender: 'MALE',
    dateOfBirth: '1972-04-15',
    contactNumber: '+91 98765 43210',
    preferredLanguage: LanguageCode.HI,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockEncounter: Encounter = {
    id: 'c0000000-0000-0000-0000-000000000001',
    patientId: mockPatient.id,
    status: EncounterStatus.COMPLETED,
    department: 'General Medicine',
    encounterType: 'OPD_GENERAL',
    chiefComplaintSummary: 'Chest pain',
    startedAt: '2026-08-30T10:00:00.000Z',
    completedAt: '2026-08-30T10:30:00.000Z',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockSummary: ClinicalSummary = {
    id: 's0000000-0000-0000-0000-000000000001',
    encounterId: mockEncounter.id,
    patientId: mockPatient.id,
    chiefComplaint: 'Chest pain',
    hpiNarrative: 'Burning sensation since yesterday night.',
    symptoms: [],
    currentMedications: [
      {
        id: 'med-1',
        drugName: 'Amlodipine',
        dosage: '5mg',
        frequency: 'OD',
        isCurrent: true,
        provenance: {
          sourceType: ProvenanceType.DOCUMENT_OCR,
          confidence: 0.92,
          verificationStatus: VerificationStatus.VERIFIED,
        },
      },
    ],
    allergies: [
      {
        id: 'alg-1',
        allergen: 'Penicillin',
        allergyType: 'DRUG',
        severity: 'SEVERE',
        provenance: {
          sourceType: ProvenanceType.PATIENT_REPORTED,
          confidence: 0.95,
          verificationStatus: VerificationStatus.VERIFIED,
        },
      },
    ],
    investigations: [
      {
        id: 'inv-1',
        testName: 'Fasting Blood Sugar',
        resultValue: '110',
        unit: 'mg/dL',
        isAbnormal: false,
        provenance: {
          sourceType: ProvenanceType.DOCUMENT_OCR,
          confidence: 0.96,
          verificationStatus: VerificationStatus.VERIFIED,
        },
      },
    ],
    timeline: [],
    redFlags: [],
    completenessScore: 92,
    unansweredRequiredFields: [],
    conflictingFactsCount: 0,
    overallConfidence: 0.93,
    isVerifiedByPhysician: true,
    generatedAt: new Date().toISOString(),
  };

  it('should map Patient to FHIR R4 Patient with ABHA identifier', () => {
    const fhirPatient = FhirMapper.mapPatient(mockPatient);

    expect(fhirPatient.resourceType).toBe('Patient');
    expect(fhirPatient.name?.[0]?.text).toBe('Ramesh Kumar');
    expect(fhirPatient.gender).toBe('male');
    expect(fhirPatient.identifier).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          system: 'https://healthid.abdm.gov.in',
          value: '91-4829-1029-4820',
        }),
      ])
    );
  });

  it('should create complete FHIR R4 Bundle containing Patient, Encounter, Medications, Allergies & Observations', () => {
    const bundle = FhirMapper.createExportBundle(mockPatient, mockEncounter, mockSummary);

    expect(bundle.resourceType).toBe('Bundle');
    expect(bundle.type).toBe('document');
    expect(bundle.entry.length).toBe(5); // Patient + Encounter + 1 Med + 1 Allergy + 1 Obs

    const resourceTypes = bundle.entry.map((e) => e.resource.resourceType);
    expect(resourceTypes).toContain('Patient');
    expect(resourceTypes).toContain('Encounter');
    expect(resourceTypes).toContain('MedicationStatement');
    expect(resourceTypes).toContain('AllergyIntolerance');
    expect(resourceTypes).toContain('Observation');
  });
});
