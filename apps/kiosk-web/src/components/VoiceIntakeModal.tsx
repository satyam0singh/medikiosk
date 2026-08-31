import React, { useState, useEffect } from 'react';
import {
  Mic,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Stethoscope,
  Globe,
  FileText,
  Clock,
  Volume2,
  X,
  ChevronRight,
  Edit3,
} from 'lucide-react';
import { LanguageCode, Patient, INDIC_LANGUAGES } from '@medikiosk/shared-types';
import { useRealtimeSpeech } from '../utils/useRealtimeSpeech';
import {
  extractLiveEntitiesFromTranscript,
  generateDoctorSummaryFromVoice,
  AiDoctorVoiceSummary,
} from '../utils/groqVoiceIntake';

export interface VoiceIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: LanguageCode;
  patient: Patient;
  onConfirmVoiceIntake: (summary: AiDoctorVoiceSummary) => void;
}

const SAMPLE_PROMPTS = [
  {
    lang: LanguageCode.HI,
    label: 'Hindi: बुखार व सिरदर्द',
    text: 'मुझे 3 दिन से बहुत तेज सिर दर्द और बुखार है, और ठंड लग रही है।',
  },
  {
    lang: LanguageCode.HINGLISH,
    label: 'Hinglish: Chest Burning',
    text: 'Kal raat se severe chest burning pain ho raha hai khana khane ke baad, breathlessness bhi lag rahi hai.',
  },
  {
    lang: LanguageCode.EN,
    label: 'English: Joint Stiffness',
    text: 'I have severe right knee joint pain and swelling for the past 2 weeks with morning stiffness.',
  },
  {
    lang: LanguageCode.HI,
    label: 'Hindi: पेट दर्द व गैस',
    text: 'पेट के ऊपरी हिस्से में तेज जलन और गैस की समस्या है, खाना खाने के बाद उल्टी जैसा लगता है।',
  },
];

export const VoiceIntakeModal: React.FC<VoiceIntakeModalProps> = ({
  isOpen,
  onClose,
  language,
  patient,
  onConfirmVoiceIntake,
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>(language || LanguageCode.HI);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [generatedSummary, setGeneratedSummary] = useState<AiDoctorVoiceSummary | null>(null);
  const [isEditingManually, setIsEditingManually] = useState(false);
  const [manualText, setManualText] = useState('');

  const {
    isListening,
    transcript,
    interimTranscript,
    fullLiveText,
    audioLevel,
    error,
    startListening,
    stopListening,
    resetTranscript,
    setCustomTranscript,
  } = useRealtimeSpeech(selectedLanguage);

  // Auto-start recording when modal opens
  useEffect(() => {
    if (isOpen) {
      setGeneratedSummary(null);
      setIsGeneratingSummary(false);
      resetTranscript();
      startListening(selectedLanguage);
    } else {
      stopListening();
    }
  }, [isOpen, selectedLanguage]);

  // Live real-time extracted entities
  const activeText = (isEditingManually ? manualText : (manualText || fullLiveText)) || '';
  const liveEntities = extractLiveEntitiesFromTranscript(activeText, selectedLanguage);

  if (!isOpen) return null;

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening(selectedLanguage);
    }
  };

  const handleApplySample = (sampleText: string, sampleLang: LanguageCode) => {
    setSelectedLanguage(sampleLang);
    setCustomTranscript(sampleText);
    setManualText(sampleText);
    setIsEditingManually(true);
    stopListening();
  };

  const handleGenerateSummary = async () => {
    const textToProcess = manualText.trim() || fullLiveText.trim();
    if (!textToProcess) return;

    stopListening();
    setIsGeneratingSummary(true);
    try {
      const summary = await generateDoctorSummaryFromVoice(textToProcess, selectedLanguage, {
        fullName: patient.fullName,
        age: patient.age,
        gender: patient.gender,
        abhaId: patient.abhaId,
      });
      setGeneratedSummary(summary);
    } catch (e) {
      console.error('Failed to generate voice summary:', e);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleConfirmAndProceed = () => {
    if (!generatedSummary) return;
    onConfirmVoiceIntake(generatedSummary);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#FFFFFF] dark:bg-[#12151E] border border-[#EAEAEA] dark:border-[#232734] rounded-2xl shadow-2xl overflow-hidden">
        {/* Modal Top Header */}
        <div className="p-3 sm:p-4 border-b border-[#EAEAEA] dark:border-[#232734] flex items-center justify-between gap-3 bg-[#FBFBFA] dark:bg-[#10121A] shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#111111] dark:bg-[#F4F4F6] text-[#FFFFFF] dark:text-[#0D0F14] flex items-center justify-center shrink-0">
              <Mic className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#111111] dark:text-[#F4F4F6] truncate">
                  AI Multilingual Voice Intake
                </h3>
                <span className="tag-pastel-blue px-2 py-0.2 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider shrink-0">
                  AI4Bharat ASR Engine
                </span>
              </div>
              <p className="text-[11px] text-[#787774] dark:text-[#8E94A4] truncate">
                Speak naturally in Hindi, English, Hinglish, or your native language.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Language Switcher Dropdown */}
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#787774] dark:text-[#8E94A4]" />
              <select
                value={selectedLanguage}
                onChange={(e) => {
                  const newLang = e.target.value as LanguageCode;
                  setSelectedLanguage(newLang);
                  startListening(newLang);
                }}
                className="py-1 px-2 text-xs font-mono rounded-md border border-[#EAEAEA] dark:border-[#2A2E3D] bg-[#FFFFFF] dark:bg-[#1A1D27] text-[#111111] dark:text-[#F4F4F6] outline-none cursor-pointer"
              >
                <option value={LanguageCode.HI}>Hindi (हिन्दी)</option>
                <option value={LanguageCode.HINGLISH}>Hinglish (हिंग्लिश)</option>
                <option value={LanguageCode.EN}>English (Indian)</option>
                {INDIC_LANGUAGES.filter(
                  (l) => l.code !== LanguageCode.HI && l.code !== LanguageCode.HINGLISH && l.code !== LanguageCode.EN
                ).map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.name} ({l.nativeName})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#787774] hover:text-[#111111] dark:hover:text-[#F4F4F6] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* 1. Interactive Audio Waveform & Live Record Center */}
          <div className="border border-[#EAEAEA] dark:border-[#232734] bg-[#FBFBFA] dark:bg-[#151822] rounded-xl p-4 sm:p-5 flex flex-col items-center justify-center text-center relative overflow-hidden">
            {/* Animated Soundwave Visualizer Bars */}
            <div className="flex items-center justify-center gap-1.5 h-12 mb-3">
              {[0.4, 0.7, 1.0, 0.6, 0.9, 1.2, 0.8, 1.4, 0.9, 0.5, 0.8, 1.1, 0.6].map((scale, i) => {
                const barHeight = isListening ? Math.max(6, Math.min(44, audioLevel * 48 * scale)) : 6;
                return (
                  <div
                    key={i}
                    style={{ height: `${barHeight}px` }}
                    className={`w-1.5 rounded-full transition-all duration-75 ${
                      isListening
                        ? 'bg-gradient-to-t from-[#1F6C9F] to-[#70B8FF]'
                        : 'bg-[#CCCCCC] dark:bg-[#333A4D]'
                    }`}
                  />
                );
              })}
            </div>

            {/* Mic Toggle Button */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleToggleListening}
                className={`px-5 py-2.5 rounded-full font-bold text-xs flex items-center gap-2 transition-all active:scale-95 cursor-pointer shadow-md ${
                  isListening
                    ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                    : 'bg-[#111111] hover:bg-black dark:bg-[#F4F4F6] dark:hover:bg-white text-[#FFFFFF] dark:text-[#0D0F14]'
                }`}
              >
                {isListening ? (
                  <>
                    <Mic className="w-4 h-4" />
                    <span>Listening into Kiosk Mic... (Tap to Pause)</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    <span>Start Speaking (Mic Paused)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={resetTranscript}
                title="Clear transcript"
                className="p-2 rounded-full border border-[#EAEAEA] dark:border-[#2A2E3D] bg-[#FFFFFF] dark:bg-[#1A1D27] text-[#787774] hover:text-[#111111] dark:hover:text-[#F4F4F6] text-xs transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {error && (
              <p className="text-[11px] text-amber-500 dark:text-amber-400 mt-2 font-mono">{error}</p>
            )}
          </div>

          {/* Quick Clickable Sample Phrases */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#787774] dark:text-[#8E94A4] block">
              Quick Test Speech Prompts (Tap to Speak):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_PROMPTS.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplySample(sample.text, sample.lang)}
                  className="px-2.5 py-1.5 rounded-lg border border-[#EAEAEA] dark:border-[#232734] bg-[#FFFFFF] dark:bg-[#141720] hover:border-[#111111] dark:hover:border-[#F4F4F6] text-[11px] font-medium text-[#111111] dark:text-[#F4F4F6] flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer text-left"
                >
                  <Volume2 className="w-3 h-3 text-[#1F6C9F] dark:text-[#70B8FF] shrink-0" />
                  <span className="truncate max-w-[240px]">{sample.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Real-Time Streaming Transcription Display & Live Entity Binding */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left 7 Cols: Real-time Transcript Window */}
            <div className="lg:col-span-7 border border-[#EAEAEA] dark:border-[#232734] bg-[#FFFFFF] dark:bg-[#141720] rounded-xl p-4 space-y-2.5">
              <div className="flex items-center justify-between border-b border-[#EAEAEA] dark:border-[#232734] pb-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-[#1F6C9F] dark:text-[#70B8FF]" />
                  <span className="text-xs font-bold text-[#111111] dark:text-[#F4F4F6]">
                    Live Streaming Transcript
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingManually(!isEditingManually);
                    if (!isEditingManually) setManualText(activeText);
                  }}
                  className="text-[10px] font-mono text-[#1F6C9F] dark:text-[#70B8FF] flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>{isEditingManually ? 'Switch to Live Speech' : 'Edit Text'}</span>
                </button>
              </div>

              {isEditingManually ? (
                <textarea
                  rows={4}
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  placeholder="Type or correct your symptoms here..."
                  className="w-full p-2.5 border rounded-lg text-xs outline-none bg-[#FBFBFA] dark:bg-[#10121A] border-[#EAEAEA] dark:border-[#232734] text-[#111111] dark:text-[#F4F4F6]"
                />
              ) : (
                <div className="min-h-[96px] p-3 rounded-lg bg-[#FBFBFA] dark:bg-[#10121A] border border-[#EAEAEA] dark:border-[#232734] font-medium text-xs leading-relaxed text-[#111111] dark:text-[#F4F4F6]">
                  {transcript ? (
                    <span>
                      {transcript}
                      {interimTranscript && (
                        <span className="text-[#1F6C9F] dark:text-[#70B8FF] italic font-normal">
                          {' '}
                          {interimTranscript}
                        </span>
                      )}
                    </span>
                  ) : interimTranscript ? (
                    <span className="text-[#1F6C9F] dark:text-[#70B8FF] italic">
                      {interimTranscript}
                    </span>
                  ) : (
                    <span className="text-[#888888] italic">
                      Speak into the microphone... Words will transcribe in real-time here in Hindi, English, or Hinglish.
                    </span>
                  )}
                  {isListening && (
                    <span className="inline-block w-1.5 h-3.5 bg-[#1F6C9F] dark:bg-[#70B8FF] ml-1 animate-pulse align-middle" />
                  )}
                </div>
              )}
            </div>

            {/* Right 5 Cols: Real-Time Dynamic Entity Alignment Card */}
            <div className="lg:col-span-5 border border-[#EAEAEA] dark:border-[#232734] bg-[#FFFFFF] dark:bg-[#141720] rounded-xl p-4 space-y-2.5">
              <div className="flex items-center justify-between border-b border-[#EAEAEA] dark:border-[#232734] pb-2">
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#1F6C9F] dark:text-[#70B8FF]" />
                  <span className="text-xs font-bold text-[#111111] dark:text-[#F4F4F6]">
                    Dynamic Summary Alignment
                  </span>
                </div>
                <span className="tag-pastel-green px-1.5 py-0.2 rounded text-[9px] font-mono font-bold">
                  LIVE PARSED
                </span>
              </div>

              <div className="space-y-1.5 text-xs font-mono">
                <div className="p-2 rounded bg-[#FBFBFA] dark:bg-[#10121A] border border-[#EAEAEA] dark:border-[#232734]">
                  <span className="text-[9px] uppercase text-[#787774] dark:text-[#8E94A4] block">
                    Chief Complaint:
                  </span>
                  <span className="font-bold text-[#111111] dark:text-[#F4F4F6] truncate block">
                    {liveEntities.primaryComplaint || 'Awaiting Speech...'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  <div className="p-2 rounded bg-[#FBFBFA] dark:bg-[#10121A] border border-[#EAEAEA] dark:border-[#232734]">
                    <span className="text-[9px] uppercase text-[#787774] dark:text-[#8E94A4] block">
                      Duration:
                    </span>
                    <span className="font-bold text-[#111111] dark:text-[#F4F4F6] truncate block">
                      {liveEntities.onset || 'Acute'}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-[#FBFBFA] dark:bg-[#10121A] border border-[#EAEAEA] dark:border-[#232734]">
                    <span className="text-[9px] uppercase text-[#787774] dark:text-[#8E94A4] block">
                      Severity:
                    </span>
                    <span
                      className={`font-bold tabular-nums block ${
                        (liveEntities.severity || 5) >= 7 ? 'text-red-500' : 'text-emerald-500'
                      }`}
                    >
                      {liveEntities.severity || 5} / 10
                    </span>
                  </div>
                </div>

                <div className="p-2 rounded bg-[#FBFBFA] dark:bg-[#10121A] border border-[#EAEAEA] dark:border-[#232734] flex items-center justify-between">
                  <span className="text-[9px] uppercase text-[#787774] dark:text-[#8E94A4]">
                    Routed Specialty:
                  </span>
                  <span className="tag-pastel-blue px-1.5 py-0.2 rounded text-[10px] font-bold">
                    {liveEntities.recommendedDepartment || 'General Medicine'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. AI Generated Doctor Summary Card (Once Synthesized) */}
          {generatedSummary && (
            <div className="border-2 border-[#1F6C9F]/40 bg-[#1F6C9F]/5 dark:bg-[#1F6C9F]/10 rounded-xl p-4 sm:p-5 space-y-3.5 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1F6C9F]/20 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#1F6C9F] text-white">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#111111] dark:text-[#F4F4F6]">
                      AI Clinical Briefing Synthesized for Doctor
                    </h4>
                    <p className="text-[10px] text-[#787774] dark:text-[#8E94A4]">
                      S.B.A.R. Medical Note • Clinical AI Intelligence
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="tag-pastel-green px-2 py-0.5 rounded text-[10px] font-mono font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Confidence {(generatedSummary.confidence * 100).toFixed(0)}%</span>
                  </span>
                  {generatedSummary.entities.emergencyRedFlag && (
                    <span className="tag-pastel-red px-2 py-0.5 rounded text-[10px] font-mono font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>RED FLAG EMERGENCY</span>
                    </span>
                  )}
                </div>
              </div>

              {/* SBAR Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-[#FFFFFF] dark:bg-[#141720] border border-[#EAEAEA] dark:border-[#232734]">
                  <strong className="text-[10px] font-mono text-[#1F6C9F] dark:text-[#70B8FF] block mb-0.5 uppercase">
                    [S] Situation
                  </strong>
                  <p className="text-[11px] leading-relaxed text-[#333333] dark:text-[#CCCCCC]">
                    {generatedSummary.sbarSummary.situation}
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-[#FFFFFF] dark:bg-[#141720] border border-[#EAEAEA] dark:border-[#232734]">
                  <strong className="text-[10px] font-mono text-[#1F6C9F] dark:text-[#70B8FF] block mb-0.5 uppercase">
                    [B] Background & Verbatim Quote
                  </strong>
                  <p className="text-[11px] leading-relaxed text-[#333333] dark:text-[#CCCCCC]">
                    {generatedSummary.sbarSummary.background}
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-[#FFFFFF] dark:bg-[#141720] border border-[#EAEAEA] dark:border-[#232734]">
                  <strong className="text-[10px] font-mono text-[#1F6C9F] dark:text-[#70B8FF] block mb-0.5 uppercase">
                    [A] Clinical Assessment
                  </strong>
                  <p className="text-[11px] leading-relaxed text-[#333333] dark:text-[#CCCCCC]">
                    {generatedSummary.sbarSummary.assessment}
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-[#FFFFFF] dark:bg-[#141720] border border-[#EAEAEA] dark:border-[#232734]">
                  <strong className="text-[10px] font-mono text-[#1F6C9F] dark:text-[#70B8FF] block mb-0.5 uppercase">
                    [R] Recommendation & Orders
                  </strong>
                  <p className="text-[11px] leading-relaxed text-[#333333] dark:text-[#CCCCCC]">
                    {generatedSummary.sbarSummary.recommendation}
                  </p>
                </div>
              </div>

              {/* Suggested Investigations Pills */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-mono uppercase text-[#787774] dark:text-[#8E94A4]">
                  Diagnostic Orders:
                </span>
                {generatedSummary.entities.suggestedInvestigations.map((inv, i) => (
                  <span key={i} className="tag-pastel-yellow px-2 py-0.5 rounded text-[10px] font-mono font-medium">
                    {inv}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="p-3 sm:p-4 border-t border-[#EAEAEA] dark:border-[#232734] flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#FBFBFA] dark:bg-[#10121A] shrink-0">
          <div className="flex items-center gap-2 text-xs text-[#787774] dark:text-[#8E94A4]">
            <Clock className="w-3.5 h-3.5" />
            <span>DPDP & ABDM Audited Clinical Provenance</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {!generatedSummary ? (
              <button
                type="button"
                onClick={handleGenerateSummary}
                disabled={!activeText.trim() || isGeneratingSummary}
                className="w-full sm:w-auto px-5 py-2.5 min-h-[42px] bg-[#111111] dark:bg-[#F4F4F6] text-[#FFFFFF] dark:text-[#0D0F14] rounded-lg font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                {isGeneratingSummary ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Synthesizing Doctor Summary...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate AI Doctor Summary</span>
                  </>
                )}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setGeneratedSummary(null)}
                  className="px-4 py-2 min-h-[40px] border border-[#EAEAEA] dark:border-[#232734] rounded-lg text-xs font-medium text-[#787774] dark:text-[#8E94A4] hover:bg-[#F0F0EF] dark:hover:bg-[#1E222D] cursor-pointer"
                >
                  Re-Record
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAndProceed}
                  className="w-full sm:w-auto px-5 py-2.5 min-h-[42px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm & Send to Doctor Dashboard</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
