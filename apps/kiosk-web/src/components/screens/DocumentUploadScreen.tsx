import React, { useState } from 'react';
import { FileText, Upload, Sparkles, ArrowRight, FileCheck } from 'lucide-react';
import { LanguageCode } from '@medikiosk/shared-types';
import { AudioPromptButton } from '../AudioPromptButton';
import { getTranslation } from '../../utils/translations';

interface DocumentUploadScreenProps {
  language: LanguageCode;
  onProceedToSummary: (documents: any[]) => void;
}

export const DocumentUploadScreen: React.FC<DocumentUploadScreenProps> = ({
  language,
  onProceedToSummary,
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; type: string; confidence: number }>>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const t = getTranslation(language);

  const handleSimulateSyntheticPrescription = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setUploadedFiles([
        {
          name: 'AIIA_OPD_Prescription_DrSharma_Nov2025.jpg',
          type: 'PRESCRIPTION',
          confidence: 0.92,
        },
      ]);
      setIsProcessing(false);
    }, 1000);
  };

  return (
    <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full py-2 px-1 sm:px-4 justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3 border-b border-[#EAEAEA] dark:border-[#232734] pb-3 shrink-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111111] dark:text-[#F4F4F6] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#1F6C9F] dark:text-[#70B8FF]" />
            <span>{t.records_title}</span>
          </h2>
          <p className="text-xs text-[#787774] dark:text-[#8E94A4] mt-0.5">
            {t.records_subtitle}
          </p>
        </div>
        <AudioPromptButton text={t.audio_records} language={language} size="md" />
      </div>

      {/* 1-Tap Demo Prescription Loader */}
      <div className="p-3 sm:p-3.5 rounded-xl border border-[#EAEAEA] dark:border-[#232734] bg-[#F7F6F3] dark:bg-[#141720] flex flex-col sm:flex-row items-center justify-between gap-3 mb-3 shrink-0">
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Sparkles className="w-4 h-4 text-[#1F6C9F] dark:text-[#70B8FF] shrink-0" />
          <p className="text-xs text-[#111111] dark:text-[#F4F4F6] font-medium">
            {t.upload_prescription} (Dr. Sharma - Amlodipine 5mg / Omeprazole):
          </p>
        </div>
        <button
          type="button"
          onClick={handleSimulateSyntheticPrescription}
          className="w-full sm:w-auto px-3 py-2 min-h-[38px] bg-[#111111] dark:bg-[#F4F4F6] text-[#FFFFFF] dark:text-[#0D0F14] rounded-md text-xs font-semibold uppercase tracking-wider shrink-0 active:scale-95 transition-all cursor-pointer"
        >
          + {t.upload_prescription}
        </button>
      </div>

      {/* Upload Dropzone */}
      <div className="border border-dashed border-[#CCCCCC] dark:border-[#333333] hover:border-[#111111] dark:hover:border-[#F4F4F6] bg-[#FFFFFF] dark:bg-[#141720] rounded-xl p-5 sm:p-7 text-center mb-4 flex flex-col items-center justify-center transition-colors shadow-xs">
        <div className="w-11 h-11 rounded-lg bg-[#F7F6F3] dark:bg-[#1E222D] border border-[#EAEAEA] dark:border-[#2D3242] text-[#111111] dark:text-[#F4F4F6] flex items-center justify-center mb-2.5">
          <Upload className="w-5 h-5 stroke-[2]" />
        </div>
        <h4 className="text-sm font-bold text-[#111111] dark:text-[#F4F4F6] mb-0.5">
          {t.records_title}
        </h4>
        <p className="text-[11px] text-[#787774] dark:text-[#8E94A4] max-w-sm mb-3">
          Supports JPG, PNG, PDF ({t.upload_prescription}, {t.upload_discharge}, {t.upload_lab})
        </p>

        {isProcessing && (
          <div className="flex items-center gap-2 text-[#1F6C9F] dark:text-[#70B8FF] text-xs font-mono animate-pulse">
            <div className="w-3.5 h-3.5 border-2 border-[#1F6C9F] dark:border-[#70B8FF] border-t-transparent rounded-full animate-spin" />
            <span>{t.extracting}</span>
          </div>
        )}

        {/* Uploaded items */}
        {uploadedFiles.length > 0 && (
          <div className="w-full mt-2 space-y-2">
            {uploadedFiles.map((doc, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg border border-[#EAEAEA] dark:border-[#232734] bg-[#FBFBFA] dark:bg-[#10121A] flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <FileCheck className="w-5 h-5 text-[#346538] dark:text-[#6EE787] shrink-0" />
                  <div className="min-w-0">
                    <h5 className="font-bold text-xs text-[#111111] dark:text-[#F4F4F6] truncate">{doc.name}</h5>
                    <p className="text-[11px] text-[#787774] dark:text-[#8E94A4] font-mono tabular-nums truncate">
                      {doc.type} • Confidence: <span className="text-[#346538] dark:text-[#6EE787] font-bold">{(doc.confidence * 100).toFixed(0)}%</span>
                    </p>
                  </div>
                </div>
                <span className="tag-pastel-green px-2 py-0.5 text-[10px] font-mono font-bold rounded shrink-0">
                  OCR Verified
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Navigation with Comfortable Touch Targets (>=48px) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-auto shrink-0">
        <button
          type="button"
          onClick={() => onProceedToSummary(uploadedFiles)}
          className="py-3 px-4 min-h-[48px] rounded-lg border border-[#EAEAEA] dark:border-[#232734] bg-[#FFFFFF] dark:bg-[#141720] text-[#666666] dark:text-[#8E94A4] font-medium text-xs hover:bg-[#F7F6F3] dark:hover:bg-[#1A1D27] transition-all cursor-pointer"
        >
          <span>{t.skip_records}</span>
        </button>

        <button
          type="button"
          onClick={() => onProceedToSummary(uploadedFiles)}
          className="py-3 px-4 min-h-[48px] rounded-lg bg-[#111111] dark:bg-[#F4F4F6] text-[#FFFFFF] dark:text-[#0D0F14] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer shadow-xs"
        >
          <span>{t.proceed_summary}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

