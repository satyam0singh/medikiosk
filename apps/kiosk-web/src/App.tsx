import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ProgressBar, KioskStep } from './components/ProgressBar';
import { WelcomeScreen } from './components/screens/WelcomeScreen';
import { IdentityScreen } from './components/screens/IdentityScreen';
import { ConsentScreen } from './components/screens/ConsentScreen';
import { ChiefComplaintScreen } from './components/screens/ChiefComplaintScreen';
import { InterviewScreen } from './components/screens/InterviewScreen';
import { RedFlagScreen } from './components/screens/RedFlagScreen';
import { DocumentUploadScreen, UploadedDocument } from './components/screens/DocumentUploadScreen';
import { CompletionScreen } from './components/screens/CompletionScreen';
import { VoiceIntakeModal } from './components/VoiceIntakeModal';
import { Patient, LanguageCode, RedFlagAlert, ProvenanceType } from '@medikiosk/shared-types';
import { KioskApi } from './services/api';
import { AiDoctorVoiceSummary } from './utils/groqVoiceIntake';

export const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<KioskStep>('LANGUAGE');
  const [language, setLanguage] = useState<LanguageCode>(LanguageCode.EN);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [activeAlert, setActiveAlert] = useState<RedFlagAlert | null>(null);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
  const [activeVoiceSummary, setActiveVoiceSummary] = useState<AiDoctorVoiceSummary | null>(null);
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([]);

  const [isLightMode, setIsLightMode] = useState<boolean>(() => {
    return localStorage.getItem('medikiosk_kiosk_theme') === 'light';
  });

  useEffect(() => {
    localStorage.setItem('medikiosk_kiosk_theme', isLightMode ? 'light' : 'dark');
    if (isLightMode) {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  }, [isLightMode]);

  const [selectedComplaintKey, setSelectedComplaintKey] = useState<string>('chest_pain');
  const [selectedComplaintLabel, setSelectedComplaintLabel] = useState<string>('Acute Chest Pain / Discomfort');

  // Step 1: Language Selection
  const handleSelectLanguage = (lang: LanguageCode) => {
    setLanguage(lang);
    setCurrentStep('IDENTITY');
  };

  // Step 2: Patient Identified
  const handlePatientIdentified = (identifiedPatient: Patient) => {
    setPatient(identifiedPatient);
    setCurrentStep('CONSENT');
  };

  // Step 3: Consent Granted
  const handleConsentGranted = async () => {
    if (!patient) return;
    setCurrentStep('COMPLAINT');
  };

  // Step 4: Chief Complaint Selected with AI Smart Department Routing
  const handleSelectComplaint = async (complaintKey: string, complaintLabel: string) => {
    if (!patient) return;

    setSelectedComplaintKey(complaintKey);
    setSelectedComplaintLabel(complaintLabel);

    // AI Smart Routing rules
    let routedDepartment = 'General Medicine';
    let encounterType: 'OPD_GENERAL' | 'OPD_AYUSH' | 'EMERGENCY' = 'OPD_GENERAL';

    if (complaintKey === 'chest_pain') {
      routedDepartment = 'Cardiology';
      encounterType = 'EMERGENCY';
    } else if (complaintKey === 'joint_pain' || complaintKey === 'ayush_assessment') {
      routedDepartment = 'Kayachikitsa / AYUSH';
      encounterType = 'OPD_AYUSH';
    } else if (complaintKey === 'abdominal_pain') {
      routedDepartment = 'Gastroenterology';
    } else if (complaintKey === 'skin') {
      routedDepartment = 'Dermatology';
    } else if (complaintKey === 'fever') {
      routedDepartment = 'General Medicine';
    }

    try {
      const encounter = await KioskApi.createEncounter({
        patientId: patient.id,
        department: routedDepartment,
        encounterType,
        chiefComplaintSummary: complaintLabel,
      });

      const session = await KioskApi.createSession({
        encounterId: encounter.id,
        patientId: patient.id,
        selectedLanguage: language,
      });

      setSessionId(session.id);

      await KioskApi.recordAnswer(session.id, {
        questionId: 'q_chief_complaint',
        selectedOptions: [complaintKey],
        rawText: complaintLabel,
      });

      setCurrentStep('INTERVIEW');
    } catch (err) {
      console.warn('Backend encounter creation fallback:', err);
      setSessionId(`session-${Date.now()}`);
      setCurrentStep('INTERVIEW');
    }
  };

  // Step 4b: Voice Intake Completed via Multilingual AI Engine
  const handleConfirmVoiceIntake = async (summary: AiDoctorVoiceSummary) => {
    if (!patient) return;

    setActiveVoiceSummary(summary);
    setIsVoiceModalOpen(false);

    const compKey =
      summary.entities.recommendedDepartment === 'Cardiology'
        ? 'chest_pain'
        : summary.entities.recommendedDepartment === 'Kayachikitsa / AYUSH'
        ? 'joint_pain'
        : summary.entities.recommendedDepartment === 'Gastroenterology'
        ? 'abdominal_pain'
        : summary.entities.recommendedDepartment === 'Dermatology'
        ? 'skin'
        : 'fever';

    setSelectedComplaintKey(compKey);
    setSelectedComplaintLabel(`🎙️ ${summary.entities.primaryComplaint}`);

    // If life-threatening red flag detected by Groq LLM
    if (summary.entities.emergencyRedFlag) {
      const redFlagAlert: RedFlagAlert = {
        id: `rf-voice-${Date.now()}`,
        encounterId: sessionId || `enc-${Date.now()}`,
        patientId: patient.id,
        ruleId: 'rf_acute_coronary_syndrome',
        severity: 'CRITICAL_EMERGENCY' as any,
        alertMessage:
          summary.entities.redFlagRationale ||
          'Critical emergency symptoms detected in patient voice narrative.',
        triggerFacts: [
          {
            field: 'voice.verbatim_transcript',
            value: summary.verbatimTranscript,
            sourceType: ProvenanceType.PATIENT_REPORTED,
          },
          {
            field: 'voice.symptom_severity',
            value: summary.entities.severity,
            sourceType: ProvenanceType.AI_EXTRACTED,
          },
        ],
        isAcknowledged: false,
        createdAt: new Date().toISOString(),
      };

      try {
        const bc = new BroadcastChannel('medikiosk_triage_alerts');
        bc.postMessage({ type: 'NEW_SAFETY_ALERT', alert: redFlagAlert });
        setTimeout(() => bc.close(), 500);
      } catch {}

      setActiveAlert(redFlagAlert);
      setCurrentStep('RED_FLAG');
      return;
    }

    // Otherwise proceed smoothly to Documents & Summary
    setCurrentStep('DOCUMENTS');
  };

   // Universal Back Button Navigation Handler
  const handleGoBack = () => {
    switch (currentStep) {
      case 'IDENTITY':
        setCurrentStep('LANGUAGE');
        break;
      case 'CONSENT':
        setCurrentStep('IDENTITY');
        break;
      case 'COMPLAINT':
        setCurrentStep('CONSENT');
        break;
      case 'INTERVIEW':
        setCurrentStep('COMPLAINT');
        break;
      case 'DOCUMENTS':
        if (activeVoiceSummary) {
          setCurrentStep('COMPLAINT');
        } else {
          setCurrentStep('INTERVIEW');
        }
        break;
      case 'RED_FLAG':
        setCurrentStep('COMPLAINT');
        break;
      default:
        break;
    }
  };

  // Step 5: Red Flag Triggered
  const handleRedFlagTriggered = (alert: RedFlagAlert) => {
    setActiveAlert(alert);
    setCurrentStep('RED_FLAG');
  };

  // Reset to Beginning
  const handleReset = () => {
    setCurrentStep('LANGUAGE');
    setPatient(null);
    setSessionId(null);
    setActiveAlert(null);
    setActiveVoiceSummary(null);
    setUploadedDocs([]);
    setSelectedComplaintKey('chest_pain');
  };

  return (
    <div
      className={`h-screen max-h-screen w-full flex flex-col overflow-hidden select-none transition-colors ${
        isLightMode
          ? 'bg-[#FBFBFA] text-[#111111]'
          : 'bg-[#0D0F14] text-[#F4F4F6]'
      }`}
    >
      {/* Universal Kiosk Header with Theme Toggle */}
      <Header
        currentLanguage={language}
        onToggleLanguage={(lang) => setLanguage(lang)}
        onEmergencyClick={() => {
          setActiveAlert({
            id: 'rf-manual-emergency',
            encounterId: 'manual',
            patientId: patient?.id || 'manual',
            ruleId: 'MANUAL_EMERGENCY_BUTTON',
            severity: 'CRITICAL_EMERGENCY' as any,
            alertMessage:
              language === LanguageCode.HI
                ? 'मरीज ने कियोस्क स्क्रीन पर आपातकालीन सहायता बटन दबाया है।'
                : 'Patient pressed emergency assistance button on kiosk screen.',
            triggerFacts: [],
            isAcknowledged: false,
            createdAt: new Date().toISOString(),
          });
          setCurrentStep('RED_FLAG');
        }}
        isLightMode={isLightMode}
        onToggleTheme={() => setIsLightMode(!isLightMode)}
      />

      {/* Progress Tracker with Dynamic Pixel Sizing */}
      <ProgressBar currentStep={currentStep} language={language} />

      {/* Dynamic Screen Viewport Container with safe internal scrolling */}
      <main className="flex-1 w-full overflow-y-auto overflow-x-hidden flex flex-col justify-between px-3 sm:px-6 py-2 sm:py-4">
        {currentStep === 'LANGUAGE' && (
          <WelcomeScreen onSelectLanguage={handleSelectLanguage} />
        )}

        {currentStep === 'IDENTITY' && (
          <IdentityScreen
            language={language}
            onPatientIdentified={handlePatientIdentified}
            onBack={handleGoBack}
          />
        )}

        {currentStep === 'CONSENT' && patient && (
          <ConsentScreen
            patient={patient}
            language={language}
            onConsentGranted={handleConsentGranted}
            onConsentDenied={handleReset}
            onBack={handleGoBack}
          />
        )}

        {currentStep === 'COMPLAINT' && (
          <ChiefComplaintScreen
            language={language}
            onSelectComplaint={handleSelectComplaint}
            onOpenVoiceIntake={() => setIsVoiceModalOpen(true)}
            onBack={handleGoBack}
          />
        )}

        {currentStep === 'INTERVIEW' && sessionId && (
          <InterviewScreen
            sessionId={sessionId}
            language={language}
            complaintKey={selectedComplaintKey}
            onInterviewCompleted={() => setCurrentStep('DOCUMENTS')}
            onRedFlagTriggered={handleRedFlagTriggered}
            onBack={handleGoBack}
          />
        )}

        {currentStep === 'RED_FLAG' && activeAlert && (
          <RedFlagScreen
            alert={activeAlert}
            language={language}
            onAcknowledge={() => setCurrentStep('COMPLAINT')}
            onRestart={handleReset}
            onBack={handleGoBack}
          />
        )}

        {currentStep === 'DOCUMENTS' && (
          <DocumentUploadScreen
            language={language}
            onProceedToSummary={(docs) => {
              setUploadedDocs(docs);
              setCurrentStep('COMPLETION');
            }}
            onBack={handleGoBack}
          />
        )}

        {currentStep === 'COMPLETION' && patient && (
          <CompletionScreen
            patient={patient}
            language={language}
            complaintKey={selectedComplaintKey}
            complaintLabel={selectedComplaintLabel}
            voiceSummary={activeVoiceSummary}
            documents={uploadedDocs}
            onResetToStart={handleReset}
          />
        )}
      </main>

      {/* AI Multilingual Voice Intake Modal Studio */}
      {patient && (
        <VoiceIntakeModal
          isOpen={isVoiceModalOpen}
          onClose={() => setIsVoiceModalOpen(false)}
          language={language}
          patient={patient}
          onConfirmVoiceIntake={handleConfirmVoiceIntake}
        />
      )}
    </div>
  );
};
export default App;
