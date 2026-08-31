import React, { useState, useRef } from 'react';
import {
  FileText,
  Upload,
  Sparkles,
  ArrowRight,
  FileCheck,
  Trash2,
  AlertTriangle,
  Cpu,
  CheckCircle2,
  FileX2,
  ArrowLeft,
} from 'lucide-react';
import { LanguageCode } from '@medikiosk/shared-types';
import { AudioPromptButton } from '../AudioPromptButton';
import { getTranslation } from '../../utils/translations';
import {
  extractTextFromPdf,
  judgeClinicalDocumentWithGroq,
  ClinicalJudgeResult,
} from '../../utils/groqOcrJudge';

export interface UploadedDocument {
  id: string;
  name: string;
  type: string;
  confidence: number;
  extractedDrugs: string[];
  extractedDiagnoses: string[];
  extractedLabValues: string[];
  size: string;
  isMedicalDocument: boolean;
  message?: string;
  clinicalSummary?: string;
  doctorName?: string;
  hospital?: string;
}

interface DocumentUploadScreenProps {
  language: LanguageCode;
  onProceedToSummary: (documents: UploadedDocument[]) => void;
  onBack?: () => void;
}

const SAMPLE_DEMO_PRESETS = [
  {
    name: '01_AIIA_OPD_Prescription_Cardiology.pdf',
    text: 'ALL INDIA INSTITUTE OF AYURVEDA. Department of Cardiology. Dr. Priya Nair MBBS MD DM. Patient: Ramesh Kumar. Diagnosis: Essential Hypertension & Atypical Angina. Rx: Tab Amlodipine 5mg OD morning, Tab Telmisartan 40mg OD night, Tab Pantoprazole 40mg before breakfast, Tab Sorbitrate 5mg SOS. 12-Lead ECG Stat.',
    size: '5.2 KB',
  },
  {
    name: '02_Ayurveda_Kayachikitsa_Prescription_Sandhivata.pdf',
    text: 'ALL INDIA INSTITUTE OF AYURVEDA. Dept of Kayachikitsa & Panchakarma. Dr. Anand Vaidya BAMS MD PhD. Patient: Sunita Devi. Diagnosis: Janu Sandhivata (Osteoarthritis knee). Rx: Yograj Guggulu 500mg 2 Tabs BD, Dashamoolarishta 15ml BD with water, Shallaki 500mg BD, Mahanarayan Taila Abhyanga, Janu Basti 7 sessions.',
    size: '5.3 KB',
  },
  {
    name: '03_Blood_Investigation_Biochemistry_Report.pdf',
    text: 'ALL INDIA INSTITUTE OF AYURVEDA Central Clinical Pathology Lab. Dr. Renu Saxena MD. Patient: Satyam Singh. Test Results: Fasting Blood Sugar (FBS) 94 mg/dL (Normal: 70-99), HbA1c 5.4% (Normal), Serum Uric Acid 5.8 mg/dL, ESR 18 mm/hr, CRP 2.4 mg/L, Serum Creatinine 0.92 mg/dL.',
    size: '5.1 KB',
  },
];

export const DocumentUploadScreen: React.FC<DocumentUploadScreenProps> = ({
  language,
  onProceedToSummary,
  onBack,
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedDocument[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = getTranslation(language);

  // Process document text through Clinical AI Judge
  const processWithGroq = async (fileName: string, text: string, size: string) => {
    setIsProcessing(true);
    setProcessingStatus(`AI Clinical Engine analyzing content in ${fileName}...`);

    try {
      const result: ClinicalJudgeResult = await judgeClinicalDocumentWithGroq(text, fileName);

      const doc: UploadedDocument = {
        id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: fileName,
        type: result.documentType || (result.isMedicalDocument ? 'PRESCRIPTION' : 'NON_MEDICAL_DOCUMENT'),
        confidence: result.confidence,
        extractedDrugs: result.extractedDrugs || [],
        extractedDiagnoses: result.extractedDiagnoses || [],
        extractedLabValues: result.extractedLabValues || [],
        size,
        isMedicalDocument: result.isMedicalDocument,
        message: result.message,
        clinicalSummary: result.clinicalSummary,
        doctorName: result.doctorName,
        hospital: result.hospital,
      };

      setUploadedFiles((prev) => [doc, ...prev.filter((d) => d.name !== fileName)]);
    } catch (err) {
      console.error('Document analysis error:', err);
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  const handleAttachPreset = async (preset: (typeof SAMPLE_DEMO_PRESETS)[0]) => {
    await processWithGroq(preset.name, preset.text, preset.size);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const sizeStr = `${(file.size / 1024).toFixed(1)} KB`;

    setIsProcessing(true);
    setProcessingStatus(`Extracting text from ${file.name}...`);

    try {
      let extractedText = '';
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        const buffer = await file.arrayBuffer();
        extractedText = await extractTextFromPdf(buffer);
      } else {
        extractedText = await file.text();
      }

      await processWithGroq(file.name, extractedText, sizeStr);
    } catch (err) {
      console.warn('File reading error, passing raw filename to AI judge:', err);
      await processWithGroq(file.name, file.name, sizeStr);
    }
  };

  const handleRemoveDoc = (id: string) => {
    setUploadedFiles((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full py-2 px-1 sm:px-4 justify-between">
      {/* Header with AI Indicator Badge and Back Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3 border-b border-[#EAEAEA] dark:border-[#232734] pb-3 shrink-0">
        <div className="flex items-center gap-2.5">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              title={language === LanguageCode.HI ? 'वापस जाएं' : 'Go Back'}
              className="p-2 rounded-xl border border-[#EAEAEA] dark:border-[#232734] bg-[#FFFFFF] dark:bg-[#141720] text-[#111111] dark:text-[#F4F4F6] hover:bg-[#F7F6F3] dark:hover:bg-[#1A1D27] active:scale-95 transition-all cursor-pointer shrink-0 shadow-xs flex items-center gap-1 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{language === LanguageCode.HI ? 'वापस' : 'Back'}</span>
            </button>
          )}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111111] dark:text-[#F4F4F6] flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#1F6C9F] dark:text-[#70B8FF]" />
                <span>{t.records_title}</span>
              </h2>
              <span className="tag-pastel-blue px-2 py-0.5 rounded-full text-[9px] font-mono font-bold flex items-center gap-1">
                <Cpu className="w-3 h-3 text-[#1F6C9F] dark:text-[#70B8FF]" />
                <span>Clinical AI Document Engine</span>
              </span>
            </div>
            <p className="text-xs text-[#787774] dark:text-[#8E94A4] mt-0.5">
              {t.records_subtitle}
            </p>
          </div>
        </div>
        <AudioPromptButton text={t.audio_records} language={language} size="md" />
      </div>

      {/* 1-Tap Quick Clinical Presets */}
      <div className="p-3.5 rounded-xl border border-[#EAEAEA] dark:border-[#232734] bg-[#F7F6F3] dark:bg-[#141720] mb-3 shrink-0">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#1F6C9F] dark:text-[#70B8FF] shrink-0" />
            <h4 className="text-xs font-bold text-[#111111] dark:text-[#F4F4F6]">
              Clinical Presets — 1-Tap AI OCR Inference:
            </h4>
          </div>
          <span className="text-[10px] font-mono text-[#787774] dark:text-[#8E94A4]">
            Dynamic AI Confidence
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {SAMPLE_DEMO_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleAttachPreset(preset)}
              className="p-2.5 text-left rounded-lg border border-[#EAEAEA] dark:border-[#232734] bg-[#FFFFFF] dark:bg-[#1A1D27] hover:border-[#111111] dark:hover:border-[#F4F4F6] transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-mono uppercase font-bold text-[#1F6C9F] dark:text-[#70B8FF] truncate">
                  {idx === 0 ? 'Cardiology' : idx === 1 ? 'AYUSH' : 'Lab Report'}
                </span>
                <span className="text-[10px] font-mono font-bold text-[#346538] dark:text-[#6EE787]">
                  + Parse with AI
                </span>
              </div>
              <p className="text-xs font-bold text-[#111111] dark:text-[#F4F4F6] truncate group-hover:text-[#1F6C9F] dark:group-hover:text-[#70B8FF]">
                {preset.name}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Native File Upload Dropzone */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf,image/*,.txt"
        className="hidden"
      />

      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-[#CCCCCC] dark:border-[#333A4D] hover:border-[#111111] dark:hover:border-[#F4F4F6] bg-[#FFFFFF] dark:bg-[#141720] rounded-xl p-5 text-center mb-3 flex flex-col items-center justify-center transition-all cursor-pointer group shadow-xs"
      >
        <div className="w-12 h-12 rounded-xl bg-[#F7F6F3] dark:bg-[#1E222D] border border-[#EAEAEA] dark:border-[#2D3242] text-[#111111] dark:text-[#F4F4F6] flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
          <Upload className="w-6 h-6 stroke-[2]" />
        </div>
        <h4 className="text-sm font-bold text-[#111111] dark:text-[#F4F4F6] mb-0.5">
          Upload Any PDF or Image (Clinical OCR & Entity Extraction)
        </h4>
        <p className="text-[11px] text-[#787774] dark:text-[#8E94A4] max-w-md mb-2">
          Select any prescription PDF from <code className="px-1 py-0.5 rounded bg-[#F7F6F3] dark:bg-[#1E222D] text-[10px] font-mono text-[#1F6C9F] dark:text-[#70B8FF]">DEMO_PDF</code> or upload any other clinical document. AI will evaluate and extract entities.
        </p>

        {isProcessing ? (
          <div className="flex items-center gap-2 text-[#1F6C9F] dark:text-[#70B8FF] text-xs font-mono animate-pulse mt-1">
            <div className="w-4 h-4 border-2 border-[#1F6C9F] dark:border-[#70B8FF] border-t-transparent rounded-full animate-spin" />
            <span>{processingStatus || 'Clinical AI Evaluating Document Entities...'}</span>
          </div>
        ) : (
          <span className="px-3.5 py-1.5 rounded-md bg-[#111111] dark:bg-[#F4F4F6] text-[#FFFFFF] dark:text-[#0D0F14] text-xs font-bold uppercase tracking-wider mt-1">
            Choose PDF / Image File
          </span>
        )}
      </div>

      {/* Dynamic AI Evaluated Results List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2 mb-3 max-h-56 overflow-y-auto">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#787774] dark:text-[#8E94A4] px-1">
            <span>{uploadedFiles.length} File(s) Processed by Clinical AI Engine</span>
            <span className="text-[#1F6C9F] dark:text-[#70B8FF] font-bold">Entity Extraction Active</span>
          </div>

          {uploadedFiles.map((doc) => {
            const isMedical = doc.isMedicalDocument;

            return (
              <div
                key={doc.id}
                className={`p-3.5 rounded-xl border transition-all text-left shadow-xs flex items-start justify-between gap-3 ${
                  isMedical
                    ? 'border-[#A3D9A5] dark:border-[#2D5A34] bg-[#F4FAF5] dark:bg-[#0E1A12]'
                    : 'border-[#F5C2C2] dark:border-[#5A2528] bg-[#FFF8F8] dark:bg-[#1A0D0E]'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0 pr-2">
                  {isMedical ? (
                    <FileCheck className="w-5 h-5 text-[#2E7D32] dark:text-[#81C784] shrink-0 mt-0.5" />
                  ) : (
                    <FileX2 className="w-5 h-5 text-[#C62828] dark:text-[#E57373] shrink-0 mt-0.5" />
                  )}

                  <div className="min-w-0">
                    {/* Title and Confidence Pill */}
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h5 className="font-bold text-xs text-[#111111] dark:text-[#F4F4F6] truncate">
                        {doc.name}
                      </h5>

                      {isMedical ? (
                        <span className="tag-pastel-green px-2 py-0.5 text-[9px] font-mono font-bold rounded flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-[#2E7D32]" />
                          <span>{(doc.confidence * 100).toFixed(0)}% AI CONFIDENCE</span>
                        </span>
                      ) : (
                        <span className="tag-pastel-red px-2 py-0.5 text-[9px] font-mono font-bold rounded flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-[#C62828]" />
                          <span>0% CONFIDENCE (NON-MEDICAL)</span>
                        </span>
                      )}

                      <span className="text-[10px] font-mono text-[#787774] dark:text-[#8E94A4]">
                        ({doc.size})
                      </span>
                    </div>

                    {/* Non-Medical Rejection Notice */}
                    {!isMedical ? (
                      <div className="p-2 rounded-md bg-[#FDEAEA] dark:bg-[#2A1517] border border-[#F5C2C2] dark:border-[#5A2528] text-[#C62828] dark:text-[#FF8A80] text-xs font-mono mt-1 space-y-0.5">
                        <p className="font-bold flex items-center gap-1.5">
                          <span>⚠️ AI Judge:</span>
                          <span>"Did not find anything (No medical or clinical content found in this document)"</span>
                        </p>
                        <p className="text-[10px] text-[#888888] dark:text-[#AAAAAA]">
                          This file does not contain recognized medical prescriptions, laboratory tests, or clinical notes.
                        </p>
                      </div>
                    ) : (
                      /* Valid Medical Extraction Summary */
                      <div className="space-y-1 mt-1 text-xs">
                        {doc.clinicalSummary && (
                          <p className="text-[11px] text-[#444444] dark:text-[#CCCCCC]">
                            <strong className="text-[#111111] dark:text-[#F4F4F6]">Clinical Summary:</strong> {doc.clinicalSummary}
                          </p>
                        )}

                        {doc.extractedDrugs.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-bold uppercase text-[#1F6C9F] dark:text-[#70B8FF]">
                              Extracted Rx Drugs:
                            </span>
                            {doc.extractedDrugs.map((drug, i) => (
                              <span
                                key={i}
                                className="px-1.5 py-0.5 rounded bg-[#EBF3F8] dark:bg-[#162738] text-[10px] font-mono text-[#1F6C9F] dark:text-[#70B8FF] font-medium"
                              >
                                {drug}
                              </span>
                            ))}
                          </div>
                        )}

                        {doc.extractedDiagnoses.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-bold uppercase text-[#787774] dark:text-[#8E94A4]">
                              Diagnosis:
                            </span>
                            {doc.extractedDiagnoses.map((diag, i) => (
                              <span
                                key={i}
                                className="px-1.5 py-0.5 rounded bg-[#F7F6F3] dark:bg-[#1E222D] text-[10px] font-mono text-[#333333] dark:text-[#DDDDDD]"
                              >
                                {diag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveDoc(doc.id);
                  }}
                  className="p-1.5 rounded-md hover:bg-[#FBE8E8] dark:hover:bg-[#3D1E22] text-[#E03E3E] transition-colors shrink-0 cursor-pointer"
                  title="Remove Document"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-auto shrink-0 pt-2 border-t border-[#EAEAEA] dark:border-[#232734]">
        <button
          type="button"
          onClick={() => onProceedToSummary(uploadedFiles)}
          className="py-3 px-4 min-h-[48px] rounded-lg border border-[#EAEAEA] dark:border-[#232734] bg-[#FFFFFF] dark:bg-[#141720] text-[#666666] dark:text-[#8E94A4] font-medium text-xs hover:bg-[#F7F6F3] dark:hover:bg-[#1A1D27] transition-all cursor-pointer"
        >
          <span>{uploadedFiles.length > 0 ? 'Skip Remaining' : t.skip_records}</span>
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
