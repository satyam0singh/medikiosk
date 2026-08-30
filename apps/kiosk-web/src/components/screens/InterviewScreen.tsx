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

    // Deterministic check for emergency severity (Score >= 7 triggers CRITICAL_EMERGENCY)
    if (currentQuestion.id === 'q_pain_severity' && scaleValue >= 7) {
      onRedFlagTriggered({
        id: 'rf-alert-chest-severe',
        encounterId: sessionId,
        patientId: 'patient',
        ruleId: 'rf_chest_pain_severe',
        severity: 'CRITICAL_EMERGENCY' as any,
        alertMessage:
          language === LanguageCode.HI
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
        const emergencyAlert = res.triggeredAlerts.find((a) => a.severity === 'CRITICAL_EMERGENCY');
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

  const prompt =
    language === LanguageCode.HI ? currentQuestion.prompt?.hi || currentQuestion.prompt?.en : currentQuestion.prompt?.en;

  return (
    <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-6">
      {/* Progress Bar Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-bold mb-2">
          <span className={isLightMode ? 'text-slate-600' : 'text-slate-400'}>
            {language === LanguageCode.HI ? 'केस-टेकिंग प्रगति' : 'Clinical Intake Progress'}
          </span>
          <span className="font-mono tabular-nums text-teal-600 dark:text-teal-400 font-black">{progress}%</span>
        </div>
        <div className={`w-full h-2 rounded-full overflow-hidden ${isLightMode ? 'bg-slate-200' : 'bg-slate-800'}`}>
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Main Question Card */}
      <div
        className={`border rounded-3xl p-6 sm:p-8 shadow-2xl mb-8 space-y-6 transition-colors ${
          isLightMode ? 'bg-white border-slate-200 shadow-slate-200/50' : 'bg-slate-900 border-slate-800'
        }`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-md">
              {currentQuestion.section || 'HPI'} • {currentQuestion.code || 'Q_CP'}
            </span>
            <h3 className={`text-xl sm:text-2xl font-black tracking-tight leading-snug ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
              {prompt}
            </h3>
          </div>
          <AudioPromptButton text={prompt || ''} language={language} size="md" />
        </div>

        {/* Option 1: Touch / Voice Multiple Choice */}
        {currentQuestion.inputType === 'VOICE_OR_TOUCH' && currentQuestion.options && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentQuestion.options.map((opt) => {
              const optLabel =
                language === LanguageCode.HI ? opt.label?.hi || opt.label?.en : opt.label?.en;
              const isSelected = selectedOption === opt.value;

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedOption(opt.value)}
                  className={`p-5 rounded-2xl border-2 text-left transition-all active:scale-[0.98] flex items-center justify-between group ${
                    isSelected
                      ? isLightMode
                        ? 'bg-teal-50 border-teal-500 shadow-sm'
                        : 'bg-teal-500/15 border-teal-400 shadow-md shadow-teal-500/10'
                      : isLightMode
                      ? 'bg-slate-50 border-slate-200 hover:border-teal-400'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className={`text-sm font-bold ${isSelected ? 'text-teal-700 dark:text-teal-300' : isLightMode ? 'text-slate-800' : 'text-slate-200'}`}>
                    {optLabel}
                  </span>
                  <div
                    className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-teal-500 border-teal-500 text-slate-950 font-bold'
                        : isLightMode
                        ? 'border-slate-300'
                        : 'border-slate-700'
                    }`}
                  >
                    {isSelected && <CheckCircle className="w-4 h-4 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Option 2: Numeric Scale (Pain 1-10) */}
        {currentQuestion.inputType === 'NUMERIC_SCALE' && (
          <div className="space-y-6 py-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span>1 - Mild Discomfort (हल्का)</span>
              <span>5 - Moderate (मध्यम)</span>
              <span className="text-rose-500">10 - Severe Emergency (अत्यधिक)</span>
            </div>

            {/* Numeric Quick Buttons (1 to 10) */}
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                const isCurrent = scaleValue === num;
                const isSevere = num >= 7;

                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setScaleValue(num)}
                    className={`py-3.5 rounded-2xl font-black text-sm transition-all active:scale-95 border-2 ${
                      isCurrent
                        ? isSevere
                          ? 'bg-rose-500 text-white border-rose-400 shadow-lg shadow-rose-500/20 scale-105'
                          : 'bg-teal-500 text-slate-950 border-teal-400 shadow-lg shadow-teal-500/20 scale-105'
                        : isLightMode
                        ? 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>

            {/* Slider with dynamic indicator */}
            <input
              type="range"
              min={1}
              max={10}
              value={scaleValue}
              onChange={(e) => setScaleValue(parseInt(e.target.value, 10))}
              className="w-full accent-teal-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded-lg"
            />

            {scaleValue >= 7 && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-600 dark:text-rose-400 font-bold">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 animate-bounce" />
                <span>
                  {language === LanguageCode.HI
                    ? 'चेतावनी: स्कोर 7+ होने पर आपातकालीन प्रोटोकॉल सक्रिय होगा।'
                    : 'Warning: Pain score >= 7 automatically flags Critical Emergency protocol.'}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Voice Recording Simulation Banner */}
      {isVoiceRecording && (
        <div className="mb-6 p-4 rounded-2xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center gap-3 animate-pulse">
          <div className="w-3 h-3 bg-teal-500 rounded-full animate-ping" />
          <span className="text-xs font-bold text-teal-700 dark:text-teal-300">
            {language === LanguageCode.HI ? 'सुन रहा हूँ... बोलिए' : 'Listening... speak clearly into kiosk microphone'}
          </span>
        </div>
      )}

      {/* Footer Navigation Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mt-auto">
        <button
          type="button"
          onClick={handleSimulateVoice}
          className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 border border-slate-300 dark:border-slate-700 transition-all active:scale-[0.98]"
        >
          <Mic className="w-4 h-4 text-teal-500" />
          <span>{language === LanguageCode.HI ? 'आवाज से उत्तर दें (माइक)' : 'Speak Answer (Mic)'}</span>
        </button>

        <button
          type="button"
          onClick={() => handleSubmitAnswer()}
          className="flex-1 py-4 bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 transition-all active:scale-[0.98]"
        >
          <span>{language === LanguageCode.HI ? 'पुष्टि करें व आगे बढ़ें' : 'Confirm & Next'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
