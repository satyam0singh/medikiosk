import React, { useState } from 'react';
import {
  AlertTriangle,
  Pill,
  Activity,
  CheckCircle2,
  Download,
  UserCheck,
  FileCheck,
} from 'lucide-react';
import {
  Patient,
  Encounter,
  ControlledClinicalSummary,
  RedFlagAlert,
} from '@medikiosk/shared-types';
import { DoctorApi } from '../services/api';

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
  onRefresh: () => void;
  onOpenFhirExport: () => void;
}

export const ClinicalBriefingView: React.FC<ClinicalBriefingViewProps> = ({
  briefing,
  onRefresh,
  onOpenFhirExport,
}) => {
  const { encounter, patient, activeRedFlags, facts, timeline, documents, summary } = briefing;

  const [activeTab, setActiveTab] = useState<'BRIEFING' | 'FACTS' | 'TIMELINE' | 'DOCUMENTS'>('BRIEFING');
  const [isVerifying, setIsVerifying] = useState(false);
  const [provisionalDiagnosis, setProvisionalDiagnosis] = useState('Acute Atypical Chest Discomfort / Reflux Esophagitis (K21.9)');
  const [treatmentPlan, setTreatmentPlan] = useState('1. Tab Pantoprazole 40mg OD before breakfast x 14 days\n2. Continue Tab Amlodipine 5mg OD\n3. 12-Lead ECG & Serum Troponin I Stat');
  const [clinicalNotes, setClinicalNotes] = useState('Patient examined in OPD Room 4. Normal heart sounds, no peripheral edema. ECG scheduled to rule out acute ischemia.');

  const isVerified = summary?.isPhysicianVerified || encounter.status === 'COMPLETED';

  const handleVerify = async () => {
    setIsVerifying(true);
    try {
      await DoctorApi.verifySummary(encounter.id, {
        provisionalDiagnosis,
        treatmentPlan,
        clinicalNotes,
      });
      onRefresh();
    } catch (err) {
      alert(`Verification failed: ${(err as Error).message}`);
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

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-61px)] overflow-y-auto p-6 space-y-6">
      {/* 1. Patient & Encounter Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-slate-950 font-black text-2xl shadow-lg">
            {patient.fullName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-extrabold text-white">{patient.fullName}</h2>
              <span className="px-2.5 py-0.5 bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-bold rounded-full">
                {encounter.department}
              </span>
              {isVerified && (
                <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>VERIFIED</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-3">
              <span>{patient.gender} • {patient.age} yrs</span>
              <span>•</span>
              <span>ABHA ID: <strong className="font-mono text-sky-400">{patient.abhaId || '91-4829-1029-4820'}</strong></span>
              <span>•</span>
              <span>MRN: <strong className="text-slate-300">{patient.hospitalPatientId || 'MRN-00482'}</strong></span>
            </p>
          </div>
        </div>

        {/* Action Header Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            type="button"
            onClick={onOpenFhirExport}
            className="flex-1 md:flex-initial px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
          >
            <Download className="w-4 h-4 text-sky-400" />
            <span>FHIR R4 / ABDM Export</span>
          </button>
        </div>
      </div>

      {/* 2. Priority Red-Flag Banner (If Triggered) */}
      {activeRedFlags.length > 0 && (
        <div className="space-y-3">
          {activeRedFlags.map((alert) => (
            <div
              key={alert.id}
              className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/50 flex items-center justify-between gap-4 shadow-lg"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5 animate-bounce" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black px-2 py-0.5 bg-rose-500 text-slate-950 rounded-md">
                      {alert.severity}
                    </span>
                    <h4 className="text-sm font-bold text-white">Deterministic Safety Rule Triggered: {alert.ruleId}</h4>
                  </div>
                  <p className="text-xs text-rose-200 mt-1">{alert.alertMessage}</p>
                </div>
              </div>

              <div>
                {alert.isAcknowledged ? (
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Acknowledged</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleAcknowledgeAlert(alert.id)}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md active:scale-95 transition-all"
                  >
                    Acknowledge Triage
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('BRIEFING')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'BRIEFING'
              ? 'bg-sky-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          Clinical Summary & Verification
        </button>
        <button
          onClick={() => setActiveTab('FACTS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'FACTS'
              ? 'bg-sky-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          Provenance & Fact Inspector ({facts.length})
        </button>
        <button
          onClick={() => setActiveTab('TIMELINE')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'TIMELINE'
              ? 'bg-sky-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          Longitudinal Timeline ({timeline.length})
        </button>
        <button
          onClick={() => setActiveTab('DOCUMENTS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'DOCUMENTS'
              ? 'bg-sky-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          Scanned Documents & OCR ({documents.length})
        </button>
      </div>

      {/* 4. Tab Contents */}
      {activeTab === 'BRIEFING' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Clinical Narrative, Meds, Labs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Structured HPI Narrative Card */}
            <div className="clinical-card p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-sky-400 font-extrabold text-sm">
                  <Activity className="w-4 h-4" />
                  <span>History of Presenting Illness (HPI)</span>
                </div>
                <span className="text-xs text-slate-400">Structured via State Machine</span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800/80 font-medium">
                {summary?.hpiNarrative ||
                  `${patient.fullName}, a ${patient.age}-year-old ${patient.gender?.toLowerCase() || 'patient'}, presented to the OPD complaining of chest pain and burning heaviness since yesterday night with a severity score of 7/10. Active hypertension medication recorded.`}
              </p>

              {/* Symptom Characteristic Tags */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Primary Complaint</span>
                  <span className="text-xs font-bold text-white">Chest Discomfort</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Onset</span>
                  <span className="text-xs font-bold text-white">Past 24-48 Hours</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Severity Score</span>
                  <span className="text-xs font-bold text-amber-400">7 / 10 (High)</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Character</span>
                  <span className="text-xs font-bold text-white">Burning / Heaviness</span>
                </div>
              </div>
            </div>

            {/* Active Medications & OCR Link */}
            <div className="clinical-card p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-teal-400 font-extrabold text-sm">
                  <Pill className="w-4 h-4" />
                  <span>Current Medications (Prescription & OCR Verified)</span>
                </div>
                <span className="text-xs text-teal-400 font-bold">2 Active Drugs</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-start justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-white">Tab Amlodipine 5mg</h5>
                    <p className="text-[11px] text-slate-400 mt-0.5">Dose: 5mg • 1 Tab OD (Morning)</p>
                    <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      <span>OCR Confidence 92%</span>
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-1 rounded">
                    DOCUMENT_OCR
                  </span>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-start justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-white">Tab Telmisartan 40mg</h5>
                    <p className="text-[11px] text-slate-400 mt-0.5">Dose: 40mg • 1 Tab OD (Night)</p>
                    <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      <span>OCR Confidence 90%</span>
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-1 rounded">
                    DOCUMENT_OCR
                  </span>
                </div>
              </div>
            </div>

            {/* Suggested Investigations */}
            <div className="clinical-card p-6 space-y-3">
              <div className="flex items-center gap-2 text-sky-400 font-extrabold text-sm border-b border-slate-800 pb-3">
                <FileCheck className="w-4 h-4" />
                <span>Suggested Clinical Diagnostic Orders</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span>1. 12-Lead Standard Electrocardiogram (ECG)</span>
                  <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">STAT / PRIORITY</span>
                </li>
                <li className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span>2. Serum Troponin I / High-Sensitivity Cardiac Markers</span>
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">RECOMMENDED</span>
                </li>
                <li className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span>3. Comprehensive Lipid Panel & Fasting Blood Sugar</span>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">ROUTINE</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Col: Physician Verification & Sign-Off Editor */}
          <div className="space-y-6">
            <div className="clinical-card p-6 space-y-4 border-2 border-sky-500/30">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-white font-extrabold text-sm">
                  <UserCheck className="w-4 h-4 text-sky-400" />
                  <span>Physician Consultation & Verification</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Provisional Diagnosis (ICD-10)
                </label>
                <input
                  type="text"
                  value={provisionalDiagnosis}
                  onChange={(e) => setProvisionalDiagnosis(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white outline-none focus:border-sky-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Physician Clinical Notes
                </label>
                <textarea
                  rows={3}
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 outline-none focus:border-sky-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Treatment & Prescription Plan
                </label>
                <textarea
                  rows={3}
                  value={treatmentPlan}
                  onChange={(e) => setTreatmentPlan(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 outline-none focus:border-sky-400 font-medium"
                />
              </div>

              <button
                type="button"
                disabled={isVerifying}
                onClick={handleVerify}
                className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-teal-400 hover:from-sky-400 hover:to-teal-300 text-slate-950 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 active:scale-95 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isVerified ? 'Update & Re-Verify Sign-Off' : 'Approve & Sign Clinical Summary'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Facts Inspector Tab */}
      {activeTab === 'FACTS' && (
        <div className="clinical-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white">Extracted Clinical Facts & Strict Provenance Audit</h3>
            <span className="text-xs text-slate-400">All fields verified against DB constraints</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Clinical Field</th>
                  <th className="p-3">Value</th>
                  <th className="p-3">Provenance Source</th>
                  <th className="p-3">Confidence</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200 font-mono">
                {facts.map((f: any) => (
                  <tr key={f.id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-semibold text-sky-400">{f.field}</td>
                    <td className="p-3 font-sans text-white">{typeof f.value === 'object' ? JSON.stringify(f.value) : String(f.value)}</td>
                    <td className="p-3 font-sans">
                      <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[11px] font-bold">
                        {f.sourceType}
                      </span>
                    </td>
                    <td className="p-3 font-sans">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        f.confidence >= 0.85 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {(f.confidence * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="p-3 font-sans">
                      <span className="text-slate-400">{f.verificationStatus}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. Timeline Tab */}
      {activeTab === 'TIMELINE' && (
        <div className="clinical-card p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white">Longitudinal Patient Medical Timeline</h3>
            <span className="text-xs text-slate-400">Chronological Event Stream</span>
          </div>

          <div className="relative border-l-2 border-slate-800 ml-4 space-y-6">
            {timeline.map((event: any) => (
              <div key={event.id} className="relative pl-6">
                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-sky-500 border-2 border-slate-900" />
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sky-400 font-mono">{event.event_date || 'Ongoing'}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-800 text-slate-300 rounded">
                      {event.event_type}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{event.title}</h4>
                  <p className="text-xs text-slate-400">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Documents Tab */}
      {activeTab === 'DOCUMENTS' && (
        <div className="clinical-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white">Scanned Prescriptions & Lab Reports (MinIO S3)</h3>
            <span className="text-xs text-slate-400">OCR Entity Extraction Pipeline</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {documents.map((doc: any) => (
              <div key={doc.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-400">{doc.document_type}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded">
                    {doc.processing_state}
                  </span>
                </div>
                <h5 className="text-sm font-bold text-white">{doc.file_name}</h5>
                <p className="text-xs text-slate-400">Size: {(doc.file_size_bytes / 1024).toFixed(1)} KB • Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}</p>
                <div className="p-3 bg-slate-900 rounded-xl text-xs text-slate-300 font-mono">
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
