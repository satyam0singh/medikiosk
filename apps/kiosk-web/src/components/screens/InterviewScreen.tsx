import React, { useState, useEffect } from 'react';
import { HelpCircle, Mic, ArrowRight, CheckCircle, AlertTriangle } from 'lucide-react';
import { ClinicalQuestion, LanguageCode, ProvenanceType, RedFlagAlert } from '@medikiosk/shared-types';
import { AudioPromptButton } from '../AudioPromptButton';
import { KioskApi } from '../../services/api';

interface InterviewScreenProps {
  sessionId: string;
  language: LanguageCode;
  onInterviewCompleted: () => void;
  onRedFlagTriggered: (alert: RedFlagAlert) => void;
}

export const InterviewScreen: React.FC<InterviewScreenProps> = ({
  sessionId,
  language,
  onInterviewCompleted,
  onRedFlagTriggered,
}) => {
  const [currentQuestion, setCurrentQuestion] = useState<ClinicalQuestion | null>(null);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [scaleValue, setScaleValue] = useState<number>(6);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);

  const fetchNextQuestion = async () => {
    setIsLoading(true);
    setSelectedOption(null);
    try {
      const data = await KioskApi.getNextQuestion(sessionId);
      if (data.isComplete || !data.question) {
        onInterviewCompleted();
      } else {
        setCurrentQuestion(data.question);
        setProgress(data.progressPercentage);
      }
    } catch (err) {
      console.error('Failed to fetch next question:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNextQuestion();
  }, [sessionId]);

  const handleSubmitAnswer = async (valueToSubmit?: string) => {
    if (!currentQuestion) return;

    const val = valueToSubmit || selectedOption || (currentQuestion.inputType === 'NUMERIC_SCALE' ? String(scaleValue) : null);
    if (!val) return;

    try {
      const res = await KioskApi.recordAnswer(sessionId, {
        questionId: currentQuestion.id,
        selectedOptions: [val],
        confidence: 0.95,
        sourceType: ProvenanceType.PATIENT_REPORTED,
      });

      // Check if red-flag emergency alert was triggered
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
      alert(`Answer submission error: ${(err as Error).message}`);
    }
  };

  const handleSimulateVoice = () => {
    setIsVoiceRecording(true);
    setTimeout(() => {
      setIsVoiceRecording(false);
      // Pick first option or default
      const defaultOpt = currentQuestion?.options?.[0]?.value || 'few_hours_ago';
      handleSubmitAnswer(defaultOpt);
    }, 1500);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-teal-300">
            {language === LanguageCode.HI ? 'अगला प्रश्न लोड हो रहा है...' : 'Loading next clinical question...'}
          </p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return null;
  }

  const prompt = language === LanguageCode.HI ? currentQuestion.prompt.hi : currentQuestion.prompt.en;

  return (
    <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-6">
      {/* Progress Bar Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
          <span>{language === LanguageCode.HI ? 'केस-टेकिंग प्रगति' : 'Intake Progress'}</span>
          <span className="text-teal-400">{progress}%</span>
        </div>
        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-slate-850 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl mb-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-700/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center">
              <HelpCircle className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 bg-slate-800 text-teal-300 border border-slate-700 rounded-lg">
              {currentQuestion.section}
            </span>
          </div>
          <AudioPromptButton text={prompt} language={language} size="md" />
        </div>

        {/* Question Prompt */}
        <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug">
          {prompt}
        </h3>

        {/* Input Types */}
        {/* Type 1: Numeric Pain / Severity Scale (1 to 10) */}
        {currentQuestion.inputType === 'NUMERIC_SCALE' && (
          <div className="space-y-6 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-400">1 (Mild / हल्का)</span>
              <span className="text-3xl font-black text-teal-400">{scaleValue}</span>
              <span className="text-sm font-bold text-rose-400">10 (Severe / अत्यधिक)</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={scaleValue}
              onChange={(e) => setScaleValue(parseInt(e.target.value, 10))}
              className="w-full h-4 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
            />
            {scaleValue >= 7 && (
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2 text-amber-300 text-xs font-semibold">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>
                  {language === LanguageCode.HI
                    ? 'उच्च तीव्रता दर्द दर्ज किया जा रहा है। डॉक्टर को विशेष प्राथमिकता अलर्ट भेजा जाएगा।'
                    : 'High severity selected. Priority triage alert will be flagged for staff.'}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Type 2: Choice Options */}
        {currentQuestion.options && currentQuestion.options.length > 0 && currentQuestion.inputType !== 'NUMERIC_SCALE' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {currentQuestion.options.map((opt) => {
              const optLabel = language === LanguageCode.HI ? opt.label.hi : opt.label.en;
              const isSelected = selectedOption === opt.value;

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setSelectedOption(opt.value);
                    handleSubmitAnswer(opt.value);
                  }}
                  className={`kiosk-card p-5 rounded-2xl border-2 flex items-center justify-between text-left transition-all ${
                    isSelected
                      ? 'bg-teal-500/20 border-teal-400 text-white shadow-lg shadow-teal-500/10'
                      : 'bg-slate-900/90 border-slate-700 hover:border-slate-500 text-slate-200'
                  }`}
                >
                  <span className="font-bold text-base">{optLabel}</span>
                  <div
                    className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${
                      isSelected ? 'border-teal-400 bg-teal-400 text-slate-950' : 'border-slate-600'
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
          className={`kiosk-btn border ${
            isVoiceRecording
              ? 'bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
          }`}
        >
          <Mic className="w-5 h-5 text-teal-400" />
          <span>
            {isVoiceRecording
              ? (language === LanguageCode.HI ? 'सुन रहे हैं...' : 'Listening...')
              : (language === LanguageCode.HI ? 'माइक द्वारा बोलें' : 'Speak Voice Answer')}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleSubmitAnswer()}
          className="kiosk-btn bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-base"
        >
          <span>{language === LanguageCode.HI ? 'उत्तर दर्ज करें (आगे बढ़ें)' : 'Submit & Next'}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
