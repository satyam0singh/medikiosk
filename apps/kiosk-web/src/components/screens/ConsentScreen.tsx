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
      alert(`Consent recording failed: ${(err as Error).message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-teal-400" />
            <span>{language === LanguageCode.HI ? 'सूचित डिजिटल सहमति' : 'Informed Digital Consent'}</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {language === LanguageCode.HI
              ? `मरीज: ${patient.fullName} (आयु: ${patient.age || 'N/A'}, लिंग: ${patient.gender})`
              : `Patient: ${patient.fullName} (Age: ${patient.age || 'N/A'}, Gender: ${patient.gender})`}
          </p>
        </div>
        <AudioPromptButton text={consentPrompt} language={language} />
      </div>

      {/* Main Consent Explanation Card */}
      <div className="bg-slate-850 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl mb-8 space-y-6">
        <div className="flex items-center gap-3 text-teal-400 font-bold text-lg">
          <Lock className="w-6 h-6" />
          <span>{language === LanguageCode.HI ? 'डेटा सुरक्षा और उपयोग की शर्तें:' : 'Data Privacy & Clinical Use Terms:'}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Scope 1 */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-bold text-white text-sm">
                {language === LanguageCode.HI ? '१. आवाज और टच द्वारा केस-टेकिंग' : '1. Voice & Touch Case-Taking'}
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {language === LanguageCode.HI
                  ? 'आपकी मुख्य तकलीफ और लक्षण डॉक्टर के लिए संरचित किए जाएंगे।'
                  : 'Your reported symptoms will be structured for your treating physician.'}
              </p>
            </div>
          </div>

          {/* Scope 2 */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-start gap-3">
            <FileText className="w-5 h-5 text-teal-400 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-bold text-white text-sm">
                {language === LanguageCode.HI ? '२. पुराने पर्चे और लैब रिपोर्ट OCR' : '2. Document OCR & Digitization'}
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {language === LanguageCode.HI
                  ? 'अपलोड किए गए पुराने पर्चों से दवाइयों और जांचों का सारांश बनेगा।'
                  : 'Prior physical reports will be digitized into a chronological timeline.'}
              </p>
            </div>
          </div>

          {/* Scope 3 */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-bold text-white text-sm">
                {language === LanguageCode.HI ? '३. डॉक्टर सत्यापन अनिवार्य है' : '3. Mandatory Physician Review'}
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {language === LanguageCode.HI
                  ? 'यह सॉफ्टवेयर डॉक्टर का विकल्प नहीं है। डॉक्टर सभी जानकारी की जांच करेंगे।'
                  : 'AI does not autonomously diagnose; your physician verifies all clinical facts.'}
              </p>
            </div>
          </div>

          {/* Scope 4 */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-indigo-400 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-bold text-white text-sm">
                {language === LanguageCode.HI ? '४. आभा / आयुष्मान भारत डिजिटल मिशन' : '4. ABHA / ABDM Interoperability'}
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {language === LanguageCode.HI
                  ? 'सत्यापित पर्चा आपके आभा रिकॉर्ड में सुरक्षित रूप से जोड़ा जा सकता है।'
                  : 'Verified summary can be linked to your ABHA health record upon physician sign-off.'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-teal-500/10 border border-teal-500/20 rounded-2xl text-xs text-teal-300 leading-relaxed">
          {language === LanguageCode.HI
            ? 'सूचना: आप किसी भी समय अपनी सहमति वापस ले सकते हैं। आपका डेटा एन्क्रिप्टेड और सुरक्षित रखा जाता है।'
            : 'Notice: You may revoke consent at any time. All data is AES-256 encrypted and handled in compliance with DPDP Act & ABDM policies.'}
        </div>
      </div>

      {/* Touch Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-auto">
        <button
          type="button"
          onClick={onConsentDenied}
          className="kiosk-btn bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
        >
          <span>{language === LanguageCode.HI ? 'असहमत / रद्द करें' : 'Decline / Cancel'}</span>
        </button>

        <button
          type="button"
          disabled={isSubmitting}
          onClick={handleAgree}
          className="kiosk-btn bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-lg shadow-emerald-500/20"
        >
          <span>{language === LanguageCode.HI ? 'हाँ, मैं सहमत हूँ (आगे बढ़ें)' : 'I Agree & Proceed'}</span>
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
