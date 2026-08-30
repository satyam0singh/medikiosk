import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { LanguageCode, INDIC_LANGUAGES } from '@medikiosk/shared-types';

interface AudioPromptButtonProps {
  text: string;
  language: LanguageCode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const AudioPromptButton: React.FC<AudioPromptButtonProps> = ({
  text,
  language,
  className = '',
  size = 'md',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const langInfo = INDIC_LANGUAGES.find((l) => l.code === language);
  const speechTag = langInfo?.speechTag || (language === LanguageCode.HI ? 'hi-IN' : 'en-IN');

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis not supported in this browser.');
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = speechTag;
    utterance.rate = 0.95; // Slightly slower for low-literacy clarity

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  const sizeClasses = {
    sm: 'p-2 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3.5 text-base',
  };

  const getButtonLabel = () => {
    switch (language) {
      case LanguageCode.HI:
        return 'बोलकर सुनें';
      case LanguageCode.BN:
        return 'শুনুন';
      case LanguageCode.MR:
        return 'ऐका';
      case LanguageCode.TA:
        return 'கேளுங்கள்';
      case LanguageCode.TE:
        return 'వినండి';
      case LanguageCode.GU:
        return 'સાંભળો';
      case LanguageCode.KN:
        return 'ಆಲಿಸಿ';
      case LanguageCode.ML:
        return 'കേൾക്കുക';
      case LanguageCode.PA:
        return 'ਸੁਣੋ';
      case LanguageCode.OR:
        return 'ଶୁଣନ୍ତୁ';
      default:
        return 'Listen';
    }
  };

  return (
    <button
      type="button"
      onClick={handleSpeak}
      className={`rounded-2xl border flex items-center gap-2 font-bold transition-all active:scale-95 shadow-md ${
        isPlaying
          ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 animate-pulse'
          : 'bg-teal-500/10 hover:bg-teal-500/20 border-teal-500/30 text-teal-300'
      } ${sizeClasses[size]} ${className}`}
      title={`Listen in ${langInfo?.name || 'Language'}`}
    >
      {isPlaying ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
      <span>{getButtonLabel()}</span>
    </button>
  );
};

