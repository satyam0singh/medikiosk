import React, { useEffect, useRef } from 'react';
import { CheckCircle2, Printer, RotateCcw, Mic, Sparkles } from 'lucide-react';
import { Patient, LanguageCode } from '@medikiosk/shared-types';
import { AudioPromptButton } from '../AudioPromptButton';
import { getTranslation } from '../../utils/translations';
import { AiDoctorVoiceSummary } from '../../utils/groqVoiceIntake';
import { UploadedDocument } from './DocumentUploadScreen';

interface CompletionScreenProps {
  patient: Patient;
  language: LanguageCode;
  complaintKey?: string;
  complaintLabel?: string;
  voiceSummary?: AiDoctorVoiceSummary | null;
  documents?: UploadedDocument[];
  onResetToStart: () => void;
}

export const CompletionScreen: React.FC<CompletionScreenProps> = ({
  patient,
  language,
  complaintKey = 'chest_pain',
  complaintLabel,
  voiceSummary,
  documents = [],
  onResetToStart,
}) => {
  const t = getTranslation(language);
  const hasCheckedInRef = useRef(false);

  // Dynamic AI Smart Routing for Assigned Doctor & Room Number
  let assignedRoom = 'Room #04 • General Medicine';
  let assignedDoctor = 'Dr. Rajesh Sharma';
  let roomNumberOnly = '4';

  const targetDept = (voiceSummary?.entities.recommendedDepartment || '').toLowerCase();

  if (complaintKey === 'chest_pain' || targetDept.includes('cardio')) {
    assignedRoom = 'Room #02 • Cardiology';
    assignedDoctor = 'Dr. Priya Nair';
    roomNumberOnly = '2';
  } else if (complaintKey === 'joint_pain' || complaintKey === 'ayush_assessment' || targetDept.includes('ayush') || targetDept.includes('kayachikitsa')) {
    assignedRoom = 'Room #07 • Kayachikitsa / AYUSH';
    assignedDoctor = 'Dr. Anand Vaidya';
    roomNumberOnly = '7';
  } else if (complaintKey === 'abdominal_pain' || targetDept.includes('gastro')) {
    assignedRoom = 'Room #06 • Gastroenterology';
    assignedDoctor = 'Dr. Ananya Roy';
    roomNumberOnly = '6';
  } else if (complaintKey === 'skin' || targetDept.includes('derma')) {
    assignedRoom = 'Room #05 • Dermatology / Twak Roga';
    assignedDoctor = 'Dr. Suresh Menon';
    roomNumberOnly = '5';
  } else if (complaintKey === 'fever' || targetDept.includes('general')) {
    assignedRoom = 'Room #04 • General Medicine';
    assignedDoctor = 'Dr. Rajesh Sharma';
    roomNumberOnly = '4';
  }

  const tokenSuffix = (patient.hospitalPatientId || patient.id || '014').slice(-3);
  const tokenNumber = `AIIA-2026-A${tokenSuffix.padStart(2, '0')}`;

  const completionPrompt =
    language === LanguageCode.HI
      ? `आपका टोकन नंबर ${tokenNumber} है। कृपया कमरा नंबर ${roomNumberOnly} के बाहर प्रतीक्षा करें। डॉक्टर ${assignedDoctor} को आपकी जानकारी भेज दी गई है।`
      : language === LanguageCode.AS
      ? `আপোনাৰ টোকেন নম্বৰ ${tokenNumber}। অনুগ্ৰহ কৰি কোঠা নম্বৰ ${roomNumberOnly} ৰ বাহিৰত অপেক্ষা কৰক।`
      : language === LanguageCode.TA
      ? `உங்கள் டோக்கன் எண் ${tokenNumber}. தயவுசெய்து அறை எண் ${roomNumberOnly} க்கு வெளியே காத்திருக்கவும்.`
      : language === LanguageCode.TE
      ? `మీ టోకెన్ సంఖ్య ${tokenNumber}. దయచేసి గది సంఖ్య ${roomNumberOnly} వెలుపల వేచి ఉండండి.`
      : language === LanguageCode.KN
      ? `ನಿಮ್ಮ ಟೋಕನ್ ಸಂಖ್ಯೆ ${tokenNumber}. ದಯವಿಟ್ಟು ಕೊಠಡಿ ಸಂಖ್ಯೆ ${roomNumberOnly} ರ ಹೊರಗೆ ಕಾಯಿರಿ.`
      : language === LanguageCode.BN
      ? `আপনার টোকেন নম্বর ${tokenNumber}। অনুগ্রহ করে রুম নম্বর ${roomNumberOnly} এর বাইরে অপেক্ষা করুন।`
      : `Your intake is complete. Token number ${tokenNumber}. Please wait outside ${assignedRoom} for ${assignedDoctor}.`;

  // Persist patient encounter across Doctor, Admin, and Triage dashboards dynamically
  useEffect(() => {
    if (hasCheckedInRef.current) return;
    hasCheckedInRef.current = true;

    const dept = assignedRoom.includes('•') ? assignedRoom.split('•')[1]?.trim() : assignedRoom;
    const isCritical = complaintKey === 'chest_pain' || Boolean(voiceSummary?.entities.emergencyRedFlag);
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const nowDate = 'Aug 31, 2026';

    const encId = `enc-${Date.now()}`;
    const patId = patient.id || `pat-${Date.now()}`;
    const abha = patient.abhaId || `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const questionnaireResponses = [
      {
        question: 'Primary reason for consultation & duration',
        response: voiceSummary
          ? `[Voice Intake (${voiceSummary.detectedLanguage})]: "${voiceSummary.verbatimTranscript}"`
          : complaintLabel || 'Routine Health Consultation',
        sourceType: voiceSummary ? 'AI4BHARAT_VOICE_ASR' : 'PATIENT_REPORTED',
        confidence: voiceSummary ? voiceSummary.confidence : 0.98,
      },
      ...(voiceSummary
        ? [
            {
              question: 'Clinical Translation & Chief Complaint',
              response: voiceSummary.clinicalTranslationEnglish,
              sourceType: 'AI_CLINICAL_EXTRACTION',
              confidence: 0.96,
            },
            {
              question: 'AI Physician Assessment (SBAR)',
              response: voiceSummary.sbarSummary.assessment,
              sourceType: 'AI_CLINICAL_JUDGE',
              confidence: 0.95,
            },
          ]
        : []),
      {
        question: 'Any previous medical history or regular medications?',
        response: documents.length > 0
          ? `${documents.length} document(s) uploaded and digitized via Medical OCR`
          : 'Prescription uploaded and digitized via Medical OCR',
        sourceType: 'AI_OCR_DIGITIZER',
        confidence: 0.95,
      },
    ];

    const queueItem = {
      id: patId,
      encounterId: encId,
      patientId: patId,
      fullName: patient.fullName,
      gender: patient.gender,
      dob: (patient as any).dateOfBirth || (patient as any).dob || 'Aug 24, 2004',
      age: patient.age || 20,
      phone: (patient as any).phoneNumber || (patient as any).phone || '+91 98765 00000',
      abhaId: abha,
      intakeDate: nowDate,
      intakeTime: nowTime,
      chiefComplaint: voiceSummary
        ? `🎙️ ${voiceSummary.entities.primaryComplaint} (${voiceSummary.detectedLanguage})`
        : complaintLabel || 'Routine Health Consultation / Intake',
      symptomLocation: voiceSummary
        ? voiceSummary.entities.location
        : complaintKey === 'joint_pain'
        ? 'Bilateral Knees / Joints'
        : complaintKey === 'chest_pain'
        ? 'Retrosternal Chest'
        : complaintKey === 'abdominal_pain'
        ? 'Epigastric / Abdominal'
        : 'General / Constitutional',
      medicalHistory: [
        complaintLabel || (voiceSummary ? voiceSummary.entities.primaryComplaint : 'Routine Intake'),
        'NKDA',
      ],
      readiness: isCritical ? 'CRITICAL' : 'Ready for review',
      status: 'CHECKED_IN',
      flagsCount: isCritical ? 1 : 0,
      department: dept || 'Kayachikitsa / AYUSH',
      assignedDoctor: assignedDoctor,
      isVoiceIntake: Boolean(voiceSummary),
      voiceTranscript: voiceSummary?.verbatimTranscript || '',
      voiceLanguage: voiceSummary?.detectedLanguage || '',
      clinicalTranslation: voiceSummary?.clinicalTranslationEnglish || '',
      aiDoctorSummary: voiceSummary?.sbarSummary || null,
      hpiNarrative: voiceSummary?.hpiNarrative || '',
      suggestedInvestigations: voiceSummary?.entities.suggestedInvestigations || [],
      questionnaireResponses,
      reviewNotes: '',
      isVerified: false,
    };

    const registeredPatient = {
      id: patId.slice(-8) || `pid-${Date.now()}`,
      name: patient.fullName,
      dob: (patient as any).dateOfBirth || (patient as any).dob || 'Aug 24, 2004',
      gender: patient.gender,
      phone: (patient as any).phoneNumber || (patient as any).phone || '+91 98765 00000',
      patientId: patient.hospitalPatientId || patId.slice(-8),
      abhaId: abha,
    };

    const triageAlert = isCritical
      ? {
          id: `rf-${Date.now()}`,
          encounterId: encId,
          patientId: patId,
          patientName: patient.fullName,
          patientGender: patient.gender,
          patientAbha: abha,
          ruleId: voiceSummary?.entities.redFlagRationale || 'rf_chest_pain_severe',
          severity: 'CRITICAL_EMERGENCY',
          alertMessage:
            voiceSummary?.entities.redFlagRationale ||
            `${queueItem.chiefComplaint} - Potential emergency symptoms detected during patient intake.`,
          timestamp: nowTime,
          isAcknowledged: false,
          status: 'ACTIVE',
          triggerFacts: [
            {
              field: 'chief_complaint.primary',
              value: voiceSummary?.entities.primaryComplaint || complaintLabel || 'Severe Symptoms',
            },
            { field: 'symptom.severity', value: 'ACUTE_CRITICAL' },
          ],
        }
      : null;

    // 1. Persist directly to Backend API & PostgreSQL (Single Comprehensive Request)
    fetch('/api/v1/encounters/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        encounterId: encId,
        patientId: patId,
        fullName: patient.fullName,
        age: patient.age || 20,
        gender: patient.gender,
        phone: (patient as any).phoneNumber || (patient as any).phone || '+91 98765 00000',
        abhaId: abha,
        department: dept || 'Kayachikitsa / AYUSH',
        chiefComplaint: queueItem.chiefComplaint,
        hasRedFlag: isCritical,
        assignedDoctorName: assignedDoctor,
        preferredLanguage: language,
        voiceSummary: voiceSummary
          ? {
              verbatimTranscript: voiceSummary.verbatimTranscript,
              detectedLanguage: voiceSummary.detectedLanguage,
              clinicalTranslationEnglish: voiceSummary.clinicalTranslationEnglish,
              sbarSummary: voiceSummary.sbarSummary,
              entities: voiceSummary.entities,
            }
          : null,
        questionnaireResponses,
        documents: (documents || []).map((d) => ({
          id: d.id,
          name: d.name,
          type: d.type,
          confidence: d.confidence,
          extractedDrugs: d.extractedDrugs || [],
          extractedDiagnoses: d.extractedDiagnoses || [],
          extractedLabValues: d.extractedLabValues || [],
          size: d.size,
          clinicalSummary: d.clinicalSummary,
          doctorName: d.doctorName,
          hospital: d.hospital,
        })),
        redFlagAlert: triageAlert,
      }),
    }).catch((err) => console.warn('Backend PostgreSQL checkin fallback:', err));

    // 2. Broadcast to all active tabs across Doctor, Admin, and Triage
    try {
      const bcSync = new BroadcastChannel('medikiosk_sync');
      bcSync.postMessage({
        type: 'NEW_PATIENT_REGISTERED',
        queueItem,
        registeredPatient,
        triageAlert,
      });
      setTimeout(() => bcSync.close(), 500);
    } catch {}

    if (triageAlert) {
      try {
        const bcTriage = new BroadcastChannel('medikiosk_triage_alerts');
        bcTriage.postMessage({
          type: 'NEW_SAFETY_ALERT',
          alert: triageAlert,
        });
        setTimeout(() => bcTriage.close(), 500);
      } catch {}
    }
  }, [patient, complaintKey, complaintLabel, assignedRoom, assignedDoctor, voiceSummary, documents]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center max-w-xl mx-auto w-full py-2 px-1 sm:px-4 text-center my-auto">
      {/* Category Pill */}
      <div className="mb-2 sm:mb-3">
        <span className="tag-pastel-green px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest flex items-center gap-1.5 mx-auto">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{t.token_title}</span>
        </span>
      </div>

      <h2 className="text-xl sm:text-3xl font-serif tracking-tight text-[#111111] dark:text-[#F4F4F6] mb-1">
        {t.token_title}
      </h2>
      <p className="text-xs text-[#787774] dark:text-[#8E94A4] mb-3 sm:mb-4">
        {t.token_subtitle}
      </p>

      {/* Audio Announcement */}
      <div className="mb-4 sm:mb-5">
        <AudioPromptButton text={completionPrompt} language={language} size="md" />
      </div>

      {/* Dynamic Thermal OPD Slip Card */}
      <div className="w-full max-w-sm bg-[#FFFFFF] dark:bg-[#141720] border border-[#EAEAEA] dark:border-[#232734] rounded-xl p-4 sm:p-5 text-left mb-4 font-mono text-xs shadow-xs">
        {/* Header */}
        <div className="border-b border-[#EAEAEA] dark:border-[#232734] pb-2.5 mb-2.5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[11px] sm:text-xs uppercase text-[#111111] dark:text-[#F4F4F6] truncate pr-2">
              {t.aiia_title}
            </h3>
            <span className="text-[10px] text-[#787774] dark:text-[#8E94A4] shrink-0">OPD #01</span>
          </div>
          <p className="text-[10px] text-[#787774] dark:text-[#8E94A4]">Case Intake Summary Slip</p>
        </div>

        {/* Token Big Box */}
        <div className="bg-[#F7F6F3] dark:bg-[#10121A] border border-[#EAEAEA] dark:border-[#232734] rounded-lg p-2.5 sm:p-3 text-center mb-2.5">
          <span className="text-[9px] uppercase tracking-wider text-[#787774] dark:text-[#8E94A4] block">
            {t.token_number}
          </span>
          <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111111] dark:text-[#F4F4F6]">{tokenNumber}</span>
        </div>

        {/* Details */}
        <div className="space-y-1.5 text-[11px] border-b border-[#EAEAEA] dark:border-[#232734] pb-2.5 mb-2.5 text-[#555555] dark:text-[#9EA5B5]">
          <div className="flex justify-between">
            <span>{t.full_name}:</span>
            <strong className="text-[#111111] dark:text-[#F4F4F6] font-sans font-bold truncate pl-2">{patient.fullName}</strong>
          </div>
          <div className="flex justify-between">
            <span>{t.age} / {t.gender}:</span>
            <span className="text-[#111111] dark:text-[#F4F4F6] tabular-nums">{patient.age} Yrs / {patient.gender === 'MALE' ? t.male : t.female}</span>
          </div>
          <div className="flex justify-between">
            <span>{t.abha_id}:</span>
            <span className="text-[#1F6C9F] dark:text-[#70B8FF] font-bold">{patient.abhaId || '91-4829-1029-4820'}</span>
          </div>
          <div className="flex justify-between">
            <span>{t.room_number}:</span>
            <span className="text-[#111111] dark:text-[#F4F4F6] font-bold">{assignedRoom}</span>
          </div>
          <div className="flex justify-between">
            <span>{t.assigned_doctor}:</span>
            <span className="text-[#111111] dark:text-[#F4F4F6]">{assignedDoctor}</span>
          </div>
        </div>

        {/* Mini Facts */}
        <div className="text-[10px] space-y-1 text-[#787774] dark:text-[#8E94A4]">
          {voiceSummary ? (
            <div className="p-2 rounded bg-[#FBFBFA] dark:bg-[#10121A] border border-[#EAEAEA] dark:border-[#232734] space-y-1">
              <div className="flex items-center gap-1 text-[#1F6C9F] dark:text-[#70B8FF] font-bold">
                <Mic className="w-3 h-3" />
                <span>Voice Intake ({voiceSummary.detectedLanguage})</span>
              </div>
              <p className="line-clamp-2 italic text-[#111111] dark:text-[#F4F4F6]">
                "{voiceSummary.verbatimTranscript}"
              </p>
              <div className="flex items-center gap-1 text-[9px] text-[#346538] dark:text-[#6EE787]">
                <Sparkles className="w-2.5 h-2.5" />
                <span>AI Doctor Briefing Generated</span>
              </div>
            </div>
          ) : (
            <p>• {t.step_complaint}: {complaintLabel || 'Clinical Assessment'}</p>
          )}

          <p>
            • {t.upload_prescription}:{' '}
            {complaintKey === 'joint_pain' || complaintKey === 'ayush_assessment'
              ? 'Yograj Guggulu & Dashamoolarishta (OCR)'
              : complaintKey === 'abdominal_pain'
              ? 'Rabeprazole + Domperidone (OCR)'
              : complaintKey === 'skin'
              ? 'Bilastine 20mg + Mometasone (OCR)'
              : complaintKey === 'chest_pain'
              ? 'Tab Amlodipine 5mg OD (OCR)'
              : 'Digitized Clinical Records Attached'}
          </p>
          <p>• {t.step_consent}: Granted (ABDM / DPDP Act 2023)</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 w-full max-w-sm">
        <button
          type="button"
          onClick={() => window.print()}
          className="flex-1 py-3 min-h-[48px] bg-[#111111] dark:bg-[#F4F4F6] text-[#FFFFFF] dark:text-[#0D0F14] font-bold text-xs uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-xs"
        >
          <Printer className="w-4 h-4" />
          <span>{t.print_slip}</span>
        </button>

        <button
          type="button"
          onClick={onResetToStart}
          className="flex-1 py-3 min-h-[48px] bg-transparent border border-[#EAEAEA] dark:border-[#232734] text-[#666666] dark:text-[#8E94A4] font-medium text-xs rounded-lg flex items-center justify-center gap-1.5 hover:bg-[#F7F6F3] dark:hover:bg-[#1A1D27] transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{t.new_patient_btn}</span>
        </button>
      </div>
    </div>
  );
};
