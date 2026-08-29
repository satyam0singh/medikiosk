import React, { useState, useEffect } from 'react';
import { DoctorHeader } from './components/DoctorHeader';
import { PatientQueueSidebar, QueueItem } from './components/PatientQueueSidebar';
import { ClinicalBriefingView } from './components/ClinicalBriefingView';
import { FhirExportModal } from './components/FhirExportModal';
import { RedFlagAlert } from '@medikiosk/shared-types';
import { DoctorApi } from './services/api';

const DEFAULT_QUEUE: QueueItem[] = [
  {
    encounterId: 'c0000000-0000-0000-0000-000000000001',
    patientId: 'b0000000-0000-0000-0000-000000000001',
    fullName: 'Ramesh Kumar (रमेश कुमार)',
    age: 54,
    gender: 'MALE',
    abhaId: '91-4829-1029-4820',
    chiefComplaint: 'Chest Pain / Burning (Score 7/10)',
    hasRedFlag: true,
    status: 'IN_PROGRESS',
    queueTime: '10:15 AM',
  },
  {
    encounterId: 'c0000000-0000-0000-0000-000000000002',
    patientId: 'b0000000-0000-0000-0000-000000000002',
    fullName: 'Sunita Devi (सुनीता देवी - AYUSH)',
    age: 48,
    gender: 'FEMALE',
    abhaId: '91-7712-4458-9901',
    chiefComplaint: 'Joint Pain & Agni Mandya',
    hasRedFlag: false,
    status: 'AWAITING',
    queueTime: '10:28 AM',
  },
];

export const App: React.FC = () => {
  const [queue] = useState<QueueItem[]>(DEFAULT_QUEUE);
  const [selectedEncounterId, setSelectedEncounterId] = useState<string>(DEFAULT_QUEUE[0]!.encounterId);
  const [briefing, setBriefing] = useState<any>(null);
  const [alerts, setAlerts] = useState<RedFlagAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFhirModalOpen, setIsFhirModalOpen] = useState(false);
  const [isLightMode, setIsLightMode] = useState<boolean>(() => {
    return localStorage.getItem('medikiosk_doctor_theme') === 'light';
  });

  useEffect(() => {
    localStorage.setItem('medikiosk_doctor_theme', isLightMode ? 'light' : 'dark');
    if (isLightMode) {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [isLightMode]);

  const fetchBriefing = async (encId: string) => {
    setIsLoading(true);
    try {
      const data = await DoctorApi.getClinicalBriefing(encId);
      setBriefing(data);
    } catch (err) {
      console.warn('Backend briefing error, using local fallback:', err);
      // Local fallback for offline/synthetic demo view
      setBriefing({
        encounter: {
          id: encId,
          patientId: 'b0000000-0000-0000-0000-000000000001',
          department: 'General Medicine',
          status: 'IN_PROGRESS',
          startedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        patient: {
          id: 'b0000000-0000-0000-0000-000000000001',
          fullName: 'Ramesh Kumar (रमेश कुमार)',
          age: 54,
          gender: 'MALE',
          abhaId: '91-4829-1029-4820',
          hospitalPatientId: 'MRN-00482',
        },
        activeRedFlags: [
          {
            id: 'rf-demo-1',
            ruleId: 'rf_chest_pain_severe',
            severity: 'CRITICAL_EMERGENCY',
            alertMessage: 'Potential emergency symptoms detected. Patient reports severe acute chest discomfort (Score >= 7). Please alert clinical triage immediately.',
            isAcknowledged: false,
            createdAt: new Date().toISOString(),
          },
        ],
        facts: [
          { id: 'f1', field: 'chief_complaint.primary', value: 'chest_pain', sourceType: 'PATIENT_REPORTED', confidence: 1.0, verificationStatus: 'PENDING' },
          { id: 'f2', field: 'hpi.pain_severity', value: 7, sourceType: 'PATIENT_REPORTED', confidence: 0.95, verificationStatus: 'PENDING' },
          { id: 'f3', field: 'hpi.chest_character', value: 'burning and heaviness', sourceType: 'PATIENT_REPORTED', confidence: 0.9, verificationStatus: 'PENDING' },
          { id: 'f4', field: 'medication.amlodipine', value: { drugName: 'Amlodipine 5mg', dosage: '5mg', frequency: 'OD' }, sourceType: 'DOCUMENT_OCR', confidence: 0.92, verificationStatus: 'PENDING' },
        ],
        medications: [
          { drugName: 'Amlodipine 5mg', dosage: '5mg', frequency: 'OD', isCurrent: true },
          { drugName: 'Telmisartan 40mg', dosage: '40mg', frequency: 'OD', isCurrent: true },
        ],
        allergies: [],
        timeline: [
          { id: 't1', event_date: '2025-11-14', event_type: 'MEDICATION_STARTED', title: 'Hypertension Management Started', description: 'Prescribed Amlodipine 5mg + Telmisartan 40mg at AIIA OPD' },
          { id: 't2', event_date: '2026-08-29', event_type: 'SYMPTOM_ONSET', title: 'Acute Chest Discomfort Onset', description: 'Patient self-reported onset of burning sensation' },
        ],
        documents: [
          { id: 'd1', document_type: 'PRESCRIPTION', file_name: 'AIIA_OPD_Prescription_DrSharma_Nov2025.jpg', file_size_bytes: 145000, processing_state: 'COMPLETED', uploaded_at: new Date().toISOString() },
        ],
        summary: null,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      const allAlerts = await DoctorApi.listAlerts();
      setAlerts(allAlerts);
    } catch (err) {
      // Ignore
    }
  };

  useEffect(() => {
    fetchBriefing(selectedEncounterId);
    fetchAlerts();
  }, [selectedEncounterId]);

  return (
    <div className={`min-h-screen flex flex-col transition-colors ${
      isLightMode
        ? 'bg-slate-50 text-slate-900 selection:bg-sky-500 selection:text-white'
        : 'bg-slate-950 text-slate-100 selection:bg-sky-500 selection:text-slate-950'
    }`}>
      {/* Header with Theme Toggle */}
      <DoctorHeader
        alerts={alerts}
        onOpenAlerts={() => {}}
        isLightMode={isLightMode}
        onToggleTheme={() => setIsLightMode(!isLightMode)}
      />

      {/* Main Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Queue */}
        <PatientQueueSidebar
          queue={queue}
          selectedEncounterId={selectedEncounterId}
          onSelectEncounter={(encId) => setSelectedEncounterId(encId)}
          isLightMode={isLightMode}
        />

        {/* Center/Right: Clinical Briefing View */}
        <main className={`flex-1 flex flex-col overflow-hidden ${isLightMode ? 'bg-slate-50' : 'bg-slate-950'}`}>
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : briefing ? (
            <ClinicalBriefingView
              briefing={briefing}
              onRefresh={() => fetchBriefing(selectedEncounterId)}
              onOpenFhirExport={() => setIsFhirModalOpen(true)}
              isLightMode={isLightMode}
            />
          ) : (
            <div className="p-8 text-center text-slate-400">Select a patient from the queue.</div>
          )}
        </main>
      </div>

      {/* FHIR Export Modal */}
      {isFhirModalOpen && (
        <FhirExportModal
          encounterId={selectedEncounterId}
          onClose={() => setIsFhirModalOpen(false)}
        />
      )}
    </div>
  );
};
export default App;
