import { LanguageCode } from '@medikiosk/shared-types';

export interface TranslationDictionary {
  // Navigation
  step_identify: string;
  step_consent: string;
  step_complaint: string;
  step_questions: string;
  step_records: string;
  step_token: string;

  // Header & Emergency
  aiia_title: string;
  emergency_alert: string;

  // Identity Screen
  identity_title: string;
  identity_subtitle: string;
  audio_identity: string;
  seeded_cases: string;
  search_placeholder: string;
  register_walkin: string;
  full_name: string;
  age: string;
  gender: string;
  mobile: string;
  abha_id: string;
  male: string;
  female: string;
  other: string;
  submit_continue: string;
  select_btn: string;

  // Consent Screen
  consent_title: string;
  consent_subtitle: string;
  audio_consent: string;
  consent_point_1: string;
  consent_point_2: string;
  consent_point_3: string;
  accept_consent: string;
  decline_consent: string;

  // Chief Complaint Screen
  complaint_title: string;
  complaint_subtitle: string;
  audio_complaint: string;
  chest_pain: string;
  joint_pain: string;
  fever: string;
  digestive: string;
  skin: string;
  general_checkup: string;

  // Interview Screen
  intake_progress: string;
  speak_answer: string;
  confirm_next: string;
  listening: string;

  // Document Screen
  records_title: string;
  records_subtitle: string;
  audio_records: string;
  upload_prescription: string;
  upload_lab: string;
  upload_discharge: string;
  extracting: string;
  skip_records: string;
  proceed_summary: string;

  // Completion / Token Screen
  token_title: string;
  token_subtitle: string;
  token_number: string;
  room_number: string;
  assigned_doctor: string;
  estimated_wait: string;
  mins: string;
  print_slip: string;
  new_patient_btn: string;
}

export const TRANSLATIONS: Record<string, TranslationDictionary> = {
  [LanguageCode.EN]: {
    step_identify: 'IDENTIFY',
    step_consent: 'CONSENT',
    step_complaint: 'COMPLAINT',
    step_questions: 'QUESTIONS',
    step_records: 'RECORDS',
    step_token: 'TOKEN',

    aiia_title: 'All India Institute of Ayurveda',
    emergency_alert: 'EMERGENCY',

    identity_title: 'Patient Identification',
    identity_subtitle: 'Search via ABHA ID, Mobile Number, or select a seeded record below',
    audio_identity: 'Welcome to MediKiosk. Please search using your 14-digit ABHA ID, mobile number, or select from the clinical records below.',
    seeded_cases: '1-TAP SEEDED CLINICAL CASES',
    search_placeholder: 'Enter ABHA ID (e.g. 91-4829-1029-4820), Mobile, or Name...',
    register_walkin: '+ REGISTER WALK-IN PATIENT',
    full_name: 'Full Patient Name',
    age: 'Age',
    gender: 'Gender',
    mobile: 'Mobile Number',
    abha_id: 'ABHA ID (Optional / Auto-Gen)',
    male: 'Male',
    female: 'Female',
    other: 'Other',
    submit_continue: 'Register & Continue',
    select_btn: 'Select',

    consent_title: 'Digital Consent for Clinical Consultation',
    consent_subtitle: 'Data handled securely as per DPDP Act 2023 & ABDM Guidelines',
    audio_consent: 'We need your informed consent to collect your clinical history, digitize documents, and share them securely with your consulting physician.',
    consent_point_1: 'Clinical history and documents will be shared only with your attending physician.',
    consent_point_2: 'You can revoke your consent at any time during this hospital visit.',
    consent_point_3: 'Session data is permanently linked to your personal ABHA health account.',
    accept_consent: 'I Agree & Give Consent',
    decline_consent: 'Decline',

    complaint_title: 'What brings you to AIIA today?',
    complaint_subtitle: 'Choose your primary health concern or speak into the kiosk microphone',
    audio_complaint: 'Please select your primary symptom from the options below or tap the microphone to describe your concern.',
    chest_pain: 'Acute Chest Pain / Discomfort',
    joint_pain: 'Knee & Joint Pain (Vata / Sandhivata)',
    fever: 'Fever, Cold & Cough',
    digestive: 'Acidity, Gas & Stomach Pain',
    skin: 'Skin Rash & Allergic Itching',
    general_checkup: 'Routine Health Consultation',

    intake_progress: 'Intake Progress',
    speak_answer: 'Speak Answer',
    confirm_next: 'Confirm & Next',
    listening: 'Listening into kiosk microphone...',

    records_title: 'Digitize Prior Prescriptions & Lab Reports',
    records_subtitle: 'High-accuracy OCR extracts medicines, dosages, and timelines automatically',
    audio_records: 'Please scan or upload your prior medical prescriptions and test reports. Our system will digitize them for your doctor.',
    upload_prescription: 'Prescription Slip',
    upload_lab: 'Blood & Lab Report',
    upload_discharge: 'Discharge Summary',
    extracting: 'AI OCR Extracting Clinical Data...',
    skip_records: 'Skip & Continue',
    proceed_summary: 'Generate Clinical Summary',

    token_title: 'Case-Taking Completed!',
    token_subtitle: 'Your structured history and prescriptions have been routed to your consulting doctor.',
    token_number: 'Token Number',
    room_number: 'Room Number',
    assigned_doctor: 'Consulting Physician',
    estimated_wait: 'Estimated Wait Time',
    mins: 'mins',
    print_slip: 'Print OPD Token Slip',
    new_patient_btn: 'Start Next Patient Check-in',
  },

  [LanguageCode.HI]: {
    step_identify: 'पहचान',
    step_consent: 'सहमति',
    step_complaint: 'लक्षण',
    step_questions: 'प्रश्न',
    step_records: 'दस्तावेज',
    step_token: 'पर्ची',

    aiia_title: 'अखिल भारतीय आयुर्वेद संस्थान',
    emergency_alert: 'आपातकाल',

    identity_title: 'मरीज पहचान व सत्यापन',
    identity_subtitle: 'आभा आईडी, मोबाइल नंबर से खोजें या नीचे दिए गए डेमो मरीज का चयन करें',
    audio_identity: 'मेडिकियोस्क में आपका स्वागत है। कृपया 14 अंकों की आभा आईडी, मोबाइल नंबर दर्ज करें या नीचे सूची में से चयन करें।',
    seeded_cases: 'त्वरित डेमो मरीज (1-टैप परीक्षण)',
    search_placeholder: 'आभा आईडी (जैसे 91-4829-1029-4820), मोबाइल या नाम दर्ज करें...',
    register_walkin: '+ नया मरीज पंजीकृत करें',
    full_name: 'मरीज का पूरा नाम',
    age: 'उम्र',
    gender: 'लिंग',
    mobile: 'मोबाइल नंबर',
    abha_id: 'आभा आईडी (वैकल्पिक)',
    male: 'पुरुष',
    female: 'महिला',
    other: 'अन्य',
    submit_continue: 'पंजीकृत करें और आगे बढ़ें',
    select_btn: 'चयन करें',

    consent_title: 'स्वास्थ्य परामर्श हेतु डिजिटल सहमति',
    consent_subtitle: 'डिजिटल व्यक्तिगत डेटा संरक्षण (DPDP) और आभा नियमों के तहत पूर्णतः सुरक्षित',
    audio_consent: 'डॉक्टर परामर्श के लिए आपकी स्वास्थ्य जानकारी और पुराने पर्चे सुरक्षित रूप से दर्ज करने हेतु आपकी सहमति आवश्यक है।',
    consent_point_1: 'आपकी स्वास्थ्य जानकारी केवल आपके परामर्श डॉक्टर के साथ साझा की जाएगी।',
    consent_point_2: 'आप अस्पताल में किसी भी समय अपनी सहमति वापस ले सकते हैं।',
    consent_point_3: 'यह विवरण आपकी व्यक्तिगत आभा आईडी से सुरक्षित रूप से लिंक रहेगा।',
    accept_consent: 'मैं सहमत हूँ (आगे बढ़ें)',
    decline_consent: 'अस्वीकार करें',

    complaint_title: 'आज आपको क्या मुख्य समस्या या तकलीफ है?',
    complaint_subtitle: 'अपनी मुख्य स्वास्थ्य समस्या चुनें या माइक में बोलकर बताएं',
    audio_complaint: 'कृपया नीचे दिए गए विकल्पों में से अपना मुख्य लक्षण चुनें या माइक बटन दबाकर बोलें।',
    chest_pain: 'सीने में दर्द व जलन (तीव्र बेचैनी)',
    joint_pain: 'घुटनों व जोड़ों का दर्द (संधिवात)',
    fever: 'बुखार, सर्दी व खांसी',
    digestive: 'पेट दर्द, गैस व एसिडिटी (अग्निमांद्य)',
    skin: 'त्वचा रोग, दाद व खुजली',
    general_checkup: 'सामान्य स्वास्थ्य परामर्श',

    intake_progress: 'परामर्श प्रगति',
    speak_answer: 'आवाज से उत्तर दें',
    confirm_next: 'पुष्टि करें व आगे बढ़ें',
    listening: 'माइक में सुन रहा हूँ... बोलिए',

    records_title: 'पुराने पर्चे और लैब रिपोर्ट अपलोड करें',
    records_subtitle: 'उन्नत ओसीआर दवाइयों के नाम, खुराक और तारीखों को स्वचालित रूप से पढ़ लेगा',
    audio_records: 'कृपया अपने पुराने डॉक्टर के पर्चे और जांच रिपोर्ट अपलोड करें। सिस्टम इन्हें डॉक्टर के लिए डिजिटाइज़ कर देगा।',
    upload_prescription: 'डॉक्टर का पर्चा',
    upload_lab: 'रक्त व लैब जांच',
    upload_discharge: 'डिस्चार्ज समरी',
    extracting: 'ओसीआर द्वारा डाटा पढ़ा जा रहा है...',
    skip_records: 'बाद में अपलोड करें',
    proceed_summary: 'क्लिनिकल समरी बनाएं',

    token_title: 'केस-टेकिंग सफलतापूर्वक पूर्ण!',
    token_subtitle: 'आपकी जानकारी और पुराने पर्चे डॉक्टर के कंप्यूटर पर भेज दिए गए हैं।',
    token_number: 'टोकन नंबर',
    room_number: 'कक्ष संख्या',
    assigned_doctor: 'परामर्श डॉक्टर',
    estimated_wait: 'अनुमानित प्रतीक्षा समय',
    mins: 'मिनट',
    print_slip: 'टोकन पर्ची प्रिंट करें',
    new_patient_btn: 'नए मरीज के लिए शुरू करें',
  },

  [LanguageCode.ML]: {
    step_identify: 'തിരിച്ചറിയൽ',
    step_consent: 'സമ്മതം',
    step_complaint: 'രോഗലക്ഷണങ്ങൾ',
    step_questions: 'ചോദ്യങ്ങൾ',
    step_records: 'രേഖകൾ',
    step_token: 'ടോക്കൺ',

    aiia_title: 'ഓൾ ഇന്ത്യ ഇൻസ്റ്റിറ്റ്യൂട്ട് ഓഫ് ആയുർവേദ',
    emergency_alert: 'അടിയന്തിരം',

    identity_title: 'രോഗിയുടെ തിരിച്ചറിയൽ',
    identity_subtitle: 'ആഭ ഐഡി, മൊബൈൽ നമ്പർ ഉപയോഗിച്ച് തിരയുക അല്ലെങ്കിൽ താഴെ നൽകിയിരിക്കുന്ന രോഗിയെ തിരഞ്ഞെടുക്കുക',
    audio_identity: 'മെഡിക്കിയോസ്കിലേക്ക് സ്വാഗതം. നിങ്ങളുടെ 14 അക്ക ആഭ ഐഡി, മൊബൈൽ നമ്പർ ഉപയോഗിച്ച് തിരയുക അല്ലെങ്കിൽ പട്ടികയിൽ നിന്ന് തിരഞ്ഞെടുക്കുക.',
    seeded_cases: '1-ടാപ്പ് ക്ലിനിക്കൽ കേസുകൾ',
    search_placeholder: 'ആഭ ഐഡി (ഉദാ. 91-4829-1029-4820), മൊബൈൽ അല്ലെങ്കിൽ പേര് നൽകുക...',
    register_walkin: '+ പുതിയ രോഗിയെ രജിസ്റ്റർ ചെയ്യുക',
    full_name: 'രോഗിയുടെ പൂർണ്ണ പേര്',
    age: 'പ്രായം',
    gender: 'ലിംഗം',
    mobile: 'മൊബൈൽ നമ്പർ',
    abha_id: 'ആഭ ഐഡി (ഐച്ഛികം)',
    male: 'പുരുഷൻ',
    female: 'സ്ത്രീ',
    other: 'മറ്റുള്ളവ',
    submit_continue: 'രജിസ്റ്റർ ചെയ്ത് തുടരുക',
    select_btn: 'തിരഞ്ഞെടുക്കുക',

    consent_title: 'ആരോഗ്യ പരിശോധനയ്ക്കുള്ള ഡിജിറ്റൽ സമ്മതം',
    consent_subtitle: 'ഡിപിഡിപി നിയമവും ആഭ മാർഗ്ഗനിർദ്ദേശങ്ങളും അനുസരിച്ച് സുരക്ഷിതം',
    audio_consent: 'ഡോക്ടറുടെ പരിശോധനയ്ക്കായി നിങ്ങളുടെ ആരോഗ്യ വിവരങ്ങളും പഴയ രേഖകളും ഡിജിറ്റൈസ് ചെയ്യാൻ നിങ്ങളുടെ സമ്മതം ആവശ്യമാണ്.',
    consent_point_1: 'നിങ്ങളുടെ വിവരങ്ങൾ പരിശോധിക്കുന്ന ഡോക്ടറുമായി മാത്രമേ പങ്കിടുകയുള്ളൂ.',
    consent_point_2: 'ഈ ആശുപത്രി സന്ദർശന വേളയിൽ എപ്പോൾ വേണമെങ്കിലും സമ്മതം പിൻവലിക്കാം.',
    consent_point_3: 'വിവരങ്ങൾ നിങ്ങളുടെ വ്യക്തിഗത ആഭ അക്കൗണ്ടുമായി സുരക്ഷിതമായി ബന്ധിപ്പിക്കും.',
    accept_consent: 'ഞാൻ സമ്മതിക്കുന്നു (തുടരുക)',
    decline_consent: 'നിരസിക്കുക',

    complaint_title: 'ഇന്ന് എന്താണ് നിങ്ങളുടെ പ്രധാന ബുദ്ധിമുട്ട്?',
    complaint_subtitle: 'പ്രധാന രോഗലക്ഷണം തിരഞ്ഞെടുക്കുക അല്ലെങ്കിൽ മൈക്കിലൂടെ സംസാരിക്കുക',
    audio_complaint: 'താഴെ നൽകിയിരിക്കുന്ന ഓപ്ഷനുകളിൽ നിന്ന് നിങ്ങളുടെ ലക്ഷണം തിരഞ്ഞെടുക്കുക അല്ലെങ്കിൽ മൈക്ക് അമർത്തി സംസാരിക്കുക.',
    chest_pain: 'നെഞ്ചുവേദനയും അസ്വസ്ഥതയും',
    joint_pain: 'സന്ധി വേദന, മുട്ടുവേദന (സന്ധിവാതം)',
    fever: 'പനി, ജലദോഷം, ചുമ',
    digestive: 'വയറുവേദന, ഗ്യാസ്, അസിഡിറ്റി',
    skin: 'ത്വക്ക് രോഗങ്ങൾ, ചൊറിച്ചിൽ',
    general_checkup: 'പൊതുവായ ആരോഗ്യ പരിശോധന',

    intake_progress: 'വിവര ശേഖരണ പുരോഗതി',
    speak_answer: 'സംസാരിച്ച് മറുപടി നൽകുക',
    confirm_next: 'സ്ഥിരീകരിച്ച് മുന്നോട്ട് പോകുക',
    listening: 'മൈക്രോഫോൺ ശ്രദ്ധിക്കുന്നു... സംസാരിക്കൂ',

    records_title: 'മുൻകാല കുറിപ്പടികളും ലാബ് റിപ്പോർട്ടുകളും അപ്‌ലോഡ് ചെയ്യുക',
    records_subtitle: 'ഒസിആർ വഴി മരുന്നുകളുടെ പേരും വിവരങ്ങളും സ്വയമേവ രേഖപ്പെടുത്തും',
    audio_records: 'നിങ്ങളുടെ മുൻകാല കുറിപ്പടികളും പരിശോധനാ റിപ്പോർട്ടുകളും അപ്‌ലോഡ് ചെയ്യുക. സിസ്റ്റം ഇവ ഡോക്ടർക്കായി തയ്യാറാക്കും.',
    upload_prescription: 'ഡോക്ടറുടെ കുറിപ്പടി',
    upload_lab: 'രക്ത & ലാബ് റിപ്പോർട്ട്',
    upload_discharge: 'ഡിസ്ചാർജ് രേഖ',
    extracting: 'രേഖകൾ പരിശോധിക്കുന്നു...',
    skip_records: 'ഒഴിവാക്കി തുടരുക',
    proceed_summary: 'പരിശോധനാ സംഗ്രഹം കാണുക',

    token_title: 'വിവര ശേഖരണം പൂർത്തിയായി!',
    token_subtitle: 'നിങ്ങളുടെ ആരോഗ്യ വിവരങ്ങളും രേഖകളും ഡോക്ടറുടെ സ്ക്രീനിലേക്ക് അയച്ചിട്ടുണ്ട്.',
    token_number: 'ടോക്കൺ നമ്പർ',
    room_number: 'റൂം നമ്പർ',
    assigned_doctor: 'പരിശോധിക്കുന്ന ഡോക്ടർ',
    estimated_wait: 'ഏകദേശ കാത്തിരിപ്പ് സമയം',
    mins: 'മിനിറ്റ്',
    print_slip: 'ടോക്കൺ സ്ലിപ്പ് പ്രിന്റ് ചെയ്യുക',
    new_patient_btn: 'അടുത്ത രോഗിക്കായി ആരംഭിക്കുക',
  },

  [LanguageCode.TA]: {
    step_identify: 'அடையாளம்',
    step_consent: 'ஒப்புதல்',
    step_complaint: 'அறிகுறிகள்',
    step_questions: 'கேள்விகள்',
    step_records: 'ஆவணங்கள்',
    step_token: 'டோக்கன்',

    aiia_title: 'அகில இந்திய ஆயுர்வேத நிறுவனம்',
    emergency_alert: 'அவசரநிலை',

    identity_title: 'நோயாளி அடையாளம் மற்றும் சரிபார்ப்பு',
    identity_subtitle: 'ஆபா ஐடி, மொபைல் எண் மூலம் தேடவும் அல்லது கீழே உள்ள நோயாளியைத் தேர்ந்தெடுக்கவும்',
    audio_identity: 'மெடிகியோஸ்கிற்கு வரவேற்கிறோம். உங்கள் 14 இலக்க ஆபா ஐடி அல்லது மொபைல் எண்ணைப் பயன்படுத்தவும்.',
    seeded_cases: '1-தட்டு மருத்துவ வழக்குகள்',
    search_placeholder: 'ஆபா ஐடி, மொபைல் எண் அல்லது பெயரை உள்ளிடவும்...',
    register_walkin: '+ புதிய நோயாளியைப் பதிவு செய்யவும்',
    full_name: 'முழுப் பெயர்',
    age: 'வயது',
    gender: 'பாலினம்',
    mobile: 'கைபேசி எண்',
    abha_id: 'ஆபா ஐடி (விருப்பத்தேர்வு)',
    male: 'ஆண்',
    female: 'பெண்',
    other: 'மற்றவை',
    submit_continue: 'பதிவு செய்து தொடரவும்',
    select_btn: 'தேர்ந்தெடு',

    consent_title: 'மருத்துவ ஆலோசனைக்கான டிஜிட்டல் ஒப்புதல்',
    consent_subtitle: 'டிபிடிபி சட்டம் மற்றும் ஆபா விதிகளின்படி முழுமையாக பாதுகாக்கப்படுகிறது',
    audio_consent: 'மருத்துவர் ஆலோசனைக்காக உங்கள் மருத்துவ வரலாறு மற்றும் ஆவணங்களை டிஜிட்டல் மயமாக்க உங்கள் ஒப்புதல் தேவை.',
    consent_point_1: 'உங்கள் தகவல்கள் ஆலோசனை வழங்கும் மருத்துவரிடம் மட்டுமே பகிரப்படும்.',
    consent_point_2: 'மருத்துவமனை வருகையின் போது எப்போது வேண்டுமானாலும் ஒப்புதலை திரும்பப் பெறலாம்.',
    consent_point_3: 'தகவல்கள் உங்கள் ஆபா கணக்குடன் பாதுகாப்பாக இணைக்கப்படும்.',
    accept_consent: 'நான் ஒப்புக்கொள்கிறேன் (தொடரவும்)',
    decline_consent: 'நிராகரி',

    complaint_title: 'இன்று உங்களுக்கு என்ன உடல்நல பிரச்சனை?',
    complaint_subtitle: 'உங்கள் முக்கிய பிரச்சனையைத் தேர்ந்தெடுக்கவும் அல்லது பேசவும்',
    audio_complaint: 'கீழே உள்ள விருப்பங்களிலிருந்து உங்கள் அறிகுறிகளைத் தேர்ந்தெடுக்கவும் அல்லது மைக்ரோஃபோனில் பேசவும்.',
    chest_pain: 'கடுமையான நெஞ்சு வலி மற்றும் அசௌகரியம்',
    joint_pain: 'முழங்கால் மற்றும் மூட்டு வலி (வாத நோய்)',
    fever: 'காய்ச்சல், சளி மற்றும் இருமல்',
    digestive: 'வயிற்று வலி, அசிடிட்டி மற்றும் வாயு',
    skin: 'தோல் நோய் மற்றும் அரிப்பு',
    general_checkup: 'பொது மருத்துவ பரிசோதனை',

    intake_progress: 'ஆலோசனை முன்னேற்றம்',
    speak_answer: 'குரல் மூலம் பதிலளிக்கவும்',
    confirm_next: 'உறுதிசெய்து தொடரவும்',
    listening: 'குரல் பதிவு செய்யப்படுகிறது... பேசவும்',

    records_title: 'முந்தைய மருந்து சீட்டுகள் & லேப் அறிக்கைகள்',
    records_subtitle: 'மருந்து பெயர்கள் மற்றும் அளவுகள் தானாகவே பிரித்தெடுக்கப்படும்',
    audio_records: 'உங்கள் முந்தைய மருந்து சீட்டுகள் மற்றும் பரிசோதனை அறிக்கைகளை பதிவேற்றவும்.',
    upload_prescription: 'மருந்து சீட்டு',
    upload_lab: 'இரத்த பரிசோதனை அறிக்கை',
    upload_discharge: 'டிஸ்சார்ஜ் சுருக்கம்',
    extracting: 'தகவல்கள் பிரித்தெடுக்கப்படுகின்றன...',
    skip_records: 'தவிர்க்கவும்',
    proceed_summary: 'சுருக்கத்தை உருவாக்கவும்',

    token_title: 'மருத்துவ விவரங்கள் சேகரிக்கப்பட்டன!',
    token_subtitle: 'உங்கள் தகவல்கள் மருத்துவரிடம் வெற்றிகரமாக அனுப்பப்பட்டன.',
    token_number: 'டோக்கன் எண்',
    room_number: 'அறை எண்',
    assigned_doctor: 'ஆலோசனை மருத்துவர்',
    estimated_wait: 'காத்திருப்பு நேரம்',
    mins: 'நிமிடங்கள்',
    print_slip: 'டோக்கன் சீட்டை அச்சிடவும்',
    new_patient_btn: 'அடுத்த நோயாளிக்கு தொடங்குங்கள்',
  },

  [LanguageCode.TE]: {
    step_identify: 'గుర్తింపు',
    step_consent: 'సమ్మతి',
    step_complaint: 'లక్షణాలు',
    step_questions: 'ప్రశ్నలు',
    step_records: 'రికార్డులు',
    step_token: 'టోకెన్',

    aiia_title: 'ఆల్ ఇండియా ఇన్స్టిట్యూట్ ఆఫ్ ఆయుర్వేద',
    emergency_alert: 'అత్యవసరం',

    identity_title: 'రోగి గుర్తింపు మరియు ధృవీకరణ',
    identity_subtitle: 'ఆభా ఐడీ లేదా మొబైల్ నంబర్ ద్వారా శోధించండి లేదా క్రింది రోగిని ఎంచుకోండి',
    audio_identity: 'మెడికియోస్క్‌కు స్వాగతం. మీ 14 అంకెల ఆభా ఐడీ లేదా మొబైల్ నంబర్‌తో నమోదు చేయండి.',
    seeded_cases: '1-ట్యాప్ క్లినికల్ కేసులు',
    search_placeholder: 'ఆభా ఐడీ, మొబైల్ నంబర్ లేదా పేరు నమోదు చేయండి...',
    register_walkin: '+ నూతన రోగి నమోదు',
    full_name: 'పూర్తి పేరు',
    age: 'వయస్సు',
    gender: 'లింగం',
    mobile: 'మొబైల్ నంబర్',
    abha_id: 'ఆభా ఐడీ (ఐచ్ఛికం)',
    male: 'పురుషుడు',
    female: 'స్త్రీ',
    other: 'ఇతరులు',
    submit_continue: 'నమోదు చేసి కొనసాగించండి',
    select_btn: 'ఎంచుకోండి',

    consent_title: 'క్లినికల్ సంప్రదింపుల కోసం డిజిటల్ సమ్మతి',
    consent_subtitle: 'డిపిడిపి చట్టం మరియు ఆభా మార్గదర్శకాల ప్రకారం భద్రపరచబడుతుంది',
    audio_consent: 'డాక్టర్ సంప్రదింపుల కోసం మీ ఆరోగ్య సమాచారం నమోదు చేయడానికి మీ సమ్మతి అవసరం.',
    consent_point_1: 'మీ సమాచారం పరీక్షించే వైద్యుడితో మాత్రమే పంచుకోబడుతుంది.',
    consent_point_2: 'ఆసుపత్రి సందర్శనలో ఎప్పుడైనా సమ్మతిని ఉపసంహరించుకోవచ్చు.',
    consent_point_3: 'వివరాలు మీ వ్యక్తిగత ఆభా ఖాతాకు సురక్షితంగా లింక్ చేయబడతాయి.',
    accept_consent: 'నేను అంగీకరిస్తున్నాను (కొనసాగండి)',
    decline_consent: 'తిరస్కరించండి',

    complaint_title: 'ఈ రోజు మీకు ఉన్న ప్రధాన సమస్య ఏమిటి?',
    complaint_subtitle: 'మీ ప్రధాన లక్షణాన్ని ఎంచుకోండి లేదా మైక్‌లో మాట్లాడండి',
    audio_complaint: 'క్రింది ఎంపికల నుండి మీ లక్షణాన్ని ఎంచుకోండి లేదా మైక్ బటన్ నొక్కి మాట్లాడండి.',
    chest_pain: 'తీవ్రమైన ఛాతీ నొప్పి మరియు అసౌకర్యం',
    joint_pain: 'కీళ్ల నొప్పులు మరియు మోకాలి నొప్పి (వాతం)',
    fever: 'జ్వరం, జలుబు మరియు దగ్గు',
    digestive: 'కడుపు నొప్పి, గ్యాస్ మరియు ఎసిడిటీ',
    skin: 'చర్మ వ్యాధులు మరియు దురద',
    general_checkup: 'సాధారణ ఆరోగ్య పరీక్ష',

    intake_progress: 'పురోగతి',
    speak_answer: 'మాట్లాడి సమాధానం ఇవ్వండి',
    confirm_next: 'నిర్ధారించి కొనసాగించండి',
    listening: 'వింటున్నాను... మాట్లాడండి',

    records_title: 'పాత ప్రిస్క్రిప్షన్లు & ల్యాబ్ రిపోర్టులు',
    records_subtitle: 'మందుల పేర్లు మరియు మోతాదులు స్వయంచాలకంగా నమోదు చేయబడతాయి',
    audio_records: 'మీ పాత ప్రిస్క్రిప్షన్లు మరియు పరీక్ష నివేదికలను అప్‌లోడ్ చేయండి.',
    upload_prescription: 'ప్రిస్క్రిప్షన్ పత్రం',
    upload_lab: 'రక్త & ల్యాబ్ నివేదిక',
    upload_discharge: 'డిశ్చార్జ్ సారాంశం',
    extracting: 'సమాచారం సేకరించబడుతోంది...',
    skip_records: 'దాటవేయి',
    proceed_summary: 'సారాంశం రూపొందించండి',

    token_title: 'కేస్ టేకింగ్ పూర్తయింది!',
    token_subtitle: 'మీ ఆరోగ్య సమాచారం వైద్యుడి స్క్రీన్‌కు పంపబడింది.',
    token_number: 'టోకెన్ సంఖ్య',
    room_number: 'గది సంఖ్య',
    assigned_doctor: 'సంప్రదించే వైద్యుడు',
    estimated_wait: 'నిరీక్షణ సమయం',
    mins: 'నిమిషాలు',
    print_slip: 'టోకెన్ స్లిప్ ప్రింట్ చేయండి',
    new_patient_btn: 'తదుపరి రోగి కోసం ప్రారంభించండి',
  },

  [LanguageCode.BN]: {
    step_identify: 'পরিচয়',
    step_consent: 'সম্মতি',
    step_complaint: 'লক্ষণ',
    step_questions: 'প্রশ্নাবলী',
    step_records: 'নথি',
    step_token: 'টোকেন',

    aiia_title: 'অল ইন্ডিয়া ইনস্টিটিউট অফ আয়ুর্বেদ',
    emergency_alert: 'জরুরী',

    identity_title: 'রোগীর পরিচয় ও যাচাইকরণ',
    identity_subtitle: 'আভা আইডি বা মোবাইল নম্বর দিয়ে অনুসন্ধান করুন বা রোগী নির্বাচন করুন',
    audio_identity: 'মেডিকিয়স্কে আপনাকে স্বাগতম। আপনার আভা আইডি বা মোবাইল নম্বর দিন।',
    seeded_cases: '১-ট্যাপ ক্লিনিকাল কেস',
    search_placeholder: 'আভা আইডি, মোবাইল বা নাম লিখুন...',
    register_walkin: '+ নতুন রোগী নিবন্ধন করুন',
    full_name: 'সম্পূর্ণ নাম',
    age: 'বয়স',
    gender: 'লিঙ্গ',
    mobile: 'মোবাইল নম্বর',
    abha_id: 'আভা আইডি (ঐচ্ছিক)',
    male: 'পুরুষ',
    female: 'মহিলা',
    other: 'অন্যান্য',
    submit_continue: 'নিবন্ধন করে এগিয়ে যান',
    select_btn: 'নির্বাচন করুন',

    consent_title: 'চিকিৎসা পরামর্শের জন্য ডিজিটাল সম্মতি',
    consent_subtitle: 'ডিপিডিপি আইন ও আভা নির্দেশিকা অনুসারে সম্পূর্ণ সুরক্ষিত',
    audio_consent: 'ডাক্তারের পরামর্শের জন্য আপনার স্বাস্থ্য বিবরণ এবং পুরানো প্রেসক্রিপশন জমা দিতে সম্মতি প্রয়োজন।',
    consent_point_1: 'আপনার তথ্য কেবল আপনার ডাক্তারের সাথে ভাগ করা হবে।',
    consent_point_2: 'আপনি যেকোনো সময় এই সম্মতি প্রত্যাহার করতে পারেন।',
    consent_point_3: 'তথ্য আপনার ব্যক্তিগত আভা অ্যাকাউন্টের সাথে সুরক্ষিত থাকবে।',
    accept_consent: 'আমি সম্মত (এগিয়ে যান)',
    decline_consent: 'প্রত্যাখ্যান করুন',

    complaint_title: 'আজ আপনার প্রধান সমস্যা বা লক্ষণ কী?',
    complaint_subtitle: 'আপনার প্রধান সমস্যা নির্বাচন করুন বা মাইকে বলুন',
    audio_complaint: 'নিচের বিকল্পগুলি থেকে আপনার প্রধান লক্ষণ নির্বাচন করুন বা মাইক চেপে বলুন।',
    chest_pain: 'বুকে তীব্র ব্যথা ও অস্বস্তি',
    joint_pain: 'হাঁটু ও জয়েন্টে ব্যথা (বাত রোগ)',
    fever: 'জ্বর, সর্দি ও কাশি',
    digestive: 'পেট ব্যথা, গ্যাস ও এসিডিটি',
    skin: 'ত্বকের সমস্যা ও চুলকানি',
    general_checkup: 'সাধারণ স্বাস্থ্য পরীক্ষা',

    intake_progress: 'অগ্রগতি',
    speak_answer: 'মুখে উত্তর দিন',
    confirm_next: 'নিশ্চিত করে এগিয়ে যান',
    listening: 'শুনছি... বলুন',

    records_title: 'পুরানো প্রেসক্রিপশন ও ল্যাব রিপোর্ট আপলোড করুন',
    records_subtitle: 'ওআইসিআর স্বয়ংক্রিয়ভাবে ওষুধের নাম এবং ডোজ শনাক্ত করবে',
    audio_records: 'আপনার পুরানো প্রেসক্রিপশন ও টেস্ট রিপোর্ট আপলোড করুন।',
    upload_prescription: 'ডাক্তারের প্রেসক্রিপশন',
    upload_lab: 'রক্ত ও ল্যাব রিপোর্ট',
    upload_discharge: 'ডিসচার্জ সারসংক্ষেপ',
    extracting: 'তথ্য সংগ্রহ করা হচ্ছে...',
    skip_records: 'এড়িয়ে যান',
    proceed_summary: 'ক্লিনিকাল সারসংক্ষেপ দেখুন',

    token_title: 'কেস-টেকিং সম্পন্ন হয়েছে!',
    token_subtitle: 'আপনার বিবরণ ডাক্তারের কম্পিউটারে সফলভাবে পাঠানো হয়েছে।',
    token_number: 'টোকেন নম্বর',
    room_number: 'রুম নম্বর',
    assigned_doctor: 'পরামর্শদাতা ডাক্তার',
    estimated_wait: 'আনুমানিক অপেক্ষার সময়',
    mins: 'মিনিট',
    print_slip: 'টোকেন স্লিপ প্রিন্ট করুন',
    new_patient_btn: 'পরবর্তী রোগীর জন্য শুরু করুন',
  },

  [LanguageCode.MR]: {
    step_identify: 'ओळख',
    step_consent: 'संमती',
    step_complaint: 'तक्रार',
    step_questions: 'प्रश्न',
    step_records: 'नोंदी',
    step_token: 'टोकन',

    aiia_title: 'अखिल भारतीय आयुर्वेद संस्था',
    emergency_alert: 'आणीबाणी',

    identity_title: 'रुग्ण ओळख व पडताळणी',
    identity_subtitle: 'आभा आयडी, मोबाईल नंबरने शोधा किंवा खालील रुग्ण निवडा',
    audio_identity: 'मेडिकिओस्कमध्ये आपले स्वागत आहे. आपला आभा आयडी किंवा मोबाईल नंबर टाका.',
    seeded_cases: '१-टॅप क्लिनिकल केसेस',
    search_placeholder: 'आभा आयडी, मोबाईल किंवा नाव प्रविष्ट करा...',
    register_walkin: '+ नवीन रुग्ण नोंदणी करा',
    full_name: 'पूर्ण नाव',
    age: 'वय',
    gender: 'लिंग',
    mobile: 'मोबाईल नंबर',
    abha_id: 'आभा आयडी (पर्यायी)',
    male: 'पुरुष',
    female: 'महिला',
    other: 'इतर',
    submit_continue: 'नोंदणी करा व पुढे जा',
    select_btn: 'निवडा',

    consent_title: 'वैद्यकीय सल्ल्यासाठी डिजिटल संमती',
    consent_subtitle: 'डीपीडीपी कायदा आणि आभा नियमांनुसार पूर्णपणे सुरक्षित',
    audio_consent: 'डॉक्टरांच्या तपासणीसाठी आपली माहिती आणि जुने कागदपत्रे डिजिटल करण्यासाठी आपली संमती आवश्यक आहे.',
    consent_point_1: 'आपली माहिती फक्त तपासणाऱ्या डॉक्टरांसोबत शेअर केली जाईल.',
    consent_point_2: 'आपण ही संमती कधीही मागे घेऊ शकता.',
    consent_point_3: 'माहिती आपल्या वैयक्तिक आभा खात्याशी सुरक्षितपणे जोडली जाईल.',
    accept_consent: 'मी सहमत आहे (पुढे जा)',
    decline_consent: 'नाकारा',

    complaint_title: 'आज आपल्याला काय त्रास किंवा समस्या आहे?',
    complaint_subtitle: 'आपले मुख्य लक्षण निवडा किंवा माइकवर बोला',
    audio_complaint: 'खालील पर्यायांमधून आपले मुख्य लक्षण निवडा किंवा माइक दाबून बोला.',
    chest_pain: 'छातीत तीव्र वेदना आणि अस्वस्थता',
    joint_pain: 'गुडघे आणि सांधेदुखी (संधिवात)',
    fever: 'ताप, सर्दी आणि खोकला',
    digestive: 'पोटदुखी, गॅस आणि पित्त',
    skin: 'त्वचेचे आजार आणि खाज',
    general_checkup: 'सर्वसाधारण आरोग्य तपासणी',

    intake_progress: 'प्रगती',
    speak_answer: 'आवाजाने उत्तर द्या',
    confirm_next: 'पुष्टी करा व पुढे जा',
    listening: 'माइक ऐकत आहे... बोला',

    records_title: 'जुने प्रिस्क्रिप्शन आणि लॅब रिपोर्ट अपलोड करा',
    records_subtitle: 'ओसीआर तंत्रज्ञानाद्वारे औषधांची नावे स्वयंचलितपणे वाचली जातील',
    audio_records: 'कृपया आपले जुने प्रिस्क्रिप्शन आणि तपासणी रिपोर्ट अपलोड करा.',
    upload_prescription: 'डॉक्टरांचे प्रिस्क्रिप्शन',
    upload_lab: 'रक्त व लॅब रिपोर्ट',
    upload_discharge: 'डिस्चार्ज सारांश',
    extracting: 'माहिती गोळा केली जात आहे...',
    skip_records: 'वगळा व पुढे जा',
    proceed_summary: 'क्लिनिकल सारांश तयार करा',

    token_title: 'केस-टेकिंग यशस्वीरित्या पूर्ण!',
    token_subtitle: 'आपली माहिती डॉक्टरांच्या स्क्रीनवर पाठवली गेली आहे.',
    token_number: 'टोकन नंबर',
    room_number: 'खोली क्रमांक',
    assigned_doctor: 'तपासणारे डॉक्टर',
    estimated_wait: 'अंदाजे प्रतीक्षा वेळ',
    mins: 'मिनिटे',
    print_slip: 'टोकन स्लिप प्रिंट करा',
    new_patient_btn: 'पुढील रुग्णासाठी सुरू करा',
  },
};

export const getTranslation = (lang: LanguageCode): TranslationDictionary => {
  return TRANSLATIONS[lang] || TRANSLATIONS[LanguageCode.EN];
};
