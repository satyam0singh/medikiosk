import React, { useState } from 'react';
import { Mic, ArrowRight, CheckCircle, AlertTriangle } from 'lucide-react';
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
          <div className="w-8 h-8 border-2 border-[#111111] dark:border-[#F4F4F6] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#787774] dark:text-[#8E94A4]">
            {language === LanguageCode.HI ? 'लोड हो रहा है...' : 'Loading question...'}
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
    <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full p-6">
      {/* Progress Header */}
      <div className="mb-6 flex items-center justify-between text-xs font-mono tabular-nums text-[#787774] dark:text-[#8E94A4]">
        <span>
          {language === LanguageCode.HI ? 'प्रगति' : 'Intake Progress'}
        </span>
        <span className="font-bold text-[#111111] dark:text-[#F4F4F6]">{progress}%</span>
      </div>

      {/* Main Question Bento */}
      <div className="border border-[#EAEAEA] dark:border-[#232734] bg-[#FFFFFF] dark:bg-[#141720] rounded-xl p-6 mb-6 space-y-5">
        <div className="flex items-start justify-between gap-4 border-b border-[#EAEAEA] dark:border-[#232734] pb-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#787774] dark:text-[#8E94A4]">
              {currentQuestion.section || 'HPI'} • {currentQuestion.code || 'Q_CP'}
            </span>
            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-[#111111] dark:text-[#F4F4F6] leading-snug">
              {prompt}
            </h3>
          </div>
          <AudioPromptButton text={prompt || ''} language={language} size="md" />
        </div>

        {/* Option 1: Touch / Voice Multiple Choice */}
        {currentQuestion.inputType === 'VOICE_OR_TOUCH' && currentQuestion.options && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentQuestion.options.map((opt) => {
              const optLabel =
                language === LanguageCode.HI ? opt.label?.hi || opt.label?.en : opt.label?.en;
              const isSelected = selectedOption === opt.value;

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedOption(opt.value)}
                  className={`p-4 rounded-lg border text-left transition-all active:scale-[0.98] flex items-center justify-between group ${
                    isSelected
                      ? 'border-[#111111] dark:border-[#F4F4F6] bg-[#F7F6F3] dark:bg-[#1E222D]'
                      : 'border-[#EAEAEA] dark:border-[#232734] bg-[#FFFFFF] dark:bg-[#141720] hover:border-[#CCCCCC]'
                  }`}
                >
                  <span className="text-xs font-medium text-[#111111] dark:text-[#F4F4F6]">
                    {optLabel}
                  </span>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-[#111111] border-[#111111] dark:bg-[#F4F4F6] dark:border-[#F4F4F6] text-[#FFFFFF] dark:text-[#111111]'
                        : 'border-[#CCCCCC] dark:border-[#444444]'
                    }`}
                  >
                    {isSelected && <CheckCircle className="w-3 h-3 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Option 2: Numeric Scale (Pain 1-10) */}
        {currentQuestion.inputType === 'NUMERIC_SCALE' && (
          <div className="space-y-4 py-1">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#787774] dark:text-[#8E94A4]">
              <span>1 - Mild</span>
              <span>5 - Moderate</span>
              <span className="text-[#9F2F2D] dark:text-[#FCA5A5]">10 - Severe</span>
            </div>

            {/* Numeric 1 to 10 Minimal Buttons */}
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                const isCurrent = scaleValue === num;
                const isSevere = num >= 7;

                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setScaleValue(num)}
                    className={`py-3 rounded-md font-mono text-xs tabular-nums transition-all active:scale-95 border ${
                      isCurrent
                        ? isSevere
                          ? 'bg-[#9F2F2D] dark:bg-[#F87171] text-[#FFFFFF] dark:text-[#111111] border-transparent font-bold'
                          : 'bg-[#111111] dark:bg-[#F4F4F6] text-[#FFFFFF] dark:text-[#0D0F14] border-transparent font-bold'
                        : 'border-[#EAEAEA] dark:border-[#232734] bg-[#FBFBFA] dark:bg-[#10121A] text-[#111111] dark:text-[#F4F4F6] hover:border-[#CCCCCC]'
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>

            <input
              type="range"
              min={1}
              max={10}
              value={scaleValue}
              onChange={(e) => setScaleValue(parseInt(e.target.value, 10))}
              className="w-full accent-[#111111] dark:accent-[#F4F4F6] cursor-pointer h-1.5 bg-[#EAEAEA] dark:bg-[#232734] rounded-lg"
            />

            {scaleValue >= 7 && (
              <div className="p-3 rounded-lg tag-pastel-red flex items-center gap-2 text-xs font-mono">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {language === LanguageCode.HI
                    ? 'चेतावनी: स्कोर 7+ होने पर आपातकालीन प्रोटोकॉल सक्रिय होगा।'
                    : 'Notice: Pain score >= 7 flags Priority Clinical Triage.'}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Voice Recording Simulation */}
      {isVoiceRecording && (
        <div className="mb-4 p-3 rounded-lg tag-pastel-blue flex items-center justify-center gap-2 font-mono text-xs">
          <div className="w-2 h-2 bg-[#1F6C9F] dark:bg-[#70B8FF] rounded-full animate-ping" />
          <span>
            {language === LanguageCode.HI ? 'सुन रहा हूँ... बोलिए' : 'Listening into kiosk microphone...'}
          </span>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row gap-3 mt-auto">
        <button
          type="button"
          onClick={handleSimulateVoice}
          className="flex-1 py-3 px-4 rounded-lg border border-[#EAEAEA] dark:border-[#232734] bg-[#FFFFFF] dark:bg-[#141720] text-[#666666] dark:text-[#8E94A4] font-medium text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <Mic className="w-3.5 h-3.5" />
          <span>{language === LanguageCode.HI ? 'आवाज से उत्तर दें' : 'Speak Answer'}</span>
        </button>

        <button
          type="button"
          onClick={() => handleSubmitAnswer()}
          className="flex-1 py-3 px-4 rounded-lg bg-[#111111] dark:bg-[#F4F4F6] text-[#FFFFFF] dark:text-[#0D0F14] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <span>{language === LanguageCode.HI ? 'पुष्टि करें व आगे बढ़ें' : 'Confirm & Next'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
