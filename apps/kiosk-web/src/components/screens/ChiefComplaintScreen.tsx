import React from 'react';
import { Heart, Flame, Wind, Activity, Bone, Sparkles, Mic, ArrowRight } from 'lucide-react';
import { LanguageCode } from '@medikiosk/shared-types';
import { AudioPromptButton } from '../AudioPromptButton';

interface ChiefComplaintScreenProps {
  language: LanguageCode;
  onSelectComplaint: (complaintKey: string, complaintLabel: string) => void;
}

interface ComplaintOption {
  key: string;
  icon: React.ElementType;
  labelEn: string;
  labelHi: string;
  subEn: string;
  subHi: string;
  tagClass: string;
}

const COMPLAINT_CARDS: ComplaintOption[] = [
  {
    key: 'chest_pain',
    icon: Heart,
    labelEn: 'Chest Pain / Discomfort',
    labelHi: 'सीने में दर्द या भारीपन',
    subEn: 'Pressure, burning, tightness, breathlessness',
    subHi: 'दबाव, जलन, जकड़न, सांस फूलना',
    tagClass: 'tag-pastel-red',
  },
  {
    key: 'fever',
    icon: Flame,
    labelEn: 'Fever & Chills',
    labelHi: 'बुखार या कंपकंपी',
    subEn: 'High temperature, body ache, shivering',
    subHi: 'तेज तापमान, बदन दर्द, ठंड लगना',
    tagClass: 'tag-pastel-yellow',
  },
  {
    key: 'abdominal_pain',
    icon: Activity,
    labelEn: 'Stomach Pain & Acidity',
    labelHi: 'पेट दर्द या गैस / अपच',
    subEn: 'Cramps, acidity, nausea, vomiting',
    subHi: 'मरोड़, खट्टी डकार, उल्टी का मन',
    tagClass: 'tag-pastel-green',
  },
  {
    key: 'cough_breathlessness',
    icon: Wind,
    labelEn: 'Cough & Breathing Issue',
    labelHi: 'खांसी या सांस की तकलीफ',
    subEn: 'Dry/wet cough, wheezing, throat pain',
    subHi: 'सूखी/बलगम वाली खांसी, गले में खराश',
    tagClass: 'tag-pastel-blue',
  },
  {
    key: 'joint_pain',
    icon: Bone,
    labelEn: 'Joint & Muscle Pain',
    labelHi: 'जोड़ों या मांसपेशियों में दर्द',
    subEn: 'Knee, back, neck pain, stiffness',
    subHi: 'घुटनों, कमर, गर्दन का दर्द, जकड़न',
    tagClass: 'tag-pastel-yellow',
  },
  {
    key: 'ayush_assessment',
    icon: Sparkles,
    labelEn: 'AYUSH Holistic & Prakriti',
    labelHi: 'आयुष प्रकृति एवं समग्र स्वास्थ्य',
    subEn: 'Tridosha balance, Agni, Ahara-Vihara',
    subHi: 'वात-पित्त-कफ, अग्नि, आहार-विहार',
    tagClass: 'tag-pastel-green',
  },
];

export const ChiefComplaintScreen: React.FC<ChiefComplaintScreenProps> = ({
  language,
  onSelectComplaint,
}) => {
  const promptText =
    language === LanguageCode.HI
      ? 'आज अस्पताल आने का आपका मुख्य कारण क्या है? नीचे दिए गए विकल्पों में से अपनी मुख्य तकलीफ चुनें या बोलकर बताएं।'
      : 'What is the main problem bringing you to the hospital today? Touch a symptom card or speak.';

  return (
    <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full py-2 px-1 sm:px-4 justify-between">
      {/* Title & Audio Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3 border-b border-[#EAEAEA] dark:border-[#232734] pb-3 shrink-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111111] dark:text-[#F4F4F6]">
            {language === LanguageCode.HI ? 'मुख्य तकलीफ चुनें' : 'Select Chief Complaint'}
          </h2>
          <p className="text-xs text-[#787774] dark:text-[#8E94A4] mt-0.5">
            {language === LanguageCode.HI
              ? 'आप जिस समस्या के लिए डॉक्टर को दिखाने आए हैं, उस पर टच करें'
              : 'Touch the card that best describes your primary health concern'}
          </p>
        </div>
        <AudioPromptButton text={promptText} language={language} size="md" />
      </div>

      {/* Grid of Dynamic Bento Symptom Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 mb-4">
        {COMPLAINT_CARDS.map((card) => {
          const Icon = card.icon;
          const label = language === LanguageCode.HI ? card.labelHi : card.labelEn;
          const sub = language === LanguageCode.HI ? card.subHi : card.subEn;

          return (
            <button
              key={card.key}
              type="button"
              onClick={() => onSelectComplaint(card.key, label)}
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
                  {label}
                </h3>
                <p className="text-[10px] sm:text-[11px] text-[#787774] dark:text-[#8E94A4] leading-tight line-clamp-2">
                  {sub}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Voice Assistant Shortcut with Comfortable Touch Target */}
      <div className="mt-auto p-3 sm:p-3.5 rounded-xl border border-[#EAEAEA] dark:border-[#232734] bg-[#F7F6F3] dark:bg-[#141720] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-8 h-8 rounded-lg bg-[#FFFFFF] dark:bg-[#1E222D] border border-[#EAEAEA] dark:border-[#2D3242] flex items-center justify-center text-[#111111] dark:text-[#F4F4F6] shrink-0">
            <Mic className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-[#111111] dark:text-[#F4F4F6] truncate">
              {language === LanguageCode.HI ? 'बोलकर तकलीफ बताना चाहते हैं?' : 'Prefer speaking your symptoms?'}
            </h4>
            <p className="text-[11px] text-[#787774] dark:text-[#8E94A4] truncate">
              {language === LanguageCode.HI ? 'माइक पर बोलें: "कल रात से सीने में दर्द है"' : 'Say clearly: "Chest pain since yesterday"'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() =>
            onSelectComplaint(
              'chest_pain',
              language === LanguageCode.HI ? 'सीने में दर्द या भारीपन' : 'Chest Pain / Discomfort'
            )
          }
          className="w-full sm:w-auto px-3.5 py-2 min-h-[40px] bg-[#111111] dark:bg-[#F4F4F6] text-[#FFFFFF] dark:text-[#0D0F14] rounded-md text-xs font-medium flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer shrink-0"
        >
          <Mic className="w-3.5 h-3.5" />
          <span>{language === LanguageCode.HI ? 'आवाज से चुनें' : 'Simulate Voice'}</span>
        </button>
      </div>
    </div>
  );
};
