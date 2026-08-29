import React from 'react';
import { Heart, Flame, Wind, Activity, Bone, Sparkles, Mic } from 'lucide-react';
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
  color: string;
}

const COMPLAINT_CARDS: ComplaintOption[] = [
  {
    key: 'chest_pain',
    icon: Heart,
    labelEn: 'Chest Pain / Discomfort',
    labelHi: 'सीने में दर्द या भारीपन',
    subEn: 'Pressure, burning, tightness, breathlessness',
    subHi: 'दबाव, जलन, जकड़न, सांस फूलना',
    color: 'from-rose-500/20 to-red-500/10 border-rose-500/40 hover:border-rose-400 text-rose-400',
  },
  {
    key: 'fever',
    icon: Flame,
    labelEn: 'Fever & Chills',
    labelHi: 'बुखार या कंपकंपी',
    subEn: 'High temperature, body ache, shivering',
    subHi: 'तेज तापमान, बदन दर्द, ठंड लगना',
    color: 'from-amber-500/20 to-orange-500/10 border-amber-500/40 hover:border-amber-400 text-amber-400',
  },
  {
    key: 'abdominal_pain',
    icon: Activity,
    labelEn: 'Stomach Pain & Acidity',
    labelHi: 'पेट दर्द या गैस / अपच',
    subEn: 'Cramps, acidity, nausea, vomiting',
    subHi: 'मरोड़, खट्टी डकार, उल्टी का मन',
    color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/40 hover:border-emerald-400 text-emerald-400',
  },
  {
    key: 'cough_breathlessness',
    icon: Wind,
    labelEn: 'Cough & Breathing Issue',
    labelHi: 'खांसी या सांस की तकलीफ',
    subEn: 'Dry/wet cough, wheezing, throat pain',
    subHi: 'सूखी/बलगम वाली खांसी, गले में खराश',
    color: 'from-sky-500/20 to-blue-500/10 border-sky-500/40 hover:border-sky-400 text-sky-400',
  },
  {
    key: 'joint_pain',
    icon: Bone,
    labelEn: 'Joint & Muscle Pain',
    labelHi: 'जोड़ों या मांसपेशियों में दर्द',
    subEn: 'Knee, back, neck pain, stiffness',
    subHi: 'घुटनों, कमर, गर्दन का दर्द, जकड़न',
    color: 'from-purple-500/20 to-indigo-500/10 border-purple-500/40 hover:border-purple-400 text-purple-400',
  },
  {
    key: 'ayush_assessment',
    icon: Sparkles,
    labelEn: 'AYUSH Holistic & Prakriti',
    labelHi: 'आयुष प्रकृति एवं समग्र स्वास्थ्य',
    subEn: 'Tridosha balance, Agni, Ahara-Vihara',
    subHi: 'वात-पित्त-कफ, अग्नि, आहार-विहार',
    color: 'from-teal-500/20 to-emerald-500/10 border-teal-500/40 hover:border-teal-400 text-teal-300',
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
    <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full p-6">
      {/* Title & Audio */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white">
            {language === LanguageCode.HI ? 'मुख्य तकलीफ चुनें' : 'Select Chief Complaint'}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {language === LanguageCode.HI
              ? 'आप जिस समस्या के लिए डॉक्टर को दिखाने आए हैं, उस पर टच करें'
              : 'Touch the card that best describes your primary health concern'}
          </p>
        </div>
        <AudioPromptButton text={promptText} language={language} />
      </div>

      {/* Voice Prompt Bar */}
      <div className="mb-6 p-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-teal-300">
              {language === LanguageCode.HI ? 'आवाज द्वारा बताएं:' : 'Voice Assisted Intake:'}
            </p>
            <p className="text-sm text-slate-300 font-medium italic">
              {language === LanguageCode.HI
                ? '"कल रात से सीने में जलन और भारीपन है..."'
                : '"Burning chest discomfort since yesterday night..."'}
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
          className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md"
        >
          {language === LanguageCode.HI ? 'बोलें / Simulate Voice' : 'Simulate Voice'}
        </button>
      </div>

      {/* 6 Large Pictorial Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {COMPLAINT_CARDS.map((card) => {
          const Icon = card.icon;
          const label = language === LanguageCode.HI ? card.labelHi : card.labelEn;
          const sub = language === LanguageCode.HI ? card.subHi : card.subEn;

          return (
            <button
              key={card.key}
              onClick={() => onSelectComplaint(card.key, label)}
              className={`kiosk-card p-6 rounded-3xl bg-gradient-to-b bg-slate-850 border-2 ${card.color} flex flex-col items-start text-left group shadow-lg`}
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-900/90 flex items-center justify-center mb-4 border border-slate-700 shadow-md">
                <Icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-teal-300 mb-1 leading-snug">
                {label}
              </h3>
              <p className="text-xs text-slate-400 font-medium leading-relaxed mb-4">
                {sub}
              </p>
              <div className="mt-auto w-full py-2.5 bg-slate-900/80 group-hover:bg-teal-500 text-slate-300 group-hover:text-slate-950 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors">
                <span>{language === LanguageCode.HI ? 'चुनें' : 'Select'}</span>
                <span>→</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
