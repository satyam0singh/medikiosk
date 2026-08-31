import { LanguageCode, INDIC_LANGUAGES } from '@medikiosk/shared-types';

export const NATIVE_GREETINGS: Record<string, string> = {
  [LanguageCode.EN]: 'Welcome to MediKiosk at All India Institute of Ayurveda.',
  [LanguageCode.HI]: 'अखिल भारतीय आयुर्वेद संस्थान में आपका स्वागत है।',
  [LanguageCode.HINGLISH]: 'All India Institute of Ayurveda me aapka swagat hai.',
  [LanguageCode.BN]: 'অল ইন্ডিয়া ইনস্টিটিউট অফ আয়ুর্বেদে আপনাকে স্বাগতম।',
  [LanguageCode.MR]: 'अखिल भारतीय आयुर्वेद संस्थेमध्ये आपले स्वागत आहे.',
  [LanguageCode.TE]: 'ఆల్ ఇండియా ఇన్స్టిట్యూట్ ఆఫ్ ఆయుర్వేదకు స్వాగతం.',
  [LanguageCode.TA]: 'அகில இந்திய ஆயுர்வேத நிறுவனத்திற்கு வரவேற்கிறோம்.',
  [LanguageCode.GU]: 'ઓલ ઇન્ડિયા ઇન્સ્ટિટ્યૂट ઓફ આયુર્વેદમાં આપનું સ્વાગત છે.',
  [LanguageCode.UR]: 'آل انڈیا انسٹی ٹیوٹ آف آیوروید میں آپ کا خیر مقدم ہے۔',
  [LanguageCode.KN]: 'ಆಲ್ ಇಂಡಿಯಾ ಇನ್‌ಸ್ಟಿಟ್ಯೂಟ್ ಆಫ್ ಆಯುರ್ವೇದಕ್ಕೆ ಸುಸ್ವಾಗತ.',
  [LanguageCode.OR]: 'ଅଲ୍ ଇଣ୍ଡିଆ ଇନଷ୍ଟିଚ୍ୟୁଟ୍ ଅଫ୍ ଆୟୁର୍ବେଦକୁ ସ୍ୱାଗତ।',
  [LanguageCode.ML]: 'ഓൾ ഇന്ത്യ ഇൻസ്റ്റിറ്റ്യൂട്ട് ഓഫ് ആയുർവേദയിലേക്ക് സ്വാഗതം.',
  [LanguageCode.PA]: 'ਆਲ ਇੰਡੀਆ ਇੰਸਟੀਚਿਊਟ ਆਫ਼ ਆਯੁਰਵੇਦ ਵਿੱਚ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ।',
  [LanguageCode.AS]: 'অল ইণ্ডিয়া ইনষ্টিটিউট অৱ আয়ুৰ্বেদলৈ আপোনাক স্বাগতম।',
  [LanguageCode.MAI]: 'अखिल भारतीय आयुर्वेद संस्थान में अपन सबहक स्वागत अछि।',
  [LanguageCode.SAT]: 'ᱚᱞ ᱤᱱᱰᱤᱭᱟ ᱤᱱᱥᱴᱤᱴᱤᱭᱩᱴ ᱚᱯᱷ ᱟᱭᱩᱨᱵᱮᱫ ᱨᱮ ᱥᱟᱹᱜᱩᱱ ᱫᱟᱨᱟᱢ᱾',
  [LanguageCode.KS]: 'آل انڈیا انسٹی ٹیوٹ آف آیوروید منز چھو توہند خیر مقدم۔',
  [LanguageCode.NE]: 'अखिल भारतीय आयुर्वेद संस्थानमा यहाँलाई स्वागत छ।',
  [LanguageCode.KOK]: 'अखिल भारतीय आयुर्वेद संस्थानांत तुमचें येवकार आसा.',
  [LanguageCode.SD]: 'آل انڊيا انسٽيٽيوٽ آف آيورويڊ ۾ اوهان جو آڌرڀاءُ آهي.',
  [LanguageCode.DGO]: 'अखिल भारतीय आयुर्वेद संस्थान च तुंदा स्वागत ऐ।',
  [LanguageCode.MNI]: 'ꯑꯣꯜ ꯏꯟꯗꯤꯌꯥ ꯏꯟꯁꯇꯤꯠꯌꯨꯠ ꯑꯣꯐ ꯑꯥꯌꯨꯔꯚꯦꯗꯥꯗꯥ ꯇꯔꯥꯝꯅꯥ ꯑꯣꯛꯆꯔꯤ꯫',
  [LanguageCode.BRX]: 'अल इन्डिया इन्स्टिटिउट अफ आयुर्वेदआव नोंथांखौ बरायबाय।',
  [LanguageCode.SA]: 'अखिलभारतीयआयुर्वेदसंस्थाने भवतां हार्दिकं स्वागतम्।',
};

export const PHONETIC_GREETINGS: Record<string, string> = {
  [LanguageCode.EN]: 'Welcome to MediKiosk at All India Institute of Ayurveda.',
  [LanguageCode.HI]: 'Namaste. Akhil Bharatiya Ayurveda Sansthan mein aapka swagat hai.',
  [LanguageCode.HINGLISH]: 'Namaste. All India Institute of Ayurveda mein aapka swagat hai.',
  [LanguageCode.BN]: 'Nomoshkar. All India Institute of Ayurveda-te aapnake shagotom.',
  [LanguageCode.MR]: 'Namaskar. Akhil Bharatiya Ayurveda Sansthe-madhye aaple swagat aahe.',
  [LanguageCode.TE]: 'Namaskaram. All India Institute of Ayurveda-ku swagatham.',
  [LanguageCode.TA]: 'Vanakkam. Akil Indhiya Aayurveda Niruvanaththirkku varaveerkirom.',
  [LanguageCode.GU]: 'Namaste. All India Institute of Ayurveda maan aapnu swagat chhe.',
  [LanguageCode.UR]: 'Assalamu Alaikum. All India Institute of Ayurveda mein aapka khair maqdam hai.',
  [LanguageCode.KN]: 'Namaskara. All India Institute of Ayurveda-kke suswagatha.',
  [LanguageCode.OR]: 'Namaskar. All India Institute of Ayurveda-ku swagata.',
  [LanguageCode.ML]: 'Namaskaram. All India Institute of Ayurveda-yilekku swagatham.',
  [LanguageCode.PA]: 'Sat Sri Akal. All India Institute of Ayurveda vich tuhaada swagat hai.',
  [LanguageCode.AS]: 'Nomoskar. All India Institute of Ayurveda-loi aaponaak swagatom.',
  [LanguageCode.MAI]: 'Pranam. Akhil Bharatiya Ayurveda Sansthan mein apan sabhak swagat achhi.',
  [LanguageCode.SAT]: 'Johar. All India Institute of Ayurveda re sagun daram.',
  [LanguageCode.KS]: 'Adaab. All India Institute of Ayurveda manz chhu tuhond khair maqdam.',
  [LanguageCode.NE]: 'Namaste. Akhil Bharatiya Ayurveda Sansthan ma yahaan lai swagat chha.',
  [LanguageCode.KOK]: 'Namaskar. Akhil Bharatiya Ayurveda Sansthaanant tumche yevkaar aasa.',
  [LanguageCode.SD]: 'Salaam. All India Institute of Ayurveda mein tavhan jo aadharbhaa aahe.',
  [LanguageCode.DGO]: 'Namaste. Akhil Bharatiya Ayurveda Sansthan ch tunda swagat ai.',
  [LanguageCode.MNI]: 'Khurumjari. All India Institute of Ayurveda-da taramna okchari.',
  [LanguageCode.BRX]: 'Khulumby. All India Institute of Ayurveda-ao nongthangkhou boraybai.',
  [LanguageCode.SA]: 'Namo Namah. Akhila Bharatiya Ayurveda Sansthane bhavataam haardikam swagatam.',
};

/**
 * Common prompt translation fallbacks so English voice speaks the exact question/prompt
 */
export const PROMPT_FALLBACKS: Record<string, string> = {
  // Screen Audio Prompts
  'audio_identity': 'Welcome to MediKiosk. Please search by ABHA ID or mobile number, or choose a patient below.',
  'audio_consent': 'Please provide digital consent for doctor consultation under DPDP and ABHA guidelines.',
  'audio_complaint': 'What brings you to All India Institute of Ayurveda today? Please select your primary health concern.',
  'audio_records': 'Please upload your previous prescriptions, lab reports, or discharge summaries for OCR extraction.',

  // Common Clinical Questions
  'When did this chest pain or discomfort start?': 'When did this chest pain or discomfort start?',
  'How many days have you had this fever or cold?': 'How many days have you had this fever, cold, or cough?',
  'Where is your stomach discomfort located?': 'Where is your stomach pain or acidity located?',
  'Which joints are primarily painful or swollen?': 'Which joints are experiencing pain, stiffness, or swelling?',
  'Where is the skin rash located and how long has it been present?': 'Where is the skin rash located and how long has it been present?',
  'How would you describe your digestive appetite (Jatharagni)?': 'How is your daily digestive appetite and food intake?',
  'On a scale from 1 (mild) to 10 (severe), how intense is the pain right now?': 'On a scale from 1 to 10, how intense is your pain right now?',
  'Do you experience shivering chills or high body temperature spikes?': 'Do you experience shivering chills with high fever spikes?',
  'Rate your joint pain severity while walking or climbing stairs (1 to 10):': 'Rate your joint pain severity while walking or climbing stairs from 1 to 10.',
  'Rate your itching (Kandu) severity from 1 (mild) to 10 (unbearable):': 'Rate your itching severity from 1 to 10.',
};

export interface SpeakOptions {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: () => void;
  rate?: number;
  pitch?: number;
}

export const playAudioBeep = (freq = 587.33, duration = 0.08) => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // AudioContext blocked by browser policy
  }
};

const findVoiceForTag = (voices: SpeechSynthesisVoice[], speechTag: string): SpeechSynthesisVoice | null => {
  const tag = speechTag.toLowerCase();
  const prefix = tag.slice(0, 2);

  const exact = voices.find((v) => v.lang.toLowerCase().replace('_', '-') === tag);
  if (exact) return exact;

  const prefixed = voices.find((v) => v.lang.toLowerCase().replace('_', '-').startsWith(prefix + '-'));
  if (prefixed) return prefixed;

  return null;
};

const findIndianFallbackVoice = (voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null => {
  const enIn = voices.find(
    (v) =>
      v.lang.toLowerCase().replace('_', '-') === 'en-in' ||
      v.name.toLowerCase().includes('india') ||
      v.name.toLowerCase().includes('ravi') ||
      v.name.toLowerCase().includes('heera')
  );
  if (enIn) return enIn;

  const hi = voices.find((v) => v.lang.toLowerCase().startsWith('hi'));
  if (hi) return hi;

  return voices.length > 0 ? voices[0] : null;
};

export const speakIndicText = async (
  text: string,
  langCode: LanguageCode,
  options?: SpeakOptions
) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('[MediKiosk TTS] Speech synthesis not supported');
    options?.onError?.();
    return;
  }

  // Play subtle feedback beep immediately
  playAudioBeep();

  try {
    window.speechSynthesis.cancel();

    const langInfo = INDIC_LANGUAGES.find((l) => l.code === langCode);
    const speechTag = langInfo?.speechTag || 'hi-IN';

    let voices = window.speechSynthesis.getVoices();

    if (voices.length === 0) {
      const voicesLoaded = new Promise<SpeechSynthesisVoice[]>((resolve) => {
        const handler = () => {
          window.speechSynthesis.removeEventListener('voiceschanged', handler);
          resolve(window.speechSynthesis.getVoices());
        };
        window.speechSynthesis.addEventListener('voiceschanged', handler);
        setTimeout(() => resolve(window.speechSynthesis.getVoices()), 300);
      });
      voices = await voicesLoaded;
    }

    const nativeVoice = findVoiceForTag(voices, speechTag);

    let textToSpeak = text;
    let voiceToUse: SpeechSynthesisVoice | null = null;
    let langToSet = speechTag;

    if (nativeVoice) {
      // 1. Browser has exact native voice for this language
      textToSpeak = text;
      voiceToUse = nativeVoice;
      langToSet = speechTag;
      console.log(`[MediKiosk TTS] Native voice "${nativeVoice.name}" for ${langCode}`);
    } else {
      // 2. Browser does not have native voice (e.g. Windows Chrome with en-IN/en-US)
      const fallbackVoice = findIndianFallbackVoice(voices);
      voiceToUse = fallbackVoice;
      langToSet = fallbackVoice?.lang || 'en-IN';

      // If it's a welcome greeting, use the language-specific phonetic greeting
      if (NATIVE_GREETINGS[langCode] && text === NATIVE_GREETINGS[langCode]) {
        textToSpeak = PHONETIC_GREETINGS[langCode] || text;
      } else {
        // Look up in phrase fallbacks or speak the clean text
        const matched = Object.entries(PROMPT_FALLBACKS).find(([key]) =>
          text.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(text.toLowerCase())
        );

        if (matched) {
          textToSpeak = matched[1];
        } else if (/[^\u0000-\u007F]/.test(text)) {
          // If it contains non-Latin script and no match, speak with English phonetic description
          textToSpeak = text;
        } else {
          textToSpeak = text;
        }
      }
      console.log(`[MediKiosk TTS] Fallback voice "${fallbackVoice?.name}" speaking: "${textToSpeak.slice(0, 40)}..."`);
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = langToSet;
    utterance.rate = options?.rate || 0.92;
    utterance.pitch = options?.pitch || 1.0;

    if (voiceToUse) {
      utterance.voice = voiceToUse;
    }

    let started = false;

    utterance.onstart = () => {
      started = true;
      options?.onStart?.();
    };

    utterance.onend = () => {
      options?.onEnd?.();
    };

    utterance.onerror = (e) => {
      console.warn('[MediKiosk TTS] Utterance error:', e.error);
      if (!started) {
        options?.onStart?.();
      }
      options?.onError?.();
    };

    (window as any).__lastUtterance = utterance;

    window.speechSynthesis.speak(utterance);

    setTimeout(() => {
      if (!started) {
        started = true;
        options?.onStart?.();
        setTimeout(() => {
          options?.onEnd?.();
        }, 2000);
      }
    }, 200);
  } catch (err) {
    console.warn('[MediKiosk TTS] Failed to speak:', err);
    options?.onError?.();
  }
};
