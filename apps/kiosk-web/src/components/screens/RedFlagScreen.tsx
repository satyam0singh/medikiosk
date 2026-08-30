import React from 'react';
import { AlertOctagon, HeartPulse, UserCheck, ArrowRight, PhoneCall } from 'lucide-react';
import { LanguageCode, RedFlagAlert } from '@medikiosk/shared-types';
import { AudioPromptButton } from '../AudioPromptButton';

interface RedFlagScreenProps {
  alert: RedFlagAlert;
  language: LanguageCode;
  onProceedAnyway: () => void;
}

export const RedFlagScreen: React.FC<RedFlagScreenProps> = ({
  alert,
  language,
  onProceedAnyway,
}) => {
  const alertText =
    language === LanguageCode.HI
      ? 'सावधानी: आपके द्वारा बताए गए लक्षणों में आपातकालीन देखभाल की आवश्यकता हो सकती है। अस्पताल के ट्राइएज काउंटर नंबर १ पर तुरंत संपर्क करें। स्टाफ को सूचित कर दिया गया है।'
      : 'Caution: Potential emergency clinical symptoms detected. Clinical triage staff has been notified. Please proceed directly to Counter #1 for immediate evaluation.';

  return (
    <div className="flex-1 flex flex-col items-center justify-center max-w-3xl mx-auto w-full p-6 text-center">
      {/* Alert Icon */}
      <div className="w-20 h-20 rounded-3xl bg-rose-500/20 border-2 border-rose-500/50 flex items-center justify-center text-rose-500 mb-4 animate-bounce shadow-2xl shadow-rose-500/20">
        <AlertOctagon className="w-12 h-12 stroke-[2.5]" />
      </div>

      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-300 border border-rose-500/30 text-xs font-black uppercase tracking-wider mb-3">
        <HeartPulse className="w-4 h-4 text-rose-500" />
        <span>{language === LanguageCode.HI ? 'आपातकालीन ट्राइएज अलर्ट' : 'Priority Triage Alert'}</span>
      </div>

      <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-3 leading-tight">
        {language === LanguageCode.HI
          ? 'अति-आवश्यक लक्षण संज्ञान में आए हैं'
          : 'Priority Emergency Symptoms Detected'}
      </h2>

      <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mb-6 max-w-xl leading-relaxed font-medium">
        {language === LanguageCode.HI
          ? 'सीने में अत्यधिक दर्द या तकलीफ के कारण, कृपया तुरंत ट्राइएज काउंटर पर उपस्थित नर्सिंग स्टाफ को बताएं।'
          : 'Due to severe reported symptoms, please alert the nursing staff at Emergency Counter #1 immediately.'}
      </p>

      {/* Audio Affordance */}
      <div className="mb-6">
        <AudioPromptButton text={alertText} language={language} size="md" />
      </div>

      {/* Triage Guidance Box */}
      <div className="w-full p-6 rounded-3xl border border-rose-500/30 bg-rose-500/5 shadow-xl text-left space-y-3 mb-6">
        <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-extrabold text-xs uppercase tracking-wider">
          <PhoneCall className="w-4 h-4" />
          <span>{language === LanguageCode.HI ? 'स्टाफ को स्वचालित रूप से सूचित किया गया है:' : 'Emergency Protocol Triggered:'}</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Deterministic Rule Code: <strong className="font-mono text-rose-600 dark:text-rose-400">{alert.ruleId}</strong> • Severity:{' '}
          <strong className="text-rose-600 dark:text-rose-400">{alert.severity}</strong>
        </p>
        <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-rose-500/20 font-medium">
          "{alert.alertMessage}"
        </p>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        <button
          type="button"
          onClick={() => window.print()}
          className="py-4 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 active:scale-95 transition-all"
        >
          <UserCheck className="w-4 h-4" />
          <span>{language === LanguageCode.HI ? 'इमरजेंसी पर्ची प्रिंट करें' : 'Print Priority Slip'}</span>
        </button>

        <button
          type="button"
          onClick={onProceedAnyway}
          className="py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-bold text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <span>{language === LanguageCode.HI ? 'दस्तावेज अपलोड पर आगे बढ़ें' : 'Continue Intake'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
