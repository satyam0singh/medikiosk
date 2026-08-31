import React from 'react';
import { Heart, Flame, Wind, Activity, Bone, Sparkles, Mic, ArrowRight, ArrowLeft } from 'lucide-react';
import { LanguageCode } from '@medikiosk/shared-types';
import { AudioPromptButton } from '../AudioPromptButton';
import { getTranslation } from '../../utils/translations';

interface ChiefComplaintScreenProps {
  language: LanguageCode;
  onSelectComplaint: (complaintKey: string, complaintLabel: string) => void;
  onOpenVoiceIntake?: () => void;
  onBack?: () => void;
}

export const ChiefComplaintScreen: React.FC<ChiefComplaintScreenProps> = ({
  language,
  onSelectComplaint,
  onOpenVoiceIntake,
  onBack,
}) => {
  const t = getTranslation(language);

  const COMPLAINT_CARDS = [
    {
      key: 'chest_pain',
      icon: Heart,
      label: t.chest_pain,
      sub: 'Pressure, burning, tightness, breathlessness',
      tagClass: 'tag-pastel-red',
    },
    {
      key: 'fever',
      icon: Flame,
      label: t.fever,
      sub: 'High temperature, body ache, shivering',
      tagClass: 'tag-pastel-yellow',
    },
    {
      key: 'abdominal_pain',
      icon: Activity,
      label: t.digestive,
      sub: 'Cramps, acidity, nausea, vomiting',
      tagClass: 'tag-pastel-green',
    },
    {
      key: 'joint_pain',
      icon: Bone,
      label: t.joint_pain,
      sub: 'Knee, back, neck pain, stiffness',
      tagClass: 'tag-pastel-yellow',
    },
    {
      key: 'skin',
      icon: Wind,
      label: t.skin,
      sub: 'Rash, allergic reactions, itching',
      tagClass: 'tag-pastel-blue',
    },
    {
      key: 'ayush_assessment',
      icon: Sparkles,
      label: t.general_checkup,
      sub: 'Tridosha balance, Agni, Ahara-Vihara',
      tagClass: 'tag-pastel-green',
    },
  ];

  return (
    <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full py-2 px-1 sm:px-4 justify-between">
      {/* Title & Audio Header with Back Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2 border-b border-[#EAEAEA] dark:border-[#232734] pb-2.5 shrink-0">
        <div className="flex items-center gap-2.5">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              title={language === LanguageCode.HI ? 'वापस जाएं' : 'Go Back'}
              className="p-2 rounded-xl border border-[#EAEAEA] dark:border-[#232734] bg-[#FFFFFF] dark:bg-[#141720] text-[#111111] dark:text-[#F4F4F6] hover:bg-[#F7F6F3] dark:hover:bg-[#1A1D27] active:scale-95 transition-all cursor-pointer shrink-0 shadow-xs flex items-center gap-1 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{language === LanguageCode.HI ? 'वापस' : 'Back'}</span>
            </button>
          )}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111111] dark:text-[#F4F4F6]">
              {t.complaint_title}
            </h2>
            <p className="text-xs text-[#787774] dark:text-[#8E94A4] mt-0.5">
              {t.complaint_subtitle}
            </p>
          </div>
        </div>
        <AudioPromptButton text={t.audio_complaint} language={language} size="md" />
      </div>

      {/* Hero Multilingual Voice Intake Banner */}
      <div className="mb-3 p-3.5 sm:p-4 rounded-xl border-2 border-[#1F6C9F]/30 bg-gradient-to-r from-[#1F6C9F]/10 via-[#1F6C9F]/5 to-transparent flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#111111] dark:bg-[#F4F4F6] text-[#FFFFFF] dark:text-[#0D0F14] flex items-center justify-center shrink-0 shadow-sm relative">
            <Mic className="w-5 h-5" />
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full absolute -top-0.5 -right-0.5 border-2 border-white dark:border-[#12151E] animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-[#111111] dark:text-[#F4F4F6]">
                {language === LanguageCode.HI
                  ? 'अपनी भाषा में बोलें (Hindi, English, Hinglish)'
                  : 'Speak Verbally in Your Native Language'}
              </h3>
              <span className="tag-pastel-blue px-1.5 py-0.2 rounded text-[9px] font-mono font-bold flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                <span>AI Real-Time ASR</span>
              </span>
            </div>
            <p className="text-[11px] text-[#787774] dark:text-[#8E94A4] mt-0.5">
              {language === LanguageCode.HI
                ? 'माइक में बोलें — आपकी बात सीधे रियल-टाइम में टेक्स्ट और डॉक्टर समरी में बदलेगी।'
                : 'Real-time multilingual transcription dynamically aligned to AI Doctor summary.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenVoiceIntake || (() => onSelectComplaint('general_voice', t.speak_answer))}
          className="w-full sm:w-auto px-4 py-2.5 min-h-[42px] bg-[#111111] dark:bg-[#F4F4F6] text-[#FFFFFF] dark:text-[#0D0F14] rounded-lg text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer shadow-sm shrink-0"
        >
          <Mic className="w-4 h-4 text-red-400" />
          <span>
            {language === LanguageCode.HI ? 'बोलकर बताएं (Tap to Speak)' : 'Start Voice Intake (Speak)'}
          </span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-2 mb-2.5">
        <div className="flex-1 h-px bg-[#EAEAEA] dark:border-[#232734]" />
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#888888]">
          {language === LanguageCode.HI ? 'या श्रेणी चुनें' : 'Or Choose Symptom Category'}
        </span>
        <div className="flex-1 h-px bg-[#EAEAEA] dark:border-[#232734]" />
      </div>

      {/* Grid of Dynamic Bento Symptom Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 mb-2">
        {COMPLAINT_CARDS.map((card) => {
          const Icon = card.icon;

          return (
            <button
              key={card.key}
              type="button"
              onClick={() => onSelectComplaint(card.key, card.label)}
              className="p-3.5 sm:p-4 min-h-[92px] rounded-xl border border-[#EAEAEA] dark:border-[#232734] bg-[#FFFFFF] dark:bg-[#141720] hover:border-[#111111] dark:hover:border-[#F4F4F6] flex flex-col items-start justify-between text-left transition-all duration-150 active:scale-[0.98] group cursor-pointer shadow-xs"
            >
              <div className="flex items-center justify-between w-full mb-1.5">
                <div className={`p-1.5 sm:p-2 rounded-md ${card.tagClass}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-[#999999] group-hover:text-[#111111] dark:group-hover:text-[#F4F4F6] transition-colors">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-[#111111] dark:text-[#F4F4F6] mb-0.5 leading-snug">
                  {card.label}
                </h3>
                <p className="text-[10px] sm:text-[11px] text-[#787774] dark:text-[#8E94A4] leading-tight line-clamp-2">
                  {card.sub}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
