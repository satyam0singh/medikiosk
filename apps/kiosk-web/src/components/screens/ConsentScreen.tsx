import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, Lock, FileText, ArrowRight, Sparkles } from 'lucide-react';
import { Patient, LanguageCode, ConsentStatus } from '@medikiosk/shared-types';
import { AudioPromptButton } from '../AudioPromptButton';
import { KioskApi } from '../../services/api';

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

  const consentPrompt =
    language === LanguageCode.HI
      ? 'कृपया सहमति की शर्तें सुनें। हम आपकी स्वास्थ्य जानकारी और पर्चों को सुरक्षित रूप से डॉक्टर के लिए तैयार करेंगे। आगे बढ़ने के लिए मैं सहमत हूँ पर टच करें।'
      : 'Please review informed consent. Your voice, touch answers and uploaded prescriptions will be structured for your doctor consultation under ABDM guidelines.';

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
    <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 border-b border-[#EAEAEA] dark:border-[#232734] pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#111111] dark:text-[#F4F4F6] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#1F6C9F] dark:text-[#70B8FF]" />
            <span>{language === LanguageCode.HI ? 'सूचित डिजिटल सहमति' : 'Informed Digital Consent'}</span>
          </h2>
          <p className="text-xs text-[#787774] dark:text-[#8E94A4] mt-1 font-mono tabular-nums">
            {language === LanguageCode.HI
              ? `मरीज: ${patient.fullName} (${patient.age || 'N/A'} yrs / ${patient.gender})`
              : `Patient: ${patient.fullName} (${patient.age || 'N/A'} yrs / ${patient.gender})`}
          </p>
        </div>
        <AudioPromptButton text={consentPrompt} language={language} size="md" />
      </div>

      {/* Main Consent Document Bento */}
      <div className="border border-[#EAEAEA] dark:border-[#232734] bg-[#FFFFFF] dark:bg-[#141720] rounded-xl p-6 mb-6 space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#555555] dark:text-[#8E94A4]">
          <Lock className="w-4 h-4" />
          <span>{language === LanguageCode.HI ? 'डेटा सुरक्षा और उपयोग की शर्तें:' : 'Data Privacy & Clinical Use Terms:'}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Scope 1 */}
          <div className="p-3.5 rounded-lg border border-[#EAEAEA] dark:border-[#232734] bg-[#FBFBFA] dark:bg-[#10121A] flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#346538] dark:text-[#6EE787] mt-0.5 shrink-0" />
            <div>
              <h4 className="font-bold text-xs text-[#111111] dark:text-[#F4F4F6]">
                {language === LanguageCode.HI ? '१. आवाज और टच द्वारा केस-टेकिंग' : '1. Voice & Touch Case-Taking'}
              </h4>
              <p className="text-[11px] text-[#787774] dark:text-[#8E94A4] mt-0.5 leading-relaxed">
                {language === LanguageCode.HI
                  ? 'आपकी मुख्य तकलीफ और लक्षण डॉक्टर के लिए संरचित किए जाएंगे।'
                  : 'Your reported symptoms will be structured for your treating physician.'}
              </p>
            </div>
          </div>

          {/* Scope 2 */}
          <div className="p-3.5 rounded-lg border border-[#EAEAEA] dark:border-[#232734] bg-[#FBFBFA] dark:bg-[#10121A] flex items-start gap-2.5">
            <FileText className="w-4 h-4 text-[#1F6C9F] dark:text-[#70B8FF] mt-0.5 shrink-0" />
            <div>
              <h4 className="font-bold text-xs text-[#111111] dark:text-[#F4F4F6]">
                {language === LanguageCode.HI ? '२. पुराने पर्चे और लैब रिपोर्ट OCR' : '2. Document OCR & Digitization'}
              </h4>
              <p className="text-[11px] text-[#787774] dark:text-[#8E94A4] mt-0.5 leading-relaxed">
                {language === LanguageCode.HI
                  ? 'अपलोड किए गए पुराने पर्चों से दवाइयों और जांचों का सारांश बनेगा।'
                  : 'Prior physical reports will be digitized into a chronological timeline.'}
              </p>
            </div>
          </div>

          {/* Scope 3 */}
          <div className="p-3.5 rounded-lg border border-[#EAEAEA] dark:border-[#232734] bg-[#FBFBFA] dark:bg-[#10121A] flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-[#956400] dark:text-[#FDE047] mt-0.5 shrink-0" />
            <div>
              <h4 className="font-bold text-xs text-[#111111] dark:text-[#F4F4F6]">
                {language === LanguageCode.HI ? '३. डॉक्टर सत्यापन अनिवार्य है' : '3. Mandatory Physician Review'}
              </h4>
              <p className="text-[11px] text-[#787774] dark:text-[#8E94A4] mt-0.5 leading-relaxed">
                {language === LanguageCode.HI
                  ? 'यह सॉफ्टवेयर डॉक्टर का विकल्प नहीं है। डॉक्टर सभी जानकारी की जांच करेंगे।'
                  : 'AI does not autonomously diagnose; your physician verifies all clinical facts.'}
              </p>
            </div>
          </div>

          {/* Scope 4 */}
          <div className="p-3.5 rounded-lg border border-[#EAEAEA] dark:border-[#232734] bg-[#FBFBFA] dark:bg-[#10121A] flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#1F6C9F] dark:text-[#70B8FF] mt-0.5 shrink-0" />
            <div>
              <h4 className="font-bold text-xs text-[#111111] dark:text-[#F4F4F6]">
                {language === LanguageCode.HI ? '४. आभा / आयुष्मान भारत डिजिटल मिशन' : '4. ABHA / ABDM Interoperability'}
              </h4>
              <p className="text-[11px] text-[#787774] dark:text-[#8E94A4] mt-0.5 leading-relaxed">
                {language === LanguageCode.HI
                  ? 'सत्यापित पर्चा आपके आभा रिकॉर्ड में सुरक्षित रूप से जोड़ा जा सकता है।'
                  : 'Verified summary can be linked to your ABHA health record upon physician sign-off.'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-3 bg-[#FBFBFA] dark:bg-[#10121A] border border-[#EAEAEA] dark:border-[#232734] rounded-lg text-[11px] text-[#787774] dark:text-[#8E94A4] leading-relaxed">
          {language === LanguageCode.HI
            ? 'सूचना: आप किसी भी समय अपनी सहमति वापस ले सकते हैं। आपका डेटा एन्क्रिप्टेड और सुरक्षित रखा जाता है।'
            : 'Notice: You may revoke consent at any time. All data is AES-256 encrypted and handled in compliance with DPDP Act & ABDM policies.'}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-auto">
        <button
          type="button"
          onClick={onConsentDenied}
          className="py-3 px-4 rounded-lg border border-[#EAEAEA] dark:border-[#232734] bg-[#FFFFFF] dark:bg-[#141720] text-[#666666] dark:text-[#8E94A4] font-medium text-xs hover:bg-[#F7F6F3] dark:hover:bg-[#1A1D27] transition-all"
        >
          <span>{language === LanguageCode.HI ? 'असहमत / रद्द करें' : 'Decline / Cancel'}</span>
        </button>

        <button
          type="button"
          disabled={isSubmitting}
          onClick={handleAgree}
          className="py-3 px-4 rounded-lg bg-[#111111] dark:bg-[#F4F4F6] text-[#FFFFFF] dark:text-[#0D0F14] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <span>{language === LanguageCode.HI ? 'हाँ, मैं सहमत हूँ (आगे बढ़ें)' : 'I Agree & Proceed'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
