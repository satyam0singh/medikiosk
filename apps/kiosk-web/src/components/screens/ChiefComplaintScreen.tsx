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
  borderColor: string;
  iconBg: string;
}

const COMPLAINT_CARDS: ComplaintOption[] = [
  {
    key: 'chest_pain',
    icon: Heart,
    labelEn: 'Chest Pain / Discomfort',
    labelHi: 'सीने में दर्द या भारीपन',
    subEn: 'Pressure, burning, tightness, breathlessness',
    subHi: 'दबाव, जलन, जकड़न, सांस फूलना',
    borderColor: 'hover:border-rose-500 border-rose-500/30',
    iconBg: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
  },
  {
    key: 'fever',
    icon: Flame,
    labelEn: 'Fever & Chills',
    labelHi: 'बुखार या कंपकंपी',
    subEn: 'High temperature, body ache, shivering',
    subHi: 'तेज तापमान, बदन दर्द, ठंड लगना',
    borderColor: 'hover:border-amber-500 border-amber-500/30',
    iconBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  },
  {
    key: 'abdominal_pain',
    icon: Activity,
    labelEn: 'Stomach Pain & Acidity',
    labelHi: 'पेट दर्द या गैस / अपच',
    subEn: 'Cramps, acidity, nausea, vomiting',
    subHi: 'मरोड़, खट्टी डकार, उल्टी का मन',
    borderColor: 'hover:border-emerald-500 border-emerald-500/30',
    iconBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  },
  {
    key: 'cough_breathlessness',
    icon: Wind,
    labelEn: 'Cough & Breathing Issue',
    labelHi: 'खांसी या सांस की तकलीफ',
    subEn: 'Dry/wet cough, wheezing, throat pain',
    subHi: 'सूखी/बलगम वाली खांसी, गले में खराश',
    borderColor: 'hover:border-sky-500 border-sky-500/30',
    iconBg: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
  },
  {
    key: 'joint_pain',
    icon: Bone,
    labelEn: 'Joint & Muscle Pain',
    labelHi: 'जोड़ों या मांसपेशियों में दर्द',
    subEn: 'Knee, back, neck pain, stiffness',
    subHi: 'घुटनों, कमर, गर्दन का दर्द, जकड़न',
    borderColor: 'hover:border-purple-500 border-purple-500/30',
    iconBg: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
  },
  {
    key: 'ayush_assessment',
    icon: Sparkles,
    labelEn: 'AYUSH Holistic & Prakriti',
    labelHi: 'आयुष प्रकृति एवं समग्र स्वास्थ्य',
    subEn: 'Tridosha balance, Agni, Ahara-Vihara',
    subHi: 'वात-पित्त-कफ, अग्नि, आहार-विहार',
    borderColor: 'hover:border-teal-500 border-teal-500/40',
    iconBg: 'bg-teal-500/15 text-teal-600 dark:text-teal-400',
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
      {/* Title & Audio Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            {language === LanguageCode.HI ? 'मुख्य तकलीफ चुनें' : 'Select Chief Complaint'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            {language === LanguageCode.HI
              ? 'आप जिस समस्या के लिए डॉक्टर को दिखाने आए हैं, उस पर टच करें'
              : 'Touch the card that best describes your primary health concern'}
          </p>
        </div>
        <AudioPromptButton text={promptText} language={language} size="md" />
      </div>

      {/* Grid of Clinical Symptom Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {COMPLAINT_CARDS.map((card) => {
          const Icon = card.icon;
          const label = language === LanguageCode.HI ? card.labelHi : card.labelEn;
          const sub = language === LanguageCode.HI ? card.subHi : card.subEn;

          return (
            <button
              key={card.key}
              type="button"
              onClick={() => onSelectComplaint(card.key, label)}
              className={`p-6 rounded-3xl border-2 bg-white dark:bg-slate-900 flex flex-col items-start text-left transition-all duration-200 hover:shadow-xl active:scale-[0.98] group ${card.borderColor}`}
            >
              <div className="flex items-center justify-between w-full mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold transition-transform group-hover:scale-110 ${card.iconBg}`}>
                  <Icon className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-teal-500 transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-teal-600 dark:group-hover:text-teal-300 transition-colors">
                {label}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                {sub}
              </p>
            </button>
          );
        })}
      </div>

      {/* Voice Assistant Shortcut Footer */}
      <div className="mt-auto p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center animate-pulse">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              {language === LanguageCode.HI ? 'बोलकर तकलीफ बताना चाहते हैं?' : 'Prefer speaking your symptoms?'}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
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
          className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
        >
          <Mic className="w-3.5 h-3.5" />
          <span>{language === LanguageCode.HI ? 'आवाज से चुनें' : 'Simulate Voice'}</span>
        </button>
      </div>
    </div>
  );
};
