import { query } from '../../database/postgres';
import { toFhirBundle, FhirBundle } from '@medikiosk/fhir-mapper';
import { PatientsService } from '../patients/patients.service';
import { EncountersService } from '../encounters/encounters.service';
import { SummariesService } from '../summaries/summaries.service';
import { ProvenanceType, VerificationStatus } from '@medikiosk/shared-types';

export class FhirService {
  public static async exportEncounter(encounterId: string): Promise<FhirBundle> {
    const encounter = await EncountersService.getById(encounterId);
    const patient = await PatientsService.getById(encounter.patientId);
    const summary = await SummariesService.getByEncounter(encounterId);

    // Fetch clinical facts to map observations
    const factsRes = await query(
      `SELECT field, value, source_type, confidence
       FROM clinical_facts
       WHERE encounter_id = $1`,
      [encounterId]
    );

    const observations = factsRes.rows.map((r, idx) => ({
      id: `obs-${encounterId}-${idx}`,
      code: r.field,
      display: r.field.replace(/\./g, ' '),
      value: typeof r.value === 'string' ? r.value : JSON.stringify(r.value),
      effectiveDateTime: new Date().toISOString(),
      provenance: {
        sourceType: r.source_type as ProvenanceType,
        confidence: parseFloat(r.confidence),
        verificationStatus: VerificationStatus.VERIFIED,
      },
    }));

    const medications = summary?.currentMedications || [];
    const allergies = summary?.allergies || [];

    const fhirBundle = toFhirBundle({
      patient,
      encounter,
      medications,
      allergies,
      observations,
    });

    // Save in fhir_exports
    await query(
      `INSERT INTO fhir_exports (
         encounter_id, patient_id, fhir_resource_type, fhir_payload, status
       ) VALUES ($1, $2, $3, $4, $5)`,
      [
        encounterId,
        patient.id,
        'Bundle',
        JSON.stringify(fhirBundle),
        'EXPORTED',
      ]
    );

    return fhirBundle;
  }
}
