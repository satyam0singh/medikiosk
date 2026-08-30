import React from 'react';
import { CheckCircle2, Printer, RotateCcw } from 'lucide-react';
import { Patient, LanguageCode } from '@medikiosk/shared-types';
import { AudioPromptButton } from '../AudioPromptButton';
import { getTranslation } from '../../utils/translations';

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
  const t = getTranslation(language);
  const tokenNumber = 'AIIA-2026-A14';
  const assignedRoom = 'Room #04 • General Medicine';
  const assignedDoctor = 'Dr. Rajesh Sharma';

  const completionPrompt =
    language === LanguageCode.HI
      ? `आपका टोकन नंबर ${tokenNumber} है। कृपया कमरा नंबर ४ के बाहर प्रतीक्षा करें। डॉक्टर को आपकी सभी जानकारी भेज दी गई है।`
      : language === LanguageCode.ML
      ? `നിങ്ങളുടെ ടോക്കൺ നമ്പർ ${tokenNumber} ആണ്. ദയവായി റൂം നമ്പർ 4 ന് മുന്നിൽ കാത്തിരിക്കുക.`
      : language === LanguageCode.TA
      ? `உங்கள் டோக்கன் எண் ${tokenNumber}. அறை எண் 4 க்கு வெளியே காத்திருக்கவும்.`
      : language === LanguageCode.TE
      ? `మీ టోకెన్ సంఖ్య ${tokenNumber}. దయచేసి గది నంబర్ 4 వెలుపల వేచి ఉండండి.`
      : `Your intake is complete. Token number ${tokenNumber}. Please wait outside Room 4 for Dr. Rajesh Sharma.`;

  return (
    <div className="flex-1 flex flex-col items-center justify-center max-w-xl mx-auto w-full py-2 px-1 sm:px-4 text-center my-auto">
      {/* Category Pill */}
      <div className="mb-2 sm:mb-3">
        <span className="tag-pastel-green px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest flex items-center gap-1.5 mx-auto">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{t.token_title}</span>
        </span>
      </div>

      <h2 className="text-xl sm:text-3xl font-serif tracking-tight text-[#111111] dark:text-[#F4F4F6] mb-1">
        {t.token_title}
      </h2>
      <p className="text-xs text-[#787774] dark:text-[#8E94A4] mb-3 sm:mb-4">
        {t.token_subtitle}
      </p>

      {/* Audio Announcement */}
      <div className="mb-4 sm:mb-5">
        <AudioPromptButton text={completionPrompt} language={language} size="md" />
      </div>

      {/* Dynamic Thermal OPD Slip Card */}
      <div className="w-full max-w-sm bg-[#FFFFFF] dark:bg-[#141720] border border-[#EAEAEA] dark:border-[#232734] rounded-xl p-4 sm:p-5 text-left mb-4 font-mono text-xs shadow-xs">
        {/* Header */}
        <div className="border-b border-[#EAEAEA] dark:border-[#232734] pb-2.5 mb-2.5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[11px] sm:text-xs uppercase text-[#111111] dark:text-[#F4F4F6] truncate pr-2">
              {t.aiia_title}
            </h3>
            <span className="text-[10px] text-[#787774] dark:text-[#8E94A4] shrink-0">OPD #01</span>
          </div>
          <p className="text-[10px] text-[#787774] dark:text-[#8E94A4]">Case Intake Summary Slip</p>
        </div>

        {/* Token Big Box */}
        <div className="bg-[#F7F6F3] dark:bg-[#10121A] border border-[#EAEAEA] dark:border-[#232734] rounded-lg p-2.5 sm:p-3 text-center mb-2.5">
          <span className="text-[9px] uppercase tracking-wider text-[#787774] dark:text-[#8E94A4] block">
            {t.token_number}
          </span>
          <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111111] dark:text-[#F4F4F6]">{tokenNumber}</span>
        </div>

        {/* Details */}
        <div className="space-y-1.5 text-[11px] border-b border-[#EAEAEA] dark:border-[#232734] pb-2.5 mb-2.5 text-[#555555] dark:text-[#9EA5B5]">
          <div className="flex justify-between">
            <span>{t.full_name}:</span>
            <strong className="text-[#111111] dark:text-[#F4F4F6] font-sans font-bold truncate pl-2">{patient.fullName}</strong>
          </div>
          <div className="flex justify-between">
            <span>{t.age} / {t.gender}:</span>
            <span className="text-[#111111] dark:text-[#F4F4F6] tabular-nums">{patient.age} Yrs / {patient.gender === 'MALE' ? t.male : t.female}</span>
          </div>
          <div className="flex justify-between">
            <span>{t.abha_id}:</span>
            <span className="text-[#1F6C9F] dark:text-[#70B8FF] font-bold">{patient.abhaId || '91-4829-1029-4820'}</span>
          </div>
          <div className="flex justify-between">
            <span>{t.room_number}:</span>
            <span className="text-[#111111] dark:text-[#F4F4F6] font-bold">{assignedRoom}</span>
          </div>
          <div className="flex justify-between">
            <span>{t.assigned_doctor}:</span>
            <span className="text-[#111111] dark:text-[#F4F4F6]">{assignedDoctor}</span>
          </div>
        </div>

        {/* Mini Facts */}
        <div className="text-[10px] space-y-0.5 text-[#787774] dark:text-[#8E94A4]">
          <p>• {t.step_complaint}: Chest Pain (Severity 7/10)</p>
          <p>• {t.upload_prescription}: Tab Amlodipine 5mg OD (OCR)</p>
          <p>• {t.step_consent}: Granted (ABDM / DPDP)</p>
        </div>
      </div>

      {/* Action Buttons with Comfortable Touch Targets (>=48px) */}
      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 w-full max-w-sm">
        <button
          type="button"
          onClick={() => window.print()}
          className="flex-1 py-3 min-h-[48px] bg-[#111111] dark:bg-[#F4F4F6] text-[#FFFFFF] dark:text-[#0D0F14] font-bold text-xs uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-xs"
        >
          <Printer className="w-4 h-4" />
          <span>{t.print_slip}</span>
        </button>

        <button
          type="button"
          onClick={onResetToStart}
          className="flex-1 py-3 min-h-[48px] bg-transparent border border-[#EAEAEA] dark:border-[#232734] text-[#666666] dark:text-[#8E94A4] font-medium text-xs rounded-lg flex items-center justify-center gap-1.5 hover:bg-[#F7F6F3] dark:hover:bg-[#1A1D27] transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{t.new_patient_btn}</span>
        </button>
      </div>
    </div>
  );
};

