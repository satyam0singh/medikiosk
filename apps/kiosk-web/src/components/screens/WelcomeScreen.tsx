import React from 'react';
import { ArrowRight, HeartPulse, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { LanguageCode } from '@medikiosk/shared-types';
import { AudioPromptButton } from '../AudioPromptButton';

interface WelcomeScreenProps {
  onSelectLanguage: (lang: LanguageCode) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSelectLanguage }) => {
  const welcomeText = "Welcome to MediKiosk at All India Institute of Ayurveda. Please touch your preferred language to begin your OPD check-in.";

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-4xl mx-auto">
      {/* Visual Hospital Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-600 dark:text-teal-300 text-xs font-bold mb-6">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Ministry of Ayush • OPD Case-Taking System</span>
      </div>

      <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight mb-3">
        स्वागतम् • Welcome to AIIA
      </h2>
      <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mb-8 leading-relaxed font-medium">
        डॉक्टर से परामर्श से पहले अपनी स्वास्थ्य जानकारी और पुराने पर्चे यहाँ दर्ज करें।
        <br />
        <span className="text-slate-500 dark:text-slate-400 text-sm">
          Pre-consultation clinical intake and document structuring before your doctor visit.
        </span>
      </p>

      {/* Audio Affordance */}
      <div className="mb-10">
        <AudioPromptButton text={welcomeText} language={LanguageCode.EN} size="lg" />
      </div>

      {/* Language Touch Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl mb-10">
        {/* Hindi Card */}
        <button
          type="button"
          onClick={() => onSelectLanguage(LanguageCode.HI)}
          className="p-8 rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 hover:border-teal-500 dark:hover:border-teal-400 hover:shadow-2xl hover:shadow-teal-500/10 flex flex-col items-center justify-center gap-4 text-center group transition-all duration-200 active:scale-[0.98]"
        >
          <div className="w-20 h-20 rounded-3xl bg-teal-500/15 group-hover:bg-teal-500 flex items-center justify-center text-teal-600 dark:text-teal-300 group-hover:text-slate-950 transition-all shadow-md">
            <span className="text-3xl font-extrabold font-serif">अ</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">हिंदी में शुरू करें</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">बोलकर या टच करके उत्तर दें</p>
          </div>
          <div className="w-full py-3 bg-teal-500/10 group-hover:bg-teal-500 text-teal-700 dark:text-teal-300 group-hover:text-slate-950 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-colors mt-2">
            <span>आगे बढ़ें</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </button>

        {/* English Card */}
        <button
          type="button"
          onClick={() => onSelectLanguage(LanguageCode.EN)}
          className="p-8 rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 hover:border-teal-500 dark:hover:border-teal-400 hover:shadow-2xl hover:shadow-teal-500/10 flex flex-col items-center justify-center gap-4 text-center group transition-all duration-200 active:scale-[0.98]"
        >
          <div className="w-20 h-20 rounded-3xl bg-teal-500/15 group-hover:bg-teal-500 flex items-center justify-center text-teal-600 dark:text-teal-300 group-hover:text-slate-950 transition-all shadow-md">
            <span className="text-3xl font-extrabold">A</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Start in English</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Answer via voice or touch</p>
          </div>
          <div className="w-full py-3 bg-teal-500/10 group-hover:bg-teal-500 text-teal-700 dark:text-teal-300 group-hover:text-slate-950 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-colors mt-2">
            <span>Proceed</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </button>
      </div>

      {/* Safety & Compliance Badges */}
      <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-6 w-full">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-teal-500" />
          <span>ABHA & ABDM Compliant</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Doctor Verification Mandatory</span>
        </div>
        <div className="flex items-center gap-1.5">
          <HeartPulse className="w-4 h-4 text-rose-500" />
          <span>Deterministic Emergency Screening</span>
        </div>
      </div>
    </div>
  );
};
