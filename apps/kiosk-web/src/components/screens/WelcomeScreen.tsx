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
      {/* Visual Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-sm font-semibold mb-6 shadow-inner">
        <Sparkles className="w-4 h-4 text-teal-400" />
        <span>Smart OPD Patient Case-Taking Kiosk</span>
      </div>

      <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
        स्वागतम् • Welcome to AIIA
      </h2>
      <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mb-8 leading-relaxed">
        डॉक्टर से परामर्श से पहले अपनी स्वास्थ्य जानकारी और पुराने पर्चे यहाँ दर्ज करें।
        <br />
        <span className="text-slate-400 text-base">
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
          onClick={() => onSelectLanguage(LanguageCode.HI)}
          className="kiosk-card p-8 rounded-3xl bg-gradient-to-b from-slate-800 to-slate-850 border-2 border-slate-700 hover:border-teal-400 hover:shadow-2xl hover:shadow-teal-500/10 flex flex-col items-center justify-center gap-4 text-center group"
        >
          <div className="w-20 h-20 rounded-3xl bg-teal-500/20 group-hover:bg-teal-500 flex items-center justify-center text-teal-300 group-hover:text-slate-950 transition-colors shadow-lg">
            <span className="text-3xl font-extrabold">अ</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-1">हिंदी में शुरू करें</h3>
            <p className="text-sm text-slate-400 font-medium">बोलकर या टच करके उत्तर दें</p>
          </div>
          <div className="w-full py-3 bg-teal-500/10 group-hover:bg-teal-500 text-teal-300 group-hover:text-slate-950 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-colors mt-2">
            <span>आगे बढ़ें</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </button>

        {/* English Card */}
        <button
          onClick={() => onSelectLanguage(LanguageCode.EN)}
          className="kiosk-card p-8 rounded-3xl bg-gradient-to-b from-slate-800 to-slate-850 border-2 border-slate-700 hover:border-teal-400 hover:shadow-2xl hover:shadow-teal-500/10 flex flex-col items-center justify-center gap-4 text-center group"
        >
          <div className="w-20 h-20 rounded-3xl bg-teal-500/20 group-hover:bg-teal-500 flex items-center justify-center text-teal-300 group-hover:text-slate-950 transition-colors shadow-lg">
            <span className="text-3xl font-extrabold">A</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-1">Start in English</h3>
            <p className="text-sm text-slate-400 font-medium">Answer via voice or touch</p>
          </div>
          <div className="w-full py-3 bg-teal-500/10 group-hover:bg-teal-500 text-teal-300 group-hover:text-slate-950 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-colors mt-2">
            <span>Proceed</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </button>
      </div>

      {/* Safety & Compliance Badges */}
      <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 border-t border-slate-800/80 pt-6 w-full">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-teal-400" />
          <span>ABHA & ABDM Compliant</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Doctor Verification Required</span>
        </div>
        <div className="flex items-center gap-1.5">
          <HeartPulse className="w-4 h-4 text-red-400" />
          <span>Deterministic Emergency Screening</span>
        </div>
      </div>
    </div>
  );
};
