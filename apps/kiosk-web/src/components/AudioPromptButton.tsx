import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { LanguageCode } from '@medikiosk/shared-types';

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
    utterance.lang = language === LanguageCode.HI ? 'hi-IN' : 'en-IN';
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

  return (
    <button
      type="button"
      onClick={handleSpeak}
      className={`rounded-2xl border flex items-center gap-2 font-bold transition-all active:scale-95 shadow-md ${
        isPlaying
          ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 animate-pulse'
          : 'bg-teal-500/10 hover:bg-teal-500/20 border-teal-500/30 text-teal-300'
      } ${sizeClasses[size]} ${className}`}
      title={language === LanguageCode.HI ? 'आवाज सुनें' : 'Listen audio'}
    >
      {isPlaying ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
      <span>{language === LanguageCode.HI ? 'बोलकर सुनें' : 'Listen'}</span>
    </button>
  );
};
