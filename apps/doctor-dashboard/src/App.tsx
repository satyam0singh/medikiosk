import React, { useState, useEffect, useCallback } from 'react';
import { DoctorHeader } from './components/DoctorHeader';
import { PatientQueueSidebar, QueueItem } from './components/PatientQueueSidebar';
import { ClinicalBriefingView } from './components/ClinicalBriefingView';
import { FhirExportModal } from './components/FhirExportModal';
import { AddPatientModal } from './components/AddPatientModal';
import { AddDoctorModal } from './components/AddDoctorModal';
import { SpecialistDirectoryModal } from './components/SpecialistDirectoryModal';
import { RedFlagAlert, DoctorSpecialist, UserRole } from '@medikiosk/shared-types';
import { DoctorApi } from './services/api';
import { Users, Stethoscope } from 'lucide-react';

const DEFAULT_SPECIALISTS: DoctorSpecialist[] = [
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    email: 'dr.sharma@aiia.gov.in',
    fullName: 'Dr. Rajesh Sharma',
    role: UserRole.PHYSICIAN,
    department: 'General Medicine',
    specialtyTitle: 'Consultant Physician • MD',
    roomNumber: 'Room #04',
    isActive: true,
    availableSlotCount: 14,
  },
  {
    id: 'a0000000-0000-0000-0000-000000000003',
    email: 'dr.vaidya@aiia.gov.in',
    fullName: 'Dr. Anand Vaidya',
    role: UserRole.AYUSH_PRACTITIONER,
    department: 'Kayachikitsa / AYUSH',
    specialtyTitle: 'Senior AYUSH Specialist • BAMS MD',
    roomNumber: 'Room #07',
    isActive: true,
    availableSlotCount: 18,
  },
  {
    id: 'a0000000-0000-0000-0000-000000000005',
    email: 'dr.priya.cardio@aiia.gov.in',
    fullName: 'Dr. Priya Nair',
    role: UserRole.PHYSICIAN,
    department: 'Cardiology',
    specialtyTitle: 'Cardiologist • DM Cardiology',
    roomNumber: 'Room #02',
    isActive: true,
    availableSlotCount: 8,
  },
  {
    id: 'a0000000-0000-0000-0000-000000000006',
    email: 'dr.menon.ortho@aiia.gov.in',
    fullName: 'Dr. Suresh Menon',
    role: UserRole.PHYSICIAN,
    department: 'Orthopedics',
    specialtyTitle: 'Orthopedic Consultant • MS Ortho',
    roomNumber: 'Room #05',
    isActive: true,
    availableSlotCount: 12,
  },
  {
    id: 'a0000000-0000-0000-0000-000000000007',
    email: 'dr.patel.chest@aiia.gov.in',
    fullName: 'Dr. Vikram Patel',
    role: UserRole.PHYSICIAN,
    department: 'Pulmonology',
    specialtyTitle: 'Chest Physician • MD Pulm',
    roomNumber: 'Room #03',
    isActive: true,
    availableSlotCount: 10,
  },
  {
    id: 'a0000000-0000-0000-0000-000000000008',
    email: 'dr.roy.gastro@aiia.gov.in',
    fullName: 'Dr. Ananya Roy',
    role: UserRole.PHYSICIAN,
    department: 'Gastroenterology',
    specialtyTitle: 'Gastroenterologist • DM Gastro',
    roomNumber: 'Room #06',
    isActive: true,
    availableSlotCount: 11,
  },
];

const DEFAULT_QUEUE: QueueItem[] = [
  {
    encounterId: 'e0000000-0000-0000-0000-000000000001',
    patientId: 'p0000000-0000-0000-0000-000000000001',
    fullName: 'Ramesh Kumar (रमेश कुमार)',
    age: 54,
    gender: 'MALE',
    abhaId: '91-4829-1029-4820',
    chiefComplaint: 'Chest Pain / Burning Sensation',
    hasRedFlag: true,
    status: 'IN_PROGRESS',
    department: 'General Medicine',
    queueTime: '10:14 AM',
  },
  {
    encounterId: 'e0000000-0000-0000-0000-000000000002',
    patientId: 'p0000000-0000-0000-0000-000000000002',
    fullName: 'Sunita Devi (सुनीता देवी)',
    age: 48,
    gender: 'FEMALE',
    abhaId: '91-3829-9201-4411',
    chiefComplaint: 'Chronic Knee & Joint Pain (संधिवात)',
    hasRedFlag: false,
    status: 'AWAITING',
    department: 'Kayachikitsa / AYUSH',
    queueTime: '10:28 AM',
  },
];

export const App: React.FC = () => {
  const [isLightMode, setIsLightMode] = useState<boolean>(true);
  const [selectedEncounterId, setSelectedEncounterId] = useState<string>('e0000000-0000-0000-0000-000000000001');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');
  const [mobileTab, setMobileTab] = useState<'QUEUE' | 'BRIEFING'>('BRIEFING');

  // Dynamic Specialists Directory
  const [specialists, setSpecialists] = useState<DoctorSpecialist[]>(DEFAULT_SPECIALISTS);
  const [activeDoctor, setActiveDoctor] = useState<DoctorSpecialist>(DEFAULT_SPECIALISTS[0]);

  // Dynamic Live Queue
  const [queue, setQueue] = useState<QueueItem[]>(DEFAULT_QUEUE);
  const [isQueueLoading, setIsQueueLoading] = useState<boolean>(false);

  // Briefing Data
  const [briefing, setBriefing] = useState<any>(null);
  const [alerts, setAlerts] = useState<RedFlagAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isFhirModalOpen, setIsFhirModalOpen] = useState(false);
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);
  const [isSpecialistsOpen, setIsSpecialistsOpen] = useState(false);

  // Sync class on root document
  useEffect(() => {
    const root = document.documentElement;
    if (isLightMode) {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
  }, [isLightMode]);

  // Fetch Specialists Directory
  const fetchSpecialists = useCallback(async () => {
    try {
      const list = await DoctorApi.getDoctors();
      if (list && list.length > 0) {
        setSpecialists(list);
      }
    } catch (err) {
      console.warn('Specialists fallback to defaults:', err);
    }
  }, []);

  // Fetch Live Queue from Backend
  const fetchLiveQueue = useCallback(async () => {
    setIsQueueLoading(true);
    try {
      const liveQueue = await DoctorApi.getLiveQueue(selectedDepartment);
      if (liveQueue && liveQueue.length > 0) {
        setQueue(liveQueue);
      }
    } catch (err) {
      console.warn('Live queue fallback:', err);
    } finally {
      setIsQueueLoading(false);
    }
  }, [selectedDepartment]);

  useEffect(() => {
    fetchSpecialists();
  }, [fetchSpecialists]);

  useEffect(() => {
    fetchLiveQueue();
  }, [fetchLiveQueue]);

  // Fetch Clinical Briefing for Active Encounter
  const fetchBriefing = useCallback(async (encId: string) => {
    setIsLoading(true);
    try {
      const data = await DoctorApi.getClinicalBriefing(encId);
      setBriefing(data);
    } catch (err) {
      console.warn('Using synthetic briefing for', encId, err);
      // Fallback
      setBriefing({
        encounter: {
          id: encId,
          patientId: 'p0000000-0000-0000-0000-000000000001',
          status: 'IN_PROGRESS',
          department: activeDoctor.department,
          encounterType: activeDoctor.department.includes('AYUSH') ? 'OPD_AYUSH' : 'OPD_GENERAL',
          chiefComplaintSummary: 'Acute Atypical Chest Discomfort / Burning Acidity',
          startedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        patient: {
          id: 'p0000000-0000-0000-0000-000000000001',
          fullName: 'Ramesh Kumar (रमेश कुमार)',
          gender: 'MALE',
          age: 54,
          abhaId: '91-4829-1029-4820',
          hospitalPatientId: 'MRN-00482',
          preferredLanguage: 'hi',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        activeRedFlags: [
          {
            id: 'rf_01',
            encounterId: encId,
            patientId: 'p0000000-0000-0000-0000-000000000001',
            ruleId: 'rf_chest_pain_severe',
            severity: 'CRITICAL_EMERGENCY',
            alertMessage:
              'Potential emergency symptoms detected. Patient reports severe acute chest discomfort (Score >= 7). Please alert clinical triage immediately.',
            isAcknowledged: false,
            createdAt: new Date().toISOString(),
          },
        ],
        facts: [
          {
            id: 'f_01',
            field: 'chief_complaint.primary',
            value: 'chest_pain',
            sourceType: 'PATIENT_REPORTED',
            confidence: 1.0,
            verificationStatus: 'PENDING',
          },
          {
            id: 'f_02',
            field: 'hpi.pain_severity',
            value: 7,
            sourceType: 'PATIENT_REPORTED',
            confidence: 1.0,
            verificationStatus: 'PENDING',
          },
          {
            id: 'f_03',
            field: 'hpi.chest_character',
            value: 'burning and heaviness',
            sourceType: 'PATIENT_REPORTED',
            confidence: 0.95,
            verificationStatus: 'PENDING',
          },
          {
            id: 'f_04',
            field: 'medication.amlodipine',
            value: { drugName: 'Amlodipine 5mg', dosage: '5mg', frequency: 'OD' },
            sourceType: 'DOCUMENT_OCR',
            confidence: 0.92,
            verificationStatus: 'PENDING',
          },
        ],
        medications: [
          { name: 'Tab Amlodipine', dosage: '5mg', frequency: 'OD', source: 'OCR' },
          { name: 'Tab Telmisartan', dosage: '40mg', frequency: 'OD', source: 'OCR' },
        ],
        allergies: [],
        timeline: [
          {
            id: 'tl_01',
            event_date: '2026-08-30 08:30 AM',
            event_type: 'CHIEF_COMPLAINT',
            title: 'Intake Completed via Kiosk',
            description: 'Patient reported chest pain starting yesterday night, severity 7/10.',
          },
          {
            id: 'tl_02',
            event_date: '2026-08-30 08:35 AM',
            event_type: 'CONSULTATION',
            title: 'Prescription Scanned & Structured',
            description: 'Amlodipine 5mg identified with 92% OCR confidence.',
          },
        ],
        documents: [
          {
            id: 'doc_01',
            file_name: 'prescription_dr_verma.jpg',
            document_type: 'PRESCRIPTION',
            processing_state: 'EXTRACTION_COMPLETE',
            file_size_bytes: 142000,
            uploaded_at: new Date().toISOString(),
          },
        ],
        summary: {
          id: 'sum_01',
          encounterId: encId,
          version: 1,
          isPhysicianVerified: false,
          hpiNarrative:
            'Ramesh Kumar, a 54-year-old male, presented to the OPD complaining of chest pain and burning heaviness since yesterday night with a severity score of 7/10. Active hypertension medication recorded.',
        },
      });
    } finally {
      setIsLoading(false);
    }
  }, [activeDoctor.department]);

  const fetchAlerts = useCallback(async () => {
    try {
      const allAlerts = await DoctorApi.listAlerts();
      setAlerts(allAlerts);
    } catch (err) {
      // Ignore
    }
  }, []);

  useEffect(() => {
    fetchBriefing(selectedEncounterId);
    fetchAlerts();
  }, [selectedEncounterId, fetchBriefing, fetchAlerts]);

  const handleSelectPatient = (encId: string) => {
    setSelectedEncounterId(encId);
    setMobileTab('BRIEFING');
  };

  const handlePatientCreated = (newEncounterId: string, newQueueItem?: any) => {
    if (newQueueItem) {
      setQueue((prev) => [newQueueItem, ...prev.filter((q) => q.encounterId !== newEncounterId)]);
      setBriefing({
        encounter: {
          id: newEncounterId,
          patientId: newQueueItem.patientId,
          status: 'IN_PROGRESS',
          department: newQueueItem.department,
          encounterType: newQueueItem.department.includes('AYUSH') ? 'OPD_AYUSH' : 'OPD_GENERAL',
          chiefComplaintSummary: newQueueItem.chiefComplaint,
          startedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        patient: {
          id: newQueueItem.patientId,
          fullName: newQueueItem.fullName,
          gender: newQueueItem.gender,
          age: newQueueItem.age,
          abhaId: newQueueItem.abhaId,
          hospitalPatientId: `MRN-${newQueueItem.encounterId.slice(-5)}`,
          preferredLanguage: 'en',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        activeRedFlags: newQueueItem.hasRedFlag
          ? [
              {
                id: `rf-${Date.now()}`,
                encounterId: newEncounterId,
                patientId: newQueueItem.patientId,
                ruleId: 'rf_chest_pain_severe',
                severity: 'CRITICAL_EMERGENCY',
                alertMessage:
                  'Potential emergency symptoms detected. Patient reports severe acute discomfort.',
                isAcknowledged: false,
                createdAt: new Date().toISOString(),
              },
            ]
          : [],
        facts: [
          {
            id: `f-${Date.now()}-1`,
            field: 'chief_complaint.primary',
            value: newQueueItem.chiefComplaint,
            sourceType: 'PATIENT_REPORTED',
            confidence: 1.0,
            verificationStatus: 'PENDING',
          },
          {
            id: `f-${Date.now()}-2`,
            field: 'department.routed',
            value: newQueueItem.department,
            sourceType: 'SYSTEM_RULE',
            confidence: 0.98,
            verificationStatus: 'PENDING',
          },
        ],
        medications: [],
        allergies: [],
        timeline: [
          {
            id: `tl-${Date.now()}`,
            event_date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            event_type: 'CHIEF_COMPLAINT',
            title: 'Walk-In Registration Completed',
            description: `Patient entered OPD queue with complaint: ${newQueueItem.chiefComplaint}`,
          },
        ],
        documents: [],
        summary: {
          id: `sum-${Date.now()}`,
          encounterId: newEncounterId,
          version: 1,
          isPhysicianVerified: false,
          hpiNarrative: `${newQueueItem.fullName}, a ${newQueueItem.age}-year-old ${newQueueItem.gender.toLowerCase()}, presented for OPD consultation in ${newQueueItem.department} with complaints of ${newQueueItem.chiefComplaint}.`,
        },
      });
    } else {
      fetchLiveQueue();
    }
    setSelectedEncounterId(newEncounterId);
    setMobileTab('BRIEFING');
  };

  const handleDoctorAdded = (newDoc: DoctorSpecialist) => {
    fetchSpecialists();
    setActiveDoctor(newDoc);
    setSelectedDepartment(newDoc.department);
  };

  const handleSelectActiveDoctor = (doc: DoctorSpecialist) => {
    setActiveDoctor(doc);
    setSelectedDepartment(doc.department);
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
        activeDoctor={activeDoctor}
        onOpenAlerts={() => {}}
        onOpenSpecialists={() => setIsSpecialistsOpen(true)}
        onOpenAddPatient={() => setIsAddPatientOpen(true)}
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
        {/* Desktop Split View: Queue Sidebar ALWAYS visible on md+; on mobile shown only when mobileTab === 'QUEUE' */}
        <div className={`h-full ${mobileTab === 'QUEUE' ? 'w-full' : 'hidden'} md:block md:w-auto`}>
          <PatientQueueSidebar
            queue={queue}
            selectedEncounterId={selectedEncounterId}
            selectedDepartment={selectedDepartment}
            onSelectDepartment={setSelectedDepartment}
            onSelectEncounter={handleSelectPatient}
            onOpenAddPatient={() => setIsAddPatientOpen(true)}
            onRefresh={fetchLiveQueue}
            isLoading={isQueueLoading}
            isLightMode={isLightMode}
          />
        </div>

        {/* Desktop Split View: Clinical Briefing View ALWAYS visible on md+; on mobile shown only when mobileTab === 'BRIEFING' */}
        <div className={`h-full flex-1 overflow-hidden ${mobileTab === 'BRIEFING' ? 'w-full' : 'hidden'} md:block`}>
          {isLoading ? (
            <div className="h-full flex items-center justify-center text-xs font-mono text-[#888888]">
              Loading Patient Clinical Briefing...
            </div>
          ) : briefing ? (
            <ClinicalBriefingView
              briefing={briefing}
              specialists={specialists}
              onRefresh={() => fetchBriefing(selectedEncounterId)}
              onOpenFhirExport={() => setIsFhirModalOpen(true)}
              isLightMode={isLightMode}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-xs font-mono text-[#888888]">
              Select a patient from the queue
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Modals */}
      {isFhirModalOpen && (
        <FhirExportModal
          encounterId={selectedEncounterId}
          onClose={() => setIsFhirModalOpen(false)}
        />
      )}

      {isAddPatientOpen && (
        <AddPatientModal
          specialists={specialists}
          onClose={() => setIsAddPatientOpen(false)}
          onPatientCreated={handlePatientCreated}
          isLightMode={isLightMode}
        />
      )}

      {isAddDoctorOpen && (
        <AddDoctorModal
          onClose={() => setIsAddDoctorOpen(false)}
          onDoctorAdded={handleDoctorAdded}
          isLightMode={isLightMode}
        />
      )}

      {isSpecialistsOpen && (
        <SpecialistDirectoryModal
          specialists={specialists}
          activeDoctor={activeDoctor}
          onSelectDoctor={handleSelectActiveDoctor}
          onOpenAddDoctor={() => setIsAddDoctorOpen(true)}
          onClose={() => setIsSpecialistsOpen(false)}
          isLightMode={isLightMode}
        />
      )}
    </div>
  );
};

export default App;

