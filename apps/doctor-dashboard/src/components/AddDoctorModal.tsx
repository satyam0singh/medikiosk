import React, { useState } from 'react';
import { X, Stethoscope, Check } from 'lucide-react';
import { DoctorApi } from '../services/api';
import { DoctorSpecialist } from '@medikiosk/shared-types';

interface AddDoctorModalProps {
  onClose: () => void;
  onDoctorAdded: (doctor: DoctorSpecialist) => void;
  isLightMode?: boolean;
}

export const AddDoctorModal: React.FC<AddDoctorModalProps> = ({
  onClose,
  onDoctorAdded,
  isLightMode = false,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Cardiology');
  const [specialtyTitle, setSpecialtyTitle] = useState('Cardiologist • DM');
  const [roomNumber, setRoomNumber] = useState('Room #08');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const departmentsList = [
    { name: 'General Medicine', defaultTitle: 'Consultant Physician • MD', defaultRoom: 'Room #04' },
    { name: 'Kayachikitsa / AYUSH', defaultTitle: 'AYUSH Specialist • BAMS MD', defaultRoom: 'Room #07' },
    { name: 'Cardiology', defaultTitle: 'Cardiologist • DM Cardiology', defaultRoom: 'Room #02' },
    { name: 'Orthopedics', defaultTitle: 'Orthopedic Surgeon • MS Ortho', defaultRoom: 'Room #05' },
    { name: 'Pulmonology', defaultTitle: 'Chest Physician • MD Pulm', defaultRoom: 'Room #03' },
    { name: 'Gastroenterology', defaultTitle: 'Gastroenterologist • DM Gastro', defaultRoom: 'Room #06' },
    { name: 'Emergency Triage', defaultTitle: 'Emergency Medical Officer', defaultRoom: 'Triage Desk #01' },
    { name: 'Panchakarma / AYUSH', defaultTitle: 'Panchakarma Consultant • MD', defaultRoom: 'Room #09' },
  ];

  const handleDepartmentChange = (deptName: string) => {
    setDepartment(deptName);
    const match = departmentsList.find((d) => d.name === deptName);
    if (match) {
      setSpecialtyTitle(match.defaultTitle);
      setRoomNumber(match.defaultRoom);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;

    setIsSubmitting(true);
    try {
      const doc = await DoctorApi.createDoctor({
        fullName: fullName.trim(),
        email: email.trim(),
        department,
        specialtyTitle: specialtyTitle.trim(),
        roomNumber: roomNumber.trim(),
      });
      onDoctorAdded(doc);
      onClose();
    } catch (err) {
      alert(`Doctor creation failed: ${(err as Error).message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className={`border rounded-xl w-full max-w-md shadow-xl overflow-hidden transition-colors ${
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
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <h3 className={`text-sm font-bold ${isLightMode ? 'text-[#111111]' : 'text-[#F4F4F6]'}`}>
                Register Specialist Doctor
              </h3>
              <p className={`text-[11px] font-mono ${isLightMode ? 'text-[#787774]' : 'text-[#8E94A4]'}`}>
                Add Physician to AIIA Hospital Directory
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
          <div>
            <label className="block text-[11px] font-medium text-[#787774] dark:text-[#8E94A4] mb-1">
              Doctor Full Name (with Title) *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Dr. Harish Chandra"
              className={`w-full p-2.5 rounded-md border text-xs outline-none font-medium ${
                isLightMode
                  ? 'bg-[#FBFBFA] border-[#EAEAEA] text-[#111111] focus:border-[#111111]'
                  : 'bg-[#10121A] border-[#232734] text-[#F4F4F6] focus:border-[#F4F4F6]'
              }`}
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#787774] dark:text-[#8E94A4] mb-1">
              Institutional Email Address *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. dr.harish@aiia.gov.in"
              className={`w-full p-2.5 rounded-md border text-xs outline-none font-mono ${
                isLightMode
                  ? 'bg-[#FBFBFA] border-[#EAEAEA] text-[#111111] focus:border-[#111111]'
                  : 'bg-[#10121A] border-[#232734] text-[#F4F4F6] focus:border-[#F4F4F6]'
              }`}
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#787774] dark:text-[#8E94A4] mb-1">
              Clinical Department *
            </label>
            <select
              value={department}
              onChange={(e) => handleDepartmentChange(e.target.value)}
              className={`w-full p-2.5 rounded-md border text-xs outline-none font-medium ${
                isLightMode
                  ? 'bg-[#FBFBFA] border-[#EAEAEA] text-[#111111] focus:border-[#111111]'
                  : 'bg-[#10121A] border-[#232734] text-[#F4F4F6] focus:border-[#F4F4F6]'
              }`}
            >
              {departmentsList.map((d) => (
                <option key={d.name} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-[#787774] dark:text-[#8E94A4] mb-1">
                Specialty Title
              </label>
              <input
                type="text"
                value={specialtyTitle}
                onChange={(e) => setSpecialtyTitle(e.target.value)}
                className={`w-full p-2.5 rounded-md border text-xs outline-none font-medium ${
                  isLightMode
                    ? 'bg-[#FBFBFA] border-[#EAEAEA] text-[#111111] focus:border-[#111111]'
                    : 'bg-[#10121A] border-[#232734] text-[#F4F4F6] focus:border-[#F4F4F6]'
                }`}
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#787774] dark:text-[#8E94A4] mb-1">
                OPD Room #
              </label>
              <input
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                className={`w-full p-2.5 rounded-md border text-xs outline-none font-mono ${
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
              <Check className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Adding...' : 'Register Specialist'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
