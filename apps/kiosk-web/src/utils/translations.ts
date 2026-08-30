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

  [LanguageCode.GU]: {
    step_identify: 'ઓળખ',
    step_consent: 'સંમતિ',
    step_complaint: 'લક્ષણો',
    step_questions: 'પ્રશ્નો',
    step_records: 'દસ્તાવેજો',
    step_token: 'ટોકન',

    aiia_title: 'ઓલ ઇન્ડિયા ઇન્સ્ટિટ્યૂટ ઓફ આયુર્વેદ',
    emergency_alert: 'કટોકટી',

    identity_title: 'દર્દીની ઓળખ અને ચકાસણી',
    identity_subtitle: 'આભા આઈડી, મોબાઈલ નંબર દ્વારા શોધો અથવા નીચે દર્દી પસંદ કરો',
    audio_identity: 'મેડિકિયોસ્કમાં આપનું સ્વાગત છે. કૃપા કરીને તમારો 14 આંકડાનો આભા આઈડી અથવા મોબાઈલ નંબર દાખલ કરો.',
    seeded_cases: '1-ટેપ ક્લિનિકલ કેસો',
    search_placeholder: 'આભા આઈડી (દા.ત. 91-4829-1029-4820), મોબાઈલ અથવા નામ દાખલ કરો...',
    register_walkin: '+ નવા દર્દીની નોંધણી કરો',
    full_name: 'દર્દીનું પૂરું નામ',
    age: 'ઉંમર',
    gender: 'જાતિ',
    mobile: 'મોબાઈલ નંબર',
    abha_id: 'આભા આઈડી (વૈકલ્પિક)',
    male: 'પુરુષ',
    female: 'સ્ત્રી',
    other: 'અન્ય',
    submit_continue: 'નોંધણી કરો અને આગળ વધો',
    select_btn: 'પસંદ કરો',

    consent_title: 'તબીબી સલાહ માટે ડિજિટલ સંમતિ',
    consent_subtitle: 'ડીપીડીપી કાયદો અને આભા માર્ગદર્શિકા અનુસાર સંપૂર્ણ સુરક્ષિત',
    audio_consent: 'ડૉક્ટર સાથેના પરામર્શ માટે તમારી આરોગ્ય માહિતી અને જૂના પ્રિસ્ક્રિપ્શન એકત્રિત કરવા માટે તમારી સંમતિ જરૂરી છે.',
    consent_point_1: 'તમારી માહિતી ફક્ત તમારી સારવાર કરતા ડૉક્ટર સાથે શેર કરવામાં આવશે.',
    consent_point_2: 'તમે હોસ્પિટલ મુલાકાત દરમિયાન કોઈપણ સમયે તમારી સંમતિ પાછી ખેંચી શકો છો.',
    consent_point_3: 'માહિતી તમારા વ્યક્તિગત આભા એકાઉન્ટ સાથે સુરક્ષિત રીતે જોડાયેલ રહેશે.',
    accept_consent: 'હું સંમત છું (આગળ વધો)',
    decline_consent: 'અસ્વીકાર કરો',

    complaint_title: 'આજે તમને શું મુખ્ય તકલીફ કે સમસ્યા છે?',
    complaint_subtitle: 'તમારી મુખ્ય સ્વાસ્થ્ય સમસ્યા પસંદ કરો અથવા માઇકમાં બોલીને જણાવો',
    audio_complaint: 'કૃપા કરીને નીચેના વિકલ્પોમાંથી તમારું મુખ્ય લક્ષણ પસંદ કરો અથવા માઇક બટન દબાવીને બોલો.',
    chest_pain: 'છાતીમાં દુખાવો અને બળતરા (તીવ્ર અસ્વસ્થતા)',
    joint_pain: 'ઘૂંટણ અને સાંધાનો દુખાવો (સંધિવા)',
    fever: 'તાવ, શરદી અને ખાંસી',
    digestive: 'પેટમાં દુખાવો, ગેસ અને એસિડિટી',
    skin: 'ચામડીના રોગ અને ખંજવાળ',
    general_checkup: 'સામાન્ય સ્વાસ્થ્ય તપાસ',

    intake_progress: 'તપાસ પ્રગતિ',
    speak_answer: 'અવાજથી જવાબ આપો',
    confirm_next: 'પુષ્ટિ કરો અને આગળ વધો',
    listening: 'માઇક સાંભળી રહ્યું છે... બોલો',

    records_title: 'જૂના પ્રિસ્ક્રિપ્શન અને લેબ રિપોર્ટ અપલોડ કરો',
    records_subtitle: 'ઓસીઆર ટેકનોલોજી દ્વારા દવાઓના નામ અને વિગતો આપમેળે વાંચવામાં આવશે',
    audio_records: 'કૃપા કરીને તમારા જૂના ડૉક્ટરના પ્રિસ્ક્રિપ્શન અને ટેસ્ટ રિપોર્ટ સ્કેન અથવા અપલોડ કરો.',
    upload_prescription: 'ડૉક્ટરનું પ્રિસ્ક્રિપ્શન',
    upload_lab: 'બ્લડ અને લેબ રિપોર્ટ',
    upload_discharge: 'ડિસ્ચાર્જ સારાંશ',
    extracting: 'ઓસીઆર દ્વારા વિગતો વાંચવામાં આવી રહી છે...',
    skip_records: 'છોડો અને આગળ વધો',
    proceed_summary: 'ક્લિનિકલ સારાંશ બનાવો',

    token_title: 'કેસ-ટેકિંગ સફળતાપૂર્વક પૂર્ણ!',
    token_subtitle: 'તમારી માહિતી અને જૂના પ્રિસ્ક્રિપ્શન ડૉક્ટરના કમ્પ્યુટર પર મોકલી દેવાયા છે.',
    token_number: 'ટોકન નંબર',
    room_number: 'રૂમ નંબર',
    assigned_doctor: 'કન્સલ્ટિંગ ડૉક્ટર',
    estimated_wait: 'અંદાજિત પ્રતીક્ષા સમય',
    mins: 'મિનિટ',
    print_slip: 'ટોકન સ્લિપ પ્રિન્ટ કરો',
    new_patient_btn: 'નવા દર્દી માટે શરૂ કરો',
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

  [LanguageCode.KN]: {
    step_identify: 'ಗುರುತು',
    step_consent: 'ಒಪ್ಪಿಗೆ',
    step_complaint: 'ಲಕ್ಷಣಗಳು',
    step_questions: 'ಪ್ರಶ್ನೆಗಳು',
    step_records: 'ದಾಖಲೆಗಳು',
    step_token: 'ಟೋಕನ್',

    aiia_title: 'ಆಲ್ ಇಂಡಿಯಾ ಇನ್ಸ್ಟಿಟ್ಯೂಟ್ ಆಫ್ ಆಯುರ್ವೇದ',
    emergency_alert: 'ತುರ್ತು',

    identity_title: 'ರೋಗಿಯ ಗುರುತು ಮತ್ತು ಪರಿಶೀಲನೆ',
    identity_subtitle: 'ಆಭಾ ಐಡಿ ಅಥವಾ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಮೂಲಕ ಹುಡುಕಿ ಅಥವಾ ಕೆಳಗಿನ ರೋಗಿಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    audio_identity: 'ಮೆಡಿಕಿಯೋಸ್ಕ್‌ಗೆ ಸುಸ್ವಾಗತ. ದಯವಿಟ್ಟು ನಿಮ್ಮ 14 ಅಂಕಿಗಳ ಆಭಾ ಐಡಿ ಅಥವಾ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ.',
    seeded_cases: '1-ಟ್ಯಾಪ್ ಕ್ಲಿನಿಕಲ್ ಪ್ರಕರಣಗಳು',
    search_placeholder: 'ಆಭಾ ಐಡಿ (ಉದಾ. 91-4829-1029-4820), ಮೊಬೈಲ್ ಅಥವಾ ಹೆಸರು ನಮೂದಿಸಿ...',
    register_walkin: '+ ಹೊಸ ರೋಗಿ ನೋಂದಣಿ',
    full_name: 'ರೋಗಿಯ ಪೂರ್ಣ ಹೆಸರು',
    age: 'ವಯಸ್ಸು',
    gender: 'ಲಿಂಗ',
    mobile: 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ',
    abha_id: 'ಆಭಾ ಐಡಿ (ಐಚ್ಛಿಕ)',
    male: 'ಪುರುಷ',
    female: 'ಮಹಿಳೆ',
    other: 'ಇತರ',
    submit_continue: 'ನೋಂದಾಯಿಸಿ ಮತ್ತು ಮುಂದುವರಿಯಿರಿ',
    select_btn: 'ಆಯ್ಕೆಮಾಡಿ',

    consent_title: 'ಆರೋಗ್ಯ ಸಮಾಲೋಚನೆಗಾಗಿ ಡಿಜಿಟಲ್ ಒಪ್ಪಿಗೆ',
    consent_subtitle: 'ಡಿಪಿಡಿಪಿ ಕಾಯ್ದೆ ಮತ್ತು ಆಭಾ ನಿಯಮಗಳ ಪ್ರಕಾರ ಸುರಕ್ಷಿತ',
    audio_consent: 'ವೈದ್ಯರ ಸಮಾಲೋಚನೆಗಾಗಿ ನಿಮ್ಮ ಆರೋಗ್ಯ ಮಾಹಿತಿ ಮತ್ತು ಹಿಂದಿನ ದಾಖಲೆಗಳನ್ನು ದಾಖಲಿಸಲು ನಿಮ್ಮ ಒಪ್ಪಿಗೆ ಅಗತ್ಯವಿದೆ.',
    consent_point_1: 'ನಿಮ್ಮ ಮಾಹಿತಿಯನ್ನು ತಪಾಸಣೆ ಮಾಡುವ ವೈದ್ಯರೊಂದಿಗೆ ಮಾತ್ರ ಹಂಚಿಕೊಳ್ಳಲಾಗುತ್ತದೆ.',
    consent_point_2: 'ಆಸ್ಪತ್ರೆಯ ಭೇಟಿಯ ಸಮಯದಲ್ಲಿ ನೀವು ಯಾವಾಗ ಬೇಕಾದರೂ ಒಪ್ಪಿಗೆಯನ್ನು ಹಿಂಪಡೆಯಬಹುದು.',
    consent_point_3: 'ಮಾಹಿತಿಯನ್ನು ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಆಭಾ ಖಾತೆಗೆ ಸುರಕ್ಷಿತವಾಗಿ ಜೋಡಿಸಲಾಗುವುದು.',
    accept_consent: 'ನಾನು ಒಪ್ಪುತ್ತೇನೆ (ಮುಂದುವರಿಯಿರಿ)',
    decline_consent: 'ತಿರಸ್ಕರಿಸಿ',

    complaint_title: 'ಇಂದು ನಿಮ್ಮ ಮುಖ್ಯ ಆರೋಗ್ಯ ತೊಂದರೆ ಏನು?',
    complaint_subtitle: 'ನಿಮ್ಮ ಮುಖ್ಯ ಲಕ್ಷಣವನ್ನು ಆಯ್ಕೆಮಾಡಿ ಅಥವಾ ಮೈಕ್‌ನಲ್ಲಿ ಮಾತನಾಡಿ',
    audio_complaint: 'ದಯವಿಟ್ಟು ಕೆಳಗಿನ ಆಯ್ಕೆಗಳಿಂದ ನಿಮ್ಮ ಮುಖ್ಯ ಲಕ್ಷಣವನ್ನು ಆರಿಸಿ ಅಥವಾ ಮೈಕ್ ಬಟನ್ ಒತ್ತಿ ಮಾತನಾಡಿ.',
    chest_pain: 'ಎದೆ ನೋವು ಮತ್ತು ಉರಿ (ತೀವ್ರ ಅಸ್ವಸ್ಥತೆ)',
    joint_pain: 'ಮೊಣಕಾಲು ಮತ್ತು ಕೀಲು ನೋವು (ಸಂಧಿವಾತ)',
    fever: 'ಜ್ವರ, ಶೀತ ಮತ್ತು ಕೆಮ್ಮು',
    digestive: 'ಹೊಟ್ಟೆ ನೋವು, ಗ್ಯಾಸ್ ಮತ್ತು ಅಸಿಡಿಟಿ',
    skin: 'ಚರ್ಮ ರೋಗಗಳು ಮತ್ತು ತುರಿಕೆ',
    general_checkup: 'ಸಾಮಾನ್ಯ ಆರೋಗ್ಯ ತಪಾಸಣೆ',

    intake_progress: 'ಪ್ರಗತಿ',
    speak_answer: 'ಧ್ವನಿಯ ಮೂಲಕ ಉತ್ತರಿಸಿ',
    confirm_next: 'ಖಚಿತಪಡಿಸಿ ಮತ್ತು ಮುಂದುವರಿಯಿರಿ',
    listening: 'ಮೈಕ್ ಆಲಿಸುತ್ತಿದೆ... ಮಾತನಾಡಿ',

    records_title: 'ಹಳೆಯ ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ಮತ್ತು ಲ್ಯಾಬ್ ವರದಿಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
    records_subtitle: 'ಓಸಿಆರ್ ತಂತ್ರಜ್ಞಾನದ ಮೂಲಕ ಔಷಧಿಗಳ ವಿವರಗಳನ್ನು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ದಾಖಲಿಸಲಾಗುತ್ತದೆ',
    audio_records: 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ಹಿಂದಿನ ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ಮತ್ತು ತಪಾಸಣಾ ವರದಿಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.',
    upload_prescription: 'ವೈದ್ಯರ ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್',
    upload_lab: 'ರಕ್ತ & ಲ್ಯಾಬ್ ವರದಿ',
    upload_discharge: 'ಡಿಸ್ಚಾರ್ಜ್ ಸಾರಾಂಶ',
    extracting: 'ಮಾಹಿತಿಯನ್ನು ದಾಖಲಿಸಲಾಗುತ್ತಿದೆ...',
    skip_records: 'ಬಿಟ್ಟು ಮುಂದುವರಿಯಿರಿ',
    proceed_summary: 'ಸಾರಾಂಶವನ್ನು ವೀಕ್ಷಿಸಿ',

    token_title: 'ಮಾಹಿತಿ ಸಂಗ್ರಹಣೆ ಪೂರ್ಣಗೊಂಡಿದೆ!',
    token_subtitle: 'ನಿಮ್ಮ ವಿವರಗಳನ್ನು ವೈದ್ಯರ ಪರದೆಗೆ ಯಶಸ್ವಿಯಾಗಿ ಕಳುಹಿಸಲಾಗಿದೆ.',
    token_number: 'ಟೋಕನ್ ಸಂಖ್ಯೆ',
    room_number: 'ಕೊಠಡಿ ಸಂಖ್ಯೆ',
    assigned_doctor: 'ತಪಾಸಣಾ ವೈದ್ಯರು',
    estimated_wait: 'ಅಂದಾಜು ಕಾಯುವ ಸಮಯ',
    mins: 'ನಿಮಿಷಗಳು',
    print_slip: 'ಟೋಕನ್ ಸ್ಲಿಪ್ ಮುದ್ರಿಸಿ',
    new_patient_btn: 'ಮುಂದಿನ ರೋಗಿಗಾಗಿ ಪ್ರಾರಂಭಿಸಿ',
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
    consent_point_3: 'వివరాలు మీ వ్యక్తిగత ఆభా ఖాతాకు సురಕ್ಷితంగా లింక్ చేయబడతాయి.',
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
    records_subtitle: 'ओसीआर तंत्रज्ञानाद्वारे औषधांची नावे स्वयंचलितपणे वाचली जातीલ',
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

  [LanguageCode.PA]: {
    step_identify: 'ਪਛਾਣ',
    step_consent: 'ਸਹਿਮਤੀ',
    step_complaint: 'ਲੱਛਣ',
    step_questions: 'ਸਵਾਲ',
    step_records: 'ਦਸਤਾਵੇਜ਼',
    step_token: 'ਟੋਕਨ',

    aiia_title: 'ਆਲ ਇੰਡੀਆ ਇੰਸਟੀਚਿਊਟ ਆਫ਼ ਆਯੁਰਵੇਦ',
    emergency_alert: 'ਐਮਰਜੈਂਸੀ',

    identity_title: 'ਮਰੀਜ਼ ਦੀ ਪਛਾਣ ਅਤੇ ਤਸਦੀਕ',
    identity_subtitle: 'ਆਭਾ ਆਈਡੀ, ਮੋਬਾਈਲ ਨੰਬਰ ਰਾਹੀਂ ਖੋਜੋ ਜਾਂ ਹੇਠਾਂ ਦਿੱਤੇ ਮਰੀਜ਼ ਨੂੰ ਚੁਣੋ',
    audio_identity: 'ਮੈਡੀਕਿਓਸਕ ਵਿੱਚ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਆਪਣਾ 14 ਅੰਕਾਂ ਦਾ ਆਭਾ ਆਈਡੀ ਜਾਂ ਮੋਬਾਈਲ ਨੰਬਰ ਦਰਜ ਕਰੋ।',
    seeded_cases: '1-ਟੈਪ ਕਲੀਨਿਕਲ ਕੇਸ',
    search_placeholder: 'ਆਭਾ ਆਈਡੀ (ਜਿਵੇਂ 91-4829-1029-4820), ਮੋਬਾਈਲ ਜਾਂ ਨਾਮ ਦਰਜ ਕਰੋ...',
    register_walkin: '+ ਨਵਾਂ ਮਰੀਜ਼ ਰਜਿਸਟਰ ਕਰੋ',
    full_name: 'ਮਰੀਜ਼ ਦਾ ਪੂਰਾ ਨਾਮ',
    age: 'ਉਮਰ',
    gender: 'ਲਿੰਗ',
    mobile: 'ਮੋਬਾਈਲ ਨੰਬਰ',
    abha_id: 'ਆਭਾ ਆਈਡੀ (ਵਿਕਲਪਿਕ)',
    male: 'ਪੁਰਸ਼',
    female: 'ਔਰਤ',
    other: 'ਹੋਰ',
    submit_continue: 'ਰਜਿਸਟਰ ਕਰੋ ਅਤੇ ਅੱਗੇ ਵਧੋ',
    select_btn: 'ਚੁਣੋ',

    consent_title: 'ਡਾਕਟਰੀ ਸਲਾਹ ਲਈ ਡਿਜੀਟਲ ਸਹਿਮਤੀ',
    consent_subtitle: 'ਡੀਪੀਡੀਪੀ ਐਕਟ ਅਤੇ ਆਭਾ ਨਿਯਮਾਂ ਅਨੁਸਾਰ ਪੂਰੀ ਤਰ੍ਹਾਂ ਸੁਰੱਖਿਅਤ',
    audio_consent: 'ਡਾਕਟਰ ਦੀ ਸਲਾਹ ਲਈ ਤੁਹਾਡੀ ਸਿਹਤ ਜਾਣਕਾਰੀ ਅਤੇ ਪੁਰਾਣੇ ਪਰਚੇ ਦਰਜ ਕਰਨ ਲਈ ਤੁਹਾਡੀ ਸਹਿਮਤੀ ਲੋੜੀਂਦੀ ਹੈ।',
    consent_point_1: 'ਤੁਹਾਡੀ ਜਾਣਕਾਰੀ ਸਿਰਫ਼ ਤੁਹਾਡੇ ਇਲਾਜ ਕਰਨ ਵਾਲੇ ਡਾਕਟਰ ਨਾਲ ਸਾਂਝੀ ਕੀਤੀ ਜਾਵੇਗੀ।',
    consent_point_2: 'ਤੁਸੀਂ ਹਸਪਤਾਲ ਦੌਰੇ ਦੌਰਾਨ ਕਿਸੇ ਵੀ ਸਮੇਂ ਸਹਿਮਤੀ ਵਾਪਸ ਲੈ ਸਕਦੇ ਹੋ।',
    consent_point_3: 'ਜਾਣਕਾਰੀ ਤੁਹਾਡੇ ਨਿੱਜੀ ਆਭਾ ਖਾਤੇ ਨਾਲ ਸੁਰੱਖਿਅਤ ਢੰਗ ਨਾਲ ਲਿੰਕ ਕੀਤੀ ਜਾਵੇਗੀ।',
    accept_consent: 'ਮੈਂ ਸਹਿਮਤ ਹਾਂ (ਅੱਗੇ ਵਧੋ)',
    decline_consent: 'ਅਸਵੀਕਾਰ ਕਰੋ',

    complaint_title: 'ਅੱਜ ਤੁਹਾਨੂੰ ਕੀ ਮੁੱਖ ਤਕਲੀਫ਼ ਜਾਂ ਸਮੱਸਿਆ ਹੈ?',
    complaint_subtitle: 'ਆਪਣਾ ਮੁੱਖ ਲੱਛਣ ਚੁਣੋ ਜਾਂ ਮਾਈਕ ਵਿੱਚ ਬੋਲ ਕੇ ਦੱਸੋ',
    audio_complaint: 'ਕਿਰਪਾ ਕਰਕੇ ਹੇਠਾਂ ਦਿੱਤੇ ਵਿਕਲਪਾਂ ਵਿੱਚੋਂ ਆਪਣਾ ਮੁੱਖ ਲੱਛਣ ਚੁਣੋ ਜਾਂ ਮਾਈਕ ਬਟਨ ਦਬਾ ਕੇ ਬੋਲੋ।',
    chest_pain: 'ਛਾਤੀ ਵਿੱਚ ਦਰਦ ਅਤੇ ਜਲਣ (ਤੀਬਰ ਬੇਚੈਨੀ)',
    joint_pain: 'ਗੋਡਿਆਂ ਅਤੇ ਜੋੜਾਂ ਦਾ ਦਰਦ (ਗਠੀਆ)',
    fever: 'ਬੁਖਾਰ, ਜ਼ੁਕਾਮ ਅਤੇ ਖੰਘ',
    digestive: 'ਪੇਟ ਦਰਦ, ਗੈਸ ਅਤੇ ਐਸੀਡਿਟੀ',
    skin: 'ਚਮੜੀ ਦੇ ਰੋਗ ਅਤੇ ਖਾਰਸ਼',
    general_checkup: 'ਆਮ ਸਿਹਤ ਜਾਂਚ',

    intake_progress: 'ਜਾਂਚ ਪ੍ਰਗਤੀ',
    speak_answer: 'ਆਵਾਜ਼ ਨਾਲ ਜਵਾਬ ਦਿਓ',
    confirm_next: 'ਪੁਸ਼ਟੀ ਕਰੋ ਅਤੇ ਅੱਗੇ ਵਧੋ',
    listening: 'ਮਾਈਕ ਸੁਣ ਰਿਹਾ ਹੈ... ਬੋਲੋ',

    records_title: 'ਪੁਰਾਣੇ ਪਰਚੇ ਅਤੇ ਲੈਬ ਰਿਪੋਰਟਾਂ ਅੱਪਲੋਡ ਕਰੋ',
    records_subtitle: 'ਓਸੀਆਰ ਤਕਨੀਕ ਰਾਹੀਂ ਦਵਾਈਆਂ ਦੇ ਵੇਰਵੇ ਆਪਣੇ ਆਪ ਪੜ੍ਹੇ ਜਾਣਗੇ',
    audio_records: 'ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੇ ਪੁਰਾਣੇ ਡਾਕਟਰ ਦੇ ਪਰਚੇ ਅਤੇ ਟੈਸਟ ਰਿਪੋਰਟਾਂ ਅੱਪਲੋਡ ਕਰੋ।',
    upload_prescription: 'ਡਾਕਟਰ ਦਾ ਪਰਚਾ',
    upload_lab: 'ਬਲੱਡ ਅਤੇ ਲੈਬ ਰਿਪੋਰਟ',
    upload_discharge: 'ਡਿਸਚਾਰਜ ਸੰਖੇਪ',
    extracting: 'ਓਸੀਆਰ ਰਾਹੀਂ ਵੇਰਵੇ ਪੜ੍ਹੇ ਜਾ ਰਹੇ ਹਨ...',
    skip_records: 'ਛੱਡੋ ਅਤੇ ਅੱਗੇ ਵਧੋ',
    proceed_summary: 'ਕਲੀਨਿਕਲ ਸੰਖੇਪ ਬਣਾਓ',

    token_title: 'ਕੇਸ-ਟੇਕਿੰਗ ਸਫਲਤਾਪੂਰਵਕ ਪੂਰੀ ਹੋਈ!',
    token_subtitle: 'ਤੁਹਾਡੀ ਜਾਣਕਾਰੀ ਡਾਕਟਰ ਦੇ ਸਕਰੀਨ ਤੇ ਭੇਜ ਦਿੱਤੀ ਗਈ ਹੈ।',
    token_number: 'ਟੋਕਨ ਨੰਬਰ',
    room_number: 'ਕਮਰਾ ਨੰਬਰ',
    assigned_doctor: 'ਸਲਾਹਕਾਰ ਡਾਕਟਰ',
    estimated_wait: 'ਅੰਦਾਜ਼ਨ ਉਡੀਕ ਸਮਾਂ',
    mins: 'ਮਿੰਟ',
    print_slip: 'ਟੋਕਨ ਪਰਚੀ ਪ੍ਰਿੰਟ ਕਰੋ',
    new_patient_btn: 'ਅਗਲੇ ਮਰੀਜ਼ ਲਈ ਸ਼ੁਰੂ ਕਰੋ',
  },

  [LanguageCode.OR]: {
    step_identify: 'ଚିହ୍ନଟ',
    step_consent: 'ସମ୍ମତି',
    step_complaint: 'ଲକ୍ଷଣ',
    step_questions: 'ପ୍ରଶ୍ନ',
    step_records: 'ଦଲିଲ',
    step_token: 'ଟୋକନ୍',

    aiia_title: 'ଅଲ ଇଣ୍ଡିଆ ଇନଷ୍ଟିଚ୍ୟୁଟ୍ ଅଫ୍ ଆୟୁର୍ବେଦ',
    emergency_alert: 'ଜରୁରୀକାଳୀନ',

    identity_title: 'ରୋଗୀ ଚିହ୍ନଟ ଏବଂ ଯାଞ୍ଚ',
    identity_subtitle: 'ଆଭା ଆଇଡି କିମ୍ବା ମୋବାଇଲ୍ ନମ୍ବର ଦ୍ୱାରା ଖୋଜନ୍ତୁ ବା ରୋଗୀ ଚୟନ କରନ୍ତୁ',
    audio_identity: 'ମେଡିକିଓସ୍କକୁ ସ୍ୱାଗତ | ଦୟାକରି ଆପଣଙ୍କ ୧୪ ଅଙ୍କ ବିଶିଷ୍ଟ ଆଭା ଆଇଡି ବା ମୋବାଇଲ୍ ନମ୍ବର ପ୍ରବେଶ କରନ୍ତୁ |',
    seeded_cases: '୧-ଟ୍ୟାପ୍ କ୍ଲିନିକାଲ୍ କେସ୍',
    search_placeholder: 'ଆଭା ଆଇଡି, ମୋବାଇଲ୍ ବା ନାମ ପ୍ରବେଶ କରନ୍ତୁ...',
    register_walkin: '+ ନୂଆ ରୋଗୀ ପଞ୍ଜୀକରଣ କରନ୍ତୁ',
    full_name: 'ସମ୍ପୂର୍ଣ୍ଣ ନାମ',
    age: 'ବୟସ',
    gender: 'ଲିଙ୍ଗ',
    mobile: 'ମୋବାଇଲ୍ ନମ୍ବର',
    abha_id: 'ଆଭା ଆଇଡି (ଇଚ୍ଛାଧୀନ)',
    male: 'ପୁରୁଷ',
    female: 'ମହିଳା',
    other: 'ଅନ୍ୟାନ୍ୟ',
    submit_continue: 'ପଞ୍ଜୀକରଣ କରନ୍ତୁ ଏବଂ ଆଗକୁ ବଢ଼ନ୍ତୁ',
    select_btn: 'ଚୟନ କରନ୍ତୁ',

    consent_title: 'ଚିକିତ୍ସା ପରାମର୍ଶ ପାଇଁ ଡିଜିଟାଲ୍ ସମ୍ମତି',
    consent_subtitle: 'ଡିପିଡିପି ଆଇନ ଏବଂ ଆଭା ନିୟମ ଅନୁଯାୟୀ ସମ୍ପୂର୍ଣ୍ଣ ସୁରକ୍ଷିତ',
    audio_consent: 'ଡାକ୍ତରୀ ପରାମର୍ଶ ପାଇଁ ଆପଣଙ୍କ ସ୍ୱାସ୍ଥ୍ୟ ତଥ୍ୟ ଡିଜିଟାଇଜ୍ କରିବାକୁ ସମ୍ମତି ଆବଶ୍ୟକ |',
    consent_point_1: 'ଆପଣଙ୍କ ତଥ୍ୟ କେବଳ ଚିକିତ୍ସା କରୁଥିବା ଡାକ୍ତରଙ୍କ ସହିତ ସେୟାର କରାଯିବ |',
    consent_point_2: 'ଆପଣ ଡାକ୍ତରଖାନା ପରିଦର୍ଶନ ସମୟରେ ଯେକୌଣସି ସମୟରେ ସମ୍ମତି ପ୍ରତ୍ୟାହାର କରିପାରିବେ |',
    consent_point_3: 'ତଥ୍ୟ ଆପଣଙ୍କ ବ୍ୟକ୍ତିଗତ ଆଭା ଆକାଉଣ୍ଟ ସହିତ ସୁରକ୍ଷିତ ଭାବରେ ସଂଯୁକ୍ତ ରହିବ |',
    accept_consent: 'ମୁଁ ସହମତ (ଆଗକୁ ବଢ଼ନ୍ତୁ)',
    decline_consent: 'ଅଗ୍ରାହ୍ୟ କରନ୍ତୁ',

    complaint_title: 'ଆଜି ଆପଣଙ୍କର ମୁଖ୍ୟ ସମସ୍ୟା ବା ଲକ୍ଷଣ କଣ?',
    complaint_subtitle: 'ଆପଣଙ୍କ ମୁଖ୍ୟ ଲକ୍ଷଣ ଚୟନ କରନ୍ତୁ କିମ୍ବା ମାଇକରେ କୁହନ୍ତୁ',
    audio_complaint: 'ଦୟାକରି ତଳେ ଥିବା ବିକଳ୍ପରୁ ଆପଣଙ୍କ ମୁଖ୍ୟ ଲକ୍ଷଣ ଚୟନ କରନ୍ତୁ କିମ୍ବା ମାଇକ୍ ବଟନ୍ ଦବାଇ କୁହନ୍ତୁ |',
    chest_pain: 'ଛାତିରେ ଯନ୍ତ୍ରଣା ଏବଂ ଅସହଜତା',
    joint_pain: 'ଗଣ୍ଠି ଏବଂ ଆଣ୍ଠୁ ଯନ୍ତ୍ରଣା (ବାତ ରୋଗ)',
    fever: 'ଜ୍ୱର, ଥଣ୍ଡା ଏବଂ କାଶ',
    digestive: 'ପେଟ ଯନ୍ତ୍ରଣା, ଗ୍ୟାସ୍ ଏବଂ ଏସିଡିଟି',
    skin: 'ଚର୍ମ ରୋଗ ଏବଂ କୁଣ୍ଡେଇ ହେବା',
    general_checkup: 'ସାଧାରଣ ସ୍ୱାସ୍ଥ୍ୟ ପରୀକ୍ଷା',

    intake_progress: 'ଅଗ୍ରଗତି',
    speak_answer: 'ସ୍ୱର ମାଧ୍ୟମରେ ଉତ୍ତର ଦିଅନ୍ତୁ',
    confirm_next: 'ନିଶ୍ଚିତ କରନ୍ତୁ ଏବଂ ଆଗକୁ ବଢ଼ନ୍ତୁ',
    listening: 'ମାଇକ୍ ଶୁଣୁଛି... କୁହନ୍ତୁ',

    records_title: 'ପୁରୁଣା ପ୍ରେସକ୍ରିପସନ୍ ଏବଂ ଲ୍ୟାବ୍ ରିପୋର୍ଟ ଅପଲୋଡ୍ କରନ୍ତୁ',
    records_subtitle: 'ଓସିଆର୍ ଦ୍ୱାରା ଔଷଧର ନାମ ଏବଂ ବିବରଣୀ ସ୍ୱୟଂଚାଳିତ ଭାବରେ ପଢାଯିବ',
    audio_records: 'ଦୟାକରି ଆପଣଙ୍କ ପୁରୁଣା ଡାକ୍ତରୀ ପ୍ରେସକ୍ରିପସନ୍ ଏବଂ ଟେଷ୍ଟ ରିପୋର୍ଟ ଅପଲୋଡ୍ କରନ୍ତୁ |',
    upload_prescription: 'ଡାକ୍ତରୀ ପ୍ରେସକ୍ରିପସନ୍',
    upload_lab: 'ରକ୍ତ ଏବଂ ଲ୍ୟାବ୍ ରିପୋର୍ଟ',
    upload_discharge: 'ଡିସଚାର୍ଜ ସାରାଂଶ',
    extracting: 'ତଥ୍ୟ ସଂଗ୍ରହ କରାଯାଉଛି...',
    skip_records: 'ଛାଡନ୍ତୁ ଏବଂ ଆଗକୁ ବଢ଼ନ୍ତୁ',
    proceed_summary: 'କ୍ଲିନିକାଲ୍ ସାରାଂଶ ଦେଖନ୍ତୁ',

    token_title: 'ତଥ୍ୟ ସଂଗ୍ରହ ସଫଳତାର ସହିତ ସମାପ୍ତ!',
    token_subtitle: 'ଆପଣଙ୍କ ବିବରଣୀ ଡାକ୍ତରଙ୍କ ସ୍କ୍ରିନକୁ ପଠାଯାଇଛି |',
    token_number: 'ଟୋକନ୍ ନମ୍ବର',
    room_number: 'ରୁମ୍ ନମ୍ବର',
    assigned_doctor: 'ପରାମର୍ଶଦାତା ଡାକ୍ତର',
    estimated_wait: 'ଅନୁମାନିତ ଅପେକ୍ଷା ସମୟ',
    mins: 'ମିନିଟ୍',
    print_slip: 'ଟୋକନ୍ ସ୍ଲିପ୍ ପ୍ରିଣ୍ଟ କରନ୍ତୁ',
    new_patient_btn: 'ପରବର୍ତ୍ତୀ ରୋଗୀ ପାଇଁ ଆରମ୍ଭ କରନ୍ତୁ',
  },

  [LanguageCode.UR]: {
    step_identify: 'شناخت',
    step_consent: 'رضامندی',
    step_complaint: 'علامات',
    step_questions: 'سوالات',
    step_records: 'دستاویزات',
    step_token: 'ٹوکن',

    aiia_title: 'آل انڈیا انسٹی ٹیوٹ آف آیوروید',
    emergency_alert: 'ایمرجنسی',

    identity_title: 'مریض کی شناخت اور تصدیق',
    identity_subtitle: 'آبھا آئی ڈی یا موبائل نمبر کے ذریعے تلاش کریں یا مریض منتخب کریں',
    audio_identity: 'میڈی کیوسک میں خوش آمدید۔ براہ کرم اپنا 14 ہندسوں کا آبھا آئی ڈی یا موبائل نمبر درج کریں۔',
    seeded_cases: '1-ٹیپ کلینیکل کیسز',
    search_placeholder: 'آبھا آئی ڈی، موبائل یا نام درج کریں...',
    register_walkin: '+ نیا مریض رجسٹر کریں',
    full_name: 'مریض کا پورا نام',
    age: 'عمر',
    gender: 'جنس',
    mobile: 'موبائل نمبر',
    abha_id: 'آبھا آئی ڈی (اختیاری)',
    male: 'مرد',
    female: 'عورت',
    other: 'دیگر',
    submit_continue: 'رجسٹر کریں اور آگے بڑھیں',
    select_btn: 'منتخب کریں',

    consent_title: 'طبی مشورے کے لیے ڈیجیٹل رضامندی',
    consent_subtitle: 'ڈی پی ڈی پی ایکٹ اور آبھا قوانین کے تحت مکمل محفوظ',
    audio_consent: 'ڈاکٹر کے مشورے کے لیے آپ کی طبی معلومات اور پرانے نسخے جمع کرنے کے لیے آپ کی رضامندی درکار ہے۔',
    consent_point_1: 'آپ کی معلومات صرف معالج ڈاکٹر کے ساتھ شیئر کی جائیں گی۔',
    consent_point_2: 'آپ ہسپتال کے دورے کے دوران کسی بھی وقت رضامندی واپس لے سکتے ہیں۔',
    consent_point_3: 'معلومات آپ کے ذاتی آبھا اکاؤنٹ کے ساتھ محفوظ طریقے سے منسلک رہے گی۔',
    accept_consent: 'میں متفق ہوں (آگے بڑھیں)',
    decline_consent: 'مسترد کریں',

    complaint_title: 'آج آپ کو کیا بنیادی تکلیف یا مسئلہ ہے؟',
    complaint_subtitle: 'اپنی بنیادی علامات منتخب کریں یا مائیک میں بول کر بتائیں',
    audio_complaint: 'براہ کرم نیچے دیے گئے اختیارات میں سے اپنی علامت منتخب کریں یا مائیک دباکر بولیں۔',
    chest_pain: 'سینے میں شدید درد اور جلن',
    joint_pain: 'گھٹنوں اور جوڑوں کا درد (گٹھیا)',
    fever: 'بخار، نزلہ اور کھانسی',
    digestive: 'پیٹ کا درد، گیس اور تیزابیت',
    skin: 'جلد کی بیماریاں اور خارش',
    general_checkup: 'عام طبی معائنہ',

    intake_progress: 'معائنے کی پیشرفت',
    speak_answer: 'آواز سے جواب دیں',
    confirm_next: 'تصدیق کریں اور آگے بڑھیں',
    listening: 'مائیک سن رہا ہے... بولیں',

    records_title: 'پرانے نسخے اور لیب رپورٹس اپ لوڈ کریں',
    records_subtitle: 'او سی آر ٹیکنالوجی کے ذریعے ادویات کی تفصیلات خود بخود درج ہو جائیں گی',
    audio_records: 'براہ کرم اپنے پرانے ڈاکٹر کے نسخے اور ٹیسٹ رپورٹس اپ لوڈ کریں۔',
    upload_prescription: 'ڈاکٹر کا نسخہ',
    upload_lab: 'خون اور لیب رپورٹ',
    upload_discharge: 'ڈسچارج سمری',
    extracting: 'معلومات کا اندراج جاری ہے...',
    skip_records: 'چھوڑیں اور آگے بڑھیں',
    proceed_summary: 'کلینیکل خلاصہ بنائیں',

    token_title: 'معلومات کا اندراج مکمل ہو گیا!',
    token_subtitle: 'آپ کی معلومات ڈاکٹر کی سکرین پر بھیج دی گئی ہے۔',
    token_number: 'ٹوکن نمبر',
    room_number: 'کمرہ نمبر',
    assigned_doctor: 'معالج ڈاکٹر',
    estimated_wait: 'متوقع انتظار کا وقت',
    mins: 'منٹ',
    print_slip: 'ٹوکن سلپ پرنٹ کریں',
    new_patient_btn: 'اگلے مریض کے لیے شروع کریں',
  },
};

export const getTranslation = (lang: LanguageCode): TranslationDictionary => {
  return TRANSLATIONS[lang] || TRANSLATIONS[LanguageCode.EN];
};
