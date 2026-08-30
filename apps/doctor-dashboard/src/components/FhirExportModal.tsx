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
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className={`border rounded-xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-xl overflow-hidden transition-colors ${
          isLightMode ? 'bg-[#FFFFFF] border-[#EAEAEA]' : 'bg-[#141720] border-[#232734]'
        }`}
      >
        {/* Modal Header */}
        <div
          className={`p-4 border-b flex items-center justify-between ${
            isLightMode ? 'border-[#EAEAEA] bg-[#FBFBFA]' : 'border-[#232734] bg-[#10121A]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-md border flex items-center justify-center ${
                isLightMode ? 'bg-[#FFFFFF] border-[#EAEAEA] text-[#111111]' : 'bg-[#1E222D] border-[#2D3242] text-[#F4F4F6]'
              }`}
            >
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className={`text-sm font-bold ${isLightMode ? 'text-[#111111]' : 'text-[#F4F4F6]'}`}>
                FHIR R4 Document Bundle • ABDM
              </h3>
              <p className={`text-[11px] font-mono ${isLightMode ? 'text-[#787774]' : 'text-[#8E94A4]'}`}>
                StructureDefinition/DocumentBundle
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`w-7 h-7 rounded-md border flex items-center justify-center transition-colors ${
              isLightMode
                ? 'bg-[#FFFFFF] hover:bg-[#F0F0EF] text-[#666666] border-[#EAEAEA]'
                : 'bg-[#1E222D] hover:bg-[#282D3D] text-[#8E94A4] border-[#2D3242]'
            }`}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Modal Content / JSON Viewer */}
        <div
          className={`flex-1 overflow-y-auto p-5 font-mono text-xs ${
            isLightMode ? 'bg-[#FBFBFA] text-[#222222]' : 'bg-[#0D0F14] text-[#D4D8E2]'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <div className="w-6 h-6 border-2 border-[#111111] dark:border-[#F4F4F6] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : fhirBundle ? (
            <pre className="overflow-x-auto whitespace-pre-wrap selection:bg-[#111111] selection:text-white">
              {JSON.stringify(fhirBundle, null, 2)}
            </pre>
          ) : (
            <p className="text-[#9F2F2D]">Failed to load FHIR bundle.</p>
          )}
        </div>

        {/* Modal Footer */}
        <div
          className={`p-3 border-t flex items-center justify-between ${
            isLightMode ? 'bg-[#FBFBFA] border-[#EAEAEA]' : 'bg-[#10121A] border-[#232734]'
          }`}
        >
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#787774] dark:text-[#8E94A4]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#346538] dark:text-[#6EE787]" />
            <span>Profile: nrces.in/ndhm/fhir/r4/DocumentBundle</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition-all border ${
                isLightMode
                  ? 'bg-[#FFFFFF] hover:bg-[#F0F0EF] text-[#111111] border-[#EAEAEA]'
                  : 'bg-[#1E222D] hover:bg-[#282D3D] text-[#F4F4F6] border-[#2D3242]'
              }`}
            >
              {copied ? <Check className="w-3 h-3 text-[#346538] dark:text-[#6EE787]" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="px-3.5 py-1.5 bg-[#111111] dark:bg-[#F4F4F6] text-[#FFFFFF] dark:text-[#0D0F14] rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-1 active:scale-95 transition-all"
            >
              <Download className="w-3 h-3" />
              <span>Download (.json)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
