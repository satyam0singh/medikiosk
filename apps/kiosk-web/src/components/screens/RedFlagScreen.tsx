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
      <div className="w-24 h-24 rounded-3xl bg-red-500/20 border-2 border-red-500/50 flex items-center justify-center text-red-400 mb-6 animate-bounce shadow-2xl shadow-red-500/20">
        <AlertOctagon className="w-14 h-14" />
      </div>

      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-bold uppercase tracking-wider mb-4">
        <HeartPulse className="w-4 h-4 text-red-400" />
        <span>{language === LanguageCode.HI ? 'आपातकालीन ट्राइएज अलर्ट' : 'Priority Triage Alert'}</span>
      </div>

      <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 leading-tight">
        {language === LanguageCode.HI
          ? 'अति-आवश्यक लक्षण संज्ञान में आए हैं'
          : 'Priority Symptoms Detected'}
      </h2>

      <p className="text-base sm:text-lg text-slate-300 mb-8 max-w-xl leading-relaxed">
        {language === LanguageCode.HI
          ? 'सीने में अत्यधिक दर्द या तकलीफ के कारण, कृपया तुरंत ट्राइएज काउंटर पर उपस्थित नर्सिंग स्टाफ को बताएं।'
          : 'Due to severe reported symptoms, please alert the nursing staff at Emergency Counter #1 immediately.'}
      </p>

      {/* Audio Affordance */}
      <div className="mb-8">
        <AudioPromptButton text={alertText} language={language} size="lg" />
      </div>

      {/* Triage Guidance Box */}
      <div className="w-full p-6 rounded-3xl bg-slate-850 border border-red-500/30 shadow-2xl text-left space-y-4 mb-8">
        <div className="flex items-center gap-3 text-red-400 font-bold text-sm">
          <PhoneCall className="w-5 h-5" />
          <span>{language === LanguageCode.HI ? 'स्टाफ को स्वचालित रूप से सूचित किया गया है:' : 'Hospital Staff Alerted:'}</span>
        </div>
        <p className="text-xs text-slate-400">
          Rule Code: <span className="font-mono text-red-400 font-bold">{alert.ruleId}</span> • Severity:{' '}
          <span className="font-bold text-red-400">{alert.severity}</span>
        </p>
        <p className="text-sm text-slate-200 bg-slate-900/90 p-4 rounded-2xl border border-slate-800 font-medium">
          "{alert.alertMessage}"
        </p>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        <button
          type="button"
          onClick={() => window.print()}
          className="kiosk-btn bg-red-600 hover:bg-red-500 text-white font-bold text-base shadow-lg shadow-red-600/30"
        >
          <UserCheck className="w-5 h-5" />
          <span>{language === LanguageCode.HI ? 'इमरजेंसी पर्ची प्रिंट करें' : 'Print Priority Slip'}</span>
        </button>

        <button
          type="button"
          onClick={onProceedAnyway}
          className="kiosk-btn bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold text-sm"
        >
          <span>{language === LanguageCode.HI ? 'दस्तावेज अपलोड पर आगे बढ़ें' : 'Continue Intake'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
