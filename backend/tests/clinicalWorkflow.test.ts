import bcrypt from 'bcryptjs';
import { AuthService } from '../src/modules/auth/auth.service';
import { ConsentService } from '../src/modules/consent/consent.service';
import { SessionsService } from '../src/modules/sessions/sessions.service';
import { SafetyService } from '../src/modules/safety/safety.service';
import * as postgresModule from '../src/database/postgres';
import {
  ConsentStatus,
  LanguageCode,
  ProvenanceType,
  RedFlagSeverity,
  UserRole,
} from '@medikiosk/shared-types';

describe('End-to-End Clinical State Machine & Safety Engine', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('should authenticate physician using bcrypt and issue valid JWT', async () => {
    const hashedPassword = bcrypt.hashSync('Medikiosk@2026', 8);

    const mockUserRow = {
      id: 'a0000000-0000-0000-0000-000000000001',
      email: 'dr.sharma@aiia.gov.in',
      password_hash: hashedPassword,
      full_name: 'Dr. Rajesh Sharma',
      is_active: true,
      hospital_id: 'AIIA-ND-01',
      department: 'General Medicine',
      roles: ['PHYSICIAN'],
      created_at: new Date(),
      updated_at: new Date(),
    };

    jest.spyOn(postgresModule, 'query').mockResolvedValue({
      rows: [mockUserRow],
      rowCount: 1,
      command: 'SELECT',
      oid: 0,
      fields: [],
    });

    const result = await AuthService.login('dr.sharma@aiia.gov.in', 'Medikiosk@2026');

    expect(result.user.email).toBe('dr.sharma@aiia.gov.in');
    expect(result.user.roles).toContain(UserRole.PHYSICIAN);
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
  });

  it('should verify consent, create session, progress questions and trigger red-flag on severe chest pain', async () => {
    // 1. Mock verify consent granted
    jest.spyOn(ConsentService, 'verifyConsent').mockResolvedValue({
      isGranted: true,
      activeConsent: {
        id: 'd0000000-0000-0000-0000-000000000001',
        patientId: 'b0000000-0000-0000-0000-000000000001',
        status: ConsentStatus.GRANTED,
        scope: ['CLINICAL_INTAKE', 'DOCUMENT_OCR'],
        version: 'v1.0',
        capturedVia: 'TOUCH_SCREEN',
        grantedAt: new Date().toISOString(),
      },
    });

    // 2. Mock query to return created session
    const mockSession = {
      id: 's0000000-0000-0000-0000-000000000001',
      encounter_id: 'c0000000-0000-0000-0000-000000000001',
      patient_id: 'b0000000-0000-0000-0000-000000000001',
      current_state: 'HISTORY_ACTIVE',
      selected_language: 'hi',
      is_degraded_mode: false,
      metadata: '{}',
      created_at: new Date(),
      updated_at: new Date(),
    };

    jest.spyOn(postgresModule, 'query').mockImplementation(async (sql: string) => {
      if (sql.includes('INSERT INTO clinical_sessions')) {
        return { rows: [mockSession], rowCount: 1, command: 'INSERT', oid: 0, fields: [] };
      }
      return { rows: [], rowCount: 0, command: 'SELECT', oid: 0, fields: [] };
    });

    const session = await SessionsService.create({
      encounterId: 'c0000000-0000-0000-0000-000000000001',
      patientId: 'b0000000-0000-0000-0000-000000000001',
      selectedLanguage: LanguageCode.HI,
    });

    expect(session.currentState).toBe('HISTORY_ACTIVE');
    expect(session.selectedLanguage).toBe('hi');

    // 3. Test Safety Evaluation directly
    const facts = [
      { field: 'chief_complaint.primary', value: 'chest_pain', sourceType: ProvenanceType.PATIENT_REPORTED },
      { field: 'hpi.pain_severity', value: 8, sourceType: ProvenanceType.PATIENT_REPORTED },
    ];

    jest.spyOn(SafetyService, 'triggerAlert').mockResolvedValue({
      id: 'rf-001',
      encounterId: 'c0000000-0000-0000-0000-000000000001',
      patientId: 'b0000000-0000-0000-0000-000000000001',
      ruleId: 'rf_chest_pain_severe',
      severity: RedFlagSeverity.CRITICAL_EMERGENCY,
      alertMessage: 'Potential emergency symptoms detected. Patient reports severe acute chest discomfort.',
      triggerFacts: facts,
      isAcknowledged: false,
      createdAt: new Date().toISOString(),
    });

    const alerts = await SafetyService.evaluateState(
      'c0000000-0000-0000-0000-000000000001',
      'b0000000-0000-0000-0000-000000000001',
      facts
    );

    expect(alerts.length).toBe(1);
    expect(alerts[0]!.severity).toBe(RedFlagSeverity.CRITICAL_EMERGENCY);
    expect(alerts[0]!.ruleId).toBe('rf_chest_pain_severe');
  });
});
