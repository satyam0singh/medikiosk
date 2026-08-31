import React, { useState, useEffect } from 'react';
import { Mic, ArrowRight, CheckCircle, ArrowLeft } from 'lucide-react';
import { ClinicalQuestion, LanguageCode, ProvenanceType, RedFlagAlert, INDIC_LANGUAGES } from '@medikiosk/shared-types';
import { AudioPromptButton } from '../AudioPromptButton';
import { KioskApi } from '../../services/api';
import { getQuestionsForComplaint, getLocalizedText } from '../../utils/clinicalQuestions';
import { getTranslation } from '../../utils/translations';

import { evaluateTriageEmergencyWithGroq } from '../../utils/groqTriageJudge';

interface InterviewScreenProps {
  sessionId: string;
  language: LanguageCode;
  complaintKey?: string;
  onInterviewCompleted: () => void;
  onRedFlagTriggered: (alert: RedFlagAlert) => void;
  onBack?: () => void;
}

export const InterviewScreen: React.FC<InterviewScreenProps> = ({
  sessionId,
  language,
  complaintKey = 'chest_pain',
  onInterviewCompleted,
  onRedFlagTriggered,
  onBack,
}) => {
  const protocolQuestions = getQuestionsForComplaint(complaintKey);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<ClinicalQuestion>(protocolQuestions[0]);
  const [progress, setProgress] = useState(Math.round((1 / protocolQuestions.length) * 100));
  const [isLoading] = useState(false);
  const [isEvaluatingTriage, setIsEvaluatingTriage] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [collectedAnswers, setCollectedAnswers] = useState<
    Array<{ questionId: string; prompt: string; answerValue: string; answerLabel: string }>
  >([]);

  const t = getTranslation(language);

  // Step back to previous question or previous kiosk screen
  const handleStepBack = () => {
    const qs = getQuestionsForComplaint(complaintKey);
    if (questionIndex > 0) {
      const prevIdx = questionIndex - 1;
      setQuestionIndex(prevIdx);
      setCurrentQuestion(qs[prevIdx]);
      setCollectedAnswers((prev) => prev.slice(0, -1));
      setSelectedOption(null);
    } else if (onBack) {
      onBack();
    }
  };

  // Sync current question when complaint or index changes
  useEffect(() => {
    const qs = getQuestionsForComplaint(complaintKey);
    if (qs[questionIndex]) {
      setCurrentQuestion(qs[questionIndex]);
      setProgress(Math.round(((questionIndex + 1) / qs.length) * 100));
    }
  }, [complaintKey, questionIndex]);

  const handleSubmitAnswer = async (valueToSubmit?: string) => {
    const qs = getQuestionsForComplaint(complaintKey);
    const q = qs[questionIndex] || currentQuestion;
    if (!q) return;

    const val = valueToSubmit || selectedOption || q.options?.[0]?.value || 'confirmed';
    const optObj = q.options?.find((o) => o.value === val);
    const optLabel = optObj ? getLocalizedText(optObj.label as any, language) : val;
    const promptText = getLocalizedText(q.prompt as any, language);

    const newAnswer = {
      questionId: q.id,
      prompt: promptText,
      answerValue: val,
      answerLabel: optLabel,
    };

    const updatedAnswers = [...collectedAnswers, newAnswer];
    setCollectedAnswers(updatedAnswers);

    // Asynchronously record answer without blocking UI
    KioskApi.recordAnswer(sessionId, {
      questionId: q.id,
      selectedOptions: [val],
      confidence: 0.95,
      sourceType: ProvenanceType.PATIENT_REPORTED,
    }).catch((err) => console.warn('Record answer local fallback:', err));

    const nextIdx = questionIndex + 1;
    if (nextIdx < qs.length) {
      setQuestionIndex(nextIdx);
      setCurrentQuestion(qs[nextIdx]);
      setSelectedOption(null);
    } else {
      // Finished all questions -> Run AI Clinical Emergency Triage Judge!
      setIsEvaluatingTriage(true);
      try {
        const decision = await evaluateTriageEmergencyWithGroq(complaintKey, updatedAnswers);
        setIsEvaluatingTriage(false);

        if (decision.isEmergency) {
          const redFlagAlert: RedFlagAlert = {
            id: `rf-alert-${Date.now()}`,
            encounterId: sessionId,
            patientId: 'patient-intake',
            ruleId: decision.redFlagRule,
            severity: 'CRITICAL_EMERGENCY' as any,
            alertMessage:
              language === LanguageCode.HI
                ? `आपातकालीन संकेत: ${decision.clinicalRationale}`
                : `Critical Emergency Detected: ${decision.clinicalRationale}`,
            triggerFacts: decision.triggerFacts.map((f) => ({
              field: f.field,
              value: f.value,
              sourceType: ProvenanceType.PATIENT_REPORTED,
            })),
            isAcknowledged: false,
            createdAt: new Date().toISOString(),
          };

          try {
            const bc = new BroadcastChannel('medikiosk_triage_alerts');
            bc.postMessage({ type: 'NEW_SAFETY_ALERT', alert: redFlagAlert });
            setTimeout(() => bc.close(), 500);
          } catch {}

          onRedFlagTriggered(redFlagAlert);
          return;
        }
      } catch (e) {
        console.error('Triage decision error:', e);
      } finally {
        setIsEvaluatingTriage(false);
      }

      onInterviewCompleted();
    }
  };

  const langInfo = INDIC_LANGUAGES.find((l) => l.code === language);
  const speechTag = langInfo?.speechTag || 'hi-IN';

  const handleStartVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsVoiceRecording(true);
      setTimeout(() => {
        setIsVoiceRecording(false);
        const defaultOpt = currentQuestion?.options?.[0]?.value || 'few_hours_ago';
        handleSubmitAnswer(defaultOpt);
      }, 1200);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = speechTag;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsVoiceRecording(true);
      };

      recognition.onresult = (event: any) => {
        setIsVoiceRecording(false);
        const transcript = event.results[0][0].transcript;
        console.log(`ASR (${speechTag}) transcript:`, transcript);

        const matched = currentQuestion?.options?.find((o) => {
          const lbl = getLocalizedText(o.label as any, language);
          return (
            lbl.toLowerCase().includes(transcript.toLowerCase()) ||
            o.value.toLowerCase().includes(transcript.toLowerCase())
          );
        });

        if (matched) {
          handleSubmitAnswer(matched.value);
        } else {
          const defaultOpt = currentQuestion?.options?.[0]?.value || 'confirmed';
          handleSubmitAnswer(defaultOpt);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error, falling back:', event.error);
        setIsVoiceRecording(false);
        const defaultOpt = currentQuestion?.options?.[0]?.value || 'confirmed';
        handleSubmitAnswer(defaultOpt);
      };

      recognition.onend = () => {
        setIsVoiceRecording(false);
      };

      recognition.start();
    } catch (e) {
      console.warn('Speech recognition start failed, using fallback:', e);
      setIsVoiceRecording(true);
      setTimeout(() => {
        setIsVoiceRecording(false);
        const defaultOpt = currentQuestion?.options?.[0]?.value || 'confirmed';
        handleSubmitAnswer(defaultOpt);
      }, 1200);
    }
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

  const promptText = getLocalizedText(currentQuestion.prompt as any, language);

  return (
    <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full py-2 px-1 sm:px-4 justify-between">
      {/* Progress Header with Back / Previous Button */}
      <div className="mb-3 flex items-center justify-between text-xs font-mono tabular-nums text-[#787774] dark:text-[#8E94A4] shrink-0">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleStepBack}
            title={language === LanguageCode.HI ? 'पिछला सवाल / वापस' : 'Previous / Go Back'}
            className="p-1.5 px-2.5 rounded-lg border border-[#EAEAEA] dark:border-[#232734] bg-[#FFFFFF] dark:bg-[#141720] text-[#111111] dark:text-[#F4F4F6] hover:bg-[#F7F6F3] dark:hover:bg-[#1A1D27] active:scale-95 transition-all cursor-pointer shadow-xs flex items-center gap-1 text-xs font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{questionIndex > 0 ? (language === LanguageCode.HI ? 'पिछला' : 'Prev') : (language === LanguageCode.HI ? 'वापस' : 'Back')}</span>
          </button>
          <span>{t.intake_progress}</span>
        </div>
        <span className="font-bold text-[#111111] dark:text-[#F4F4F6]">{progress}%</span>
      </div>

      {/* Main Question Bento */}
      <div className="border border-[#EAEAEA] dark:border-[#232734] bg-[#FFFFFF] dark:bg-[#141720] rounded-xl p-4 sm:p-5 mb-4 space-y-4 shadow-xs">
        <div className="flex items-start justify-between gap-3 border-b border-[#EAEAEA] dark:border-[#232734] pb-3">
          <div className="space-y-1 min-w-0 pr-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#787774] dark:text-[#8E94A4]">
              {currentQuestion.section || 'HPI'} • {currentQuestion.code || 'Q'}
            </span>
            <h3 className="text-base sm:text-lg font-bold tracking-tight text-[#111111] dark:text-[#F4F4F6] leading-snug">
              {promptText}
            </h3>
          </div>
          <AudioPromptButton text={promptText || ''} language={language} size="md" />
        </div>

        {/* Option 1: Touch / Voice Multiple Choice */}
        {currentQuestion.inputType === 'VOICE_OR_TOUCH' && currentQuestion.options && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {currentQuestion.options.map((opt) => {
              const optLabel = getLocalizedText(opt.label as any, language);
              const isSelected = selectedOption === opt.value;

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedOption(opt.value)}
                  className={`p-3 sm:p-3.5 min-h-[48px] rounded-lg border text-left transition-all active:scale-[0.98] flex items-center justify-between group cursor-pointer ${
                    isSelected
                      ? 'border-[#111111] dark:border-[#F4F4F6] bg-[#F7F6F3] dark:bg-[#1E222D]'
                      : 'border-[#EAEAEA] dark:border-[#232734] bg-[#FFFFFF] dark:bg-[#141720] hover:border-[#CCCCCC]'
                  }`}
                >
                  <span className="text-xs font-medium text-[#111111] dark:text-[#F4F4F6] pr-2">
                    {optLabel}
                  </span>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
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

        {/* AI Evaluating Indicator */}
        {isEvaluatingTriage && (
          <div className="p-3 rounded-lg border border-[#1F6C9F]/30 bg-[#1F6C9F]/10 flex items-center gap-2.5 text-xs text-[#1F6C9F] dark:text-[#70B8FF] animate-pulse">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
            <span className="font-mono">
              {language === LanguageCode.HI
                ? 'क्लिनिकल एआई आपातकालीन विश्लेषण जारी है...'
                : 'Clinical AI Triage Engine analyzing symptom presentation...'}
            </span>
          </div>
        )}
      </div>

      {/* Voice Recording Simulation */}
      {isVoiceRecording && (
        <div className="mb-3 p-2.5 rounded-lg tag-pastel-blue flex items-center justify-center gap-2 font-mono text-xs shrink-0">
          <div className="w-2 h-2 bg-[#1F6C9F] dark:bg-[#70B8FF] rounded-full animate-ping" />
          <span>
            {language === LanguageCode.HI ? 'सुन रहा हूँ... बोलिए' : `${langInfo?.name || 'Voice'} listening...`}
          </span>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 mt-auto shrink-0">
        <button
          type="button"
          onClick={handleStartVoice}
          className={`flex-1 py-3 px-4 min-h-[48px] rounded-lg border font-medium text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer ${
            isVoiceRecording
              ? 'bg-red-500/20 border-red-500/50 text-red-400 animate-pulse'
              : 'border-[#EAEAEA] dark:border-[#232734] bg-[#FFFFFF] dark:bg-[#141720] text-[#666666] dark:text-[#8E94A4]'
          }`}
        >
          <Mic className="w-3.5 h-3.5" />
          <span>
            {isVoiceRecording ? `${langInfo?.name || 'Voice'} Listening...` : `Speak (${langInfo?.name || 'Voice'})`}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleSubmitAnswer()}
          className="flex-1 py-3 px-4 min-h-[48px] bg-[#111111] dark:bg-[#F4F4F6] text-[#FFFFFF] dark:text-[#0D0F14] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer shadow-xs"
        >
          <span>{t.confirm_next}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
