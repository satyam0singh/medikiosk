import {
  Patient,
  Encounter,
  ClinicalSummary,
  MedicationFact,
  AllergyFact,
  InvestigationFact,
} from '@medikiosk/shared-types';

export interface FhirIdentifier {
  system: string;
  value: string;
}

export interface FhirCodeableConcept {
  coding?: Array<{
    system?: string;
    code?: string;
    display?: string;
  }>;
  text?: string;
}

export interface FhirResource {
  resourceType: string;
  id: string;
  meta?: {
    versionId?: string;
    lastUpdated?: string;
    profile?: string[];
  };
}

export interface FhirPatient extends FhirResource {
  resourceType: 'Patient';
  identifier?: FhirIdentifier[];
  name?: Array<{
    use?: string;
    text: string;
  }>;
  telecom?: Array<{
    system: string;
    value: string;
  }>;
  gender?: 'male' | 'female' | 'other' | 'unknown';
  birthDate?: string;
}

export interface FhirEncounter extends FhirResource {
  resourceType: 'Encounter';
  status: 'planned' | 'arrived' | 'triaged' | 'in-progress' | 'onleave' | 'finished' | 'cancelled';
  class: {
    system: string;
    code: string;
    display: string;
  };
  subject: {
    reference: string;
    display?: string;
  };
  period?: {
    start?: string;
    end?: string;
  };
}

export interface FhirCondition extends FhirResource {
  resourceType: 'Condition';
  clinicalStatus: FhirCodeableConcept;
  verificationStatus: FhirCodeableConcept;
  category?: FhirCodeableConcept[];
  code: FhirCodeableConcept;
  subject: {
    reference: string;
  };
  encounter?: {
    reference: string;
  };
  recordedDate?: string;
}

export interface FhirObservation extends FhirResource {
  resourceType: 'Observation';
  status: 'registered' | 'preliminary' | 'final' | 'amended' | 'corrected';
  category?: FhirCodeableConcept[];
  code: FhirCodeableConcept;
  subject: {
    reference: string;
  };
  valueQuantity?: {
    value: number;
    unit: string;
    system?: string;
  };
  valueString?: string;
  effectiveDateTime?: string;
}

export interface FhirMedicationStatement extends FhirResource {
  resourceType: 'MedicationStatement';
  status: 'active' | 'completed' | 'entered-in-error' | 'intended' | 'stopped' | 'on-hold';
  medicationCodeableConcept: FhirCodeableConcept;
  subject: {
    reference: string;
  };
  effectiveDateTime?: string;
  dosage?: Array<{
    text?: string;
  }>;
}

export interface FhirAllergyIntolerance extends FhirResource {
  resourceType: 'AllergyIntolerance';
  clinicalStatus?: FhirCodeableConcept;
  verificationStatus?: FhirCodeableConcept;
  type?: 'allergy' | 'intolerance';
  category?: Array<'food' | 'medication' | 'environment' | 'biologic'>;
  criticality?: 'low' | 'high' | 'unable-to-assess';
  code: FhirCodeableConcept;
  patient: {
    reference: string;
  };
}

export interface FhirBundle extends FhirResource {
  resourceType: 'Bundle';
  type: 'document' | 'collection' | 'transaction';
  timestamp: string;
  entry: Array<{
    fullUrl?: string;
    resource: FhirResource;
  }>;
}

// ============================================================================
// Mapping Utilities
// ============================================================================

export class FhirMapper {
  /**
   * Maps internal MediKiosk Patient entity to FHIR R4 Patient
   */
  public static mapPatient(patient: Patient): FhirPatient {
    const identifiers: FhirIdentifier[] = [];

    if (patient.abhaId) {
      identifiers.push({
        system: 'https://healthid.abdm.gov.in',
        value: patient.abhaId,
      });
    }

    if (patient.hospitalPatientId) {
      identifiers.push({
        system: 'https://medikiosk.local/mrn',
        value: patient.hospitalPatientId,
      });
    }

    return {
      resourceType: 'Patient',
      id: patient.id,
      meta: {
        profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/Patient'],
        lastUpdated: patient.updatedAt,
      },
      identifier: identifiers.length > 0 ? identifiers : undefined,
      name: [{
        use: 'official',
        text: patient.fullName,
      }],
      gender: patient.gender === 'MALE' ? 'male' : patient.gender === 'FEMALE' ? 'female' : 'other',
      birthDate: patient.dateOfBirth,
      telecom: patient.contactNumber ? [{
        system: 'phone',
        value: patient.contactNumber,
      }] : undefined,
    };
  }

  /**
   * Maps internal MediKiosk Encounter entity to FHIR R4 Encounter
   */
  public static mapEncounter(encounter: Encounter, patientName?: string): FhirEncounter {
    return {
      resourceType: 'Encounter',
      id: encounter.id,
      meta: {
        profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/Encounter'],
      },
      status: encounter.status === 'COMPLETED' || encounter.status === 'VERIFIED' ? 'finished' : 'in-progress',
      class: {
        system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
        code: 'AMB',
        display: 'ambulatory',
      },
      subject: {
        reference: `Patient/${encounter.patientId}`,
        display: patientName,
      },
      period: {
        start: encounter.startedAt,
        end: encounter.completedAt,
      },
    };
  }

  /**
   * Maps medication facts to FHIR MedicationStatement resources
   */
  public static mapMedications(medications: MedicationFact[], patientId: string): FhirMedicationStatement[] {
    return medications.map((med, idx) => ({
      resourceType: 'MedicationStatement',
      id: med.id || `med-${idx + 1}`,
      status: med.isCurrent ? 'active' : 'completed',
      medicationCodeableConcept: {
        text: med.drugName,
      },
      subject: {
        reference: `Patient/${patientId}`,
      },
      dosage: [{
        text: [med.dosage, med.frequency, med.route, med.duration].filter(Boolean).join(', '),
      }],
    }));
  }

  /**
   * Maps allergy facts to FHIR AllergyIntolerance resources
   */
  public static mapAllergies(allergies: AllergyFact[], patientId: string): FhirAllergyIntolerance[] {
    return allergies.map((alg, idx) => ({
      resourceType: 'AllergyIntolerance',
      id: alg.id || `allergy-${idx + 1}`,
      clinicalStatus: {
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical',
          code: 'active',
          display: 'Active',
        }],
      },
      criticality: alg.severity === 'SEVERE' ? 'high' : 'low',
      code: {
        text: alg.allergen,
      },
      patient: {
        reference: `Patient/${patientId}`,
      },
    }));
  }

  /**
   * Maps investigation facts to FHIR Observation resources
   */
  public static mapInvestigations(investigations: InvestigationFact[], patientId: string): FhirObservation[] {
    return investigations.map((inv, idx) => ({
      resourceType: 'Observation',
      id: inv.id || `obs-${idx + 1}`,
      status: 'final',
      code: {
        text: inv.testName,
      },
      subject: {
        reference: `Patient/${patientId}`,
      },
      valueString: inv.resultValue ? `${inv.resultValue} ${inv.unit || ''}`.trim() : undefined,
      effectiveDateTime: inv.testDate,
    }));
  }

  /**
   * Generates a complete FHIR R4 Bundle containing all structured clinical information
   */
  public static createExportBundle(
    patient: Patient,
    encounter: Encounter,
    summary: ClinicalSummary
  ): FhirBundle {
    const fhirPatient = this.mapPatient(patient);
    const fhirEncounter = this.mapEncounter(encounter, patient.fullName);
    const fhirMeds = this.mapMedications(summary.currentMedications, patient.id);
    const fhirAllergies = this.mapAllergies(summary.allergies, patient.id);
    const fhirObservations = this.mapInvestigations(summary.investigations, patient.id);

    const entries: Array<{ fullUrl?: string; resource: FhirResource }> = [
      { fullUrl: `urn:uuid:${patient.id}`, resource: fhirPatient },
      { fullUrl: `urn:uuid:${encounter.id}`, resource: fhirEncounter },
      ...fhirMeds.map(m => ({ fullUrl: `urn:uuid:${m.id}`, resource: m })),
      ...fhirAllergies.map(a => ({ fullUrl: `urn:uuid:${a.id}`, resource: a })),
      ...fhirObservations.map(o => ({ fullUrl: `urn:uuid:${o.id}`, resource: o })),
    ];

    return {
      resourceType: 'Bundle',
      id: `bundle-${encounter.id}`,
      type: 'document',
      timestamp: new Date().toISOString(),
      entry: entries,
    };
  }
}

export function toFhirBundle(params: {
  patient: Patient;
  encounter: Encounter;
  medications?: MedicationFact[];
  allergies?: AllergyFact[];
  observations?: Array<{
    id: string;
    code: string;
    display: string;
    value: string;
    effectiveDateTime?: string;
  }>;
}): FhirBundle {
  const fhirPatient = FhirMapper.mapPatient(params.patient);
  const fhirEncounter = FhirMapper.mapEncounter(params.encounter, params.patient.fullName);
  const fhirMeds = FhirMapper.mapMedications(params.medications || [], params.patient.id);
  const fhirAllergies = FhirMapper.mapAllergies(params.allergies || [], params.patient.id);

  const entries: Array<{ fullUrl?: string; resource: FhirResource }> = [
    { fullUrl: `urn:uuid:${params.patient.id}`, resource: fhirPatient },
    { fullUrl: `urn:uuid:${params.encounter.id}`, resource: fhirEncounter },
    ...fhirMeds.map(m => ({ fullUrl: `urn:uuid:${m.id}`, resource: m })),
    ...fhirAllergies.map(a => ({ fullUrl: `urn:uuid:${a.id}`, resource: a })),
  ];

  if (params.observations) {
    for (const obs of params.observations) {
      const observationResource: FhirObservation = {
        resourceType: 'Observation',
        id: obs.id,
        status: 'final',
        subject: {
          reference: `Patient/${params.patient.id}`,
        },
        code: { text: obs.display },
        valueString: obs.value,
        effectiveDateTime: obs.effectiveDateTime || new Date().toISOString(),
      };
      entries.push({
        fullUrl: `urn:uuid:${obs.id}`,
        resource: observationResource,
      });
    }
  }

  return {
    resourceType: 'Bundle',
    id: `bundle-${params.encounter.id}`,
    type: 'document',
    timestamp: new Date().toISOString(),
    entry: entries,
  };
}

