import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ProgressBar, KioskStep } from './components/ProgressBar';
import { WelcomeScreen } from './components/screens/WelcomeScreen';
import { IdentityScreen } from './components/screens/IdentityScreen';
import { ConsentScreen } from './components/screens/ConsentScreen';
import { ChiefComplaintScreen } from './components/screens/ChiefComplaintScreen';
import { InterviewScreen } from './components/screens/InterviewScreen';
import { RedFlagScreen } from './components/screens/RedFlagScreen';
import { DocumentUploadScreen } from './components/screens/DocumentUploadScreen';
import { CompletionScreen } from './components/screens/CompletionScreen';
import { Patient, LanguageCode, RedFlagAlert } from '@medikiosk/shared-types';
import { KioskApi } from './services/api';

export const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<KioskStep>('LANGUAGE');
  const [language, setLanguage] = useState<LanguageCode>(LanguageCode.EN);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [activeAlert, setActiveAlert] = useState<RedFlagAlert | null>(null);
  const [isLightMode, setIsLightMode] = useState<boolean>(() => {
    return localStorage.getItem('medikiosk_kiosk_theme') === 'light';
  });

  useEffect(() => {
    localStorage.setItem('medikiosk_kiosk_theme', isLightMode ? 'light' : 'dark');
    if (isLightMode) {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [isLightMode]);

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

  // Step 4: Chief Complaint Selected
  const handleSelectComplaint = async (complaintKey: string, complaintLabel: string) => {
    if (!patient) return;

    try {
      // 1. Create Encounter
      const encounter = await KioskApi.createEncounter({
        patientId: patient.id,
        department: complaintKey === 'ayush_assessment' ? 'Kayachikitsa / AYUSH' : 'General Medicine',
        chiefComplaintSummary: complaintLabel,
      });

      // 2. Create Clinical Session
      const session = await KioskApi.createSession({
        encounterId: encounter.id,
        patientId: patient.id,
        selectedLanguage: language,
      });

      setSessionId(session.id);

      // Record first answer for chief complaint
      await KioskApi.recordAnswer(session.id, {
        questionId: 'q_chief_complaint',
        selectedOptions: [complaintKey],
        rawText: complaintLabel,
      });

      setCurrentStep('INTERVIEW');
    } catch (err) {
      console.warn('Backend encounter creation fallback:', err);
      setSessionId('local-demo-session-id');
      setCurrentStep('INTERVIEW');
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
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors ${
      isLightMode
        ? 'bg-slate-50 text-slate-900 selection:bg-teal-500 selection:text-white'
        : 'bg-slate-950 text-slate-100 selection:bg-teal-500 selection:text-slate-950'
    }`}>
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
            alertMessage: language === LanguageCode.HI
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

      {/* Progress Tracker */}
      <ProgressBar currentStep={currentStep} language={language} />

      {/* Dynamic Screen Renderer */}
      <main className="flex-1 flex flex-col">
        {currentStep === 'LANGUAGE' && (
          <WelcomeScreen onSelectLanguage={handleSelectLanguage} />
        )}

        {currentStep === 'IDENTITY' && (
          <IdentityScreen
            language={language}
            onPatientIdentified={handlePatientIdentified}
          />
        )}

        {currentStep === 'CONSENT' && patient && (
          <ConsentScreen
            patient={patient}
            language={language}
            onConsentGranted={handleConsentGranted}
            onConsentDenied={handleReset}
          />
        )}

        {currentStep === 'COMPLAINT' && (
          <ChiefComplaintScreen
            language={language}
            onSelectComplaint={handleSelectComplaint}
          />
        )}

        {currentStep === 'INTERVIEW' && (
          <InterviewScreen
            sessionId={sessionId || 'demo-session'}
            language={language}
            onInterviewCompleted={() => setCurrentStep('DOCUMENTS')}
            onRedFlagTriggered={handleRedFlagTriggered}
            isLightMode={isLightMode}
          />
        )}

        {currentStep === 'RED_FLAG' && activeAlert && (
          <RedFlagScreen
            alert={activeAlert}
            language={language}
            onProceedAnyway={() => setCurrentStep('DOCUMENTS')}
          />
        )}

        {currentStep === 'DOCUMENTS' && (
          <DocumentUploadScreen
            language={language}
            onProceedToSummary={() => setCurrentStep('COMPLETED')}
          />
        )}

        {currentStep === 'COMPLETED' && patient && (
          <CompletionScreen
            patient={patient}
            language={language}
            onResetToStart={handleReset}
          />
        )}
      </main>
    </div>
  );
};
export default App;
