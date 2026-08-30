import React, { useState } from 'react';
import { FileText, Upload, Sparkles, ArrowRight, FileCheck } from 'lucide-react';
import { LanguageCode } from '@medikiosk/shared-types';
import { AudioPromptButton } from '../AudioPromptButton';

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

  const promptText =
    language === LanguageCode.HI
      ? 'यदि आपके पास पुराने डॉक्टर के पर्चे या जांच रिपोर्ट हैं, तो यहाँ कैमरा या स्कैनर से स्कैन करें। यदि नहीं हैं, तो सीधे आगे बढ़ें।'
      : 'If you have previous doctor prescriptions or lab reports, scan or upload them now. Otherwise, you can skip to completion.';

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
    }, 1200);
  };

  return (
    <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
            <FileText className="w-8 h-8 text-teal-500" />
            <span>{language === LanguageCode.HI ? 'पुराने पर्चे एवं दस्तावेज अपलोड' : 'Document & Prescription Capture'}</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            {language === LanguageCode.HI
              ? 'OCR तकनीक द्वारा आपकी पुरानी दवाइयों और जांचों का सारांश तैयार किया जाएगा'
              : 'Medical OCR will extract prior medications and lab values into your timeline'}
          </p>
        </div>
        <AudioPromptButton text={promptText} language={language} size="md" />
      </div>

      {/* 1-Tap Demo Prescription Loader */}
      <div className="p-4 rounded-3xl bg-teal-500/10 border border-teal-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 shadow-sm">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0" />
          <p className="text-xs sm:text-sm text-teal-800 dark:text-teal-300 font-bold">
            {language === LanguageCode.HI
              ? 'डेमो के लिए तैयार किया गया पुराना पर्चा जोड़ें (Amlodipine 5mg / Omeprazole):'
              : 'Attach Synthetic Demo Prescription (Dr. Sharma - Amlodipine 5mg):'}
          </p>
        </div>
        <button
          type="button"
          onClick={handleSimulateSyntheticPrescription}
          className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider shrink-0 transition-all shadow-md active:scale-95"
        >
          {language === LanguageCode.HI ? '+ डेमो पर्चा जोड़ें' : '+ Attach Demo Rx'}
        </button>
      </div>

      {/* Upload Dropzone */}
      <div className="border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-teal-500 dark:hover:border-teal-400 bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 text-center shadow-xl mb-6 flex flex-col items-center justify-center transition-colors">
        <div className="w-16 h-16 rounded-2xl bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-4">
          <Upload className="w-8 h-8 stroke-[2.2]" />
        </div>
        <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
          {language === LanguageCode.HI ? 'पर्चा यहाँ रखें या फाइल चुनें' : 'Place Document on Scanner or Browse File'}
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-4 font-medium">
          Supports JPG, PNG, PDF (Prescriptions, Discharge Summaries, Biochemistry Reports)
        </p>

        {isProcessing && (
          <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 text-xs font-bold animate-pulse">
            <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
            <span>Scanning & running Medical OCR entity extraction...</span>
          </div>
        )}

        {/* Uploaded items */}
        {uploadedFiles.length > 0 && (
          <div className="w-full mt-4 space-y-3">
            {uploadedFiles.map((doc, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-teal-500/30 flex items-center justify-between text-left shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <FileCheck className="w-6 h-6 text-emerald-500" />
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white text-sm">{doc.name}</h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Type: <strong className="text-teal-600 dark:text-teal-400 font-semibold">{doc.type}</strong> • OCR Confidence:{' '}
                      <strong className="text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">{(doc.confidence * 100).toFixed(0)}%</strong>
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-bold rounded-full">
                  OCR Complete
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-auto">
        <button
          type="button"
          onClick={() => onProceedToSummary(uploadedFiles)}
          className="p-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 font-bold text-xs uppercase tracking-wider rounded-2xl transition-all active:scale-[0.98]"
        >
          <span>{language === LanguageCode.HI ? 'पर्चा नहीं है / छोड़ें' : 'No Documents / Skip'}</span>
        </button>

        <button
          type="button"
          onClick={() => onProceedToSummary(uploadedFiles)}
          className="p-4 bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 active:scale-[0.98] transition-all"
        >
          <span>{language === LanguageCode.HI ? 'समीक्षा एवं टोकन प्राप्त करें' : 'Proceed & Get Token'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
