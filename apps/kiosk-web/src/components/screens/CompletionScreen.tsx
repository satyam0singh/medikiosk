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
      <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 border-2 border-emerald-500/50 flex items-center justify-center text-emerald-400 mb-4 shadow-xl shadow-emerald-500/20">
        <CheckCircle2 className="w-12 h-12" />
      </div>

      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider mb-3">
        <Sparkles className="w-4 h-4 text-emerald-400" />
        <span>{language === LanguageCode.HI ? 'केस-टेकिंग सफलतापूर्वक पूर्ण' : 'Intake Successfully Completed'}</span>
      </div>

      <h2 className="text-3xl sm:text-4xl font-black text-white mb-2">
        {language === LanguageCode.HI ? 'आपका टोकन तैयार है' : 'Your Token is Ready'}
      </h2>
      <p className="text-sm text-slate-300 mb-6">
        {language === LanguageCode.HI
          ? 'आपकी जानकारी सुरक्षित रूप से डॉक्टर के डैशबोर्ड पर भेज दी गई है।'
          : 'Your clinical history has been structured and queued for physician verification.'}
      </p>

      {/* Audio Announcement */}
      <div className="mb-6">
        <AudioPromptButton text={completionPrompt} language={language} size="md" />
      </div>

      {/* Printable OPD Token Slip */}
      <div className="w-full max-w-md bg-white text-slate-900 rounded-3xl p-6 shadow-2xl border-4 border-teal-500 text-left relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 bg-teal-600 text-white text-[10px] font-extrabold uppercase px-4 py-1 rounded-bl-xl tracking-wider">
          AIIA OPD KIOSK
        </div>

        {/* Hospital Header */}
        <div className="border-b border-slate-200 pb-3 mb-4">
          <h3 className="font-extrabold text-sm text-teal-900 uppercase">All India Institute of Ayurveda</h3>
          <p className="text-[11px] text-slate-500 font-medium">Pre-Consultation Case Intake Slip</p>
        </div>

        {/* Token Big Number */}
        <div className="bg-slate-100 rounded-2xl p-4 text-center mb-4 border border-slate-200">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Token Number</span>
          <span className="text-4xl font-black text-teal-800 tracking-tight">{tokenNumber}</span>
        </div>

        {/* Patient Details */}
        <div className="space-y-2 text-xs border-b border-slate-200 pb-4 mb-4">
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
            <span className="font-mono font-bold text-slate-900">{patient.abhaId || '91-4829-1029-4820'}</span>
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
        <div className="text-[11px] space-y-1 text-slate-600">
          <p>• <strong>Complaint:</strong> Chest Burning / Discomfort (Severity 6/10)</p>
          <p>• <strong>Prior Meds:</strong> Tab Amlodipine 5mg OD (Verified via OCR)</p>
          <p>• <strong>Consent Status:</strong> Granted (ABDM / DPDP Compliant)</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
        <button
          type="button"
          onClick={() => window.print()}
          className="kiosk-btn bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold"
        >
          <Printer className="w-5 h-5" />
          <span>{language === LanguageCode.HI ? 'पर्ची प्रिंट करें' : 'Print Token'}</span>
        </button>

        <button
          type="button"
          onClick={onResetToStart}
          className="kiosk-btn bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold"
        >
          <RotateCcw className="w-5 h-5 text-teal-400" />
          <span>{language === LanguageCode.HI ? 'नया मरीज (होम)' : 'Next Patient'}</span>
        </button>
      </div>
    </div>
  );
};
