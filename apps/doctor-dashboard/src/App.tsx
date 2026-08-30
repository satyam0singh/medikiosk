import React, { useState, useEffect } from 'react';
import { DoctorHeader } from './components/DoctorHeader';
import { PatientQueueSidebar, QueueItem } from './components/PatientQueueSidebar';
import { ClinicalBriefingView } from './components/ClinicalBriefingView';
import { FhirExportModal } from './components/FhirExportModal';
import { RedFlagAlert } from '@medikiosk/shared-types';
import { DoctorApi } from './services/api';
import { Users, Stethoscope } from 'lucide-react';

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
  const [mobileTab, setMobileTab] = useState<'QUEUE' | 'BRIEFING'>('BRIEFING');
  const [isLightMode, setIsLightMode] = useState<boolean>(() => {
    return localStorage.getItem('medikiosk_doctor_theme') === 'light';
  });

  useEffect(() => {
    localStorage.setItem('medikiosk_doctor_theme', isLightMode ? 'light' : 'dark');
    if (isLightMode) {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
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
      const selectedPatient = queue.find((q) => q.encounterId === encId);
      const isRamesh = encId === DEFAULT_QUEUE[0]!.encounterId;

      setBriefing({
        encounter: {
          id: encId,
          patientId: selectedPatient?.patientId || 'b0000000-0000-0000-0000-000000000001',
          department: isRamesh ? 'General Medicine' : 'Kayachikitsa / AYUSH',
          status: 'IN_PROGRESS',
          startedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        patient: {
          id: selectedPatient?.patientId || 'b0000000-0000-0000-0000-000000000001',
          fullName: selectedPatient?.fullName || 'Ramesh Kumar (रमेश कुमार)',
          age: selectedPatient?.age || 54,
          gender: selectedPatient?.gender || 'MALE',
          abhaId: selectedPatient?.abhaId || '91-4829-1029-4820',
          hospitalPatientId: isRamesh ? 'MRN-00482' : 'MRN-00483',
        },
        activeRedFlags: isRamesh
          ? [
              {
                id: 'rf-demo-1',
                ruleId: 'rf_chest_pain_severe',
                severity: 'CRITICAL_EMERGENCY',
                alertMessage:
                  'Potential emergency symptoms detected. Patient reports severe acute chest discomfort (Score >= 7). Please alert clinical triage immediately.',
                isAcknowledged: false,
                createdAt: new Date().toISOString(),
              },
            ]
          : [],
        facts: [
          {
            id: 'f1',
            field: 'chief_complaint.primary',
            value: isRamesh ? 'chest_pain' : 'joint_pain_agni',
            sourceType: 'PATIENT_REPORTED',
            confidence: 1.0,
            verificationStatus: 'PENDING',
          },
          {
            id: 'f2',
            field: 'hpi.pain_severity',
            value: isRamesh ? 7 : 4,
            sourceType: 'PATIENT_REPORTED',
            confidence: 0.95,
            verificationStatus: 'PENDING',
          },
          {
            id: 'f3',
            field: 'hpi.chest_character',
            value: isRamesh ? 'burning and heaviness' : 'dull ache and stiffness',
            sourceType: 'PATIENT_REPORTED',
            confidence: 0.9,
            verificationStatus: 'PENDING',
          },
          {
            id: 'f4',
            field: 'medication.amlodipine',
            value: { drugName: 'Amlodipine 5mg', dosage: '5mg', frequency: 'OD' },
            sourceType: 'DOCUMENT_OCR',
            confidence: 0.92,
            verificationStatus: 'PENDING',
          },
        ],
        medications: [
          { drugName: 'Amlodipine 5mg', dosage: '5mg', frequency: 'OD', isCurrent: true },
          { drugName: 'Telmisartan 40mg', dosage: '40mg', frequency: 'OD', isCurrent: true },
        ],
        allergies: [],
        timeline: [
          {
            id: 't1',
            event_date: '2025-11-14',
            event_type: 'MEDICATION_STARTED',
            title: 'Hypertension Management Started',
            description: 'Prescribed Amlodipine 5mg + Telmisartan 40mg at AIIA OPD',
          },
          {
            id: 't2',
            event_date: '2026-08-29',
            event_type: 'SYMPTOM_ONSET',
            title: 'Acute Chest Discomfort Onset',
            description: 'Patient self-reported onset of burning sensation',
          },
        ],
        documents: [
          {
            id: 'd1',
            document_type: 'PRESCRIPTION',
            file_name: 'AIIA_OPD_Prescription_DrSharma_Nov2025.jpg',
            file_size_bytes: 145000,
            processing_state: 'COMPLETED',
            uploaded_at: new Date().toISOString(),
          },
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

  const handleSelectPatient = (encId: string) => {
    setSelectedEncounterId(encId);
    // On mobile, auto-navigate to Briefing view
    setMobileTab('BRIEFING');
  };

  return (
    <div
      className={`h-screen max-h-screen w-full flex flex-col overflow-hidden select-none transition-colors ${
        isLightMode
          ? 'bg-[#FBFBFA] text-[#111111]'
          : 'bg-[#0D0F14] text-[#F4F4F6]'
      }`}
    >
      {/* Universal Physician Header */}
      <DoctorHeader
        alerts={alerts}
        onOpenAlerts={() => {}}
        isLightMode={isLightMode}
        onToggleTheme={() => setIsLightMode(!isLightMode)}
      />

      {/* Mobile-Only Tab Switcher (Visible on < md) */}
      <div
        className={`md:hidden flex items-center border-b px-2 py-1.5 shrink-0 transition-colors ${
          isLightMode ? 'bg-[#FFFFFF] border-[#EAEAEA]' : 'bg-[#141720] border-[#232734]'
        }`}
      >
        <button
          type="button"
          onClick={() => setMobileTab('QUEUE')}
          className={`flex-1 py-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all min-h-[40px] cursor-pointer ${
            mobileTab === 'QUEUE'
              ? 'bg-[#111111] dark:bg-[#F4F4F6] text-[#FFFFFF] dark:text-[#0D0F14]'
              : isLightMode
              ? 'text-[#666666] hover:bg-[#F7F6F3]'
              : 'text-[#8E94A4] hover:bg-[#1E222D]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Queue ({queue.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileTab('BRIEFING')}
          className={`flex-1 py-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all min-h-[40px] cursor-pointer ${
            mobileTab === 'BRIEFING'
              ? 'bg-[#111111] dark:bg-[#F4F4F6] text-[#FFFFFF] dark:text-[#0D0F14]'
              : isLightMode
              ? 'text-[#666666] hover:bg-[#F7F6F3]'
              : 'text-[#8E94A4] hover:bg-[#1E222D]'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          <span className="truncate">
            {briefing?.patient?.fullName ? briefing.patient.fullName.split(' ')[0] : 'Briefing'}
          </span>
        </button>
      </div>

      {/* Responsive Workstation Body */}
      <div className="flex-1 flex overflow-hidden w-full relative">
        {/* Patient Queue: Full width on mobile when selected; Sidebar on desktop */}
        <div
          className={`${
            mobileTab === 'QUEUE' ? 'flex w-full' : 'hidden'
          } md:flex md:w-72 lg:w-80 shrink-0 h-full overflow-hidden`}
        >
          <PatientQueueSidebar
            queue={queue}
            selectedEncounterId={selectedEncounterId}
            onSelectEncounter={handleSelectPatient}
            isLightMode={isLightMode}
          />
        </div>

        {/* Clinical Briefing View: Full width on mobile when selected; Main view on desktop */}
        <main
          className={`${
            mobileTab === 'BRIEFING' ? 'flex w-full' : 'hidden'
          } md:flex flex-1 flex-col overflow-hidden h-full`}
        >
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-[#111111] dark:border-[#F4F4F6] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : briefing ? (
            <ClinicalBriefingView
              briefing={briefing}
              onRefresh={() => fetchBriefing(selectedEncounterId)}
              onOpenFhirExport={() => setIsFhirModalOpen(true)}
              onBackToQueue={() => setMobileTab('QUEUE')}
              isLightMode={isLightMode}
            />
          ) : (
            <div className="p-8 text-center text-[#888888]">Select a patient from the queue.</div>
          )}
        </main>
      </div>

      {/* FHIR Export Modal */}
      {isFhirModalOpen && (
        <FhirExportModal
          encounterId={selectedEncounterId}
          onClose={() => setIsFhirModalOpen(false)}
          isLightMode={isLightMode}
        />
      )}
    </div>
  );
};
export default App;
