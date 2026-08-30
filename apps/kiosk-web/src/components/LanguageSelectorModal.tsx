import React, { useState } from 'react';
import { X, Search, Globe, Volume2, Sparkles, Check } from 'lucide-react';
import { LanguageCode, INDIC_LANGUAGES, IndicLanguageInfo } from '@medikiosk/shared-types';

interface LanguageSelectorModalProps {
  currentLanguage: LanguageCode;
  onSelectLanguage: (lang: LanguageCode) => void;
  onClose: () => void;
  isLightMode?: boolean;
}

export const LanguageSelectorModal: React.FC<LanguageSelectorModalProps> = ({
  currentLanguage,
  onSelectLanguage,
  onClose,
  isLightMode = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [previewingCode, setPreviewingCode] = useState<string | null>(null);

  const filteredLanguages = INDIC_LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAudioPreview = (e: React.MouseEvent, lang: IndicLanguageInfo) => {
    e.stopPropagation();
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const sampleText =
      lang.code === LanguageCode.HI
        ? 'अखिल भारतीय आयुर्वेद संस्थान में आपका स्वागत है।'
        : lang.code === LanguageCode.BN
        ? 'অল ইন্ডিয়া ইনস্টিটিউট অফ আয়ুর্বেদে আপনাকে স্বাগতম।'
        : lang.code === LanguageCode.TA
        ? 'அகில இந்திய ஆயுர்வேத நிறுவனத்திற்கு வரவேற்கிறோம்.'
        : lang.code === LanguageCode.TE
        ? 'ఆల్ ఇండియా ఇన్స్టిట్యూట్ ఆఫ్ ఆయుర్వేదకు స్వాగతం.'
        : lang.code === LanguageCode.MR
        ? 'अखिल भारतीय आयुर्वेद संस्थेमध्ये आपले स्वागत आहे.'
        : lang.code === LanguageCode.GU
        ? 'ઓલ ઇન્ડિયા ઇન્સ્ટિટ્યૂટ ઓફ આયુર્વેદમાં આપનું સ્વાગત છે.'
        : `Welcome to All India Institute of Ayurveda in ${lang.name}.`;

    const utterance = new SpeechSynthesisUtterance(sampleText);
    utterance.lang = lang.speechTag;
    utterance.rate = 0.95;

    utterance.onstart = () => setPreviewingCode(lang.code);
    utterance.onend = () => setPreviewingCode(null);
    utterance.onerror = () => setPreviewingCode(null);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-md animate-fade-in">
      <div
        className={`w-full max-w-3xl rounded-2xl border shadow-2xl flex flex-col max-h-[90vh] overflow-hidden ${
          isLightMode
            ? 'bg-[#FFFFFF] border-[#EAEAEA] text-[#111111]'
            : 'bg-[#12151E] border-[#232734] text-[#F4F4F6]'
        }`}
      >
        {/* Modal Header */}
        <div
          className={`p-4 sm:p-5 border-b flex items-center justify-between gap-4 ${
            isLightMode ? 'border-[#EAEAEA] bg-[#F7F6F3]' : 'border-[#232734] bg-[#181C28]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1F6C9F]/15 border border-[#1F6C9F]/30 flex items-center justify-center text-[#1F6C9F] dark:text-[#70B8FF]">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold">22 Official Indian Languages</h3>
                <span className="tag-pastel-blue px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> Bhashini / AI4Bharat
                </span>
              </div>
              <p className="text-xs text-[#666666] dark:text-[#8E94A4]">
                Select your preferred regional language for conversational voice & touch intake
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-lg border transition-colors ${
              isLightMode
                ? 'border-[#EAEAEA] hover:bg-[#EAEAEA] text-[#666666]'
                : 'border-[#232734] hover:bg-[#1E222D] text-[#8E94A4]'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div
          className={`p-3 sm:p-4 border-b ${
            isLightMode ? 'border-[#EAEAEA] bg-[#FFFFFF]' : 'border-[#232734] bg-[#141720]'
          }`}
        >
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888888]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by language name, native script, or state (e.g. Bengali, বাংলা, Tamil, मराठी)..."
              className={`w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border outline-none transition-all ${
                isLightMode
                  ? 'border-[#EAEAEA] bg-[#F7F6F3] focus:border-[#1F6C9F] text-[#111111]'
                  : 'border-[#232734] bg-[#181C28] focus:border-[#70B8FF] text-[#F4F4F6]'
              }`}
            />
          </div>
        </div>

        {/* Language Grid */}
        <div className="p-3 sm:p-5 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3">
          {filteredLanguages.map((lang) => {
            const isSelected = currentLanguage === lang.code;
            const isPreviewing = previewingCode === lang.code;

            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  onSelectLanguage(lang.code);
                  onClose();
                }}
                className={`p-3 rounded-xl border text-left flex items-center justify-between gap-2.5 transition-all active:scale-[0.98] cursor-pointer group ${
                  isSelected
                    ? isLightMode
                      ? 'border-[#1F6C9F] bg-[#1F6C9F]/10 ring-1 ring-[#1F6C9F]'
                      : 'border-[#70B8FF] bg-[#70B8FF]/15 ring-1 ring-[#70B8FF]'
                    : isLightMode
                    ? 'border-[#EAEAEA] bg-[#FFFFFF] hover:border-[#111111] hover:bg-[#F7F6F3]'
                    : 'border-[#232734] bg-[#141720] hover:border-[#F4F4F6] hover:bg-[#181C28]'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-sm font-bold truncate">{lang.nativeName}</span>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-[#1F6C9F] dark:text-[#70B8FF] shrink-0" />
                    )}
                  </div>
                  <div className="text-xs text-[#666666] dark:text-[#8E94A4] flex items-center gap-1.5">
                    <span className="font-medium">{lang.name}</span>
                    <span>•</span>
                    <span className="text-[10px] font-mono text-[#888888] dark:text-[#687082] truncate">
                      {lang.region}
                    </span>
                  </div>
                </div>

                {/* Voice Preview Button */}
                <button
                  type="button"
                  onClick={(e) => handleAudioPreview(e, lang)}
                  title={`Preview ${lang.name} Speech`}
                  className={`p-2 rounded-lg border shrink-0 transition-colors ${
                    isPreviewing
                      ? 'bg-amber-500/20 border-amber-500 text-amber-500 animate-pulse'
                      : isLightMode
                      ? 'border-[#EAEAEA] hover:bg-[#EAEAEA] text-[#666666]'
                      : 'border-[#232734] hover:bg-[#1E222D] text-[#8E94A4]'
                  }`}
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </button>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div
          className={`p-3 sm:p-4 border-t flex flex-wrap items-center justify-between gap-2 text-xs ${
            isLightMode ? 'border-[#EAEAEA] bg-[#F7F6F3]' : 'border-[#232734] bg-[#181C28]'
          }`}
        >
          <div className="text-[11px] text-[#666666] dark:text-[#8E94A4] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Multimodal ASR + IndicTTS Voice Guidance Enabled</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#111111] dark:bg-[#F4F4F6] text-white dark:text-black font-semibold text-xs transition-opacity hover:opacity-90"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
