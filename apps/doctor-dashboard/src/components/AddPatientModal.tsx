import React, { useState } from 'react';
import { X, UserPlus, UserCheck } from 'lucide-react';
import { DoctorApi } from '../services/api';
import { DoctorSpecialist } from '@medikiosk/shared-types';

interface AddPatientModalProps {
  specialists: DoctorSpecialist[];
  onClose: () => void;
  onPatientCreated: (encounterId: string, newQueueItem?: any) => void;
  isLightMode?: boolean;
}

export const AddPatientModal: React.FC<AddPatientModalProps> = ({
  specialists,
  onClose,
  onPatientCreated,
  isLightMode = false,
}) => {
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('42');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [contactNumber, setContactNumber] = useState('+91 98765 00000');
  const [abhaId, setAbhaId] = useState('');
  const [department, setDepartment] = useState('General Medicine');
  const [chiefComplaintSummary, setChiefComplaintSummary] = useState('Acute Atypical Chest Discomfort');
  const [assignedDoctorId, setAssignedDoctorId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    setIsSubmitting(true);
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const generatedAbha = abhaId.trim() || `91-${randomSuffix}-${randomSuffix}-0001`;
    const generatedMrn = `MRN-2026-${Date.now().toString().slice(-5)}`;
    const encId = `e-${Date.now().toString().slice(-8)}`;

    const fallbackQueueItem = {
      encounterId: encId,
      patientId: `p-${Date.now().toString().slice(-8)}`,
      fullName: fullName.trim(),
      age: parseInt(age, 10),
      gender,
      abhaId: generatedAbha,
      chiefComplaint: chiefComplaintSummary.trim() || 'General Clinical Consultation',
      hasRedFlag: chiefComplaintSummary.toLowerCase().includes('chest') || chiefComplaintSummary.toLowerCase().includes('severe'),
      status: 'IN_PROGRESS',
      department,
      queueTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    try {
      const patient = await DoctorApi.createWalkInPatient({
        fullName: fullName.trim(),
        age: parseInt(age, 10),
        gender,
        contactNumber,
        abhaId: generatedAbha,
        hospitalPatientId: generatedMrn,
        preferredLanguage: 'en',
      });

      const encounter = await DoctorApi.createEncounter({
        patientId: patient.id,
        department,
        physicianId: assignedDoctorId || undefined,
        chiefComplaintSummary: chiefComplaintSummary.trim() || 'General Clinical Consultation',
      });

      onPatientCreated(encounter.id, fallbackQueueItem);
      onClose();
    } catch (err) {
      console.warn('Backend API registration fallback to local active queue state:', err);
      onPatientCreated(encId, fallbackQueueItem);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const departmentsList = [
    'General Medicine',
    'Kayachikitsa / AYUSH',
    'Cardiology',
    'Orthopedics',
    'Pulmonology',
    'Gastroenterology',
    'Emergency Triage',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className={`border rounded-xl w-full max-w-lg shadow-xl overflow-hidden transition-colors ${
          isLightMode ? 'bg-[#FFFFFF] border-[#EAEAEA]' : 'bg-[#141720] border-[#232734]'
        }`}
      >
        {/* Header */}
        <div
          className={`p-4 border-b flex items-center justify-between ${
            isLightMode ? 'border-[#EAEAEA] bg-[#FBFBFA]' : 'border-[#232734] bg-[#10121A]'
          }`}
        >
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-md border flex items-center justify-center ${
                isLightMode ? 'bg-[#FFFFFF] border-[#EAEAEA] text-[#111111]' : 'bg-[#1E222D] border-[#2D3242] text-[#F4F4F6]'
              }`}
            >
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className={`text-sm font-bold ${isLightMode ? 'text-[#111111]' : 'text-[#F4F4F6]'}`}>
                Manual Walk-In Patient Registration
              </h3>
              <p className={`text-[11px] font-mono ${isLightMode ? 'text-[#787774]' : 'text-[#8E94A4]'}`}>
                Direct OPD Queue Entry & Specialist Assignment
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`w-7 h-7 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${
              isLightMode
                ? 'bg-[#FFFFFF] hover:bg-[#F0F0EF] text-[#666666] border-[#EAEAEA]'
                : 'bg-[#1E222D] hover:bg-[#282D3D] text-[#8E94A4] border-[#2D3242]'
            }`}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-[#787774] dark:text-[#8E94A4] mb-1">
                Full Patient Name *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Vikas Sharma"
                className={`w-full p-2.5 rounded-md border text-xs outline-none font-medium ${
                  isLightMode
                    ? 'bg-[#FBFBFA] border-[#EAEAEA] text-[#111111] focus:border-[#111111]'
                    : 'bg-[#10121A] border-[#232734] text-[#F4F4F6] focus:border-[#F4F4F6]'
                }`}
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#787774] dark:text-[#8E94A4] mb-1">
                ABHA ID (Optional / Auto-Gen)
              </label>
              <input
                type="text"
                value={abhaId}
                onChange={(e) => setAbhaId(e.target.value)}
                placeholder="e.g. 91-8822-1920-3810"
                className={`w-full p-2.5 rounded-md border text-xs outline-none font-mono ${
                  isLightMode
                    ? 'bg-[#FBFBFA] border-[#EAEAEA] text-[#111111] focus:border-[#111111]'
                    : 'bg-[#10121A] border-[#232734] text-[#F4F4F6] focus:border-[#F4F4F6]'
                }`}
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#787774] dark:text-[#8E94A4] mb-1">
                Age *
              </label>
              <input
                type="number"
                required
                min={1}
                max={120}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className={`w-full p-2.5 rounded-md border text-xs outline-none font-mono ${
                  isLightMode
                    ? 'bg-[#FBFBFA] border-[#EAEAEA] text-[#111111] focus:border-[#111111]'
                    : 'bg-[#10121A] border-[#232734] text-[#F4F4F6] focus:border-[#F4F4F6]'
                }`}
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#787774] dark:text-[#8E94A4] mb-1">
                Gender *
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className={`w-full p-2.5 rounded-md border text-xs outline-none font-medium ${
                  isLightMode
                    ? 'bg-[#FBFBFA] border-[#EAEAEA] text-[#111111] focus:border-[#111111]'
                    : 'bg-[#10121A] border-[#232734] text-[#F4F4F6] focus:border-[#F4F4F6]'
                }`}
              >
                <option value="MALE">Male (पुरुष)</option>
                <option value="FEMALE">Female (महिला)</option>
                <option value="OTHER">Other (अन्य)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-medium text-[#787774] dark:text-[#8E94A4] mb-1">
                Mobile Number
              </label>
              <input
                type="text"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                className={`w-full p-2.5 rounded-md border text-xs outline-none font-mono ${
                  isLightMode
                    ? 'bg-[#FBFBFA] border-[#EAEAEA] text-[#111111] focus:border-[#111111]'
                    : 'bg-[#10121A] border-[#232734] text-[#F4F4F6] focus:border-[#F4F4F6]'
                }`}
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#787774] dark:text-[#8E94A4] mb-1">
                Target Specialist Department *
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className={`w-full p-2.5 rounded-md border text-xs outline-none font-medium ${
                  isLightMode
                    ? 'bg-[#FBFBFA] border-[#EAEAEA] text-[#111111] focus:border-[#111111]'
                    : 'bg-[#10121A] border-[#232734] text-[#F4F4F6] focus:border-[#F4F4F6]'
                }`}
              >
                {departmentsList.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#787774] dark:text-[#8E94A4] mb-1">
                Assigned Specialist (Optional)
              </label>
              <select
                value={assignedDoctorId}
                onChange={(e) => setAssignedDoctorId(e.target.value)}
                className={`w-full p-2.5 rounded-md border text-xs outline-none font-medium ${
                  isLightMode
                    ? 'bg-[#FBFBFA] border-[#EAEAEA] text-[#111111] focus:border-[#111111]'
                    : 'bg-[#10121A] border-[#232734] text-[#F4F4F6] focus:border-[#F4F4F6]'
                }`}
              >
                <option value="">-- Any Available Specialist --</option>
                {specialists
                  .filter((s) => s.department === department || department === 'General Medicine')
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.roomNumber})
                    </option>
                  ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-medium text-[#787774] dark:text-[#8E94A4] mb-1">
                Chief Complaint / Presenting Concern
              </label>
              <input
                type="text"
                value={chiefComplaintSummary}
                onChange={(e) => setChiefComplaintSummary(e.target.value)}
                placeholder="e.g. Chest Discomfort, Joint Pain, Fever"
                className={`w-full p-2.5 rounded-md border text-xs outline-none font-medium ${
                  isLightMode
                    ? 'bg-[#FBFBFA] border-[#EAEAEA] text-[#111111] focus:border-[#111111]'
                    : 'bg-[#10121A] border-[#232734] text-[#F4F4F6] focus:border-[#F4F4F6]'
                }`}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#EAEAEA] dark:border-[#232734]">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-md border border-[#EAEAEA] dark:border-[#232734] text-xs font-medium text-[#666666] dark:text-[#8E94A4] hover:bg-[#F7F6F3] dark:hover:bg-[#1E222D] cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="py-2.5 px-5 bg-[#111111] dark:bg-[#F4F4F6] text-[#FFFFFF] dark:text-[#0D0F14] rounded-md font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-xs"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Registering...' : 'Add to OPD Queue'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
