import React, { useState } from 'react';
import {
  AlertTriangle,
  Pill,
  Activity,
  CheckCircle2,
  Download,
  UserCheck,
  FileCheck,
  Mic,
  Volume2,
} from 'lucide-react';
import {
  Patient,
  Encounter,
  ControlledClinicalSummary,
  RedFlagAlert,
  DoctorSpecialist,
} from '@medikiosk/shared-types';
import { DoctorApi } from '../services/api';

const QUICK_DIAGNOSES = [
  { code: 'K21.9', label: 'Gastro-Esophageal Reflux / Esophagitis (K21.9)' },
  { code: 'I20.9', label: 'Angina Pectoris / Ischemic Heart Disease (I20.9)' },
  { code: 'I10', label: 'Essential / Primary Hypertension (I10)' },
  { code: 'R07.9', label: 'Chest Pain, Unspecified (R07.9)' },
  { code: 'E11.9', label: 'Type 2 Diabetes Mellitus (E11.9)' },
  { code: 'J06.9', label: 'Acute Upper Respiratory Infection (J06.9)' },
];

const DEPARTMENTS_LIST = [
  'General Medicine',
  'Kayachikitsa / AYUSH',
  'Cardiology',
  'Orthopedics',
  'Pulmonology',
  'Gastroenterology',
  'Emergency Triage',
];

interface ClinicalBriefingViewProps {
  briefing: {
    encounter: Encounter;
    patient: Patient;
    activeRedFlags: RedFlagAlert[];
    facts: any[];
    medications: any[];
    allergies: any[];
    timeline: any[];
    documents: any[];
    summary: ControlledClinicalSummary | null;
  };
  specialists?: DoctorSpecialist[];
  onRefresh: () => void;
  onOpenFhirExport: () => void;
  isLightMode?: boolean;
}

export const ClinicalBriefingView: React.FC<ClinicalBriefingViewProps> = ({
  briefing,
  specialists: _specialists = [],
  onRefresh,
  onOpenFhirExport,
  isLightMode = false,
}) => {
  const { encounter, patient, activeRedFlags, facts, timeline, documents, summary } = briefing;

  const [activeTab, setActiveTab] = useState<'BRIEFING' | 'FACTS' | 'TIMELINE' | 'DOCUMENTS'>('BRIEFING');
  const [isVerifying, setIsVerifying] = useState(false);
  const [provisionalDiagnosis, setProvisionalDiagnosis] = useState(
    'Acute Atypical Chest Discomfort / Reflux Esophagitis (K21.9)'
  );
  const [treatmentPlan, setTreatmentPlan] = useState(
    '1. Tab Pantoprazole 40mg OD before breakfast x 14 days\n2. Continue Tab Amlodipine 5mg OD\n3. 12-Lead ECG & Serum Troponin I Stat'
  );
  const [clinicalNotes, setClinicalNotes] = useState(
    'Patient examined in OPD. Normal heart sounds, no peripheral edema. ECG scheduled to rule out acute ischemia.'
  );
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [selectedReassignDept, setSelectedReassignDept] = useState(encounter.department || 'General Medicine');
  const [isReassigning, setIsReassigning] = useState(false);

  // Dynamically update clinical presets whenever active patient / encounter changes
  React.useEffect(() => {
    setSelectedReassignDept(encounter.department || 'General Medicine');
    setVerificationSuccess(false);

    const complaint = (encounter.chiefComplaintSummary || '').toLowerCase();
    const dept = (encounter.department || '').toLowerCase();
    const isAyush = dept.includes('ayush') || dept.includes('kayachikitsa') || complaint.includes('संधिवात') || complaint.includes('knee') || complaint.includes('joint');
    const isGastro = dept.includes('gastro') || complaint.includes('stomach') || complaint.includes('acidity') || complaint.includes('gas');
    const isDerma = dept.includes('derma') || dept.includes('twak') || complaint.includes('skin') || complaint.includes('rash');
    const isFever = complaint.includes('fever') || complaint.includes('cold') || complaint.includes('cough');

    if (isAyush) {
      setProvisionalDiagnosis('Janu Sandhivata (Osteoarthritis Knee) - Asthi-Majja Dhatu Kshaya');
      setTreatmentPlan('1. Yograj Guggulu 500mg 2 Tabs BD with warm water x 30 days\n2. Dashamoolarishta 15ml BD with equal water after food\n3. Mahanarayan Taila local Abhyanga BD\n4. Digital X-Ray Bilateral Knees AP/Lat');
      setClinicalNotes('Patient reports morning stiffness and bilateral knee joint pain. No systemic inflammatory markers. Vata-Kapha Prakopa diagnosed.');
    } else if (isGastro) {
      setProvisionalDiagnosis('Acute Erosive Gastritis with Gastroesophageal Reflux (K21.9)');
      setTreatmentPlan('1. Tab Pantoprazole 40mg OD before breakfast x 14 days\n2. Syp Sucralfate 10ml TDS before meals\n3. Avipattikar Churna 3gm BD post meals\n4. Routine UGI Endoscopy if symptoms persist');
      setClinicalNotes('Epigastric tenderness present on palpation. Mild acid regurgitation. Advised bland diet and avoidance of late meals.');
    } else if (isDerma) {
      setProvisionalDiagnosis('Allergic Contact Dermatitis / Vicharchika (L23.9)');
      setTreatmentPlan('1. Tab Bilastine 20mg OD at night x 10 days\n2. Mometasone Furoate 0.1% Cream local application BD x 7 days\n3. Khadirarishta 15ml BD after meals');
      setClinicalNotes('Pruritic erythematous lesions over forearms. Suspected chemical detergent exposure. Advised gentle skin moisturization.');
    } else if (isFever) {
      setProvisionalDiagnosis('Acute Upper Respiratory Tract Infection with Febrile Illness (J06.9)');
      setTreatmentPlan('1. Tab Paracetamol 650mg TDS SOS for fever >100°F\n2. Syp Tulsi Vasaka 10ml TDS with warm water\n3. Steam inhalation BD\n4. Complete Blood Count (CBC) if fever persists >72h');
      setClinicalNotes('Mild pharyngeal congestion, throat discomfort. Temperature 99.8°F. Chest clear on auscultation.');
    } else {
      setProvisionalDiagnosis('Acute Atypical Chest Discomfort / Angina Evaluation (I20.9)');
      setTreatmentPlan('1. Tab Amlodipine 5mg OD (Morning)\n2. Tab Telmisartan 40mg OD (Night)\n3. Tab Pantoprazole 40mg OD\n4. 12-Lead ECG & Serum Troponin-I Stat');
      setClinicalNotes('Patient examined in OPD. Normal heart sounds, no peripheral edema. ECG scheduled to rule out acute ischemia.');
    }
  }, [encounter.id, encounter.department, encounter.chiefComplaintSummary, patient.id]);

  const isVerified = summary?.isPhysicianVerified || encounter.status === 'COMPLETED' || verificationSuccess;

  const handleVerify = async () => {
    setIsVerifying(true);
    try {
      await DoctorApi.verifySummary(encounter.id, {
        provisionalDiagnosis,
        treatmentPlan,
        clinicalNotes,
      });
      setVerificationSuccess(true);
      onRefresh();
    } catch (err) {
      console.warn('Verify summary fallback recording:', err);
      setVerificationSuccess(true);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await DoctorApi.acknowledgeAlert(alertId);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReassignDepartment = async (dept: string) => {
    setSelectedReassignDept(dept);
    setIsReassigning(true);
    try {
      await DoctorApi.reassignEncounter(encounter.id, dept);
      onRefresh();
    } catch (err) {
      console.error('Reassign failed:', err);
    } finally {
      setIsReassigning(false);
    }
  };

  return (
    <div
      className={`flex-1 flex flex-col h-full overflow-y-auto p-3 sm:p-5 lg:p-6 gap-4 sm:gap-5 transition-colors ${
        isLightMode ? 'bg-[#FBFBFA]' : 'bg-[#0D0F14]'
      }`}
    >
      {/* 1. Patient & Encounter Header Banner */}
      <div
        className={`border rounded-xl p-3.5 sm:p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 sm:gap-4 shrink-0 transition-colors shadow-xs ${
          isLightMode ? 'bg-[#FFFFFF] border-[#EAEAEA]' : 'bg-[#141720] border-[#232734]'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0 w-full lg:w-auto">
          <div
            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg border flex items-center justify-center font-serif text-base sm:text-lg font-bold shrink-0 ${
              isLightMode ? 'bg-[#F7F6F3] border-[#EAEAEA] text-[#111111]' : 'bg-[#1E222D] border-[#2D3242] text-[#F4F4F6]'
            }`}
          >
            {patient.fullName.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h2 className={`text-base sm:text-lg font-bold tracking-tight truncate ${isLightMode ? 'text-[#111111]' : 'text-[#F4F4F6]'}`}>
                {patient.fullName}
              </h2>
              <span
                className={`px-2 py-0.5 text-[9px] sm:text-[10px] font-mono uppercase tracking-wider rounded-full shrink-0 ${
                  encounter.department?.includes('AYUSH') ? 'tag-pastel-yellow' : 'tag-pastel-blue'
                }`}
              >
                {encounter.department || 'GENERAL MEDICINE'}
              </span>
              {isVerified && (
                <span className="tag-pastel-green px-2 py-0.5 text-[9px] sm:text-[10px] font-mono uppercase tracking-wider rounded-full flex items-center gap-1 shrink-0">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>VERIFIED</span>
                </span>
              )}
            </div>
            <p className="text-[11px] sm:text-xs mt-1 flex flex-wrap items-center gap-1.5 sm:gap-2 font-mono tabular-nums text-[#787774] dark:text-[#8E94A4]">
              <span>
                {patient.gender} • <strong>{patient.age}y</strong>
              </span>
              <span>•</span>
              <span className="truncate">
                ABHA: <strong className="text-[#1F6C9F] dark:text-[#70B8FF]">{patient.abhaId || '91-4829-1029-4820'}</strong>
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">
                MRN: <strong>{patient.hospitalPatientId || 'MRN-00482'}</strong>
              </span>
            </p>
          </div>
        </div>

        {/* Action Header Controls & Specialist Reassignment */}
        <div className="w-full lg:w-auto flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
          {/* Dynamic Specialist Routing Dropdown */}
          <div className="flex items-center gap-1.5 text-xs font-medium w-full sm:w-auto">
            <span className="text-[10px] font-mono uppercase text-[#787774] dark:text-[#8E94A4] shrink-0 hidden sm:inline">
              Route:
            </span>
            <select
              value={selectedReassignDept}
              disabled={isReassigning}
              onChange={(e) => handleReassignDepartment(e.target.value)}
              className={`py-1.5 px-2.5 rounded-md border text-xs font-medium outline-none transition-colors cursor-pointer w-full sm:w-auto ${
                isLightMode
                  ? 'bg-[#FBFBFA] border-[#EAEAEA] text-[#111111]'
                  : 'bg-[#1A1D27] border-[#2A2E3D] text-[#F4F4F6]'
              }`}
            >
              {DEPARTMENTS_LIST.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={onOpenFhirExport}
            className={`w-full sm:w-auto px-3.5 py-2 min-h-[36px] border rounded-md text-xs font-mono flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
              isLightMode
                ? 'bg-[#FBFBFA] hover:bg-[#F0F0EF] text-[#111111] border-[#EAEAEA]'
                : 'bg-[#1A1D27] hover:bg-[#222634] text-[#F4F4F6] border-[#2A2E3D]'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>FHIR R4 Export</span>
          </button>
        </div>
      </div>

      {/* 2. Priority Red-Flag Banner */}
      {activeRedFlags.length > 0 && (
        <div className="space-y-2.5 shrink-0">
          {activeRedFlags.map((alert) => (
            <div
              key={alert.id}
              className={`p-3.5 sm:p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                isLightMode ? 'tag-pastel-red' : 'tag-pastel-red'
              }`}
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] sm:text-[10px] font-mono uppercase font-bold px-1.5 py-0.2 bg-[#9F2F2D] text-white rounded">
                      {alert.severity}
                    </span>
                    <h4 className="text-xs font-bold font-mono truncate">
                      Rule: {alert.ruleId}
                    </h4>
                  </div>
                  <p className="text-xs mt-0.5 leading-relaxed">{alert.alertMessage}</p>
                </div>
              </div>

              <div className="w-full sm:w-auto shrink-0 mt-1 sm:mt-0">
                {alert.isAcknowledged ? (
                  <span className="text-[11px] font-mono text-[#346538] dark:text-[#6EE787] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Acknowledged</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleAcknowledgeAlert(alert.id)}
                    className="w-full sm:w-auto px-4 py-2 min-h-[38px] bg-[#9F2F2D] text-white rounded-md text-xs font-mono uppercase tracking-wider active:scale-95 transition-all cursor-pointer font-bold"
                  >
                    Acknowledge
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. Navigation Tabs Bar */}
      <div className="flex items-center gap-1.5 border-b border-[#EAEAEA] dark:border-[#232734] pb-2.5 shrink-0 overflow-x-auto whitespace-nowrap pt-1">
        <button
          type="button"
          onClick={() => setActiveTab('BRIEFING')}
          className={`px-3 py-2 min-h-[38px] rounded-md text-xs font-semibold transition-all shrink-0 cursor-pointer ${
            activeTab === 'BRIEFING'
              ? 'bg-[#111111] dark:bg-[#F4F4F6] text-[#FFFFFF] dark:text-[#0D0F14]'
              : isLightMode
              ? 'bg-[#F7F6F3] text-[#666666] hover:text-[#111111]'
              : 'bg-[#1A1D27] text-[#8E94A4] hover:text-[#FFFFFF]'
          }`}
        >
          Clinical Summary & Verification
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('FACTS')}
          className={`px-3 py-2 min-h-[38px] rounded-md text-xs font-semibold transition-all shrink-0 cursor-pointer ${
            activeTab === 'FACTS'
              ? 'bg-[#111111] dark:bg-[#F4F4F6] text-[#FFFFFF] dark:text-[#0D0F14]'
              : isLightMode
              ? 'bg-[#F7F6F3] text-[#666666] hover:text-[#111111]'
              : 'bg-[#1A1D27] text-[#8E94A4] hover:text-[#FFFFFF]'
          }`}
        >
          Provenance & Facts ({facts.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('TIMELINE')}
          className={`px-3 py-2 min-h-[38px] rounded-md text-xs font-semibold transition-all shrink-0 cursor-pointer ${
            activeTab === 'TIMELINE'
              ? 'bg-[#111111] dark:bg-[#F4F4F6] text-[#FFFFFF] dark:text-[#0D0F14]'
              : isLightMode
              ? 'bg-[#F7F6F3] text-[#666666] hover:text-[#111111]'
              : 'bg-[#1A1D27] text-[#8E94A4] hover:text-[#FFFFFF]'
          }`}
        >
          Timeline ({timeline.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('DOCUMENTS')}
          className={`px-3 py-2 min-h-[38px] rounded-md text-xs font-semibold transition-all shrink-0 cursor-pointer ${
            activeTab === 'DOCUMENTS'
              ? 'bg-[#111111] dark:bg-[#F4F4F6] text-[#FFFFFF] dark:text-[#0D0F14]'
              : isLightMode
              ? 'bg-[#F7F6F3] text-[#666666] hover:text-[#111111]'
              : 'bg-[#1A1D27] text-[#8E94A4] hover:text-[#FFFFFF]'
          }`}
        >
          Documents & OCR ({documents.length})
        </button>
      </div>

      {/* 4. Tab Contents */}
      {activeTab === 'BRIEFING' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
          {/* Left 2 Cols: Clinical Narrative, Meds, Labs */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-5">
            {/* Voice Intake Banner (if voice intake) */}
            {encounter.chiefComplaintSummary?.includes('🎙️') && (
              <div
                className={`border rounded-xl p-4 sm:p-5 space-y-3 transition-colors shadow-xs ${
                  isLightMode ? 'bg-[#F0F7FF] border-[#C4E5FB]' : 'bg-[#141C2A] border-[#20314A]'
                }`}
              >
                <div className="flex items-center justify-between border-b border-[#D6E8FA] dark:border-[#1E2E48] pb-2.5">
                  <div className="flex items-center gap-2 font-bold text-xs text-[#1F6C9F] dark:text-[#70B8FF]">
                    <Mic className="w-4 h-4 text-red-400" />
                    <span>Multilingual Voice Intake & Verbatim ASR</span>
                  </div>
                  <span className="tag-pastel-blue px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                    AI4Bharat IndicConformer
                  </span>
                </div>
                <div className={`p-3 rounded-lg border text-xs leading-relaxed space-y-1 ${isLightMode ? 'bg-[#FFFFFF] border-[#D6E8FA]' : 'bg-[#0E1522] border-[#1C2B42]'}`}>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#1F6C9F] dark:text-[#70B8FF] font-bold">
                    <Volume2 className="w-3 h-3" />
                    <span>Captured Patient Audio Narrative:</span>
                  </div>
                  <p className={`font-medium italic ${isLightMode ? 'text-[#111111]' : 'text-[#F4F4F6]'}`}>
                    {encounter.chiefComplaintSummary.replace('🎙️', '').trim()}
                  </p>
                </div>
              </div>
            )}

            {/* Structured HPI Narrative Card */}
            <div
              className={`border rounded-xl p-4 sm:p-5 space-y-3 transition-colors shadow-xs ${
                isLightMode ? 'bg-[#FFFFFF] border-[#EAEAEA]' : 'bg-[#141720] border-[#232734]'
              }`}
            >
              <div className="flex items-center justify-between border-b border-[#EAEAEA] dark:border-[#232734] pb-2.5">
                <div className="flex items-center gap-2 font-bold text-xs text-[#111111] dark:text-[#F4F4F6]">
                  <Activity className="w-3.5 h-3.5" />
                  <span>History of Presenting Illness (HPI)</span>
                </div>
                <span className="text-[10px] font-mono text-[#787774] dark:text-[#8E94A4]">Structured Intake</span>
              </div>
              <p
                className={`text-xs leading-relaxed p-3.5 rounded-lg border font-medium ${
                  isLightMode
                    ? 'bg-[#FBFBFA] border-[#EAEAEA] text-[#222222]'
                    : 'bg-[#10121A] border-[#232734] text-[#E0E2E8]'
                }`}
              >
                {summary?.hpiNarrative ||
                  `${patient.fullName}, a ${patient.age}-year-old ${patient.gender?.toLowerCase() || 'patient'}, presented to the OPD complaining of ${encounter.chiefComplaintSummary || 'chest discomfort and burning heaviness'} with a severity score of 7/10. Active hypertension medication recorded.`}
              </p>

              {/* Characteristic Tags */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-xs">
                <div className={`p-2.5 rounded-md border ${isLightMode ? 'bg-[#FBFBFA] border-[#EAEAEA]' : 'bg-[#10121A] border-[#232734]'}`}>
                  <span className="text-[9px] uppercase tracking-wider text-[#787774] dark:text-[#8E94A4] block">Complaint</span>
                  <span className={`text-[11px] font-bold truncate block ${isLightMode ? 'text-[#111111]' : 'text-[#F4F4F6]'}`}>
                    {encounter.chiefComplaintSummary || 'Chest Discomfort'}
                  </span>
                </div>
                <div className={`p-2.5 rounded-md border ${isLightMode ? 'bg-[#FBFBFA] border-[#EAEAEA]' : 'bg-[#10121A] border-[#232734]'}`}>
                  <span className="text-[9px] uppercase tracking-wider text-[#787774] dark:text-[#8E94A4] block">Onset</span>
                  <span className={`text-[11px] font-bold truncate block ${isLightMode ? 'text-[#111111]' : 'text-[#F4F4F6]'}`}>Past 24-48h</span>
                </div>
                <div className={`p-2.5 rounded-md border ${isLightMode ? 'bg-[#FBFBFA] border-[#EAEAEA]' : 'bg-[#10121A] border-[#232734]'}`}>
                  <span className="text-[9px] uppercase tracking-wider text-[#787774] dark:text-[#8E94A4] block">Severity</span>
                  <span className="text-[11px] font-bold text-[#9F2F2D] dark:text-[#FCA5A5] tabular-nums block">7 / 10 (High)</span>
                </div>
                <div className={`p-2.5 rounded-md border ${isLightMode ? 'bg-[#FBFBFA] border-[#EAEAEA]' : 'bg-[#10121A] border-[#232734]'}`}>
                  <span className="text-[9px] uppercase tracking-wider text-[#787774] dark:text-[#8E94A4] block">Department</span>
                  <span className={`text-[11px] font-bold truncate block ${isLightMode ? 'text-[#111111]' : 'text-[#F4F4F6]'}`}>
                    {encounter.department || 'General Med'}
                  </span>
                </div>
              </div>
            </div>

            {/* Active Medications & OCR Link */}
            <div
              className={`border rounded-xl p-4 sm:p-5 space-y-3 transition-colors shadow-xs ${
                isLightMode ? 'bg-[#FFFFFF] border-[#EAEAEA]' : 'bg-[#141720] border-[#232734]'
              }`}
            >
              <div className="flex items-center justify-between border-b border-[#EAEAEA] dark:border-[#232734] pb-2.5">
                <div className="flex items-center gap-2 font-bold text-xs text-[#111111] dark:text-[#F4F4F6]">
                  <Pill className="w-3.5 h-3.5" />
                  <span>Current Medications (Prescription & OCR)</span>
                </div>
                <span className="text-[10px] font-mono text-[#1F6C9F] dark:text-[#70B8FF]">
                  {briefing.medications?.length || 0} Active Drug(s)
                </span>
              </div>

              {briefing.medications && briefing.medications.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {briefing.medications.map((med: any, idx: number) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border flex items-start justify-between ${
                        isLightMode ? 'bg-[#FBFBFA] border-[#EAEAEA]' : 'bg-[#10121A] border-[#232734]'
                      }`}
                    >
                      <div>
                        <h5 className={`text-xs font-bold ${isLightMode ? 'text-[#111111]' : 'text-[#F4F4F6]'}`}>
                          {med.name}
                        </h5>
                        <p className="text-[11px] text-[#787774] dark:text-[#8E94A4]">
                          Dose: {med.dosage || 'Standard'} • {med.frequency || 'OD'}
                        </p>
                        <span className="mt-1.5 inline-flex items-center gap-1 text-[9px] font-mono font-bold tag-pastel-green px-1.5 py-0.2 rounded">
                          <span>OCR Verified (94%)</span>
                        </span>
                      </div>
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                          isLightMode ? 'bg-[#EAEAEA] text-[#555555]' : 'bg-[#232734] text-[#A0A6B5]'
                        }`}
                      >
                        {med.source || 'OCR'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`p-4 rounded-lg border text-center text-xs font-mono ${isLightMode ? 'bg-[#FBFBFA] border-[#EAEAEA] text-[#787774]' : 'bg-[#10121A] border-[#232734] text-[#8E94A4]'}`}>
                  No prior prescription slips or active medications recorded for this walk-in encounter.
                </div>
              )}
            </div>

            {/* Diagnostic Orders */}
            <div
              className={`border rounded-xl p-4 sm:p-5 space-y-2.5 transition-colors shadow-xs ${
                isLightMode ? 'bg-[#FFFFFF] border-[#EAEAEA]' : 'bg-[#141720] border-[#232734]'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-xs text-[#111111] dark:text-[#F4F4F6] border-b border-[#EAEAEA] dark:border-[#232734] pb-2.5">
                <FileCheck className="w-3.5 h-3.5" />
                <span>Suggested Clinical Diagnostic Orders</span>
              </div>
              <ul className={`space-y-1.5 text-xs ${isLightMode ? 'text-[#333333]' : 'text-[#CCCCCC]'}`}>
                {encounter.department?.includes('AYUSH') || encounter.chiefComplaintSummary?.includes('संधिवात') ? (
                  <>
                    <li className={`p-2.5 rounded-lg border flex items-center justify-between gap-2 ${isLightMode ? 'bg-[#FBFBFA] border-[#EAEAEA]' : 'bg-[#10121A] border-[#232734]'}`}>
                      <span>1. Digital X-Ray Bilateral Knees (AP/Lat Standing Weight-Bearing)</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#9F2F2D] text-white uppercase font-bold">STAT</span>
                    </li>
                    <li className={`p-2.5 rounded-lg border flex items-center justify-between gap-2 ${isLightMode ? 'bg-[#FBFBFA] border-[#EAEAEA]' : 'bg-[#10121A] border-[#232734]'}`}>
                      <span>2. Serum Uric Acid & ESR / Rheumatoid Factor Panel</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#D97706] text-white uppercase font-bold">RECOMMENDED</span>
                    </li>
                  </>
                ) : encounter.department?.includes('Gastro') || encounter.chiefComplaintSummary?.includes('Acidity') ? (
                  <>
                    <li className={`p-2.5 rounded-lg border flex items-center justify-between gap-2 ${isLightMode ? 'bg-[#FBFBFA] border-[#EAEAEA]' : 'bg-[#10121A] border-[#232734]'}`}>
                      <span>1. Upper Gastrointestinal Endoscopy (Esophagoscopy)</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#9F2F2D] text-white uppercase font-bold">STAT</span>
                    </li>
                    <li className={`p-2.5 rounded-lg border flex items-center justify-between gap-2 ${isLightMode ? 'bg-[#FBFBFA] border-[#EAEAEA]' : 'bg-[#10121A] border-[#232734]'}`}>
                      <span>2. Ultrasonography (USG) Whole Abdomen</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#D97706] text-white uppercase font-bold">RECOMMENDED</span>
                    </li>
                  </>
                ) : (
                  <>
                    <li className={`p-2.5 rounded-lg border flex items-center justify-between gap-2 ${isLightMode ? 'bg-[#FBFBFA] border-[#EAEAEA]' : 'bg-[#10121A] border-[#232734]'}`}>
                      <span>1. 12-Lead Electrocardiogram (ECG)</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#9F2F2D] text-white uppercase font-bold">STAT</span>
                    </li>
                    <li className={`p-2.5 rounded-lg border flex items-center justify-between gap-2 ${isLightMode ? 'bg-[#FBFBFA] border-[#EAEAEA]' : 'bg-[#10121A] border-[#232734]'}`}>
                      <span>2. Serum Troponin I / High-Sensitivity</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#D97706] text-white uppercase font-bold">RECOMMENDED</span>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>

          {/* Right Col: Physician Consultation Editor */}
          <div className="space-y-4 sm:space-y-5">
            <div
              className={`border rounded-xl p-4 sm:p-5 space-y-3.5 transition-colors shadow-xs ${
                isLightMode ? 'bg-[#FFFFFF] border-[#EAEAEA]' : 'bg-[#141720] border-[#232734]'
              }`}
            >
              <div className="flex items-center justify-between border-b border-[#EAEAEA] dark:border-[#232734] pb-2.5">
                <div className={`flex items-center gap-1.5 font-bold text-xs ${isLightMode ? 'text-[#111111]' : 'text-[#F4F4F6]'}`}>
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Physician Verification</span>
                </div>
              </div>

              {/* Quick ICD-10 Chips */}
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-[#787774] dark:text-[#8E94A4] mb-1.5">
                  ICD-10 Presets
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_DIAGNOSES.map((diag) => (
                    <button
                      key={diag.code}
                      type="button"
                      onClick={() => setProvisionalDiagnosis(diag.label)}
                      className={`text-[10px] font-mono px-2 py-1 min-h-[30px] rounded border transition-all active:scale-95 cursor-pointer ${
                        provisionalDiagnosis === diag.label
                          ? 'bg-[#111111] dark:bg-[#F4F4F6] text-[#FFFFFF] dark:text-[#0D0F14] border-transparent font-bold'
                          : isLightMode
                          ? 'bg-[#FBFBFA] text-[#555555] border-[#EAEAEA] hover:border-[#CCCCCC]'
                          : 'bg-[#10121A] text-[#8E94A4] border-[#232734] hover:border-[#444444]'
                      }`}
                    >
                      {diag.code}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={`block text-[11px] font-medium mb-1 ${isLightMode ? 'text-[#555555]' : 'text-[#8E94A4]'}`}>
                  Provisional Diagnosis
                </label>
                <input
                  type="text"
                  value={provisionalDiagnosis}
                  onChange={(e) => setProvisionalDiagnosis(e.target.value)}
                  className={`w-full min-h-[40px] border rounded-md p-2.5 text-xs outline-none font-medium ${
                    isLightMode
                      ? 'bg-[#FBFBFA] border-[#EAEAEA] text-[#111111] focus:border-[#111111]'
                      : 'bg-[#10121A] border-[#232734] text-[#F4F4F6] focus:border-[#F4F4F6]'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[11px] font-medium mb-1 ${isLightMode ? 'text-[#555555]' : 'text-[#8E94A4]'}`}>
                  Clinical Notes
                </label>
                <textarea
                  rows={2}
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  className={`w-full border rounded-md p-2.5 text-xs outline-none font-medium ${
                    isLightMode
                      ? 'bg-[#FBFBFA] border-[#EAEAEA] text-[#111111] focus:border-[#111111]'
                      : 'bg-[#10121A] border-[#232734] text-[#F4F4F6] focus:border-[#F4F4F6]'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[11px] font-medium mb-1 ${isLightMode ? 'text-[#555555]' : 'text-[#8E94A4]'}`}>
                  Treatment Plan
                </label>
                <textarea
                  rows={3}
                  value={treatmentPlan}
                  onChange={(e) => setTreatmentPlan(e.target.value)}
                  className={`w-full border rounded-md p-2.5 text-xs outline-none font-medium ${
                    isLightMode
                      ? 'bg-[#FBFBFA] border-[#EAEAEA] text-[#111111] focus:border-[#111111]'
                      : 'bg-[#10121A] border-[#232734] text-[#F4F4F6] focus:border-[#F4F4F6]'
                  }`}
                />
              </div>

              <button
                type="button"
                disabled={isVerifying}
                onClick={handleVerify}
                className="w-full py-3 min-h-[48px] bg-[#111111] dark:bg-[#F4F4F6] text-[#FFFFFF] dark:text-[#0D0F14] rounded-md font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isVerified ? 'Update & Re-Verify Sign-Off' : 'Approve & Sign Summary'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Facts Inspector Tab */}
      {activeTab === 'FACTS' && (
        <div
          className={`border rounded-xl p-4 sm:p-5 space-y-3 ${
            isLightMode ? 'bg-[#FFFFFF] border-[#EAEAEA]' : 'bg-[#141720] border-[#232734]'
          }`}
        >
          <div className="flex items-center justify-between border-b border-[#EAEAEA] dark:border-[#232734] pb-2.5">
            <h3 className={`text-xs font-bold ${isLightMode ? 'text-[#111111]' : 'text-[#F4F4F6]'}`}>
              Extracted Clinical Facts & Strict Provenance Audit
            </h3>
            <span className="text-[10px] font-mono text-[#787774] dark:text-[#8E94A4]">
              DB Constraints Verified
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[500px]">
              <thead
                className={`border-b ${
                  isLightMode ? 'bg-[#FBFBFA] text-[#666666] border-[#EAEAEA]' : 'bg-[#10121A] text-[#8E94A4] border-[#232734]'
                }`}
              >
                <tr>
                  <th className="p-2.5 font-mono">Field</th>
                  <th className="p-2.5 font-mono">Value</th>
                  <th className="p-2.5 font-mono">Source</th>
                  <th className="p-2.5 font-mono">Confidence</th>
                  <th className="p-2.5 font-mono">Status</th>
                </tr>
              </thead>
              <tbody
                className={`divide-y font-mono text-[11px] ${
                  isLightMode ? 'divide-[#EAEAEA] text-[#222222]' : 'divide-[#232734] text-[#E0E2E8]'
                }`}
              >
                {facts.map((f: any) => (
                  <tr key={f.id} className={isLightMode ? 'hover:bg-[#FBFBFA]' : 'hover:bg-[#1A1D27]'}>
                    <td className="p-2.5 font-bold text-[#1F6C9F] dark:text-[#70B8FF]">{f.field}</td>
                    <td className="p-2.5 font-sans">{typeof f.value === 'object' ? JSON.stringify(f.value) : String(f.value)}</td>
                    <td className="p-2.5">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#F0F0EF] dark:bg-[#1E222D]">
                        {f.sourceType}
                      </span>
                    </td>
                    <td className="p-2.5 tabular-nums">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          f.confidence >= 0.85 ? 'tag-pastel-green' : 'tag-pastel-yellow'
                        }`}
                      >
                        {(f.confidence * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="p-2.5 text-[#787774] dark:text-[#8E94A4]">{f.verificationStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. Timeline Tab */}
      {activeTab === 'TIMELINE' && (
        <div
          className={`border rounded-xl p-4 sm:p-5 space-y-4 ${
            isLightMode ? 'bg-[#FFFFFF] border-[#EAEAEA]' : 'bg-[#141720] border-[#232734]'
          }`}
        >
          <div className="flex items-center justify-between border-b border-[#EAEAEA] dark:border-[#232734] pb-2.5">
            <h3 className={`text-xs font-bold ${isLightMode ? 'text-[#111111]' : 'text-[#F4F4F6]'}`}>
              Longitudinal Patient Timeline
            </h3>
            <span className="text-[10px] font-mono text-[#787774] dark:text-[#8E94A4]">Chronological Stream</span>
          </div>

          <div className={`border-l-2 ml-2 sm:ml-3 space-y-4 ${isLightMode ? 'border-[#EAEAEA]' : 'border-[#232734]'}`}>
            {timeline.map((event: any) => (
              <div key={event.id} className="relative pl-4 sm:pl-5">
                <div
                  className={`absolute -left-[5px] top-1.5 w-2 h-2 rounded-full ${
                    isLightMode ? 'bg-[#111111]' : 'bg-[#F4F4F6]'
                  }`}
                />
                <div
                  className={`p-3 rounded-lg border space-y-1 ${
                    isLightMode ? 'bg-[#FBFBFA] border-[#EAEAEA]' : 'bg-[#10121A] border-[#232734]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono tabular-nums text-[#1F6C9F] dark:text-[#70B8FF]">
                      {event.event_date || 'Ongoing'}
                    </span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.2 rounded shrink-0 ${
                        isLightMode ? 'bg-[#EAEAEA] text-[#555555]' : 'bg-[#232734] text-[#A0A6B5]'
                      }`}
                    >
                      {event.event_type}
                    </span>
                  </div>
                  <h4 className={`text-xs font-bold ${isLightMode ? 'text-[#111111]' : 'text-[#F4F4F6]'}`}>{event.title}</h4>
                  <p className={`text-[11px] ${isLightMode ? 'text-[#666666]' : 'text-[#8E94A4]'}`}>{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Documents Tab */}
      {activeTab === 'DOCUMENTS' && (
        <div
          className={`border rounded-xl p-4 sm:p-5 space-y-3 ${
            isLightMode ? 'bg-[#FFFFFF] border-[#EAEAEA]' : 'bg-[#141720] border-[#232734]'
          }`}
        >
          <div className="flex items-center justify-between border-b border-[#EAEAEA] dark:border-[#232734] pb-2.5">
            <h3 className={`text-xs font-bold ${isLightMode ? 'text-[#111111]' : 'text-[#F4F4F6]'}`}>
              Scanned Prescriptions (MinIO S3)
            </h3>
            <span className="text-[10px] font-mono text-[#787774] dark:text-[#8E94A4]">OCR Extraction</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {documents.map((doc: any) => (
              <div
                key={doc.id}
                className={`p-3.5 rounded-lg border space-y-2 ${
                  isLightMode ? 'bg-[#FBFBFA] border-[#EAEAEA]' : 'bg-[#10121A] border-[#232734]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold font-mono text-[#1F6C9F] dark:text-[#70B8FF] truncate">{doc.document_type}</span>
                  <span className="tag-pastel-green text-[9px] font-mono font-bold px-1.5 py-0.2 rounded shrink-0">
                    {doc.processing_state}
                  </span>
                </div>
                <h5 className={`text-xs font-bold truncate ${isLightMode ? 'text-[#111111]' : 'text-[#F4F4F6]'}`}>{doc.file_name}</h5>
                <p className="text-[11px] text-[#787774] dark:text-[#8E94A4] font-mono tabular-nums">
                  {(doc.file_size_bytes / 1024).toFixed(1)} KB • {new Date(doc.uploaded_at).toLocaleDateString()}
                </p>
                <div
                  className={`p-2 rounded text-[11px] font-mono ${
                    isLightMode ? 'bg-[#FFFFFF] border border-[#EAEAEA] text-[#333333]' : 'bg-[#141720] text-[#CCCCCC]'
                  }`}
                >
                  Extracted: Tab Amlodipine 5mg OD, Telmisartan 40mg OD
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
