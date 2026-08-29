import {
  Patient,
  Encounter,
  ConsentRecord,
  ClinicalSession,
  ClinicalQuestion,
  ProvenanceType,
  RedFlagAlert,
} from '@medikiosk/shared-types';

const API_BASE = '/api/v1';

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

export const KioskApi = {
  // Patients
  searchPatients: (term: string) => fetchJson<Patient[]>(`/patients/search?q=${encodeURIComponent(term)}`),
  createPatient: (data: Partial<Patient>) =>
    fetchJson<Patient>('/patients', { method: 'POST', body: JSON.stringify(data) }),

  // Consent
  recordConsent: (data: Partial<ConsentRecord>) =>
    fetchJson<ConsentRecord>('/consents', { method: 'POST', body: JSON.stringify(data) }),

  // Encounters
  createEncounter: (data: { patientId: string; department?: string; chiefComplaintSummary?: string }) =>
    fetchJson<Encounter>('/encounters', { method: 'POST', body: JSON.stringify(data) }),

  // Sessions
  createSession: (data: { encounterId: string; patientId: string; selectedLanguage: string }) =>
    fetchJson<ClinicalSession>('/sessions', { method: 'POST', body: JSON.stringify(data) }),

  getSession: (sessionId: string) =>
    fetchJson<{ session: ClinicalSession; answers: unknown[]; facts: unknown[]; activeRedFlags: RedFlagAlert[] }>(`/sessions/${sessionId}`),

  // Questions
  getNextQuestion: (sessionId: string) =>
    fetchJson<{
      question: ClinicalQuestion | null;
      isComplete: boolean;
      progressPercentage: number;
      totalAnswered: number;
      remainingRequired: number;
    }>(`/questions/next?sessionId=${sessionId}`),

  // Submit Answer
  recordAnswer: (sessionId: string, data: {
    questionId: string;
    rawText?: string;
    selectedOptions?: string[];
    confidence?: number;
    sourceType?: ProvenanceType;
  }) => fetchJson<{ answer: unknown; triggeredAlerts: RedFlagAlert[]; isCompleted: boolean }>(
    `/sessions/${sessionId}/answers`,
    { method: 'POST', body: JSON.stringify(data) }
  ),

  // Health
  checkHealth: () => fetchJson<{ status: string }>('/health'),
};
