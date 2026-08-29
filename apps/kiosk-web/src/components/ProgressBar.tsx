import React from 'react';
import { User, FileText, Stethoscope, HelpCircle, Upload, CheckCircle2 } from 'lucide-react';
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

interface StepItem {
  id: KioskStep;
  labelEn: string;
  labelHi: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STEPS: StepItem[] = [
  { id: 'IDENTITY', labelEn: 'Identify', labelHi: 'पहचान', icon: User },
  { id: 'CONSENT', labelEn: 'Consent', labelHi: 'सहमति', icon: FileText },
  { id: 'COMPLAINT', labelEn: 'Complaint', labelHi: 'लक्षण', icon: Stethoscope },
  { id: 'INTERVIEW', labelEn: 'Questions', labelHi: 'पूछताछ', icon: HelpCircle },
  { id: 'DOCUMENTS', labelEn: 'Records', labelHi: 'दस्तावेज़', icon: Upload },
  { id: 'COMPLETED', labelEn: 'Token', labelHi: 'पर्ची', icon: CheckCircle2 },
];

export const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, language }) => {
  if (currentStep === 'LANGUAGE') return null;

  const currentIdx = STEPS.findIndex((s) => s.id === currentStep);

  return (
    <div className="w-full max-w-4xl mx-auto px-6 pt-5 pb-3">
      <div className="flex items-center justify-between relative">
        {/* Background Connecting Line */}
        <div className="absolute left-6 right-6 top-5 -translate-y-1/2 h-1 bg-slate-200 dark:bg-slate-800 rounded-full z-0" />

        {/* Active Filled Line */}
        <div
          className="absolute left-6 top-5 -translate-y-1/2 h-1 bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full z-0 transition-all duration-500"
          style={{
            width: currentIdx >= 0 ? `${(currentIdx / (STEPS.length - 1)) * 100}%` : '0%',
          }}
        />

        {/* Step Nodes */}
        {STEPS.map((step, idx) => {
          const isPassed = currentIdx > idx;
          const isCurrent = currentStep === step.id;
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex flex-col items-center relative z-10">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                  isPassed
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : isCurrent
                    ? 'bg-teal-500 text-slate-950 ring-4 ring-teal-500/20 shadow-lg shadow-teal-500/30 scale-110'
                    : 'bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 text-slate-400'
                }`}
              >
                <Icon className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span
                className={`text-[11px] font-bold mt-2 transition-colors ${
                  isCurrent
                    ? 'text-teal-600 dark:text-teal-400 font-extrabold'
                    : isPassed
                    ? 'text-slate-700 dark:text-slate-300'
                    : 'text-slate-400 dark:text-slate-600'
                }`}
              >
                {language === LanguageCode.HI ? step.labelHi : step.labelEn}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
