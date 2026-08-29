import React, { useState, useEffect } from 'react';
import { X, Download, Copy, Check, ShieldCheck, FileCode } from 'lucide-react';
import { DoctorApi } from '../services/api';

interface FhirExportModalProps {
  encounterId: string;
  onClose: () => void;
}

export const FhirExportModal: React.FC<FhirExportModalProps> = ({ encounterId, onClose }) => {
  const [fhirBundle, setFhirBundle] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchBundle = async () => {
      try {
        const bundle = await DoctorApi.exportFhirBundle(encounterId);
        setFhirBundle(bundle);
      } catch (err) {
        console.error('FHIR export error:', err);
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
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <FileCode className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">FHIR R4 Document Bundle • ABDM Compliant</h3>
              <p className="text-xs text-slate-400">Standardized interoperable clinical payload for ABDM PHR linkage</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content / JSON Viewer */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950 font-mono text-xs text-slate-300">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <div className="w-8 h-8 border-3 border-sky-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : fhirBundle ? (
            <pre className="overflow-x-auto whitespace-pre-wrap selection:bg-sky-500 selection:text-slate-950">
              {JSON.stringify(fhirBundle, null, 2)}
            </pre>
          ) : (
            <p className="text-rose-400">Failed to load FHIR bundle.</p>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Profile: https://nrces.in/ndhm/fhir/r4/StructureDefinition/DocumentBundle</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
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
