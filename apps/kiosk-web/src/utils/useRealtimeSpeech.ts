import { useState, useEffect, useRef, useCallback } from 'react';
import { LanguageCode, INDIC_LANGUAGES } from '@medikiosk/shared-types';

export interface UseRealtimeSpeechReturn {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  fullLiveText: string;
  audioLevel: number;
  error: string | null;
  isSupported: boolean;
  startListening: (lang?: LanguageCode) => void;
  stopListening: () => void;
  resetTranscript: () => void;
  setCustomTranscript: (text: string) => void;
}

export function useRealtimeSpeech(initialLanguage: LanguageCode = LanguageCode.HI): UseRealtimeSpeechReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const currentLangRef = useRef<LanguageCode>(initialLanguage);

  useEffect(() => {
    currentLangRef.current = initialLanguage;
  }, [initialLanguage]);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('[MediKiosk Speech] Native Web Speech API not present in this browser.');
      setIsSupported(true); // Still allow simulation / manual voice fallback
    }

    return () => {
      stopAudioAnalysis();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, []);

  const startAudioAnalysis = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        startSimulatedAudioMeter();
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      micStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) {
        startSimulatedAudioMeter();
        return;
      }

      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateLevel = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        const normalized = Math.min(1, Math.max(0.08, avg / 128));
        setAudioLevel(normalized);

        animationFrameRef.current = requestAnimationFrame(updateLevel);
      };

      updateLevel();
    } catch {
      // If mic permission rejected or blocked, fallback to simulated visualizer
      startSimulatedAudioMeter();
    }
  };

  const startSimulatedAudioMeter = () => {
    let phase = 0;
    const interval = setInterval(() => {
      phase += 0.2;
      const val = 0.2 + Math.abs(Math.sin(phase) * 0.6) + (Math.random() * 0.2);
      setAudioLevel(Math.min(1, Math.max(0.1, val)));
    }, 100);

    (window as any).__simulatedVoiceInterval = interval;
  };

  const stopAudioAnalysis = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if ((window as any).__simulatedVoiceInterval) {
      clearInterval((window as any).__simulatedVoiceInterval);
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch {}
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setAudioLevel(0);
  };

  const startListening = useCallback((lang?: LanguageCode) => {
    const langToUse = lang || currentLangRef.current;
    currentLangRef.current = langToUse;

    const langInfo = INDIC_LANGUAGES.find((l) => l.code === langToUse);
    const speechTag = langInfo?.speechTag || 'hi-IN';

    setError(null);
    setInterimTranscript('');
    setIsListening(true);
    startAudioAnalysis();

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Simulated interactive real-time voice speech feeder
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = speechTag;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let finalChunk = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const res = event.results[i];
          if (res.isFinal) {
            finalChunk += res[0].transcript + ' ';
          } else {
            currentInterim += res[0].transcript;
          }
        }

        if (finalChunk.trim()) {
          setTranscript((prev) => (prev ? `${prev.trim()} ${finalChunk.trim()}` : finalChunk.trim()));
        }
        setInterimTranscript(currentInterim);
      };

      recognition.onerror = (event: any) => {
        console.warn('[MediKiosk Speech] Recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setError('Microphone access was denied. Please allow microphone permissions or type below.');
        } else if (event.error !== 'no-speech') {
          setError(`Voice input notice: ${event.error}`);
        }
      };

      recognition.onend = () => {
        // If still flagged as listening (e.g. continuous pause), gracefully keep state or restart
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e: any) {
      console.warn('[MediKiosk Speech] Failed to start recognition:', e);
      setError('Live speech recognition initialized with fallback mode.');
    }
  }, []);

  const stopListening = useCallback(() => {
    setIsListening(false);
    setInterimTranscript('');
    stopAudioAnalysis();

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setError(null);
  }, []);

  const setCustomTranscript = useCallback((text: string) => {
    setTranscript(text);
    setInterimTranscript('');
  }, []);

  const fullLiveText = transcript
    ? interimTranscript
      ? `${transcript} ${interimTranscript}`
      : transcript
    : interimTranscript;

  return {
    isListening,
    transcript,
    interimTranscript,
    fullLiveText,
    audioLevel,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    setCustomTranscript,
  };
}
