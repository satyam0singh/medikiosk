import { query, withTransaction } from '../../database/postgres';
import { ConsentRecord, ConsentStatus } from '@medikiosk/shared-types';
import { AppError } from '../../middleware/errorHandler';

export interface RecordConsentInput {
  patientId: string;
  encounterId?: string;
  status: ConsentStatus;
  scope: string[];
  version?: string;
  capturedVia: 'VOICE' | 'TOUCH_SCREEN' | 'PAPER_SIGNED';
  ipAddress?: string;
  auditSignature?: string;
}

export class ConsentService {
  public static async recordConsent(data: RecordConsentInput): Promise<ConsentRecord> {
    return await withTransaction(async (client) => {
      // 1. Check patient exists
      const patCheck = await client.query('SELECT id FROM patients WHERE id = $1', [data.patientId]);
      if (patCheck.rows.length === 0) {
        throw new AppError(`Patient not found with id ${data.patientId}`, 404, 'PATIENT_NOT_FOUND');
      }

      // 2. Insert consent record
      const insertRes = await client.query(
        `INSERT INTO consents (
           patient_id, status, scope, version, captured_via, ip_address, audit_signature
         ) VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, patient_id, status, scope, version, captured_via, granted_at,
                   revoked_at, ip_address, audit_signature, created_at`,
        [
          data.patientId,
          data.status,
          JSON.stringify(data.scope),
          data.version || 'v1.0',
          data.capturedVia,
          data.ipAddress || null,
          data.auditSignature || null,
        ]
      );

      const consentRow = insertRes.rows[0];

      // 3. Insert immutable audit log
      await client.query(
        `INSERT INTO audit_logs (
           action, patient_id, encounter_id, ip_address, payload
         ) VALUES ($1, $2, $3, $4, $5)`,
        [
          'RECORD_CONSENT',
          data.patientId,
          data.encounterId || null,
          data.ipAddress || null,
          JSON.stringify({
            consentId: consentRow.id,
            status: data.status,
            scope: data.scope,
            capturedVia: data.capturedVia,
          }),
        ]
      );

      return this.mapRowToConsent(consentRow);
    });
  }

  public static async verifyConsent(patientId: string, requiredScope?: string): Promise<{ isGranted: boolean; activeConsent?: ConsentRecord }> {
    const res = await query(
      `SELECT id, patient_id, status, scope, version, captured_via, granted_at,
              revoked_at, ip_address, audit_signature, created_at
       FROM consents
       WHERE patient_id = $1 AND status = 'GRANTED' AND revoked_at IS NULL
       ORDER BY granted_at DESC
       LIMIT 1`,
      [patientId]
    );

    if (res.rows.length === 0) {
      return { isGranted: false };
    }

    const consent = this.mapRowToConsent(res.rows[0]);

    if (requiredScope) {
      const hasScope = consent.scope.includes(requiredScope);
      return { isGranted: hasScope, activeConsent: consent };
    }

    return { isGranted: true, activeConsent: consent };
  }

  public static async revokeConsent(consentId: string, ipAddress?: string): Promise<ConsentRecord> {
    return await withTransaction(async (client) => {
      const res = await client.query(
        `UPDATE consents
         SET status = 'REVOKED', revoked_at = NOW()
         WHERE id = $1
         RETURNING id, patient_id, status, scope, version, captured_via, granted_at,
                   revoked_at, ip_address, audit_signature, created_at`,
        [consentId]
      );

      if (res.rows.length === 0) {
        throw new AppError(`Consent record not found with id ${consentId}`, 404, 'CONSENT_NOT_FOUND');
      }

      const consentRow = res.rows[0];

      // Audit revocation
      await client.query(
        `INSERT INTO audit_logs (
           action, patient_id, ip_address, payload
         ) VALUES ($1, $2, $3, $4)`,
        [
          'REVOKE_CONSENT',
          consentRow.patient_id,
          ipAddress || null,
          JSON.stringify({ consentId }),
        ]
      );

      return this.mapRowToConsent(consentRow);
    });
  }

  private static mapRowToConsent(r: any): ConsentRecord {
    return {
      id: r.id,
      patientId: r.patient_id,
      status: r.status as ConsentStatus,
      scope: typeof r.scope === 'string' ? JSON.parse(r.scope) : r.scope,
      version: r.version,
      capturedVia: r.captured_via,
      grantedAt: r.granted_at.toISOString(),
      revokedAt: r.revoked_at ? r.revoked_at.toISOString() : undefined,
      ipAddress: r.ip_address,
      auditSignature: r.audit_signature,
    };
  }
}
