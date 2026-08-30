import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, Lock, FileText, ArrowRight, Sparkles } from 'lucide-react';
import { Patient, LanguageCode, ConsentStatus } from '@medikiosk/shared-types';
import { AudioPromptButton } from '../AudioPromptButton';
import { KioskApi } from '../../services/api';
import { getTranslation } from '../../utils/translations';

interface ConsentScreenProps {
  patient: Patient;
  language: LanguageCode;
  onConsentGranted: (consentRecord: any) => void;
  onConsentDenied: () => void;
}

export const ConsentScreen: React.FC<ConsentScreenProps> = ({
  patient,
  language,
  onConsentGranted,
  onConsentDenied,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = getTranslation(language);

  const handleAgree = async () => {
    setIsSubmitting(true);
    try {
      const consent = await KioskApi.recordConsent({
        patientId: patient.id,
        status: ConsentStatus.GRANTED,
        scope: ['CLINICAL_INTAKE', 'DOCUMENT_OCR', 'AI_STRUCTURING', 'ABDM_SHARING'],
        version: 'v1.0',
        capturedVia: 'TOUCH_SCREEN',
      });
      onConsentGranted(consent);
    } catch (err) {
      console.warn('Backend consent recording fallback (offline/demo):', err);
      onConsentGranted({
        id: 'consent-local-granted',
        patientId: patient.id,
        status: ConsentStatus.GRANTED,
        scope: ['CLINICAL_INTAKE', 'DOCUMENT_OCR', 'AI_STRUCTURING', 'ABDM_SHARING'],
        version: 'v1.0',
        capturedVia: 'TOUCH_SCREEN',
        grantedAt: new Date().toISOString(),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full py-2 px-1 sm:px-4 justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3 border-b border-[#EAEAEA] dark:border-[#232734] pb-3 shrink-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111111] dark:text-[#F4F4F6] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#1F6C9F] dark:text-[#70B8FF]" />
            <span>{t.consent_title}</span>
          </h2>
          <p className="text-xs text-[#787774] dark:text-[#8E94A4] mt-0.5 font-mono tabular-nums">
            {t.full_name}: {patient.fullName} ({patient.age || 'N/A'} yrs / {patient.gender === 'MALE' ? t.male : t.female})
          </p>
        </div>
        <AudioPromptButton text={t.audio_consent} language={language} size="md" />
      </div>

      {/* Main Consent Document Bento with dynamic internal flow */}
      <div className="border border-[#EAEAEA] dark:border-[#232734] bg-[#FFFFFF] dark:bg-[#141720] rounded-xl p-4 sm:p-5 mb-4 space-y-3 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#555555] dark:text-[#8E94A4]">
          <Lock className="w-3.5 h-3.5" />
          <span>{t.consent_subtitle}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
          {/* Scope 1 */}
          <div className="p-3 rounded-lg border border-[#EAEAEA] dark:border-[#232734] bg-[#FBFBFA] dark:bg-[#10121A] flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#346538] dark:text-[#6EE787] mt-0.5 shrink-0" />
            <div>
              <h4 className="font-bold text-xs text-[#111111] dark:text-[#F4F4F6]">
                1. {t.step_complaint} & {t.step_questions}
              </h4>
              <p className="text-[11px] text-[#787774] dark:text-[#8E94A4] mt-0.5 leading-relaxed">
                {t.consent_point_1}
              </p>
            </div>
          </div>

          {/* Scope 2 */}
          <div className="p-3 rounded-lg border border-[#EAEAEA] dark:border-[#232734] bg-[#FBFBFA] dark:bg-[#10121A] flex items-start gap-2.5">
            <FileText className="w-4 h-4 text-[#1F6C9F] dark:text-[#70B8FF] mt-0.5 shrink-0" />
            <div>
              <h4 className="font-bold text-xs text-[#111111] dark:text-[#F4F4F6]">
                2. {t.step_records}
              </h4>
              <p className="text-[11px] text-[#787774] dark:text-[#8E94A4] mt-0.5 leading-relaxed">
                {t.records_subtitle}
              </p>
            </div>
          </div>

          {/* Scope 3 */}
          <div className="p-3 rounded-lg border border-[#EAEAEA] dark:border-[#232734] bg-[#FBFBFA] dark:bg-[#10121A] flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-[#956400] dark:text-[#FDE047] mt-0.5 shrink-0" />
            <div>
              <h4 className="font-bold text-xs text-[#111111] dark:text-[#F4F4F6]">
                3. DPDP Act 2023
              </h4>
              <p className="text-[11px] text-[#787774] dark:text-[#8E94A4] mt-0.5 leading-relaxed">
                {t.consent_point_2}
              </p>
            </div>
          </div>

          {/* Scope 4 */}
          <div className="p-3 rounded-lg border border-[#EAEAEA] dark:border-[#232734] bg-[#FBFBFA] dark:bg-[#10121A] flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#1F6C9F] dark:text-[#70B8FF] mt-0.5 shrink-0" />
            <div>
              <h4 className="font-bold text-xs text-[#111111] dark:text-[#F4F4F6]">
                4. ABHA / ABDM
              </h4>
              <p className="text-[11px] text-[#787774] dark:text-[#8E94A4] mt-0.5 leading-relaxed">
                {t.consent_point_3}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 mt-auto shrink-0">
        <button
          type="button"
          onClick={onConsentDenied}
          className="py-3 px-4 min-h-[48px] rounded-lg border border-[#EAEAEA] dark:border-[#232734] bg-[#FFFFFF] dark:bg-[#141720] text-[#666666] dark:text-[#8E94A4] font-medium text-xs hover:bg-[#F7F6F3] dark:hover:bg-[#1A1D27] transition-all cursor-pointer"
        >
          {t.decline_consent}
        </button>

        <button
          type="button"
          disabled={isSubmitting}
          onClick={handleAgree}
          className="flex-1 py-3 px-4 min-h-[48px] rounded-lg bg-[#111111] dark:bg-[#F4F4F6] text-[#FFFFFF] dark:text-[#0D0F14] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer shadow-xs"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>{t.accept_consent}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
