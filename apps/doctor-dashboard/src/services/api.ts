import {
  Patient,
  Encounter,
  ControlledClinicalSummary,
  RedFlagAlert,
  DoctorSpecialist,
} from '@medikiosk/shared-types';

const API_BASE = (import.meta as any).env?.VITE_API_URL
  ? `${(import.meta as any).env.VITE_API_URL}/api/v1`
  : '/api/v1';

async function fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const json = await res.json();
  if (!res.ok || json.success === false) {
    const errorMsg = json.error?.message || `Request failed with status ${res.status}`;
    throw new Error(errorMsg);
  }

  return json.data as T;
}

export const DoctorApi = {
  // Specialists Directory
  getDoctors: (department?: string) =>
    fetchJson<DoctorSpecialist[]>(department ? `/doctors?department=${encodeURIComponent(department)}` : '/doctors'),

  createDoctor: (data: {
    fullName: string;
    email: string;
    department: string;
    specialtyTitle?: string;
    roomNumber?: string;
  }) =>
    fetchJson<DoctorSpecialist>('/doctors', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Live Dynamic Patient Queue
  getLiveQueue: (department?: string, search?: string) => {
    const params = new URLSearchParams();
    if (department && department !== 'ALL') params.append('department', department);
    if (search) params.append('search', search);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return fetchJson<any[]>(`/encounters/queue${qs}`);
  },

  // Manual Walk-in Patient Creation
  createWalkInPatient: (data: {
    fullName: string;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    age: number;
    contactNumber?: string;
    abhaId?: string;
    preferredLanguage?: string;
    hospitalPatientId?: string;
  }) =>
    fetchJson<Patient>('/patients', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Create Manual Encounter
  createEncounter: (data: {
    patientId: string;
    department?: string;
    physicianId?: string;
    chiefComplaintSummary?: string;
  }) =>
    fetchJson<Encounter>('/encounters', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Reassign Encounter to another Specialist Department / Doctor
  reassignEncounter: (encounterId: string, department: string, physicianId?: string) =>
    fetchJson<Encounter>(`/encounters/${encounterId}/reassign`, {
      method: 'PATCH',
      body: JSON.stringify({ department, physicianId }),
    }),

  // Encounters & Clinical Briefing
  getClinicalBriefing: (encounterId: string) =>
    fetchJson<{
      encounter: Encounter;
      patient: Patient;
      activeRedFlags: RedFlagAlert[];
      facts: any[];
      medications: any[];
      allergies: any[];
      timeline: any[];
      documents: any[];
      summary: ControlledClinicalSummary | null;
    }>(`/encounters/${encounterId}/clinical-briefing`),

  // Summaries & Verification
  generateSummary: (encounterId: string) =>
    fetchJson<ControlledClinicalSummary>('/summaries/generate', {
      method: 'POST',
      body: JSON.stringify({ encounterId }),
    }),

  verifySummary: (encounterId: string, data: {
    clinicalNotes?: string;
    physicianNotes?: string;
    provisionalDiagnosis?: string;
    treatmentPlan?: string;
    editedFields?: Record<string, unknown>;
  }) =>
    fetchJson<{ summary: ControlledClinicalSummary; reviewId: string }>(
      `/summaries/${encounterId}/verify`,
      { method: 'POST', body: JSON.stringify(data) }
    ),

  // FHIR R4 Bundle Export
  exportFhirBundle: (encounterId: string) =>
    fetchJson<Record<string, unknown>>(`/fhir/export/${encounterId}`),

  // Red Flags & Alerts
  listAlerts: () => fetchJson<RedFlagAlert[]>('/alerts'),
  acknowledgeAlert: (alertId: string) =>
    fetchJson<RedFlagAlert>(`/alerts/${alertId}/acknowledge`, { method: 'POST' }),

  // Documents & OCR
  processDocument: (documentId: string) =>
    fetchJson<any>(`/documents/${documentId}/process`, { method: 'POST' }),
};
