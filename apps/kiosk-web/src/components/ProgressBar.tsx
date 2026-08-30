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
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-3 sm:pt-4 pb-1 shrink-0">
      <div className="flex items-center justify-between gap-1.5 sm:gap-2">
        {STEPS.map((step, idx) => {
          const isPassed = currentIdx > idx;
          const isCurrent = currentStep === step.id;

          return (
            <div key={step.id} className="flex-1 flex flex-col items-center min-w-0">
              {/* Dynamic Responsive Progress Segment */}
              <div
                className={`w-full h-1 sm:h-1.5 rounded-full mb-1.5 transition-colors duration-200 ${
                  isPassed
                    ? 'bg-[#346538] dark:bg-[#6EE787]'
                    : isCurrent
                    ? 'bg-[#111111] dark:bg-[#F4F4F6]'
                    : 'bg-[#EAEAEA] dark:bg-[#232734]'
                }`}
              />
              <span
                className={`text-[9px] sm:text-[10px] font-mono uppercase tracking-wider truncate text-center max-w-full transition-colors ${
                  isCurrent
                    ? 'text-[#111111] dark:text-[#F4F4F6] font-bold'
                    : isPassed
                    ? 'text-[#666666] dark:text-[#8E94A4]'
                    : 'text-[#AAAAAA] dark:text-[#4A5060]'
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
