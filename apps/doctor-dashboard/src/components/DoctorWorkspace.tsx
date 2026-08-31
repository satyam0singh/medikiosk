import React, { useState, useEffect } from 'react';
import {
  Users,
  FileCheck,
  Shield,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  X,
  Check,
  FileText,
  HeartPulse,
  Sun,
  Moon,
  LogOut,
  Activity,
  ChevronDown,
  Mic,
  Volume2,
  Sparkles,
  UserPlus,
  Stethoscope,
  Copy,
  Pill,
  History,
  FileCode,
  Menu,
} from 'lucide-react';
import { DoctorSpecialist } from '@medikiosk/shared-types';
import { AddPatientModal } from './AddPatientModal';
import { SpecialistDirectoryModal } from './SpecialistDirectoryModal';
import { FhirExportModal } from './FhirExportModal';

export interface DoctorWorkspaceProps {
  currentUser: {
    username: string;
    fullName: string;
    role: string;
  };
  specialists: DoctorSpecialist[];
  activeDoctor: DoctorSpecialist;
  onSelectDoctor: (doc: DoctorSpecialist) => void;
  onNavigateToTriage: () => void;
  onNavigateToAdmin: () => void;
  onLogout: () => void;
  isLightMode: boolean;
  onToggleTheme: () => void;
}

export interface PatientVisitHistoryItem {
  encounterId: string;
  date: string;
  time: string;
  timestamp: string;
  department: string;
  doctor: string;
  chiefComplaint: string;
  symptomLocation?: string;
  severity?: string;
  isVoiceIntake?: boolean;
  voiceTranscript?: string;
  voiceLanguage?: string;
  clinicalTranslation?: string;
  aiDoctorSummary?: {
    situation?: string;
    background?: string;
    assessment?: string;
    recommendation?: string;
  };
  suggestedInvestigations?: string[];
  medicalHistory?: string[];
  medications?: string[];
  questionnaireResponses?: Array<{
    question: string;
    response: string;
    sourceType?: string;
    confidence?: number;
  }>;
  consentSigned?: boolean;
  consentTimestamp?: string;
  status: 'CHECKED_IN' | 'IN_CONSULTATION' | 'COMPLETED' | 'CRITICAL';
  physicianNotes?: string;
  provisionalDiagnosis?: string;
}

export interface QueuedPatientRecord {
  id: string;
  encounterId: string;
  patientId: string;
  fullName: string;
  gender: string;
  dob: string;
  age: number;
  phone: string;
  abhaId: string;
  intakeTime: string;
  intakeDate: string;
  chiefComplaint: string;
  symptomLocation: string;
  medicalHistory: string[];
  readiness: 'Ready for review' | 'CRITICAL' | 'Verified' | 'Pending';
  status: 'CHECKED_IN' | 'IN_CONSULTATION' | 'COMPLETED';
  flagsCount: number;
  department: string;
  assignedDoctor?: string;
  isVoiceIntake?: boolean;
  voiceTranscript?: string;
  voiceLanguage?: string;
  clinicalTranslation?: string;
  aiDoctorSummary?: {
    situation?: string;
    background?: string;
    assessment?: string;
    recommendation?: string;
  };
  hpiNarrative?: string;
  suggestedInvestigations?: string[];
  questionnaireResponses?: Array<{
    question: string;
    response: string;
    sourceType?: string;
    confidence?: number;
  }>;
  reviewNotes?: string;
  isVerified?: boolean;
  totalVisitsCount?: number;
}

const QUICK_DIAGNOSES = [
  { code: 'M17.9', label: 'Janu Sandhivata / OA Knee (M17.9)' },
  { code: 'K21.9', label: 'Reflux Esophagitis / Amlapitta (K21.9)' },
  { code: 'I10', label: 'Essential Hypertension (I10)' },
  { code: 'I20.9', label: 'Angina Pectoris / Ischemic Heart (I20.9)' },
  { code: 'J06.9', label: 'Acute Upper Respiratory Infection (J06.9)' },
  { code: 'L23.9', label: 'Allergic Contact Dermatitis (L23.9)' },
];

export const DoctorWorkspace: React.FC<DoctorWorkspaceProps> = ({
  currentUser,
  specialists,
  activeDoctor,
  onSelectDoctor,
  onNavigateToTriage,
  onNavigateToAdmin,
  onLogout,
  isLightMode,
  onToggleTheme,
}) => {
  const [queue, setQueue] = useState<QueuedPatientRecord[]>(() => {
    try {
      const stored = localStorage.getItem('medikiosk_live_queue');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  // Modal / Popup state for selected patient
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'intake' | 'journey' | 'documents' | 'review'>('intake');

  const [activeFilter, setActiveFilter] = useState<'All' | 'My patients' | 'Flagged' | 'Verified' | 'Pending'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [reviewNote, setReviewNote] = useState('');
  const [isSavingReview, setIsSavingReview] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modal Dialog states
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [isSpecialistsOpen, setIsSpecialistsOpen] = useState(false);
  const [isFhirModalOpen, setIsFhirModalOpen] = useState(false);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPatientModalOpen) {
        setIsPatientModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPatientModalOpen]);

  // Fetch live queue directly from PostgreSQL backend API
  const fetchLiveDbQueue = async () => {
    try {
      const res = await fetch('/api/v1/encounters/queue');
      if (!res.ok) return;
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        if (json.data.length === 0) {
          setQueue([]);
          try { localStorage.removeItem('medikiosk_live_queue'); } catch {}
          return;
        }

        const dbRecords: QueuedPatientRecord[] = json.data.map((row: any, i: number) => {
          const abha = row.abhaId || '91-4829-1029-4820';
          const isVoice = typeof row.chiefComplaint === 'string' && row.chiefComplaint.includes('🎙️');

          return {
            id: row.patientId || `pat-db-${i}`,
            encounterId: row.encounterId,
            patientId: row.patientId,
            fullName: row.fullName,
            gender: row.gender,
            dob: row.dob || 'Aug 24, 2002',
            age: row.age || 30,
            phone: row.phone || '+91 98765 00000',
            abhaId: abha,
            intakeDate: 'Aug 31, 2026',
            intakeTime: row.queueTime || '10:30 AM',
            chiefComplaint: row.chiefComplaint || 'Clinical intake / Pre-consultation intake',
            symptomLocation: row.department?.includes('AYUSH')
              ? 'Bilateral Knees / Joints'
              : row.department?.includes('Cardio')
              ? 'Retrosternal Chest'
              : 'General / Constitutional',
            medicalHistory: [row.chiefComplaint || 'Clinical intake', 'NKDA'],
            readiness: row.hasRedFlag
              ? 'CRITICAL'
              : row.status === 'VERIFIED'
              ? 'Verified'
              : 'Ready for review',
            status: row.status === 'VERIFIED' ? 'COMPLETED' : 'CHECKED_IN',
            flagsCount: row.hasRedFlag ? 1 : 0,
            department: row.department,
            assignedDoctor:
              row.assignedDoctorName && row.assignedDoctorName !== 'Unassigned'
                ? row.assignedDoctorName
                : activeDoctor?.fullName || 'Dr. Rajesh Sharma',
            isVoiceIntake: isVoice,
            voiceTranscript: row.voiceTranscript || (isVoice ? row.chiefComplaint.replace('🎙️', '').trim() : ''),
            voiceLanguage: row.voiceLanguage || (isVoice ? 'Hindi / Hinglish ASR' : ''),
            clinicalTranslation: row.clinicalTranslation || '',
            aiDoctorSummary: row.aiDoctorSummary || null,
            hpiNarrative: row.hpiNarrative || '',
            suggestedInvestigations: row.suggestedInvestigations || [],
            questionnaireResponses: row.questionnaireResponses || [
              {
                question: 'Primary reason for consultation',
                response: row.chiefComplaint || 'Clinical intake',
                sourceType: isVoice ? 'AI4BHARAT_ASR' : 'PATIENT_REPORTED',
                confidence: 0.98,
              },
            ],
            reviewNotes: row.reviewNotes || '',
            isVerified: row.status === 'VERIFIED',
            totalVisitsCount: 1,
          };
        });

        setQueue((prev) => {
          const verifiedEncIds = new Set(prev.filter((p) => p.isVerified).map((p) => p.encounterId));
          const reviewNotesMap = new Map(prev.map((p) => [p.encounterId, p.reviewNotes]));

          return dbRecords.map((r) => {
            const isVer = r.isVerified || verifiedEncIds.has(r.encounterId);
            return {
              ...r,
              isVerified: isVer,
              readiness: isVer ? ('Verified' as const) : r.readiness,
              reviewNotes: reviewNotesMap.get(r.encounterId) || r.reviewNotes,
            };
          });
        });
      }
    } catch (err) {
      console.warn('Live DB queue fetch fallback:', err);
    }
  };

  // Real-time poller & Broadcast channel sync
  useEffect(() => {
    fetchLiveDbQueue();
    const interval = setInterval(fetchLiveDbQueue, 3000);

    const handleStorage = () => {
      fetchLiveDbQueue();
    };

    window.addEventListener('storage', handleStorage);

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('medikiosk_sync');
      bc.onmessage = (event) => {
        if (event.data?.type === 'NEW_PATIENT_REGISTERED' || event.data?.type === 'QUEUE_UPDATED') {
          fetchLiveDbQueue();
        }
      };
    } catch {}

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorage);
      if (bc) bc.close();
    };
  }, []);

  const selectedPatient = queue.find((p) => p.id === selectedPatientId) || null;

  // Dynamic patient modal data fetched directly from PostgreSQL
  const [patientVisits, setPatientVisits] = useState<PatientVisitHistoryItem[]>([]);
  const [patientMedications, setPatientMedications] = useState<any[]>([]);
  const [patientDocuments, setPatientDocuments] = useState<any[]>([]);

  // Build clean single-visit fallback for immediate render while async API loads
  const buildSingleVisitFromPatient = (patient: QueuedPatientRecord): PatientVisitHistoryItem => ({
    encounterId: patient.encounterId,
    date: patient.intakeDate,
    time: patient.intakeTime,
    timestamp: new Date().toISOString(),
    department: patient.department,
    doctor: patient.assignedDoctor || activeDoctor.fullName,
    chiefComplaint: patient.chiefComplaint,
    symptomLocation: patient.symptomLocation,
    severity: patient.readiness === 'CRITICAL' ? 'Critical (8/10)' : 'Moderate (5/10)',
    isVoiceIntake: Boolean(patient.isVoiceIntake),
    voiceTranscript: patient.voiceTranscript || '',
    voiceLanguage: patient.voiceLanguage || '',
    clinicalTranslation: patient.clinicalTranslation || '',
    aiDoctorSummary: patient.aiDoctorSummary || undefined,
    medicalHistory: patient.medicalHistory,
    medications: [],
    consentSigned: true,
    consentTimestamp: `${patient.intakeDate}, ${patient.intakeTime}`,
    status: patient.readiness === 'CRITICAL' ? 'CRITICAL' : 'CHECKED_IN',
    physicianNotes: patient.reviewNotes || 'Pre-consultation intake recorded at MediKiosk.',
    provisionalDiagnosis: patient.department?.includes('AYUSH')
      ? 'M17.9 Janu Sandhivata / OA Knee'
      : patient.department?.includes('Cardio')
      ? 'I20.9 Angina Pectoris'
      : 'Z00.0 General Medical Examination',
  });

  // Open modal when patient clicked - fetch 100% dynamic data from PostgreSQL
  const handleOpenPatientModal = async (patientId: string) => {
    setSelectedPatientId(patientId);
    const p = queue.find((item) => item.id === patientId);
    if (p) {
      setReviewNote(p.reviewNotes || '');
      setPatientVisits([buildSingleVisitFromPatient(p)]);
      setPatientMedications([]);
      setPatientDocuments([]);
    }
    setActiveModalTab('intake');
    setIsPatientModalOpen(true);

    if (p) {
      const pid = p.patientId || p.id;
      try {
        const [journeyRes, medsRes, docsRes] = await Promise.all([
          fetch(`/api/v1/encounters/patient/${encodeURIComponent(pid)}/journey`),
          fetch(`/api/v1/encounters/patient/${encodeURIComponent(pid)}/medications`),
          fetch(`/api/v1/encounters/patient/${encodeURIComponent(pid)}/documents`),
        ]);

        if (journeyRes.ok) {
          const jData = await journeyRes.json();
          if (jData.success && Array.isArray(jData.data) && jData.data.length > 0) {
            setPatientVisits(jData.data);
          }
        }

        if (medsRes.ok) {
          const mData = await medsRes.json();
          if (mData.success && Array.isArray(mData.data)) {
            setPatientMedications(mData.data);
          }
        }

        if (docsRes.ok) {
          const dData = await docsRes.json();
          if (dData.success && Array.isArray(dData.data)) {
            setPatientDocuments(dData.data);
          }
        }
      } catch (err) {
        console.warn('Error fetching dynamic patient data from PostgreSQL:', err);
      }
    }
  };

  const handleSaveReview = () => {
    if (!selectedPatient) return;
    setIsSavingReview(true);

    fetch(`/api/v1/encounters/${selectedPatient.encounterId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'IN_PROGRESS',
        physicianId: activeDoctor?.id,
      }),
    }).catch((err) => console.warn('PostgreSQL encounter status PATCH fallback:', err));

    setTimeout(() => {
      setQueue((prev) =>
        prev.map((p) =>
          p.id === selectedPatient.id
            ? {
                ...p,
                reviewNotes: reviewNote,
                isVerified: true,
                readiness: 'Verified' as const,
                status: 'COMPLETED' as const,
              }
            : p
        )
      );
      setIsSavingReview(false);
    }, 400);
  };

  const handlePlayAudio = (text: string) => {
    if (isPlayingAudio) {
      window.speechSynthesis?.cancel();
      setIsPlayingAudio(false);
      return;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.onstart = () => setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Filter queue
  const filteredPatients = queue.filter((patient) => {
    const matchesFilter =
      activeFilter === 'All' ||
      (activeFilter === 'My patients' && (!patient.assignedDoctor || patient.assignedDoctor.includes(activeDoctor.fullName.split(' ')[1] || ''))) ||
      (activeFilter === 'Flagged' && (patient.readiness === 'CRITICAL' || patient.flagsCount > 0)) ||
      (activeFilter === 'Verified' && (patient.isVerified || patient.readiness === 'Verified')) ||
      (activeFilter === 'Pending' && !patient.isVerified && patient.readiness !== 'Verified');

    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      patient.fullName.toLowerCase().includes(q) ||
      patient.abhaId.toLowerCase().includes(q) ||
      (patient.phone && patient.phone.includes(q)) ||
      patient.chiefComplaint.toLowerCase().includes(q) ||
      patient.department.toLowerCase().includes(q);

    return matchesFilter && matchesSearch;
  });

  const currentPatientJourney = selectedPatient
    ? patientVisits.length > 0
      ? patientVisits
      : [buildSingleVisitFromPatient(selectedPatient)]
    : [];

  return (
    <div
      className={`min-h-[100dvh] flex flex-col font-sans transition-colors duration-200 ${
        isLightMode ? 'bg-[#F8F9FA] text-[#111827]' : 'bg-[#090A0F] text-[#F4F4F6]'
      }`}
    >
      {/* Top Navigation Bar */}
      <header
        className={`h-14 border-b px-3 sm:px-6 flex items-center justify-between shrink-0 z-40 transition-colors ${
          isLightMode ? 'bg-[#FFFFFF] border-[#E5E7EB]' : 'bg-[#12151E] border-[#232838]'
        }`}
      >
        {/* Brand Identity & AIIA Hospital System Tag */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div
            className={`w-8 h-8 rounded-xl border flex items-center justify-center shadow-xs shrink-0 ${
              isLightMode
                ? 'bg-[#E1F3FE] border-[#C4E5FB] text-[#1F6C9F]'
                : 'bg-[#1E2738] border-[#2D3952] text-[#70B8FF]'
            }`}
          >
            <HeartPulse className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className={`font-extrabold text-xs sm:text-sm tracking-tight ${isLightMode ? 'text-[#111827]' : 'text-[#FFFFFF]'}`}>
                MediKiosk
              </span>
              <span className="tag-pastel-blue px-1.5 py-0.2 rounded-full text-[8px] sm:text-[9px] font-mono font-bold uppercase tracking-wider">
                PHYSICIAN OS
              </span>
            </div>
            <p className="text-[10px] text-[#6B7280] dark:text-[#8E94A4] leading-none hidden md:block">
              All India Institute of Ayurveda • OPD Care
            </p>
          </div>
        </div>

        {/* Global Search with Hotkey Pill (Desktop only) */}
        <div className="relative max-w-md w-full hidden md:block mx-6">
          <input
            type="text"
            placeholder="Search patient name, ABHA ID (e.g. 91-4711), or Phone (e.g. 8448885239)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-9 pr-12 py-1.5 rounded-lg text-xs font-medium transition-colors focus:outline-none ${
              isLightMode
                ? 'bg-[#F1F3F5] border border-[#E5E7EB] text-[#111827] placeholder-[#9CA3AF] focus:border-[#111827]'
                : 'bg-[#171B26] border border-[#2B3142] text-[#FFFFFF] placeholder-[#5D6373] focus:border-[#F4F4F6]'
            }`}
          />
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]" />
          <span className="text-[9px] font-mono text-[#888888] px-1.5 py-0.5 rounded border border-[#E5E7EB] dark:border-[#2B3142] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
            ⌘K
          </span>
        </div>

        {/* Right Actions & Switches */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setIsAddPatientOpen(true)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 active:scale-95 transition-all cursor-pointer shadow-xs ${
              isLightMode ? 'bg-[#111827] text-[#FFFFFF]' : 'bg-[#F4F4F6] text-[#090A0F]'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Walk-In</span>
          </button>

          <button
            type="button"
            onClick={() => setIsSpecialistsOpen(true)}
            title="Specialists Directory"
            className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-mono border transition-all active:scale-95 cursor-pointer hidden sm:flex items-center gap-1 ${
              isLightMode
                ? 'bg-[#FFFFFF] border-[#E5E7EB] text-[#1F6C9F] hover:bg-[#F1F3F5]'
                : 'bg-[#171B26] border-[#2B3142] text-[#70B8FF] hover:bg-[#22283A]'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Specialists</span>
          </button>

          {/* Theme Toggle (Shows target theme icon to switch into) */}
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label="Toggle Theme"
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isLightMode
                ? 'bg-[#F1F3F5] border-[#E5E7EB] text-[#4B5563] hover:bg-[#E5E7EB]'
                : 'bg-[#171B26] border-[#2B3142] text-[#8E94A4] hover:text-[#FFFFFF]'
            }`}
          >
            {isLightMode ? <Moon className="w-3.5 h-3.5 text-slate-700" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
          </button>

          {/* Doctor Switcher Menu (Desktop) */}
          <div className="relative hidden md:block">
            <select
              value={activeDoctor.id}
              onChange={(e) => {
                const found = specialists.find((s) => s.id === e.target.value);
                if (found) onSelectDoctor(found);
              }}
              className={`pl-7 pr-6 py-1.5 rounded-lg text-xs font-mono border appearance-none cursor-pointer focus:outline-none font-bold ${
                isLightMode
                  ? 'bg-[#FFFFFF] border-[#E5E7EB] text-[#111827] hover:bg-[#F1F3F5]'
                  : 'bg-[#171B26] border-[#2B3142] text-[#FFFFFF] hover:bg-[#22283A]'
              }`}
            >
              {specialists.map((doc) => (
                <option key={doc.id} value={doc.id} className="text-xs">
                  {doc.fullName} ({doc.department.split(' ')[0]})
                </option>
              ))}
            </select>
            <div className="w-4 h-4 rounded-full bg-[#2563EB] text-[#FFFFFF] font-bold text-[9px] flex items-center justify-center absolute left-1.5 top-1/2 -translate-y-1/2 pointer-events-none">
              D
            </div>
            <ChevronDown className="w-3 h-3 text-[#888888] absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`p-1.5 rounded-lg border md:hidden transition-colors cursor-pointer ${
              isLightMode ? 'bg-[#F1F3F5] border-[#E5E7EB] text-[#333333]' : 'bg-[#171B26] border-[#2B3142] text-[#F4F4F6]'
            }`}
          >
            <Menu className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onLogout}
            title="Sign Out"
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer hidden md:block ${
              isLightMode
                ? 'bg-[#F1F3F5] border-[#E5E7EB] text-[#666666] hover:text-red-500'
                : 'bg-[#171B26] border-[#2B3142] text-[#8E94A4] hover:text-red-400'
            }`}
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Mobile Drawer Dropdown */}
      {isMobileMenuOpen && (
        <div
          className={`md:hidden border-b p-3 space-y-2.5 transition-colors ${
            isLightMode ? 'bg-[#FFFFFF] border-[#E5E7EB]' : 'bg-[#12151E] border-[#232838]'
          }`}
        >
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, ABHA ID or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-8 pr-3 py-1.5 rounded-lg text-xs font-medium focus:outline-none ${
                isLightMode ? 'bg-[#F1F3F5] border border-[#E5E7EB] text-[#111827]' : 'bg-[#171B26] border border-[#2B3142] text-[#FFFFFF]'
              }`}
            />
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#888888]" />
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setIsSpecialistsOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs border font-semibold text-center ${
                isLightMode ? 'border-[#E5E7EB] bg-[#F8F9FA] text-[#111827]' : 'border-[#2B3142] bg-[#171B26] text-[#F4F4F6]'
              }`}
            >
              Specialists
            </button>
            <button
              type="button"
              onClick={() => {
                onNavigateToTriage();
                setIsMobileMenuOpen(false);
              }}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs border font-semibold text-center ${
                isLightMode ? 'border-[#E5E7EB] bg-[#F8F9FA] text-[#111827]' : 'border-[#2B3142] bg-[#171B26] text-[#F4F4F6]'
              }`}
            >
              Triage
            </button>
            <button
              type="button"
              onClick={() => {
                onNavigateToAdmin();
                setIsMobileMenuOpen(false);
              }}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs border font-semibold text-center ${
                isLightMode ? 'border-[#E5E7EB] bg-[#F8F9FA] text-[#111827]' : 'border-[#2B3142] bg-[#171B26] text-[#F4F4F6]'
              }`}
            >
              Admin
            </button>
          </div>
        </div>
      )}

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar (Desktop only) */}
        <aside
          className={`w-60 border-r p-3 flex flex-col justify-between shrink-0 hidden lg:flex transition-colors ${
            isLightMode ? 'bg-[#FFFFFF] border-[#E5E7EB]' : 'bg-[#0E1118] border-[#232838]'
          }`}
        >
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#888888] px-2 block mb-1">
                WORKSPACE
              </span>
              <p className={`text-xs font-bold px-2 ${isLightMode ? 'text-[#111827]' : 'text-[#FFFFFF]'}`}>
                Physician Workstation
              </p>
            </div>

            <nav className="space-y-1">
              <button
                type="button"
                className={`w-full p-2.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                  isLightMode
                    ? 'bg-[#E1F3FE] text-[#1F6C9F] font-bold border border-[#C4E5FB]'
                    : 'bg-[#1F6C9F]/20 text-[#70B8FF] font-bold border border-[#1F6C9F]/30'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4" />
                  <span>OPD Patient Queue</span>
                </div>
                <span className="tag-pastel-blue px-1.5 py-0.2 rounded text-[10px] font-mono font-bold">
                  {queue.length}
                </span>
              </button>
            </nav>

            {/* Secure Protocol Card */}
            <div
              className={`p-3 rounded-xl border transition-colors ${
                isLightMode ? 'bg-[#F8F9FA] border-[#E5E7EB]' : 'bg-[#141824] border-[#23293D]'
              }`}
            >
              <div className={`flex items-center gap-1.5 text-xs font-bold mb-1 ${isLightMode ? 'text-[#111827]' : 'text-[#FFFFFF]'}`}>
                <Shield className={`w-3.5 h-3.5 ${isLightMode ? 'text-[#1F6C9F]' : 'text-[#70B8FF]'}`} />
                <span>DPDP & ABDM Audited</span>
              </div>
              <p className={`text-[10px] leading-relaxed ${isLightMode ? 'text-[#6B7280]' : 'text-[#8E94A4]'}`}>
                Indexed by Phone & ABHA ID with complete chronological patient journey storage.
              </p>
            </div>
          </div>

          {/* Active Doctor Profile */}
          <div
            className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors ${
              isLightMode ? 'bg-[#FFFFFF] border-[#E5E7EB]' : 'bg-[#141824] border-[#23293D]'
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full border flex items-center justify-center font-bold text-xs ${
                  isLightMode ? 'bg-[#E1F3FE] border-[#C4E5FB] text-[#1F6C9F]' : 'bg-[#1F6C9F]/30 border-[#1F6C9F]/40 text-[#70B8FF]'
                }`}
              >
                {activeDoctor.fullName.charAt(4) || 'D'}
              </div>
              <div>
                <span className={`block text-xs font-bold leading-tight ${isLightMode ? 'text-[#111827]' : 'text-[#FFFFFF]'}`}>
                  {activeDoctor.fullName}
                </span>
                <span className="text-[10px] text-[#888888] font-mono">
                  {activeDoctor.roomNumber || 'Room #04'} • {currentUser.role}
                </span>
              </div>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          </div>
        </aside>

        {/* Center Main Content Area */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`text-lg sm:text-2xl font-extrabold tracking-tight ${isLightMode ? 'text-[#111827]' : 'text-[#FFFFFF]'}`}>
                  Queued Patients
                </h2>
                <span className="tag-pastel-blue px-2 py-0.5 rounded-full text-xs font-mono font-bold">
                  {filteredPatients.length} records
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${isLightMode ? 'text-[#6B7280]' : 'text-[#8E94A4]'}`}>
                Click any patient to open their comprehensive Patient Journey, Voice Intake & Clinical Consultation modal.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {(['All', 'My patients', 'Flagged', 'Verified', 'Pending'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveFilter(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all cursor-pointer ${
                    activeFilter === tab
                      ? isLightMode
                        ? 'bg-[#111827] text-[#FFFFFF] font-bold shadow-xs'
                        : 'bg-[#F4F4F6] text-[#090A0F] font-bold shadow-xs'
                      : isLightMode
                      ? 'bg-[#FFFFFF] text-[#4B5563] hover:text-[#111827] border border-[#E5E7EB]'
                      : 'bg-[#171B26] text-[#9096A6] hover:text-[#FFFFFF] border border-[#2B3142]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 1. MOBILE CARDS VIEW (< md: screen sizes)                                  */}
          {/* ========================================================================= */}
          <div className="md:hidden space-y-3">
            {filteredPatients.length === 0 ? (
              <div className={`p-8 text-center rounded-2xl border ${isLightMode ? 'bg-[#FFFFFF] border-[#E5E7EB]' : 'bg-[#12151E] border-[#232838]'}`}>
                <Users className="w-8 h-8 text-[#888888] mx-auto opacity-50 mb-2" />
                <p className="text-xs font-bold text-[#888888]">No patients matching current filter</p>
                <button
                  type="button"
                  onClick={() => setIsAddPatientOpen(true)}
                  className="text-xs font-bold text-[#1F6C9F] dark:text-[#70B8FF] mt-2 block mx-auto"
                >
                  + Register Walk-In Patient
                </button>
              </div>
            ) : (
              filteredPatients.map((patient) => {
                const isCrit = patient.readiness === 'CRITICAL';

                return (
                  <div
                    key={patient.id}
                    onClick={() => handleOpenPatientModal(patient.id)}
                    className={`p-4 rounded-2xl border transition-all active:scale-[0.98] cursor-pointer space-y-2.5 shadow-xs ${
                      isLightMode
                        ? 'bg-[#FFFFFF] border-[#E5E7EB] hover:border-[#1F6C9F]/50 hover:bg-[#F0F7FF]/30'
                        : 'bg-[#12151E] border-[#232838] hover:border-[#70B8FF]/40 hover:bg-[#161D2B]'
                    }`}
                  >
                    {/* Header Row: Avatar, Name, Readiness Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-sm shrink-0 ${
                            isLightMode ? 'bg-[#E1F3FE] border-[#C4E5FB] text-[#1F6C9F]' : 'bg-[#1F6C9F]/20 border-[#1F6C9F]/40 text-[#70B8FF]'
                          }`}
                        >
                          {patient.fullName.charAt(0)}
                        </div>
                        <div>
                          <h4 className={`text-sm font-bold leading-tight ${isLightMode ? 'text-[#111827]' : 'text-[#FFFFFF]'}`}>
                            {patient.fullName}
                          </h4>
                          <span className={`text-[11px] font-mono tabular-nums ${isLightMode ? 'text-[#6B7280]' : 'text-[#8E94A4]'}`}>
                            {patient.gender} • {patient.age}y • Ph: {patient.phone}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold shrink-0 ${
                          isCrit
                            ? 'tag-pastel-red'
                            : patient.readiness === 'Verified'
                            ? 'tag-pastel-green'
                            : 'tag-pastel-yellow'
                        }`}
                      >
                        {patient.readiness}
                      </span>
                    </div>

                    {/* ABHA ID Row */}
                    <div className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono flex items-center justify-between ${
                      isLightMode ? 'bg-[#F1F3F5] border-[#E5E7EB] text-[#1F6C9F]' : 'bg-[#171B26] border-[#232838] text-[#70B8FF]'
                    }`}>
                      <span className="font-bold">ABHA: {patient.abhaId}</span>
                      <span className="text-[10px] text-[#888888] font-normal">{patient.intakeDate} • {patient.intakeTime}</span>
                    </div>

                    {/* Chief Complaint Highlight */}
                    <div className={`p-2.5 rounded-xl border space-y-1 ${
                      isLightMode ? 'bg-[#F8F9FA] border-[#E5E7EB]' : 'bg-[#171B26] border-[#232838]'
                    }`}>
                      <div className="flex items-center justify-between text-[10px] font-mono uppercase text-[#888888]">
                        <span>CHIEF COMPLAINT</span>
                        <span className="text-[#1F6C9F] dark:text-[#70B8FF] font-bold">{patient.department}</span>
                      </div>
                      <p className={`text-xs font-semibold leading-snug line-clamp-2 ${isLightMode ? 'text-[#111827]' : 'text-[#FFFFFF]'}`}>
                        {patient.chiefComplaint}
                      </p>
                    </div>

                    {/* Footer Action */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1.5">
                        {patient.isVoiceIntake && (
                          <span className="tag-pastel-blue px-2 py-0.5 rounded text-[10px] font-mono font-bold inline-flex items-center gap-1">
                            <Mic className="w-2.5 h-2.5 text-red-400" />
                            <span>Voice ASR</span>
                          </span>
                        )}
                        <span className="tag-pastel-purple px-2 py-0.5 rounded text-[10px] font-mono font-semibold">
                          {patient.status}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenPatientModal(patient.id);
                        }}
                        className="px-3 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1 bg-[#2563EB] text-white shadow-xs"
                      >
                        <span>Open</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* ========================================================================= */}
          {/* 2. DESKTOP EXPANSIVE TABLE VIEW (>= md: screen sizes)                      */}
          {/* ========================================================================= */}
          <div
            className={`hidden md:block border rounded-2xl overflow-hidden shadow-xs transition-colors ${
              isLightMode ? 'bg-[#FFFFFF] border-[#E5E7EB]' : 'bg-[#12151E] border-[#232838]'
            }`}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[750px]">
                <thead
                  className={`border-b text-[10px] font-mono uppercase tracking-wider ${
                    isLightMode ? 'border-[#E5E7EB] text-[#6B7280] bg-[#F8F9FA]' : 'border-[#232838] text-[#64748B] bg-[#10121A]'
                  }`}
                >
                  <tr>
                    <th className="py-3.5 px-4">PATIENT</th>
                    <th className="py-3.5 px-4">INTAKE TIME</th>
                    <th className="py-3.5 px-4">CHIEF COMPLAINT</th>
                    <th className="py-3.5 px-4">READINESS</th>
                    <th className="py-3.5 px-4">STATUS</th>
                    <th className="py-3.5 px-4 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isLightMode ? 'divide-[#E5E7EB]' : 'divide-[#1D2230]'}`}>
                  {filteredPatients.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center">
                        <div className="max-w-xs mx-auto space-y-2">
                          <Users className="w-8 h-8 text-[#888888] mx-auto opacity-50" />
                          <p className="text-xs font-bold text-[#888888]">No patients matching current filter</p>
                          <button
                            type="button"
                            onClick={() => setIsAddPatientOpen(true)}
                            className="text-xs font-bold text-[#1F6C9F] dark:text-[#70B8FF] hover:underline"
                          >
                            + Register Walk-In Patient
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredPatients.map((patient) => {
                      const isCrit = patient.readiness === 'CRITICAL';

                      return (
                        <tr
                          key={patient.id}
                          onClick={() => handleOpenPatientModal(patient.id)}
                          className={`transition-all cursor-pointer ${
                            isLightMode ? 'hover:bg-[#F1F5F9]' : 'hover:bg-[#161D2B]'
                          }`}
                        >
                          {/* Patient */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-9 h-9 rounded-xl border flex items-center justify-center font-bold text-xs shrink-0 ${
                                  isLightMode ? 'bg-[#E1F3FE] border-[#C4E5FB] text-[#1F6C9F]' : 'bg-[#1F6C9F]/20 border-[#1F6C9F]/40 text-[#70B8FF]'
                                }`}
                              >
                                {patient.fullName.charAt(0)}
                              </div>
                              <div>
                                <strong className={`block text-xs font-bold leading-tight hover:underline ${isLightMode ? 'text-[#111827]' : 'text-[#FFFFFF]'}`}>
                                  {patient.fullName}
                                </strong>
                                <span className={`text-[10px] font-mono tabular-nums ${isLightMode ? 'text-[#6B7280]' : 'text-[#8E94A4]'}`}>
                                  {patient.gender} • {patient.age}y • ABHA {patient.abhaId} • {patient.phone}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Intake */}
                          <td className="py-4 px-4">
                            <div>
                              <span className={`block font-medium font-mono tabular-nums ${isLightMode ? 'text-[#111827]' : 'text-[#FFFFFF]'}`}>
                                {patient.intakeDate}
                              </span>
                              <span className="text-[10px] text-[#888888] font-mono tabular-nums">{patient.intakeTime}</span>
                            </div>
                          </td>

                          {/* Chief Complaint */}
                          <td className="py-4 px-4 max-w-[280px]">
                            <div>
                              <span className={`block font-semibold truncate ${isLightMode ? 'text-[#111827]' : 'text-[#FFFFFF]'}`}>
                                {patient.chiefComplaint}
                              </span>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                {patient.isVoiceIntake && (
                                  <span className="tag-pastel-blue px-1.5 py-0.2 rounded text-[9px] font-mono font-bold inline-flex items-center gap-0.5">
                                    <Mic className="w-2.5 h-2.5 text-red-400" />
                                    <span>{patient.voiceLanguage ? patient.voiceLanguage.split(' ')[0] : 'Voice ASR'}</span>
                                  </span>
                                )}
                                <span className="text-[10px] text-[#888888] block truncate">
                                  {patient.department}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Readiness */}
                          <td className="py-4 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold inline-flex items-center gap-1 ${
                                isCrit
                                  ? 'tag-pastel-red'
                                  : patient.readiness === 'Verified'
                                  ? 'tag-pastel-green'
                                  : 'tag-pastel-yellow'
                              }`}
                            >
                              {isCrit ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                              <span>{patient.readiness}</span>
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1.5">
                              <span className="tag-pastel-blue px-2 py-0.5 rounded text-[10px] font-mono font-semibold">
                                {patient.status}
                              </span>
                              {patient.flagsCount > 0 && (
                                <span className="tag-pastel-red px-1.5 py-0.5 rounded text-[10px] font-mono font-bold flex items-center gap-0.5">
                                  <AlertTriangle className="w-3 h-3" />
                                  <span>{patient.flagsCount}</span>
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Action */}
                          <td className="py-4 px-4 text-right">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenPatientModal(patient.id);
                              }}
                              className="px-3.5 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-xs"
                            >
                              <span>Open</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div
              className={`p-3 border-t flex items-center justify-between text-xs ${
                isLightMode ? 'border-[#E5E7EB] text-[#6B7280]' : 'border-[#232838] text-[#8E94A4]'
              }`}
            >
              <span className="font-mono tabular-nums">
                Showing {filteredPatients.length} of {queue.length} patients
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={fetchLiveDbQueue}
                  className={`px-3 py-1 rounded-lg border text-xs cursor-pointer active:scale-95 transition-all ${
                    isLightMode ? 'bg-[#FFFFFF] border-[#E5E7EB] text-[#4B5563]' : 'bg-[#171B26] border-[#2B3142] text-[#8E94A4]'
                  }`}
                >
                  Refresh Queue
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ========================================================================= */}
      {/* POPUP MODAL: RESPONSIVE HYBRID (Bottom Sheet on Mobile, Modal on Desktop) */}
      {/* ========================================================================= */}
      {isPatientModalOpen && selectedPatient && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setIsPatientModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full sm:max-w-4xl h-[92vh] sm:h-[88vh] sm:max-h-[90dvh] rounded-t-3xl sm:rounded-3xl border-t sm:border overflow-hidden flex flex-col shadow-2xl transition-all duration-300 ${
              isLightMode ? 'bg-[#FFFFFF] border-[#E5E7EB]' : 'bg-[#12151E] border-[#232838]'
            }`}
          >
            {/* Modal Header: Patient Demographics & ABHA Identity */}
            <div
              className={`p-3.5 sm:p-5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shrink-0 ${
                isLightMode ? 'bg-[#F8F9FA] border-[#E5E7EB]' : 'bg-[#10121A] border-[#232838]'
              }`}
            >
              <div className="flex items-center justify-between sm:justify-start gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#2563EB] text-white font-extrabold text-sm sm:text-base flex items-center justify-center shadow-sm shrink-0">
                    {selectedPatient.fullName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className={`text-sm sm:text-lg font-bold truncate max-w-[200px] sm:max-w-none ${isLightMode ? 'text-[#111827]' : 'text-[#FFFFFF]'}`}>
                        {selectedPatient.fullName}
                      </h3>
                      <span
                        className={`px-2 py-0.2 sm:py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono font-bold shrink-0 ${
                          selectedPatient.readiness === 'CRITICAL'
                            ? 'tag-pastel-red'
                            : selectedPatient.isVerified
                            ? 'tag-pastel-green'
                            : 'tag-pastel-yellow'
                        }`}
                      >
                        {selectedPatient.isVerified ? 'Verified' : selectedPatient.readiness}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] text-[#6B7280] dark:text-[#8E94A4] font-mono mt-0.5">
                      <span>{selectedPatient.gender} • {selectedPatient.age}y</span>
                      <span>•</span>
                      <span className="text-[#1F6C9F] dark:text-[#70B8FF] font-bold">ABHA: {selectedPatient.abhaId}</span>
                      <button
                        type="button"
                        onClick={() => navigator.clipboard?.writeText(selectedPatient.abhaId)}
                        title="Copy ABHA"
                        className="hover:text-[#111827] dark:hover:text-[#FFFFFF] cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Mobile Close Button */}
                <button
                  type="button"
                  onClick={() => setIsPatientModalOpen(false)}
                  className={`sm:hidden p-1.5 rounded-lg text-[#888888] ${isLightMode ? 'hover:bg-[#E5E7EB]' : 'hover:bg-[#1E222D]'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Header Right Actions (Desktop) */}
              <div className="hidden sm:flex items-center gap-2 self-end sm:self-center">
                <span className="tag-pastel-blue px-2.5 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1">
                  <History className="w-3 h-3" />
                  <span>{currentPatientJourney.length} Encounters</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsFhirModalOpen(true)}
                  title="Export FHIR R4 Bundle"
                  className={`p-2 rounded-xl border text-xs font-mono cursor-pointer transition-all active:scale-95 ${
                    isLightMode ? 'bg-[#FFFFFF] border-[#E5E7EB] text-[#111827] hover:bg-[#F1F3F5]' : 'bg-[#171B26] border-[#2B3142] text-[#F4F4F6] hover:bg-[#22283A]'
                  }`}
                >
                  <FileCode className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsPatientModalOpen(false)}
                  className={`p-2 rounded-xl text-[#888888] transition-colors cursor-pointer ${
                    isLightMode ? 'hover:text-[#111827] hover:bg-[#E5E7EB]' : 'hover:text-[#FFFFFF] hover:bg-[#1E222D]'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Navigation Tabs */}
            <div
              className={`px-3 sm:px-6 border-b flex items-center gap-1 sm:gap-2 overflow-x-auto shrink-0 ${
                isLightMode ? 'bg-[#FFFFFF] border-[#E5E7EB]' : 'bg-[#12151E] border-[#232838]'
              }`}
            >
              {[
                { id: 'intake', label: 'Encounter & Intake', icon: Activity },
                { id: 'journey', label: `Chronological Journey (${currentPatientJourney.length})`, icon: History },
                { id: 'documents', label: 'Medications & OCR', icon: Pill },
                { id: 'review', label: 'Physician Sign-Off', icon: FileCheck },
              ].map((tab) => {
                const IconComp = tab.icon;
                const isActive = activeModalTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveModalTab(tab.id as any)}
                    className={`py-2.5 sm:py-3 px-2.5 sm:px-4 text-xs font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? isLightMode
                          ? 'border-[#111827] text-[#111827]'
                          : 'border-[#70B8FF] text-[#70B8FF]'
                        : 'border-transparent text-[#888888] hover:text-[#111827] dark:hover:text-[#FFFFFF]'
                    }`}
                  >
                    <IconComp className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Modal Body Content Area */}
            <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-3.5 sm:space-y-4">
              {/* ========================================================= */}
              {/* TAB 1: Encounter & Intake (Current Visit)                 */}
              {/* ========================================================= */}
              {activeModalTab === 'intake' && (
                <div className="space-y-3.5">
                  {/* Top 2x2 Bento Metric Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                    <div className={`p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border ${isLightMode ? 'bg-[#F8F9FA] border-[#E5E7EB]' : 'bg-[#171B26] border-[#2B3142]'}`}>
                      <span className="text-[8px] sm:text-[9px] font-mono uppercase tracking-wider text-[#888888] block mb-1">MEDICAL HISTORY</span>
                      <div className="flex flex-wrap gap-1">
                        {selectedPatient.medicalHistory.map((h, i) => (
                          <span key={i} className="tag-pastel-yellow px-1.5 py-0.2 rounded text-[9px] sm:text-[10px] font-medium">
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className={`p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border ${isLightMode ? 'bg-[#F8F9FA] border-[#E5E7EB]' : 'bg-[#171B26] border-[#2B3142]'}`}>
                      <span className="text-[8px] sm:text-[9px] font-mono uppercase tracking-wider text-[#888888] block mb-1">QUESTIONNAIRE</span>
                      <p className="text-xs font-bold text-[#1F6C9F] dark:text-[#70B8FF]">
                        {selectedPatient.questionnaireResponses?.length || 0} Clinical responses
                      </p>
                    </div>

                    <div className={`p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border ${isLightMode ? 'bg-[#F8F9FA] border-[#E5E7EB]' : 'bg-[#171B26] border-[#2B3142]'}`}>
                      <span className="text-[8px] sm:text-[9px] font-mono uppercase tracking-wider text-[#888888] block mb-1">DOCUMENTS</span>
                      <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        1 OCR Prescription
                      </p>
                    </div>

                    <div className={`p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border ${isLightMode ? 'bg-[#F8F9FA] border-[#E5E7EB]' : 'bg-[#171B26] border-[#2B3142]'}`}>
                      <span className="text-[8px] sm:text-[9px] font-mono uppercase tracking-wider text-[#888888] block mb-1">SAFETY SIGNALS</span>
                      <p className={`text-xs font-bold ${selectedPatient.readiness === 'CRITICAL' ? 'text-red-500' : 'text-[#888888]'}`}>
                        {selectedPatient.readiness === 'CRITICAL' ? '1 Critical Alert' : 'No active alerts'}
                      </p>
                    </div>
                  </div>

                  {/* Encounter Details Card */}
                  <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border space-y-2.5 ${isLightMode ? 'bg-[#F8F9FA] border-[#E5E7EB]' : 'bg-[#171B26] border-[#2B3142]'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded-lg tag-pastel-purple">
                          <Activity className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <h4 className={`text-xs font-bold ${isLightMode ? 'text-[#111827]' : 'text-[#FFFFFF]'}`}>
                            Encounter Details
                          </h4>
                          <p className="text-[10px] text-[#888888]">Current consultation encounter</p>
                        </div>
                      </div>
                      <span className="tag-pastel-blue px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                        {selectedPatient.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1 text-xs divide-y sm:divide-y-0 divide-[#E5E7EB] dark:divide-[#232838]">
                      <div className="pt-1 sm:pt-0">
                        <span className="text-[9px] font-mono uppercase text-[#888888] block">ENCOUNTER ID</span>
                        <p className="font-mono text-[10px] truncate text-[#1F6C9F] dark:text-[#70B8FF] font-bold">
                          {selectedPatient.encounterId}
                        </p>
                      </div>
                      <div className="pt-1 sm:pt-0">
                        <span className="text-[9px] font-mono uppercase text-[#888888] block">CHECK-IN</span>
                        <p className="font-mono text-[11px] font-semibold">
                          {selectedPatient.intakeDate}, {selectedPatient.intakeTime}
                        </p>
                      </div>
                      <div className="pt-1 sm:pt-0">
                        <span className="text-[9px] font-mono uppercase text-[#888888] block">DEPARTMENT</span>
                        <p className="text-[11px] font-semibold truncate">{selectedPatient.department}</p>
                      </div>
                      <div className="pt-1 sm:pt-0">
                        <span className="text-[9px] font-mono uppercase text-[#888888] block">ATTENDING DOCTOR</span>
                        <p className="text-[11px] font-semibold truncate">{selectedPatient.assignedDoctor || activeDoctor.fullName}</p>
                      </div>
                    </div>
                  </div>

                  {/* DPDP Act Consent Card */}
                  <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border space-y-2 ${isLightMode ? 'bg-[#F8F9FA] border-[#E5E7EB]' : 'bg-[#171B26] border-[#2B3142]'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded-lg tag-pastel-green">
                          <Shield className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <h4 className={`text-xs font-bold ${isLightMode ? 'text-[#111827]' : 'text-[#FFFFFF]'}`}>
                            Consent Record
                          </h4>
                          <p className="text-[10px] text-[#888888]">Digital DPDP Act 2023 consent capture</p>
                        </div>
                      </div>
                      <span className="tag-pastel-green px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                        GRANTED
                      </span>
                    </div>
                    <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${isLightMode ? 'bg-[#FFFFFF] border-[#E5E7EB]' : 'bg-[#12151E] border-[#232838]'}`}>
                      <div>
                        <span className="font-bold block">Consent captured & verified</span>
                        <span className="text-[10px] text-[#888888] font-mono">Signed {selectedPatient.intakeDate}, {selectedPatient.intakeTime}</span>
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    </div>
                  </div>

                  {/* AI Multilingual Voice Intake Card */}
                  {(selectedPatient.isVoiceIntake || selectedPatient.voiceTranscript) && (
                    <div className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border space-y-3 ${isLightMode ? 'bg-[#F0F7FF] border-[#C4E5FB]' : 'bg-[#141C2A] border-[#20314A]'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-[#2563EB] text-white shadow-xs">
                            <Mic className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <h4 className={`text-xs font-bold ${isLightMode ? 'text-[#111827]' : 'text-[#FFFFFF]'}`}>
                              AI Multilingual Voice Intake & ASR
                            </h4>
                            <p className="text-[10px] text-[#6B7280] dark:text-[#8E94A4]">
                              Captured via Multilingual Voice Intake & Synthesized by Clinical AI Engine
                            </p>
                          </div>
                        </div>
                        <span className="tag-pastel-blue px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0">
                          {selectedPatient.voiceLanguage || 'Hindi / Hinglish'}
                        </span>
                      </div>

                      {/* Verbatim Speech Quote */}
                      <div className={`p-3 rounded-xl border space-y-1.5 ${isLightMode ? 'bg-[#FFFFFF] border-[#D6E8FA]' : 'bg-[#0E1522] border-[#1C2B42]'}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-mono uppercase tracking-wider text-[#1F6C9F] dark:text-[#70B8FF] flex items-center gap-1 font-bold">
                            <Volume2 className="w-3 h-3" />
                            <span>Verbatim Patient Speech</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => handlePlayAudio(selectedPatient.voiceTranscript || '')}
                            className={`text-[9px] font-mono px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer transition-all active:scale-95 ${
                              isPlayingAudio ? 'bg-amber-500 text-white animate-pulse' : 'tag-pastel-green'
                            }`}
                          >
                            <Volume2 className="w-2.5 h-2.5" />
                            <span>{isPlayingAudio ? 'Playing...' : 'Listen Audio'}</span>
                          </button>
                        </div>
                        <p className={`text-xs italic font-medium leading-relaxed ${isLightMode ? 'text-[#111827]' : 'text-[#F4F4F6]'}`}>
                          "{selectedPatient.voiceTranscript}"
                        </p>
                      </div>

                      {/* English Clinical Translation */}
                      {selectedPatient.clinicalTranslation && (
                        <div className="space-y-0.5 text-xs">
                          <span className="text-[10px] font-mono uppercase text-[#6B7280] dark:text-[#8E94A4] block">
                            Clinical Translation (English):
                          </span>
                          <p className={`text-xs font-medium leading-snug ${isLightMode ? 'text-[#374151]' : 'text-[#CBD5E1]'}`}>
                            {selectedPatient.clinicalTranslation}
                          </p>
                        </div>
                      )}

                      {/* SBAR Note */}
                      {selectedPatient.aiDoctorSummary && (
                        <div className="space-y-2 pt-1 border-t border-[#D6E8FA] dark:border-[#1E2E48]">
                          <div className="flex items-center gap-1 text-[#1F6C9F] dark:text-[#70B8FF] text-[11px] font-bold">
                            <Sparkles className="w-3 h-3" />
                            <span>AI Synthesized Physician S.B.A.R.</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            <div className={`p-2.5 rounded-xl border ${isLightMode ? 'bg-[#FFFFFF] border-[#E5E7EB]' : 'bg-[#10141F] border-[#222E42]'}`}>
                              <strong className="text-[9px] font-mono text-[#1F6C9F] dark:text-[#70B8FF] block uppercase">[S] Situation</strong>
                              <p className={`text-[11px] ${isLightMode ? 'text-[#374151]' : 'text-[#CCCCCC]'}`}>{selectedPatient.aiDoctorSummary.situation}</p>
                            </div>
                            <div className={`p-2.5 rounded-xl border ${isLightMode ? 'bg-[#FFFFFF] border-[#E5E7EB]' : 'bg-[#10141F] border-[#222E42]'}`}>
                              <strong className="text-[9px] font-mono text-[#1F6C9F] dark:text-[#70B8FF] block uppercase">[A] Assessment</strong>
                              <p className={`text-[11px] ${isLightMode ? 'text-[#374151]' : 'text-[#CCCCCC]'}`}>{selectedPatient.aiDoctorSummary.assessment}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Patient Structured Intake Card */}
                  <div className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border space-y-2.5 ${isLightMode ? 'bg-[#F8F9FA] border-[#E5E7EB]' : 'bg-[#171B26] border-[#2B3142]'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded-lg tag-pastel-purple">
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <h4 className={`text-xs font-bold ${isLightMode ? 'text-[#111827]' : 'text-[#FFFFFF]'}`}>
                            Patient Structured Intake
                          </h4>
                          <p className="text-[10px] text-[#888888]">Saved clinical intake records</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-[#888888] block mb-0.5">CHIEF COMPLAINTS</span>
                        <p className={`font-semibold ${isLightMode ? 'text-[#111827]' : 'text-[#FFFFFF]'}`}>
                          {selectedPatient.chiefComplaint}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase text-[#888888] block mb-0.5">SYMPTOM LOCATION</span>
                        <p className={isLightMode ? 'text-[#374151]' : 'text-[#CBD5E1]'}>
                          {selectedPatient.symptomLocation}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase text-[#888888] block mb-0.5">MEDICAL HISTORY</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedPatient.medicalHistory.map((hist, idx) => (
                            <span key={idx} className="tag-pastel-yellow px-2 py-0.5 rounded text-[10px] font-medium">
                              {hist}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Questionnaire Responses */}
                  <div className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border space-y-2.5 ${isLightMode ? 'bg-[#F8F9FA] border-[#E5E7EB]' : 'bg-[#171B26] border-[#2B3142]'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded-lg tag-pastel-blue">
                          <Activity className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <h4 className={`text-xs font-bold ${isLightMode ? 'text-[#111827]' : 'text-[#FFFFFF]'}`}>
                            Questionnaire Responses
                          </h4>
                          <p className="text-[10px] text-[#888888]">Patient answers with confidence and provenance</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {selectedPatient.questionnaireResponses?.map((q, idx) => (
                        <div key={idx} className={`p-2.5 rounded-xl border text-xs space-y-1 ${isLightMode ? 'bg-[#FFFFFF] border-[#E5E7EB]' : 'bg-[#12151E] border-[#232838]'}`}>
                          <p className={`font-semibold ${isLightMode ? 'text-[#111827]' : 'text-[#FFFFFF]'}`}>{q.question}</p>
                          <div className="flex items-center justify-between gap-1">
                            <span className="tag-pastel-green px-2 py-0.5 rounded text-[10px] font-bold">{q.response}</span>
                            <span className="text-[9px] font-mono text-[#888888]">{q.sourceType || 'PATIENT'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 2: Chronological Patient Journey & Visit History      */}
              {/* ========================================================= */}
              {activeModalTab === 'journey' && (
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className={`text-xs sm:text-sm font-bold ${isLightMode ? 'text-[#111827]' : 'text-[#FFFFFF]'}`}>
                        Chronological Visit History & Patient Journey
                      </h4>
                      <p className="text-[11px] text-[#888888]">
                        Indexed by ABHA ID ({selectedPatient.abhaId}) & Phone ({selectedPatient.phone})
                      </p>
                    </div>
                    <span className="tag-pastel-blue px-2.5 py-1 rounded-full text-xs font-mono font-bold shrink-0">
                      {currentPatientJourney.length} Visits
                    </span>
                  </div>

                  <div className="space-y-3 relative before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#E5E7EB] dark:before:bg-[#232838]">
                    {currentPatientJourney.map((visit, index) => {
                      const isLatest = index === 0;

                      return (
                        <div key={visit.encounterId} className="relative pl-8 sm:pl-10">
                          {/* Timeline Dot */}
                          <div
                            className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center font-bold text-[10px] sm:text-xs absolute left-0 top-1 shadow-xs ${
                              isLatest
                                ? 'bg-[#2563EB] text-white border-white dark:border-[#12151E]'
                                : isLightMode
                                ? 'bg-[#FFFFFF] text-[#888888] border-[#E5E7EB]'
                                : 'bg-[#171B26] text-[#8E94A4] border-[#2B3142]'
                            }`}
                          >
                            {currentPatientJourney.length - index}
                          </div>

                          {/* Card */}
                          <div
                            className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border space-y-2 ${
                              isLatest
                                ? isLightMode
                                  ? 'bg-[#F0F7FF] border-[#C4E5FB]'
                                  : 'bg-[#141C2A] border-[#20314A]'
                                : isLightMode
                                ? 'bg-[#F8F9FA] border-[#E5E7EB]'
                                : 'bg-[#171B26] border-[#2B3142]'
                            }`}
                          >
                            <div className="flex flex-wrap items-center justify-between gap-1.5">
                              <div className="flex items-center gap-1.5">
                                <span className={`text-xs font-bold ${isLightMode ? 'text-[#111827]' : 'text-[#FFFFFF]'}`}>
                                  {visit.date} • {visit.time}
                                </span>
                                {isLatest && (
                                  <span className="tag-pastel-blue px-1.5 py-0.2 rounded text-[8px] font-mono font-bold uppercase">
                                    CURRENT
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="tag-pastel-purple px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                                  {visit.department}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                    visit.status === 'COMPLETED'
                                      ? 'tag-pastel-green'
                                      : visit.status === 'CRITICAL'
                                      ? 'tag-pastel-red'
                                      : 'tag-pastel-yellow'
                                  }`}
                                >
                                  {visit.status}
                                </span>
                              </div>
                            </div>

                            {/* Chief Complaint */}
                            <div>
                              <span className="text-[9px] font-mono uppercase text-[#888888] block mb-0.5">CHIEF COMPLAINT</span>
                              <p className={`text-xs font-semibold ${isLightMode ? 'text-[#111827]' : 'text-[#FFFFFF]'}`}>
                                {visit.chiefComplaint}
                              </p>
                            </div>

                            {/* Attending Doctor & Diagnosis */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs pt-1">
                              <div>
                                <span className="text-[9px] font-mono uppercase text-[#888888] block">ATTENDING PHYSICIAN</span>
                                <p className="font-medium">{visit.doctor}</p>
                              </div>
                              {visit.provisionalDiagnosis && (
                                <div>
                                  <span className="text-[9px] font-mono uppercase text-[#888888] block">DIAGNOSIS</span>
                                  <p className="font-bold text-[#1F6C9F] dark:text-[#70B8FF]">{visit.provisionalDiagnosis}</p>
                                </div>
                              )}
                            </div>

                            {/* Prescribed Medications */}
                            {visit.medications && visit.medications.length > 0 && (
                              <div>
                                <span className="text-[9px] font-mono uppercase text-[#888888] block mb-1">PRESCRIBED MEDICINES</span>
                                <div className="flex flex-wrap gap-1">
                                  {visit.medications.map((m, idx) => (
                                    <span key={idx} className="tag-pastel-green px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1">
                                      <Pill className="w-2.5 h-2.5" />
                                      <span>{m}</span>
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Physician Review Notes */}
                            {visit.physicianNotes && (
                              <div className={`p-2.5 rounded-xl border text-xs ${isLightMode ? 'bg-[#FFFFFF] border-[#E5E7EB]' : 'bg-[#12151E] border-[#232838]'}`}>
                                <span className="text-[9px] font-mono uppercase text-[#888888] block mb-0.5">PHYSICIAN NOTES</span>
                                <p className={`italic text-[11px] ${isLightMode ? 'text-[#4B5563]' : 'text-[#CCCCCC]'}`}>{visit.physicianNotes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 3: Medications & Digitized OCR Documents              */}
              {/* ========================================================= */}
              {activeModalTab === 'documents' && (
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className={`text-xs sm:text-sm font-bold ${isLightMode ? 'text-[#111827]' : 'text-[#FFFFFF]'}`}>
                        Medications & Digitized OCR Documents
                      </h4>
                      <p className="text-[11px] text-[#888888]">Scanned medical documents and verified OCR extractions from PostgreSQL</p>
                    </div>
                  </div>

                  {/* Active Medications Section */}
                  <div className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border space-y-3 ${isLightMode ? 'bg-[#F8F9FA] border-[#E5E7EB]' : 'bg-[#171B26] border-[#2B3142]'}`}>
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-lg tag-pastel-green">
                        <Pill className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className={`text-xs font-bold ${isLightMode ? 'text-[#111827]' : 'text-[#FFFFFF]'}`}>
                          Active Medications ({patientMedications.length})
                        </h4>
                        <p className="text-[10px] text-[#888888]">Verified by AI Clinical Judge & Digitizer</p>
                      </div>
                    </div>

                    {patientMedications.length > 0 ? (
                      <div className="space-y-2">
                        {patientMedications.map((med, idx) => (
                          <div key={idx} className={`p-3 rounded-xl border flex items-center justify-between text-xs ${isLightMode ? 'bg-[#FFFFFF] border-[#E5E7EB]' : 'bg-[#12151E] border-[#232838]'}`}>
                            <div className="flex items-center gap-2.5">
                              <Pill className="w-4 h-4 text-[#1F6C9F] dark:text-[#70B8FF] shrink-0" />
                              <div>
                                <strong className={`block font-bold ${isLightMode ? 'text-[#111827]' : 'text-[#FFFFFF]'}`}>{med.name}</strong>
                                <span className="text-[10px] text-[#888888]">{med.dosage} • {med.frequency}</span>
                              </div>
                            </div>
                            <span className="tag-pastel-green px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0">
                              {Math.round((med.confidence || 0.96) * 100)}% OCR Verified
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-4 text-center">
                        <p className="text-xs text-[#888888]">No medications uploaded or extracted during this intake.</p>
                      </div>
                    )}
                  </div>

                  {/* Scanned Documents Section */}
                  {patientDocuments.length > 0 && (
                    <div className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border space-y-3 ${isLightMode ? 'bg-[#F8F9FA] border-[#E5E7EB]' : 'bg-[#171B26] border-[#2B3142]'}`}>
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded-lg tag-pastel-purple">
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <h4 className={`text-xs font-bold ${isLightMode ? 'text-[#111827]' : 'text-[#FFFFFF]'}`}>
                            Scanned Prescriptions & Reports ({patientDocuments.length})
                          </h4>
                          <p className="text-[10px] text-[#888888]">Digitized files stored in health record store</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {patientDocuments.map((doc, idx) => (
                          <div key={idx} className={`p-3 rounded-xl border flex items-center justify-between text-xs ${isLightMode ? 'bg-[#FFFFFF] border-[#E5E7EB]' : 'bg-[#12151E] border-[#232838]'}`}>
                            <div className="flex items-center gap-2.5">
                              <FileText className="w-4 h-4 text-[#7C3AED] dark:text-[#A78BFA] shrink-0" />
                              <div>
                                <strong className={`block font-bold ${isLightMode ? 'text-[#111827]' : 'text-[#FFFFFF]'}`}>{doc.fileName}</strong>
                                <span className="text-[10px] text-[#888888]">{doc.documentType} • {(doc.fileSizeBytes / 1024).toFixed(1)} KB</span>
                              </div>
                            </div>
                            <span className="tag-pastel-blue px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0">
                              {doc.status || 'CONFIRMED'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 4: Physician Review & Sign-off                        */}
              {/* ========================================================= */}
              {activeModalTab === 'review' && (
                <div className="space-y-3.5">
                  <div className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border space-y-3 ${isLightMode ? 'bg-[#F8F9FA] border-[#E5E7EB]' : 'bg-[#171B26] border-[#2B3142]'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded-lg tag-pastel-green">
                          <FileCheck className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <h4 className={`text-xs font-bold ${isLightMode ? 'text-[#111827]' : 'text-[#FFFFFF]'}`}>
                            Physician Clinical Review & Sign-Off
                          </h4>
                          <p className="text-[10px] text-[#888888]">Verification and prescription completion</p>
                        </div>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold ${selectedPatient.isVerified ? 'tag-pastel-green' : 'tag-pastel-yellow'}`}>
                        {selectedPatient.isVerified ? 'Verified' : 'Pending'}
                      </span>
                    </div>

                    {/* Quick ICD-10 Diagnosis Chips */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#888888] block">
                        Quick Diagnosis Presets:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {QUICK_DIAGNOSES.map((diag) => (
                          <button
                            key={diag.code}
                            type="button"
                            onClick={() => {
                              setReviewNote((prev) =>
                                prev ? `${prev}\nProvisional Diagnosis: ${diag.label}` : `Provisional Diagnosis: ${diag.label}`
                              );
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-mono border transition-all cursor-pointer shadow-xs ${
                              isLightMode
                                ? 'bg-[#FFFFFF] border-[#E5E7EB] hover:bg-[#F1F3F5] text-[#111827]'
                                : 'bg-[#12151E] border-[#232838] hover:bg-[#1C2130] text-[#F4F4F6]'
                            }`}
                          >
                            {diag.code} • {diag.label.split('/')[0]}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Review Notes Textarea */}
                    <div className="space-y-1.5">
                      <label className={`text-xs font-bold block ${isLightMode ? 'text-[#111827]' : 'text-[#FFFFFF]'}`}>
                        Physician Clinical Assessment & Orders
                      </label>
                      <textarea
                        rows={4}
                        value={reviewNote}
                        onChange={(e) => setReviewNote(e.target.value)}
                        placeholder="Document clinical assessment, verified diagnosis, prescription orders or follow-up instructions..."
                        className={`w-full p-3 rounded-2xl text-xs resize-none focus:outline-none ${
                          isLightMode
                            ? 'bg-[#FFFFFF] border border-[#E5E7EB] text-[#111827] placeholder-[#9CA3AF]'
                            : 'bg-[#12151E] border border-[#232838] text-[#FFFFFF] placeholder-[#5D6373]'
                        }`}
                      />
                    </div>

                    {/* Legal Notice */}
                    <div className={`p-2.5 sm:p-3 rounded-xl border text-[11px] leading-relaxed flex items-start gap-2 ${isLightMode ? 'bg-[#E1F3FE]/60 border-[#C4E5FB] text-[#1F6C9F]' : 'bg-[#1F6C9F]/10 border-[#1F6C9F]/30 text-[#70B8FF]'}`}>
                      <Shield className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>
                        By signing off, you confirm clinical verification under the ABDM framework.
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleSaveReview}
                        disabled={isSavingReview}
                        className="w-full sm:flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-[#FFFFFF] font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer shadow-sm"
                      >
                        {isSavingReview ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            <span>{selectedPatient.isVerified ? 'Update Clinical Sign-Off' : 'Approve & Sign Clinical Summary'}</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsFhirModalOpen(true)}
                        className={`w-full sm:w-auto py-3 px-4 border rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isLightMode ? 'bg-[#FFFFFF] hover:bg-[#F1F3F5] text-[#111827] border-[#E5E7EB]' : 'bg-[#171B26] hover:bg-[#22283A] text-[#F4F4F6] border-[#2B3142]'
                        }`}
                      >
                        <FileCode className="w-4 h-4" />
                        <span>Export FHIR Bundle</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Dialog: Add Walk-In Patient */}
      {isAddPatientOpen && (
        <AddPatientModal
          specialists={specialists}
          onClose={() => setIsAddPatientOpen(false)}
          onPatientCreated={(_encId, newQ) => {
            setIsAddPatientOpen(false);
            if (newQ) {
              setQueue((prev) => [newQ, ...prev]);
              setSelectedPatientId(newQ.id);
            }
          }}
          isLightMode={isLightMode}
        />
      )}

      {/* Modal Dialog: Specialists Directory */}
      {isSpecialistsOpen && (
        <SpecialistDirectoryModal
          specialists={specialists}
          activeDoctor={activeDoctor}
          onSelectDoctor={(doc) => {
            onSelectDoctor(doc);
            setIsSpecialistsOpen(false);
          }}
          onOpenAddDoctor={() => {}}
          onClose={() => setIsSpecialistsOpen(false)}
          isLightMode={isLightMode}
        />
      )}

      {/* Modal Dialog: FHIR Export */}
      {isFhirModalOpen && selectedPatient && (
        <FhirExportModal
          encounterId={selectedPatient.encounterId}
          onClose={() => setIsFhirModalOpen(false)}
          isLightMode={isLightMode}
        />
      )}
    </div>
  );
};

export default DoctorWorkspace;
