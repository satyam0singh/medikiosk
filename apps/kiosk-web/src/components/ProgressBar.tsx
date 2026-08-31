import React from 'react';
import { User, FileText, Stethoscope, HelpCircle, Upload, CheckCircle2 } from 'lucide-react';
import { LanguageCode } from '@medikiosk/shared-types';
import { getTranslation } from '../utils/translations';

export type KioskStep =
  | 'LANGUAGE'
  | 'IDENTITY'
  | 'CONSENT'
  | 'COMPLAINT'
  | 'INTERVIEW'
  | 'RED_FLAG'
  | 'DOCUMENTS'
  | 'COMPLETED'
  | 'COMPLETION';

interface ProgressBarProps {
  currentStep: KioskStep;
  language: LanguageCode;
}

interface StepItem {
  id: KioskStep | 'COMPLETION';
  translationKey: 'step_identify' | 'step_consent' | 'step_complaint' | 'step_questions' | 'step_records' | 'step_token';
  icon: React.ComponentType<{ className?: string }>;
}

const STEPS: StepItem[] = [
  { id: 'IDENTITY', translationKey: 'step_identify', icon: User },
  { id: 'CONSENT', translationKey: 'step_consent', icon: FileText },
  { id: 'COMPLAINT', translationKey: 'step_complaint', icon: Stethoscope },
  { id: 'INTERVIEW', translationKey: 'step_questions', icon: HelpCircle },
  { id: 'DOCUMENTS', translationKey: 'step_records', icon: Upload },
  { id: 'COMPLETION', translationKey: 'step_token', icon: CheckCircle2 },
];

export const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, language }) => {
  if (currentStep === 'LANGUAGE') return null;

  const t = getTranslation(language);
  const normalizedStep = currentStep === 'COMPLETED' ? 'COMPLETION' : currentStep;
  const currentIdx = STEPS.findIndex((s) => s.id === normalizedStep);

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
                {t[step.translationKey]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

