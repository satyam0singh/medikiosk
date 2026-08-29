import React from 'react';
import { CheckCircle2, Printer, RotateCcw, Sparkles } from 'lucide-react';
import { Patient, LanguageCode } from '@medikiosk/shared-types';
import { AudioPromptButton } from '../AudioPromptButton';

interface CompletionScreenProps {
  patient: Patient;
  language: LanguageCode;
  onResetToStart: () => void;
}

export const CompletionScreen: React.FC<CompletionScreenProps> = ({
  patient,
  language,
  onResetToStart,
}) => {
  const tokenNumber = 'AIIA-2026-A14';
  const assignedRoom = 'Room #04 • General Medicine';
  const assignedDoctor = 'Dr. Rajesh Sharma';

  const completionPrompt =
    language === LanguageCode.HI
      ? `आपका टोकन नंबर ${tokenNumber} है। कृपया कमरा नंबर ४ के बाहर प्रतीक्षा करें। डॉक्टर को आपकी सभी जानकारी भेज दी गई है।`
      : `Your intake is complete. Token number ${tokenNumber}. Please wait outside Room 4 for Dr. Rajesh Sharma.`;

  return (
    <div className="flex-1 flex flex-col items-center justify-center max-w-3xl mx-auto w-full p-6 text-center">
      {/* Success Badge */}
      <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500/50 flex items-center justify-center text-emerald-500 mb-3 shadow-lg shadow-emerald-500/20">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider mb-2">
        <Sparkles className="w-3.5 h-3.5" />
        <span>{language === LanguageCode.HI ? 'केस-टेकिंग सफलतापूर्वक पूर्ण' : 'Intake Successfully Completed'}</span>
      </div>

      <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-2">
        {language === LanguageCode.HI ? 'आपका टोकन तैयार है' : 'Your Token is Ready'}
      </h2>
      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-5 font-medium">
        {language === LanguageCode.HI
          ? 'आपकी जानकारी सुरक्षित रूप से डॉक्टर के डैशबोर्ड पर भेज दी गई है।'
          : 'Your clinical history has been structured and queued for physician verification.'}
      </p>

      {/* Audio Announcement */}
      <div className="mb-5">
        <AudioPromptButton text={completionPrompt} language={language} size="md" />
      </div>

      {/* Printable Thermal-Style OPD Token Slip */}
      <div className="w-full max-w-md bg-white text-slate-900 rounded-3xl p-6 shadow-2xl border-4 border-teal-500 text-left relative overflow-hidden mb-6">
        <div className="absolute top-0 right-0 bg-teal-600 text-white text-[10px] font-black uppercase px-3.5 py-1 rounded-bl-xl tracking-wider">
          AIIA OPD KIOSK
        </div>

        {/* Hospital Header */}
        <div className="border-b border-slate-200 pb-3 mb-3">
          <h3 className="font-black text-sm text-teal-900 uppercase tracking-tight">All India Institute of Ayurveda</h3>
          <p className="text-[11px] text-slate-500 font-medium">Pre-Consultation Case Intake Slip • Ministry of Ayush</p>
        </div>

        {/* Token Big Number */}
        <div className="bg-slate-50 rounded-2xl p-4 text-center mb-3 border border-slate-200">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">OPD Token Number</span>
          <span className="text-3xl sm:text-4xl font-black text-teal-800 tracking-tight">{tokenNumber}</span>
        </div>

        {/* Patient Details */}
        <div className="space-y-1.5 text-xs border-b border-slate-200 pb-3 mb-3 font-medium">
          <div className="flex justify-between">
            <span className="text-slate-500">Patient Name:</span>
            <span className="font-bold text-slate-900">{patient.fullName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Age / Gender:</span>
            <span className="font-bold text-slate-900">{patient.age} Yrs / {patient.gender}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">ABHA Health ID:</span>
            <span className="font-mono font-bold text-teal-700">{patient.abhaId || '91-4829-1029-4820'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Assigned Room:</span>
            <span className="font-bold text-teal-800">{assignedRoom}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Consultant:</span>
            <span className="font-bold text-slate-900">{assignedDoctor}</span>
          </div>
        </div>

        {/* Summary Mini Facts */}
        <div className="text-[11px] space-y-1 text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
          <p>• <strong>Complaint:</strong> Chest Burning / Discomfort (Severity 7/10)</p>
          <p>• <strong>Prior Meds:</strong> Tab Amlodipine 5mg OD (Verified via OCR)</p>
          <p>• <strong>Consent Status:</strong> Granted (ABDM / DPDP Compliant)</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
        <button
          type="button"
          onClick={() => window.print()}
          className="flex-1 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
        >
          <Printer className="w-4 h-4" />
          <span>{language === LanguageCode.HI ? 'पर्ची प्रिंट करें' : 'Print Token Slip'}</span>
        </button>

        <button
          type="button"
          onClick={onResetToStart}
          className="flex-1 py-3 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{language === LanguageCode.HI ? 'नए मरीज हेतु रीसेट' : 'Start Next Patient'}</span>
        </button>
      </div>
    </div>
  );
};
