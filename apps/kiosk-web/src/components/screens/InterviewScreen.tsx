import React, { useState } from 'react';
import { HelpCircle, Mic, ArrowRight, CheckCircle, AlertTriangle } from 'lucide-react';
import { ClinicalQuestion, LanguageCode, ProvenanceType, RedFlagAlert } from '@medikiosk/shared-types';
import { AudioPromptButton } from '../AudioPromptButton';
import { KioskApi } from '../../services/api';

const makeBilingual = (en: string, hi: string): any => ({
  en,
  hi,
  hinglish: en,
  mr: en,
  ta: en,
  te: en,
  bn: en,
});

const FALLBACK_QUESTIONS: ClinicalQuestion[] = [
  {
    id: 'q_chest_onset',
    code: 'Q_CP_001',
    section: 'HPI',
    prompt: makeBilingual(
      'When did this chest pain or discomfort start?',
      'सीने में यह दर्द या परेशानी कब से शुरू हुई?'
    ),
    inputType: 'VOICE_OR_TOUCH',
    options: [
      { id: 'opt_1', value: 'few_hours_ago', label: makeBilingual('A few hours ago', 'कुछ घंटे पहले') },
      { id: 'opt_2', value: 'yesterday_night', label: makeBilingual('Yesterday night', 'कल रात से') },
      { id: 'opt_3', value: 'few_days_ago', label: makeBilingual('A few days ago', 'कुछ दिनों से') },
      { id: 'opt_4', value: 'weeks_or_more', label: makeBilingual('More than a week ago', 'एक सप्ताह से अधिक') },
    ],
    targetField: 'hpi.onset',
    isRequired: true,
  },
  {
    id: 'q_pain_severity',
    code: 'Q_CP_002',
    section: 'HPI',
    prompt: makeBilingual(
      'On a scale from 1 (mild) to 10 (severe), how intense is the pain right now?',
      '1 (हल्का) से 10 (अत्यधिक) के पैमाने पर, दर्द कितना तीव्र है?'
    ),
    inputType: 'NUMERIC_SCALE',
    targetField: 'hpi.pain_severity',
    isRequired: true,
  },
  {
    id: 'q_chest_character',
    code: 'Q_CP_003',
    section: 'HPI',
    prompt: makeBilingual(
      'How would you describe the feeling in your chest?',
      'सीने में किस प्रकार का दर्द या अनुभव हो रहा है?'
    ),
    inputType: 'VOICE_OR_TOUCH',
    options: [
      { id: 'opt_burning', value: 'burning', label: makeBilingual('Burning / Heaviness (जलन या भारीपन)', 'जलन या भारीपन') },
      { id: 'opt_pressure', value: 'pressure', label: makeBilingual('Tight Squeezing Pressure (दबाव या जकड़न)', 'दबाव या जकड़न') },
      { id: 'opt_sharp', value: 'sharp', label: makeBilingual('Sharp Stabbing Pain (सुई जैसा चुभने वाला दर्द)', 'सुई जैसा चुभने वाला दर्द') },
    ],
    targetField: 'hpi.chest_character',
    isRequired: true,
  },
  {
    id: 'q_prior_medications',
    code: 'Q_MED_001',
    section: 'MEDICATIONS',
    prompt: makeBilingual(
      'Are you currently taking any regular medicines for BP, Sugar, or other conditions?',
      'क्या आप बीपी, शुगर या किसी अन्य बीमारी की नियमित दवा ले रहे हैं?'
    ),
    inputType: 'VOICE_OR_TOUCH',
    options: [
      { id: 'opt_bp', value: 'bp_medicines', label: makeBilingual('Blood Pressure Medicines (बीपी की दवा)', 'बीपी की दवा') },
      { id: 'opt_diabetes', value: 'diabetes_medicines', label: makeBilingual('Diabetes / Sugar Medicines (शुगर की दवा)', 'शुगर की दवा') },
      { id: 'opt_heart', value: 'heart_medicines', label: makeBilingual('Heart / Cholesterol Medicines (हार्ट/कोलेस्ट्रॉल)', 'हार्ट/कोलेस्ट्रॉल की दवा') },
      { id: 'opt_none', value: 'no_medicines', label: makeBilingual('No regular medicines (कोई नियमित दवा नहीं)', 'कोई नियमित दवा नहीं') },
    ],
    targetField: 'medications.history',
    isRequired: false,
  },
];

interface InterviewScreenProps {
  sessionId: string;
  language: LanguageCode;
  onInterviewCompleted: () => void;
  onRedFlagTriggered: (alert: RedFlagAlert) => void;
  isLightMode?: boolean;
}

export const InterviewScreen: React.FC<InterviewScreenProps> = ({
  sessionId,
  language,
  onInterviewCompleted,
  onRedFlagTriggered,
  isLightMode = false,
}) => {
  const [currentQuestion, setCurrentQuestion] = useState<ClinicalQuestion | null>(FALLBACK_QUESTIONS[0]!);
  const [progress, setProgress] = useState(25);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [scaleValue, setScaleValue] = useState<number>(7);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [fallbackIndex, setFallbackIndex] = useState(0);

  const fetchNextQuestion = async () => {
    setIsLoading(true);
    setSelectedOption(null);
    try {
      const data = await KioskApi.getNextQuestion(sessionId);
      if (data.isComplete) {
        onInterviewCompleted();
      } else if (data.question) {
        setCurrentQuestion(data.question);
        setProgress(data.progressPercentage);
      } else {
        // Use fallback sequence
        const nextIdx = fallbackIndex + 1;
        if (nextIdx < FALLBACK_QUESTIONS.length) {
          setFallbackIndex(nextIdx);
          setCurrentQuestion(FALLBACK_QUESTIONS[nextIdx]!);
          setProgress(Math.round(((nextIdx + 1) / FALLBACK_QUESTIONS.length) * 100));
        } else {
          onInterviewCompleted();
        }
      }
    } catch (err) {
      console.warn('Using local question flow fallback:', err);
      const nextIdx = fallbackIndex + 1;
      if (nextIdx < FALLBACK_QUESTIONS.length) {
        setFallbackIndex(nextIdx);
        setCurrentQuestion(FALLBACK_QUESTIONS[nextIdx]!);
        setProgress(Math.round(((nextIdx + 1) / FALLBACK_QUESTIONS.length) * 100));
      } else {
        onInterviewCompleted();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAnswer = async (valueToSubmit?: string) => {
    if (!currentQuestion) return;

    const val = valueToSubmit || selectedOption || (currentQuestion.inputType === 'NUMERIC_SCALE' ? String(scaleValue) : 'yes');

    // Deterministic check for emergency severity
    if (currentQuestion.id === 'q_pain_severity' && scaleValue >= 7) {
      onRedFlagTriggered({
        id: 'rf-alert-chest-severe',
        encounterId: sessionId,
        patientId: 'patient',
        ruleId: 'rf_chest_pain_severe',
        severity: 'CRITICAL_EMERGENCY' as any,
        alertMessage: language === LanguageCode.HI
          ? 'सीने में तीव्र दर्द (तीव्रता स्कोर 7+) का पता चला है। तत्काल आपातकालीन सहायता टीम को सूचित किया गया है।'
          : 'Severe acute chest discomfort (Score >= 7) detected. Immediate triage and physician notification required.',
        triggerFacts: [{ field: 'hpi.pain_severity', value: scaleValue, sourceType: ProvenanceType.PATIENT_REPORTED }],
        isAcknowledged: false,
        createdAt: new Date().toISOString(),
      });
      return;
    }

    try {
      const res = await KioskApi.recordAnswer(sessionId, {
        questionId: currentQuestion.id,
        selectedOptions: [val],
        confidence: 0.95,
        sourceType: ProvenanceType.PATIENT_REPORTED,
      });

      if (res.triggeredAlerts && res.triggeredAlerts.length > 0) {
        const emergencyAlert = res.triggeredAlerts.find(a => a.severity === 'CRITICAL_EMERGENCY');
        if (emergencyAlert) {
          onRedFlagTriggered(emergencyAlert);
          return;
        }
      }

      if (res.isCompleted) {
        onInterviewCompleted();
      } else {
        await fetchNextQuestion();
      }
    } catch (err) {
      console.warn('Record answer fallback progression:', err);
      const nextIdx = fallbackIndex + 1;
      if (nextIdx < FALLBACK_QUESTIONS.length) {
        setFallbackIndex(nextIdx);
        setCurrentQuestion(FALLBACK_QUESTIONS[nextIdx]!);
        setProgress(Math.round(((nextIdx + 1) / FALLBACK_QUESTIONS.length) * 100));
      } else {
        onInterviewCompleted();
      }
    }
  };

  const handleSimulateVoice = () => {
    setIsVoiceRecording(true);
    setTimeout(() => {
      setIsVoiceRecording(false);
      const defaultOpt = currentQuestion?.options?.[0]?.value || 'few_hours_ago';
      handleSubmitAnswer(defaultOpt);
    }, 1200);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className={`text-sm font-semibold ${isLightMode ? 'text-teal-700' : 'text-teal-300'}`}>
            {language === LanguageCode.HI ? 'अगला प्रश्न लोड हो रहा है...' : 'Loading next clinical question...'}
          </p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return null;
  }

  const prompt = language === LanguageCode.HI ? (currentQuestion.prompt?.hi || currentQuestion.prompt?.en) : currentQuestion.prompt?.en;

  return (
    <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-6">
      {/* Progress Bar Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-bold mb-2">
          <span className={isLightMode ? 'text-slate-600' : 'text-slate-400'}>
            {language === LanguageCode.HI ? 'केस-टेकिंग प्रगति' : 'Intake Progress'}
          </span>
          <span className={isLightMode ? 'text-teal-700' : 'text-teal-400'}>{progress}%</span>
        </div>
        <div className={`w-full h-2.5 rounded-full overflow-hidden ${isLightMode ? 'bg-slate-200' : 'bg-slate-800'}`}>
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className={`border rounded-3xl p-6 sm:p-8 shadow-2xl mb-8 space-y-6 transition-colors ${
        isLightMode
          ? 'bg-white border-slate-200 shadow-slate-200'
          : 'bg-slate-900 border-slate-800 shadow-slate-950'
      }`}>
        <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4 ${
          isLightMode ? 'border-slate-100' : 'border-slate-800'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-600 dark:text-teal-300 flex items-center justify-center">
              <HelpCircle className="w-6 h-6" />
            </div>
            <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 border rounded-lg ${
              isLightMode
                ? 'bg-teal-50 text-teal-700 border-teal-200'
                : 'bg-slate-800 text-teal-300 border-slate-700'
            }`}>
              {currentQuestion.section}
            </span>
          </div>
          <AudioPromptButton text={prompt || ''} language={language} size="md" />
        </div>

        {/* Question Prompt */}
        <h3 className={`text-2xl sm:text-3xl font-extrabold leading-snug ${
          isLightMode ? 'text-slate-900' : 'text-white'
        }`}>
          {prompt}
        </h3>

        {/* Input Types */}
        {/* Type 1: Numeric Pain / Severity Scale (1 to 10) */}
        {currentQuestion.inputType === 'NUMERIC_SCALE' && (
          <div className="space-y-6 pt-4">
            <div className="flex items-center justify-between">
              <span className={`text-sm font-bold ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>1 (Mild / हल्का)</span>
              <span className={`text-4xl font-black ${isLightMode ? 'text-teal-600' : 'text-teal-400'}`}>{scaleValue}</span>
              <span className="text-sm font-bold text-rose-500">10 (Severe / अत्यधिक)</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={scaleValue}
              onChange={(e) => setScaleValue(parseInt(e.target.value, 10))}
              className="w-full h-4 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
            />
            {scaleValue >= 7 && (
              <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center gap-3 text-amber-700 dark:text-amber-300 text-xs font-bold">
                <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500 animate-bounce" />
                <span>
                  {language === LanguageCode.HI
                    ? 'उच्च तीव्रता दर्द (7+) दर्ज किया जा रहा है। अस्पताल के क्लिनिकल ट्राइएज को तत्काल अलर्ट भेजा जाएगा।'
                    : 'High severity (7+) selected. Priority triage alert will be flagged for the physician immediately.'}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Type 2: Choice Options */}
        {currentQuestion.options && currentQuestion.options.length > 0 && currentQuestion.inputType !== 'NUMERIC_SCALE' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {currentQuestion.options.map((opt) => {
              const optLabel = language === LanguageCode.HI ? (opt.label?.hi || opt.label?.en) : opt.label?.en;
              const isSelected = selectedOption === opt.value;

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setSelectedOption(opt.value);
                    handleSubmitAnswer(opt.value);
                  }}
                  className={`p-5 rounded-2xl border-2 flex items-center justify-between text-left transition-all ${
                    isSelected
                      ? 'bg-teal-500/20 border-teal-500 text-teal-900 dark:text-white shadow-lg shadow-teal-500/10'
                      : isLightMode
                      ? 'bg-slate-50 border-slate-200 hover:border-teal-400 text-slate-800'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-600 text-slate-200'
                  }`}
                >
                  <span className="font-bold text-base">{optLabel}</span>
                  <div
                    className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'border-teal-500 bg-teal-500 text-white'
                        : isLightMode ? 'border-slate-400' : 'border-slate-600'
                    }`}
                  >
                    {isSelected && <CheckCircle className="w-4 h-4" />}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Voice Simulation & Proceed Footer */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-auto">
        <button
          type="button"
          onClick={handleSimulateVoice}
          disabled={isVoiceRecording}
          className={`p-4 rounded-2xl border font-bold text-sm flex items-center justify-center gap-2 transition-all ${
            isVoiceRecording
              ? 'bg-rose-500/20 border-rose-500 text-rose-600 dark:text-rose-300 animate-pulse'
              : isLightMode
              ? 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300 shadow-sm'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
          }`}
        >
          <Mic className="w-5 h-5 text-teal-500" />
          <span>
            {isVoiceRecording
              ? (language === LanguageCode.HI ? 'सुन रहे हैं...' : 'Listening...')
              : (language === LanguageCode.HI ? 'माइक द्वारा बोलें' : 'Speak Voice Answer')}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleSubmitAnswer()}
          className="p-4 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 active:scale-95 transition-all"
        >
          <span>{language === LanguageCode.HI ? 'उत्तर दर्ज करें (आगे बढ़ें)' : 'Submit & Next'}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
