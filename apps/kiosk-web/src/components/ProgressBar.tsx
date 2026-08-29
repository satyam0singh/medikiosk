import React from 'react';
import { UserCheck, FileCheck, Stethoscope, HelpCircle, FileText, CheckCircle2 } from 'lucide-react';
import { LanguageCode } from '@medikiosk/shared-types';

export type KioskStep =
  | 'LANGUAGE'
  | 'IDENTITY'
  | 'CONSENT'
  | 'COMPLAINT'
  | 'INTERVIEW'
  | 'RED_FLAG'
  | 'DOCUMENTS'
  | 'COMPLETED';

interface ProgressBarProps {
  currentStep: KioskStep;
  language: LanguageCode;
}

const STEPS = [
  { id: 'IDENTITY', labelEn: 'Identify', labelHi: 'पहचान', icon: UserCheck },
  { id: 'CONSENT', labelEn: 'Consent', labelHi: 'सहमति', icon: FileCheck },
  { id: 'COMPLAINT', labelEn: 'Complaint', labelHi: 'तकलीफ', icon: Stethoscope },
  { id: 'INTERVIEW', labelEn: 'Questions', labelHi: 'विवरण', icon: HelpCircle },
  { id: 'DOCUMENTS', labelEn: 'Records', labelHi: 'दस्तावेज', icon: FileText },
  { id: 'COMPLETED', labelEn: 'Token', labelHi: 'टोकन', icon: CheckCircle2 },
];

export const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, language }) => {
  if (currentStep === 'LANGUAGE') return null;

  const currentIdx = STEPS.findIndex(s => s.id === currentStep);

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-4">
      <div className="flex items-center justify-between relative">
        {/* Background Track Line */}
        <div className="absolute top-1/2 -translate-y-1/2 left-6 right-6 h-1.5 bg-slate-800 rounded-full z-0" />
        
        {/* Active Track Line */}
        <div
          className="absolute top-1/2 -translate-y-1/2 left-6 h-1.5 bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full z-0 transition-all duration-500"
          style={{
            width: `${Math.max(0, (currentIdx / (STEPS.length - 1)) * 100)}%`,
          }}
        />

        {/* Step Nodes */}
        {STEPS.map((s, idx) => {
          const isPassed = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          const Icon = s.icon;

          return (
            <div key={s.id} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  isPassed
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : isCurrent
                    ? 'bg-teal-400 text-slate-950 ring-4 ring-teal-500/30 scale-110 shadow-lg'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span
                className={`mt-2 text-xs font-semibold tracking-wide ${
                  isCurrent ? 'text-teal-300 font-bold' : isPassed ? 'text-slate-300' : 'text-slate-500'
                }`}
              >
                {language === LanguageCode.HI ? s.labelHi : s.labelEn}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
