import React from 'react';
import { Heart, Flame, Wind, Activity, Bone, Sparkles, Mic, ArrowRight } from 'lucide-react';
import { LanguageCode } from '@medikiosk/shared-types';
import { AudioPromptButton } from '../AudioPromptButton';
import { getTranslation } from '../../utils/translations';

interface ChiefComplaintScreenProps {
  language: LanguageCode;
  onSelectComplaint: (complaintKey: string, complaintLabel: string) => void;
}

export const ChiefComplaintScreen: React.FC<ChiefComplaintScreenProps> = ({
  language,
  onSelectComplaint,
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
      {/* Title & Audio Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3 border-b border-[#EAEAEA] dark:border-[#232734] pb-3 shrink-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111111] dark:text-[#F4F4F6]">
            {t.complaint_title}
          </h2>
          <p className="text-xs text-[#787774] dark:text-[#8E94A4] mt-0.5">
            {t.complaint_subtitle}
          </p>
        </div>
        <AudioPromptButton text={t.audio_complaint} language={language} size="md" />
      </div>

      {/* Grid of Dynamic Bento Symptom Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 mb-4">
        {COMPLAINT_CARDS.map((card) => {
          const Icon = card.icon;

          return (
            <button
              key={card.key}
              type="button"
              onClick={() => onSelectComplaint(card.key, card.label)}
              className="p-4 sm:p-4.5 min-h-[96px] rounded-xl border border-[#EAEAEA] dark:border-[#232734] bg-[#FFFFFF] dark:bg-[#141720] hover:border-[#111111] dark:hover:border-[#F4F4F6] flex flex-col items-start justify-between text-left transition-all duration-150 active:scale-[0.98] group cursor-pointer shadow-xs"
            >
              <div className="flex items-center justify-between w-full mb-2">
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

      {/* Voice Assistant Shortcut */}
      <div className="mt-auto p-3 sm:p-3.5 rounded-xl border border-[#EAEAEA] dark:border-[#232734] bg-[#F7F6F3] dark:bg-[#141720] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#111111] dark:bg-[#F4F4F6] text-[#FFFFFF] dark:text-[#0D0F14] flex items-center justify-center">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#111111] dark:text-[#F4F4F6]">
              {t.speak_answer}
            </h4>
            <p className="text-[11px] text-[#787774] dark:text-[#8E94A4]">
              {t.listening}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onSelectComplaint('general_voice', t.speak_answer)}
          className="w-full sm:w-auto px-3.5 py-2 min-h-[40px] bg-[#111111] dark:bg-[#F4F4F6] text-[#FFFFFF] dark:text-[#0D0F14] rounded-md text-xs font-medium flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer shrink-0"
        >
          <Mic className="w-3.5 h-3.5" />
          <span>{t.speak_answer}</span>
        </button>
      </div>
    </div>
  );
};

