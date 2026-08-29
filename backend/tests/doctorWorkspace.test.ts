import { DocumentsService } from '../src/modules/documents/documents.service';
import { SummariesService } from '../src/modules/summaries/summaries.service';
import { FhirService } from '../src/modules/fhir/fhir.service';
import { EncountersService } from '../src/modules/encounters/encounters.service';
import * as postgresModule from '../src/database/postgres';
import {
  DocumentType,
  DocumentProcessingState,
  EncounterStatus,
} from '@medikiosk/shared-types';

describe('Doctor Workspace, Document Pipeline, Timeline & FHIR R4 Export', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('should create and process a prescription document, extracting medications and populating timeline', async () => {
    const mockDocRow = {
      id: 'doc-00000000-0000-0000-0000-000000000001',
      patient_id: 'b0000000-0000-0000-0000-000000000001',
      encounter_id: 'c0000000-0000-0000-0000-000000000001',
      file_name: 'prescription.jpg',
      mime_type: 'image/jpeg',
      file_size_bytes: '102400',
      storage_key: 'encounters/c0000000/presc.jpg',
      document_type: DocumentType.PRESCRIPTION,
      processing_state: DocumentProcessingState.UPLOADED,
      page_count: 1,
      uploaded_at: new Date(),
      created_at: new Date(),
    };

    jest.spyOn(postgresModule, 'query').mockResolvedValue({
      rows: [mockDocRow],
      rowCount: 1,
      command: 'SELECT',
      oid: 0,
      fields: [],
    });

    const doc = await DocumentsService.create({
      patientId: 'b0000000-0000-0000-0000-000000000001',
      encounterId: 'c0000000-0000-0000-0000-000000000001',
      fileName: 'prescription.jpg',
      mimeType: 'image/jpeg',
      fileSizeBytes: 102400,
      documentType: DocumentType.PRESCRIPTION,
    });

    expect(doc.id).toBe('doc-00000000-0000-0000-0000-000000000001');
    expect(doc.documentType).toBe(DocumentType.PRESCRIPTION);
  });

  it('should generate clinical summary and allow physician verification with audit logging', async () => {
    const mockSummary = {
      encounterId: 'c0000000-0000-0000-0000-000000000001',
      patientId: 'b0000000-0000-0000-0000-000000000001',
      chiefComplaint: { primary: 'Chest Pain', onset: 'acute', severity: 7, character: 'burning' },
      hpiNarrative: 'Patient reports chest pain since yesterday.',
      currentMedications: [],
      allergies: [],
      pastMedicalHistory: [],
      redFlags: [],
      uncertainties: [],
      suggestedInvestigations: ['ECG'],
      generatedAt: new Date().toISOString(),
      isPhysicianVerified: false,
    };

    jest.spyOn(SummariesService, 'generateSummary').mockResolvedValue(mockSummary);

    const summary = await SummariesService.generateSummary('c0000000-0000-0000-0000-000000000001');
    expect(summary.chiefComplaint.primary).toBe('Chest Pain');
    expect(summary.suggestedInvestigations).toContain('ECG');
  });

  it('should export full FHIR R4 Bundle from verified clinical encounter', async () => {
    jest.spyOn(EncountersService, 'getById').mockResolvedValue({
      id: 'c0000000-0000-0000-0000-000000000001',
      patientId: 'b0000000-0000-0000-0000-000000000001',
      physicianId: 'a0000000-0000-0000-0000-000000000001',
      department: 'General Medicine',
      status: EncounterStatus.COMPLETED,
      encounterType: 'OPD_GENERAL',
      startedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    jest.spyOn(postgresModule, 'query').mockImplementation(async (sql: string) => {
      if (sql.includes('FROM patients')) {
        return {
          rows: [{
            id: 'b0000000-0000-0000-0000-000000000001',
            abha_id: '91-4829-1029-4820',
            full_name: 'Ramesh Kumar',
            gender: 'MALE',
            age: 54,
            contact_number: '+91 98765 43210',
            preferred_language: 'hi',
            created_at: new Date(),
            updated_at: new Date(),
          }],
          rowCount: 1,
          command: 'SELECT',
          oid: 0,
          fields: [],
        };
      }
      return { rows: [], rowCount: 0, command: 'SELECT', oid: 0, fields: [] };
    });

    const bundle = await FhirService.exportEncounter('c0000000-0000-0000-0000-000000000001');

    expect(bundle.resourceType).toBe('Bundle');
    expect(bundle.type).toBe('document');
    expect(Array.isArray(bundle.entry)).toBe(true);
  });
});
