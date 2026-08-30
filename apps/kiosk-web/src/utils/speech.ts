import { LanguageCode, INDIC_LANGUAGES } from '@medikiosk/shared-types';

export const NATIVE_GREETINGS: Record<string, string> = {
  [LanguageCode.EN]: 'Welcome to MediKiosk at All India Institute of Ayurveda.',
  [LanguageCode.HI]: 'अखिल भारतीय आयुर्वेद संस्थान में आपका स्वागत है।',
  [LanguageCode.HINGLISH]: 'All India Institute of Ayurveda me aapka swagat hai.',
  [LanguageCode.BN]: 'অল ইন্ডিয়া ইনস্টিটিউট অফ আয়ুর্বেদে আপনাকে স্বাগতম।',
  [LanguageCode.MR]: 'अखिल भारतीय आयुर्वेद संस्थेमध्ये आपले स्वागत आहे.',
  [LanguageCode.TE]: 'ఆల్ ఇండియా ఇన్స్టిట్యూట్ ఆఫ్ ఆయుర్వేదకు స్వాగతం.',
  [LanguageCode.TA]: 'அகில இந்திய ஆயுர்வேத நிறுவனத்திற்கு வரவேற்கிறோம்.',
  [LanguageCode.GU]: 'ઓલ ઇન્ડિયા ઇન્સ્ટિટ્યૂટ ઓફ આયુર્વેદમાં આપનું સ્વાગત છે.',
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

export interface SpeakOptions {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: () => void;
  rate?: number;
  pitch?: number;
}

export const speakIndicText = (
  text: string,
  langCode: LanguageCode,
  options?: SpeakOptions
) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this environment');
    options?.onError?.();
    return;
  }

  try {
    window.speechSynthesis.cancel();

    const langInfo = INDIC_LANGUAGES.find((l) => l.code === langCode);
    const speechTag = langInfo?.speechTag || 'hi-IN';

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = speechTag;
    utterance.rate = options?.rate || 0.92;
    utterance.pitch = options?.pitch || 1.0;

    // Resolve matching voices
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      // 1. Direct language tag match (e.g. gu-IN, ml-IN, mr-IN)
      const exactVoice = voices.find(
        (v) =>
          v.lang.toLowerCase() === speechTag.toLowerCase() ||
          v.lang.toLowerCase().replace('_', '-').startsWith(speechTag.toLowerCase().slice(0, 2))
      );

      if (exactVoice) {
        utterance.voice = exactVoice;
      } else {
        // 2. Fallback to Indian English or Hindi voice for Indic accent phonetics
        const indicFallbackVoice = voices.find(
          (v) =>
            v.lang.includes('hi') ||
            v.lang.includes('IN') ||
            v.name.includes('India') ||
            v.name.includes('Hindi')
        );
        if (indicFallbackVoice) {
          utterance.voice = indicFallbackVoice;
        }
      }
    }

    utterance.onstart = () => {
      options?.onStart?.();
    };

    utterance.onend = () => {
      options?.onEnd?.();
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis utterance error:', e);
      options?.onError?.();
    };

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Failed to speak text:', err);
    options?.onError?.();
  }
};
