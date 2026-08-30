import React from 'react';
import { CheckCircle2, Printer, RotateCcw } from 'lucide-react';
import { Patient, LanguageCode } from '@medikiosk/shared-types';
import { AudioPromptButton } from '../AudioPromptButton';

interface CompletionScreenProps {
  patient: Patient;
  language: LanguageCode;
  onResetToStart: () => void;
}

export const CompletionScreen: React.FC<CompletionScreenProps> = ({
  patient,
  language,
  onResetToStart,
}) => {
  const tokenNumber = 'AIIA-2026-A14';
  const assignedRoom = 'Room #04 • General Medicine';
  const assignedDoctor = 'Dr. Rajesh Sharma';

  const completionPrompt =
    language === LanguageCode.HI
      ? `आपका टोकन नंबर ${tokenNumber} है। कृपया कमरा नंबर ४ के बाहर प्रतीक्षा करें। डॉक्टर को आपकी सभी जानकारी भेज दी गई है।`
      : `Your intake is complete. Token number ${tokenNumber}. Please wait outside Room 4 for Dr. Rajesh Sharma.`;

  return (
    <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full p-6 text-center">
      {/* Category Pill */}
      <div className="mb-3">
        <span className="tag-pastel-green px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest flex items-center gap-1.5 mx-auto">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{language === LanguageCode.HI ? 'केस-टेकिंग पूर्ण' : 'Intake Completed'}</span>
        </span>
      </div>

      <h2 className="text-2xl sm:text-3xl font-serif tracking-tight text-[#111111] dark:text-[#F4F4F6] mb-1">
        {language === LanguageCode.HI ? 'आपका टोकन तैयार है' : 'Your Token is Ready'}
      </h2>
      <p className="text-xs text-[#787774] dark:text-[#8E94A4] mb-4">
        {language === LanguageCode.HI
          ? 'आपकी जानकारी सुरक्षित रूप से डॉक्टर के डैशबोर्ड पर भेज दी गई है।'
          : 'Clinical intake structured and queued for physician verification.'}
      </p>

      {/* Audio Announcement */}
      <div className="mb-6">
        <AudioPromptButton text={completionPrompt} language={language} size="md" />
      </div>

      {/* Minimalist Thermal OPD Slip Card */}
      <div className="w-full max-w-sm bg-[#FFFFFF] dark:bg-[#141720] border border-[#EAEAEA] dark:border-[#232734] rounded-xl p-5 text-left mb-6 font-mono text-xs">
        {/* Header */}
        <div className="border-b border-[#EAEAEA] dark:border-[#232734] pb-3 mb-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase text-[#111111] dark:text-[#F4F4F6]">All India Institute of Ayurveda</h3>
            <span className="text-[10px] text-[#787774] dark:text-[#8E94A4]">OPD #01</span>
          </div>
          <p className="text-[10px] text-[#787774] dark:text-[#8E94A4]">Case Intake Summary Slip</p>
        </div>

        {/* Token Big Box */}
        <div className="bg-[#F7F6F3] dark:bg-[#10121A] border border-[#EAEAEA] dark:border-[#232734] rounded-lg p-3 text-center mb-3">
          <span className="text-[10px] uppercase tracking-wider text-[#787774] dark:text-[#8E94A4] block">Token Number</span>
          <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111111] dark:text-[#F4F4F6]">{tokenNumber}</span>
        </div>

        {/* Details */}
        <div className="space-y-1.5 text-[11px] border-b border-[#EAEAEA] dark:border-[#232734] pb-3 mb-3 text-[#555555] dark:text-[#9EA5B5]">
          <div className="flex justify-between">
            <span>Patient:</span>
            <strong className="text-[#111111] dark:text-[#F4F4F6] font-sans font-bold">{patient.fullName}</strong>
          </div>
          <div className="flex justify-between">
            <span>Age / Sex:</span>
            <span className="text-[#111111] dark:text-[#F4F4F6] tabular-nums">{patient.age} Yrs / {patient.gender}</span>
          </div>
          <div className="flex justify-between">
            <span>ABHA ID:</span>
            <span className="text-[#1F6C9F] dark:text-[#70B8FF] font-bold">{patient.abhaId || '91-4829-1029-4820'}</span>
          </div>
          <div className="flex justify-between">
            <span>Room:</span>
            <span className="text-[#111111] dark:text-[#F4F4F6] font-bold">{assignedRoom}</span>
          </div>
          <div className="flex justify-between">
            <span>Doctor:</span>
            <span className="text-[#111111] dark:text-[#F4F4F6]">{assignedDoctor}</span>
          </div>
        </div>

        {/* Mini Facts */}
        <div className="text-[10px] space-y-1 text-[#787774] dark:text-[#8E94A4]">
          <p>• Complaint: Chest Pain (Severity 7/10)</p>
          <p>• Prior Rx: Tab Amlodipine 5mg OD (OCR)</p>
          <p>• Consent: Granted (ABDM / DPDP)</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        <button
          type="button"
          onClick={() => window.print()}
          className="flex-1 py-2.5 bg-[#111111] dark:bg-[#F4F4F6] text-[#FFFFFF] dark:text-[#0D0F14] font-bold text-xs uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 active:scale-95 transition-all"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>{language === LanguageCode.HI ? 'पर्ची प्रिंट करें' : 'Print Slip'}</span>
        </button>

        <button
          type="button"
          onClick={onResetToStart}
          className="flex-1 py-2.5 bg-transparent border border-[#EAEAEA] dark:border-[#232734] text-[#666666] dark:text-[#8E94A4] font-medium text-xs rounded-lg flex items-center justify-center gap-1.5 hover:bg-[#F7F6F3] dark:hover:bg-[#1A1D27] transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{language === LanguageCode.HI ? 'रीसेट' : 'Next Patient'}</span>
        </button>
      </div>
    </div>
  );
};
