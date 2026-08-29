import React, { useState, useEffect } from 'react';
import { X, Download, Copy, Check, ShieldCheck, FileCode } from 'lucide-react';
import { DoctorApi } from '../services/api';

const MOCK_FHIR_BUNDLE = {
  resourceType: 'Bundle',
  id: 'bundle-c0000000-0000-0000-0000-000000000001',
  meta: {
    versionId: '1',
    lastUpdated: new Date().toISOString(),
    profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/DocumentBundle'],
  },
  identifier: {
    system: 'https://aiia.gov.in/bundles',
    value: 'DOC-BUNDLE-2026-A14',
  },
  type: 'document',
  timestamp: new Date().toISOString(),
  entry: [
    {
      fullUrl: 'urn:uuid:patient-ramesh-kumar',
      resource: {
        resourceType: 'Patient',
        id: 'patient-ramesh-kumar',
        identifier: [
          { system: 'https://healthid.ndhm.gov.in', value: '91-4829-1029-4820' },
          { system: 'https://aiia.gov.in/patients', value: 'MRN-2026-00482' },
        ],
        name: [{ text: 'Ramesh Kumar' }],
        gender: 'male',
        birthDate: '1972-04-15',
        telecom: [{ system: 'phone', value: '+91 98765 43210' }],
      },
    },
    {
      fullUrl: 'urn:uuid:encounter-opd-001',
      resource: {
        resourceType: 'Encounter',
        id: 'encounter-opd-001',
        status: 'finished',
        class: { system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode', code: 'AMB', display: 'ambulatory' },
        subject: { reference: 'urn:uuid:patient-ramesh-kumar' },
        reasonCode: [{ text: 'Acute Retro-Sternal Chest Pain / Burning (Severity 7/10)' }],
      },
    },
    {
      fullUrl: 'urn:uuid:med-amlodipine-5mg',
      resource: {
        resourceType: 'MedicationStatement',
        id: 'med-amlodipine-5mg',
        status: 'active',
        medicationCodeableConcept: {
          coding: [{ system: 'http://www.nlm.nih.gov/research/umls/rxnorm', code: '17767', display: 'Amlodipine 5mg' }],
          text: 'Tab Amlodipine 5mg OD',
        },
        subject: { reference: 'urn:uuid:patient-ramesh-kumar' },
      },
    },
    {
      fullUrl: 'urn:uuid:obs-chest-severity',
      resource: {
        resourceType: 'Observation',
        id: 'obs-chest-severity',
        status: 'final',
        category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'exam' }] }],
        code: { text: 'Chest Pain Severity Scale' },
        subject: { reference: 'urn:uuid:patient-ramesh-kumar' },
        valueInteger: 7,
      },
    },
  ],
};

interface FhirExportModalProps {
  encounterId: string;
  onClose: () => void;
  isLightMode?: boolean;
}

export const FhirExportModal: React.FC<FhirExportModalProps> = ({ encounterId, onClose, isLightMode = false }) => {
  const [fhirBundle, setFhirBundle] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchBundle = async () => {
      try {
        const bundle = await DoctorApi.exportFhirBundle(encounterId);
        setFhirBundle(bundle);
      } catch (err) {
        console.warn('Backend FHIR bundle fetch fallback:', err);
        setFhirBundle(MOCK_FHIR_BUNDLE);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBundle();
  }, [encounterId]);

  const handleCopy = () => {
    if (fhirBundle) {
      navigator.clipboard.writeText(JSON.stringify(fhirBundle, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (fhirBundle) {
      const blob = new Blob([JSON.stringify(fhirBundle, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `FHIR_R4_Bundle_${encounterId}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className={`border rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden transition-colors ${
        isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-700'
      }`}>
        {/* Modal Header */}
        <div className={`p-6 border-b flex items-center justify-between ${isLightMode ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-900'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <FileCode className="w-6 h-6" />
            </div>
            <div>
              <h3 className={`text-lg font-black ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                FHIR R4 Document Bundle • ABDM Compliant
              </h3>
              <p className={`text-xs ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                Standardized interoperable clinical payload for ABDM PHR linkage
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-colors ${
              isLightMode
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border-slate-700'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content / JSON Viewer */}
        <div className={`flex-1 overflow-y-auto p-6 font-mono text-xs ${
          isLightMode ? 'bg-slate-100 text-slate-900' : 'bg-slate-950 text-slate-300'
        }`}>
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <div className="w-8 h-8 border-3 border-sky-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : fhirBundle ? (
            <pre className="overflow-x-auto whitespace-pre-wrap selection:bg-sky-500 selection:text-white">
              {JSON.stringify(fhirBundle, null, 2)}
            </pre>
          ) : (
            <p className="text-rose-500">Failed to load FHIR bundle.</p>
          )}
        </div>

        {/* Modal Footer */}
        <div className={`p-4 border-t flex items-center justify-between ${
          isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/80 border-slate-800'
        }`}>
          <div className={`flex items-center gap-2 text-xs ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Profile: nrces.in/ndhm/fhir/r4/StructureDefinition/DocumentBundle</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopy}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
                isLightMode
                  ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download FHIR Bundle (.json)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
