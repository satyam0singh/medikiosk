import { LanguageCode, INDIC_LANGUAGES } from '@medikiosk/shared-types';

export const NATIVE_GREETINGS: Record<string, string> = {
  [LanguageCode.HI]: 'अखिल भारतीय आयुर्वेद संस्थान में आपका स्वागत है। अपनी भाषा में परामर्श शुरू करें।',
  [LanguageCode.EN]: 'Welcome to All India Institute of Ayurveda. Please touch to begin your clinical check-in.',
  [LanguageCode.HINGLISH]: 'All India Institute of Ayurveda mein aapka swagat hai. Apna clinical intake start karein.',
  [LanguageCode.ML]: 'അഖിലേന്ത്യാ ആയുർവേദ ഇൻസ്റ്റിറ്റ്യൂട്ടിലേക്ക് സ്വാഗതം. നിങ്ങളുടെ പരിശോധന ഇവിടെ ആരംഭിക്കാം.',
  [LanguageCode.TA]: 'அகில இந்திய ஆயுர்வேத நிறுவனத்திற்கு வரவேற்கிறோம். உங்கள் மருத்துவ பதிவை தொடங்கவும்.',
  [LanguageCode.TE]: 'ఆల్ ఇండియా ఇన్స్టిట్యూట్ ఆఫ్ ఆయుర్వేదకు స్వాగతం. మీ వైద్య సంప్రదింపులను ప్రారంభించండి.',
  [LanguageCode.BN]: 'অল ইন্ডিয়া ইনস্টিটিউট অফ আয়ুর্বেদে আপনাকে স্বাগতম। আপনার স্বাস্থ্য পরামর্শ শুরু করুন।',
  [LanguageCode.MR]: 'अखिल भारतीय आयुर्वेद संस्थेमध्ये आपले स्वागत आहे. आपला तपासणी सल्ला सुरू करा.',
  [LanguageCode.GU]: 'ઓલ ઇન્ડિયા ઇન્સ્ટિટ્યૂટ ઓફ આયુર્વેદમાં આપનું સ્વાગત છે. આપનો પરામર્શ અહીં શરૂ કરો.',
  [LanguageCode.KN]: 'ಆಲ್ ಇಂಡಿಯಾ ಇನ್ಸ್ಟಿಟ್ಯೂಟ್ ಆಫ್ ಆಯುರ್ವೇದಕ್ಕೆ ಸುಸ್ವಾಗತ. ನಿಮ್ಮ ಚಿಕಿತ್ಸಾ ಸಮಾಲೋಚನೆಯನ್ನು ಪ್ರಾರಂಭಿಸಿ.',
  [LanguageCode.OR]: 'ଅଲ ଇଣ୍ଡିଆ ଇନଷ୍ଟିଚ୍ୟୁଟ୍ ଅଫ୍ ଆୟୁର୍ବେଦକୁ ସ୍ୱାଗତ | ଆପଣଙ୍କ ପରାମର୍ଶ ଏଠାରେ ଆରମ୍ଭ କରନ୍ତୁ |',
  [LanguageCode.PA]: 'ਆਲ ਇੰਡੀਆ ਇੰਸਟੀਚਿਊਟ ਆਫ਼ ਆਯੁਰਵੇਦ ਵਿੱਚ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ। ਆਪਣੀ ਜਾਂਚ ਸ਼ੁਰੂ ਕਰੋ।',
  [LanguageCode.AS]: 'অল ইণ্ডিয়া ইনষ্টিটিউট অৱ আয়ুৰ্বেদলৈ স্বাগতম। আপোনাৰ স্বাস্থ্য পৰামৰ্শ আৰম্ভ কৰক।',
  [LanguageCode.UR]: 'آل انڈیا انسٹی ٹیوٹ آف آیوروید میں خوش آمدید۔ اپنا طبی مشورہ شروع کریں۔',
  [LanguageCode.MAI]: 'अखिल भारतीय आयुर्वेद संस्थान में अहाँक स्वागत अछि। अपन स्वास्थ्य परामर्श शुरू करू।',
  [LanguageCode.SAT]: 'ᱚᱞ ᱤᱱᱰᱤᱭᱟ ᱤᱱᱥᱴᱤᱴᱤᱭᱩᱴ ᱚᱯᱷ ᱟᱭᱩᱨᱵᱮᱫ ᱨᱮ ᱥᱟᱹᱜᱩᱱ ᱫᱟᱨᱟᱢ᱾ ᱟᱢᱟᱜ ᱴᱤᱠᱮᱴ ᱮᱦᱚᱵᱽ ᱢᱮ᱾',
  [LanguageCode.KS]: 'آل انڈیا انسٹی ٹیوٹ آف آیورویدس منٛز چھُ تۄہہِ پؠٹھ واریاہ خیرمقدم۔',
  [LanguageCode.NE]: 'अखिल भारतीय आयुर्वेद संस्थानमा यहाँलाई स्वागत छ। आफ्नो स्वास्थ्य जाँच सुरु गर्नुहोस्।',
  [LanguageCode.KOK]: 'अखिल भारतीय आयुर्वेद संस्थेंत तुमकां येवकार। तुमची भलायकी तपासणी सुरू करात.',
  [LanguageCode.SD]: 'آل انڊيا انسٽيٽيوٽ آف آيورويڊ ۾ اوهان کي ڀليڪار چئجي ٿو.',
  [LanguageCode.DGO]: 'अखिल भारतीय आयुर्वेद संस्थान च तुंदा स्वागत ऐ। अपनी जांच शुरू करो।',
  [LanguageCode.MNI]: 'ꯑꯣꯜ ꯏꯟꯗꯤꯌꯥ ꯏꯟꯁꯇꯤꯠꯌꯨꯠ ꯑꯣꯐ ꯑꯥꯌꯨꯔꯕꯦꯗꯗꯥ ꯇꯔꯥꯝꯅꯥ ꯑꯣꯛꯆꯔꯤ꯫',
  [LanguageCode.BRX]: 'अल इन्डिया इन्स्टिटिउट अफ आयुर्वेदआव नोंथांखौ बरायबाय।',
  [LanguageCode.SA]: 'अखिलभारतीय आयुर्वेदसंस्थाने भवतः हार्दिकं स्वागतम्। स्वास्थ्यपरामर्शं प्रारभताम्।',
};

export const speakIndicText = (
  text: string,
  langCode: LanguageCode,
  callbacks?: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: () => void;
  }
) => {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not available');
    callbacks?.onError?.();
    return;
  }

  window.speechSynthesis.cancel();

  const langInfo = INDIC_LANGUAGES.find((l) => l.code === langCode);
  const speechTag = langInfo?.speechTag || 'hi-IN';

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = speechTag;
  utterance.rate = 0.92; // Slightly measured rate for low-literacy clarity
  utterance.pitch = 1.0;

  // Find exact voice matching tag or Indic voice fallback
  const voices = window.speechSynthesis.getVoices();
  const primaryLangPrefix = speechTag.split('-')[0] || 'hi';

  const exactVoice = voices.find((v) => v.lang === speechTag);
  const prefixVoice = voices.find((v) => v.lang.startsWith(primaryLangPrefix));
  const indicVoice = voices.find((v) => v.lang.includes('IN') || v.lang.includes('hi') || v.name.includes('India'));

  if (exactVoice) {
    utterance.voice = exactVoice;
  } else if (prefixVoice) {
    utterance.voice = prefixVoice;
  } else if (indicVoice) {
    utterance.voice = indicVoice;
  }

  utterance.onstart = () => {
    callbacks?.onStart?.();
  };

  utterance.onend = () => {
    callbacks?.onEnd?.();
  };

  utterance.onerror = (e) => {
    console.warn('Speech synthesis error:', e);
    callbacks?.onError?.();
  };

  window.speechSynthesis.speak(utterance);
};
