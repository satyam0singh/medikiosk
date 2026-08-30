import React, { useState } from 'react';
import { ArrowRight, HeartPulse, CheckCircle2, ShieldCheck, Globe, Sparkles } from 'lucide-react';
import { LanguageCode } from '@medikiosk/shared-types';
import { AudioPromptButton } from '../AudioPromptButton';
import { LanguageSelectorModal } from '../LanguageSelectorModal';

interface WelcomeScreenProps {
  onSelectLanguage: (lang: LanguageCode) => void;
  isLightMode?: boolean;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSelectLanguage, isLightMode = false }) => {
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const welcomeText =
    'Welcome to MediKiosk at All India Institute of Ayurveda. Please touch your preferred language to begin your OPD check-in.';

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-2 sm:p-6 text-center max-w-3xl mx-auto w-full my-auto">
      {/* Category Eyebrow */}
      <div className="mb-3 sm:mb-4">
        <span className="tag-pastel-blue px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest inline-block">
          Ministry of Ayush • OPD Case Intake
        </span>
      </div>

      <h2 className="text-2xl sm:text-4xl font-serif tracking-tight leading-tight mb-2 sm:mb-3 text-[#111111] dark:text-[#F4F4F6]">
        स्वागतम् • Welcome to AIIA
      </h2>
      <p className="text-xs sm:text-sm text-[#666666] dark:text-[#8E94A4] max-w-lg mb-4 sm:mb-5 leading-relaxed px-2">
        डॉक्टर से परामर्श से पहले अपनी स्वास्थ्य जानकारी और पुराने पर्चे यहाँ दर्ज करें।
        <br />
        <span className="text-[11px] sm:text-xs text-[#888888] dark:text-[#687082]">
          Pre-consultation clinical intake and document structuring before your doctor visit.
        </span>
      </p>

      {/* Audio Button */}
      <div className="mb-4 sm:mb-6">
        <AudioPromptButton text={welcomeText} language={LanguageCode.EN} size="md" />
      </div>

      {/* Dynamic Bento Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 w-full max-w-lg mb-3 px-2">
        {/* Hindi Card */}
        <button
          type="button"
          onClick={() => onSelectLanguage(LanguageCode.HI)}
          className="p-5 sm:p-6 rounded-xl border border-[#EAEAEA] dark:border-[#232734] bg-[#FFFFFF] dark:bg-[#141720] hover:border-[#111111] dark:hover:border-[#F4F4F6] flex flex-col items-center text-center transition-all duration-150 active:scale-[0.98] group shadow-xs cursor-pointer min-h-[140px] justify-between"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-[#F7F6F3] dark:bg-[#1E222D] border border-[#EAEAEA] dark:border-[#2D3242] flex items-center justify-center text-base sm:text-lg font-serif mb-2 text-[#111111] dark:text-[#F4F4F6]">
            अ
          </div>
          <div className="mb-3">
            <h3 className="text-sm sm:text-base font-bold text-[#111111] dark:text-[#F4F4F6] mb-0.5">हिंदी में शुरू करें</h3>
            <p className="text-[11px] sm:text-xs text-[#787774] dark:text-[#8E94A4]">बोलकर या टच करके उत्तर दें</p>
          </div>
          <div className="w-full py-2.5 min-h-[40px] bg-[#111111] dark:bg-[#F4F4F6] text-[#FFFFFF] dark:text-[#0D0F14] rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors">
            <span>आगे बढ़ें</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </button>

        {/* English Card */}
        <button
          type="button"
          onClick={() => onSelectLanguage(LanguageCode.EN)}
          className="p-5 sm:p-6 rounded-xl border border-[#EAEAEA] dark:border-[#232734] bg-[#FFFFFF] dark:bg-[#141720] hover:border-[#111111] dark:hover:border-[#F4F4F6] flex flex-col items-center text-center transition-all duration-150 active:scale-[0.98] group shadow-xs cursor-pointer min-h-[140px] justify-between"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-[#F7F6F3] dark:bg-[#1E222D] border border-[#EAEAEA] dark:border-[#2D3242] flex items-center justify-center text-base sm:text-lg font-mono mb-2 text-[#111111] dark:text-[#F4F4F6]">
            A
          </div>
          <div className="mb-3">
            <h3 className="text-sm sm:text-base font-bold text-[#111111] dark:text-[#F4F4F6] mb-0.5">Start in English</h3>
            <p className="text-[11px] sm:text-xs text-[#787774] dark:text-[#8E94A4]">Answer via voice or touch</p>
          </div>
          <div className="w-full py-2.5 min-h-[40px] bg-[#111111] dark:bg-[#F4F4F6] text-[#FFFFFF] dark:text-[#0D0F14] rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors">
            <span>Proceed</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </button>
      </div>

      {/* 22 Regional Languages Trigger Button */}
      <div className="w-full max-w-lg mb-6 px-2">
        <button
          type="button"
          onClick={() => setShowLanguageModal(true)}
          className="w-full p-3.5 rounded-xl border border-[#1F6C9F]/30 dark:border-[#70B8FF]/30 bg-[#1F6C9F]/5 dark:bg-[#70B8FF]/5 hover:bg-[#1F6C9F]/10 dark:hover:bg-[#70B8FF]/10 flex items-center justify-between gap-3 text-left transition-all active:scale-[0.99] cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#1F6C9F]/15 border border-[#1F6C9F]/30 flex items-center justify-center text-[#1F6C9F] dark:text-[#70B8FF]">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-[#111111] dark:text-[#F4F4F6]">
                  22 Regional Indian Languages
                </span>
                <span className="tag-pastel-blue px-1.5 py-0.2 rounded text-[9px] font-mono uppercase flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> AI4Bharat
                </span>
              </div>
              <p className="text-[11px] text-[#666666] dark:text-[#8E94A4]">
                বাংলা, தமிழ், తెలుగు, मराठी, ગુજરાતી, ಕನ್ನಡ, മലയാളം, ਪੰਜਾਬੀ...
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#1F6C9F] dark:text-[#70B8FF] group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Safety Badges Footer */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-xs text-[#787774] dark:text-[#8E94A4] border-t border-[#EAEAEA] dark:border-[#232734] pt-4 w-full px-2">
        <div className="flex items-center gap-1 font-mono text-[10px] sm:text-[11px]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#1F6C9F] dark:text-[#70B8FF]" />
          <span>ABHA / ABDM Linked</span>
        </div>
        <div className="flex items-center gap-1 font-mono text-[10px] sm:text-[11px]">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#346538] dark:text-[#6EE787]" />
          <span>Doctor Verification Mandatory</span>
        </div>
        <div className="flex items-center gap-1 font-mono text-[10px] sm:text-[11px]">
          <HeartPulse className="w-3.5 h-3.5 text-[#9F2F2D] dark:text-[#FCA5A5]" />
          <span>Deterministic Triage</span>
        </div>
      </div>

      {/* Language Selector Modal */}
      {showLanguageModal && (
        <LanguageSelectorModal
          currentLanguage={LanguageCode.EN}
          onSelectLanguage={onSelectLanguage}
          onClose={() => setShowLanguageModal(false)}
          isLightMode={isLightMode}
        />
      )}
    </div>
  );
};

