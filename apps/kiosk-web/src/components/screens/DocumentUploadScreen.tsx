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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <FileText className="w-8 h-8 text-teal-400" />
            <span>{language === LanguageCode.HI ? 'पुराने पर्चे एवं दस्तावेज अपलोड' : 'Document & Prescription Capture'}</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {language === LanguageCode.HI
              ? 'OCR तकनीक द्वारा आपकी पुरानी दवाइयों और जांचों का सारांश तैयार किया जाएगा'
              : 'Medical OCR will extract prior medications and lab values into your timeline'}
          </p>
        </div>
        <AudioPromptButton text={promptText} language={language} />
      </div>

      {/* 1-Tap Demo Prescription Loader */}
      <div className="p-4 rounded-2xl bg-teal-950/40 border border-teal-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-teal-400 shrink-0" />
          <p className="text-xs sm:text-sm text-teal-300 font-medium">
            {language === LanguageCode.HI
              ? 'डेमो के लिए तैयार किया गया पुराना पर्चा जोड़ें (Amlodipine 5mg / Omeprazole):'
              : 'Attach Synthetic Demo Prescription (Dr. Sharma - Amlodipine 5mg):'}
          </p>
        </div>
        <button
          type="button"
          onClick={handleSimulateSyntheticPrescription}
          className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl text-xs font-bold shrink-0 transition-all shadow-md active:scale-95"
        >
          {language === LanguageCode.HI ? '+ डेमो पर्चा जोड़ें' : '+ Attach Demo Rx'}
        </button>
      </div>

      {/* Upload Dropzone */}
      <div className="bg-slate-850 border-2 border-dashed border-slate-700 hover:border-teal-400 rounded-3xl p-8 sm:p-12 text-center shadow-xl mb-6 flex flex-col items-center justify-center transition-colors">
        <div className="w-16 h-16 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-4">
          <Upload className="w-8 h-8" />
        </div>
        <h4 className="text-lg font-bold text-white mb-1">
          {language === LanguageCode.HI ? 'पर्चा यहाँ रखें या फाइल चुनें' : 'Place Document on Scanner or Browse File'}
        </h4>
        <p className="text-xs text-slate-400 max-w-sm mb-4">
          Supports JPG, PNG, PDF (Prescriptions, Discharge Summaries, Biochemistry Reports)
        </p>

        {isProcessing && (
          <div className="flex items-center gap-2 text-teal-400 text-sm font-semibold animate-pulse">
            <div className="w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
            <span>Scanning & running Medical OCR...</span>
          </div>
        )}

        {/* Uploaded items */}
        {uploadedFiles.length > 0 && (
          <div className="w-full mt-4 space-y-3">
            {uploadedFiles.map((doc, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-900 border border-teal-500/30 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  <FileCheck className="w-6 h-6 text-emerald-400" />
                  <div>
                    <h5 className="font-bold text-white text-sm">{doc.name}</h5>
                    <p className="text-xs text-slate-400">
                      Type: <span className="text-teal-400 font-semibold">{doc.type}</span> • OCR Confidence:{' '}
                      <span className="text-emerald-400 font-semibold">{(doc.confidence * 100).toFixed(0)}%</span>
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold rounded-full">
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
          className="kiosk-btn bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold text-sm"
        >
          <span>{language === LanguageCode.HI ? 'पर्चा नहीं है / छोड़ें' : 'No Documents / Skip'}</span>
        </button>

        <button
          type="button"
          onClick={() => onProceedToSummary(uploadedFiles)}
          className="kiosk-btn bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-base"
        >
          <span>{language === LanguageCode.HI ? 'समीक्षा एवं टोकन प्राप्त करें' : 'Proceed & Get Token'}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
