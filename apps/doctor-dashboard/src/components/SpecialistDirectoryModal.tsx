import React from 'react';
import { X, Stethoscope, Plus, Check } from 'lucide-react';
import { DoctorSpecialist } from '@medikiosk/shared-types';

interface SpecialistDirectoryModalProps {
  specialists: DoctorSpecialist[];
  activeDoctor: DoctorSpecialist;
  onSelectDoctor: (doctor: DoctorSpecialist) => void;
  onOpenAddDoctor: () => void;
  onClose: () => void;
  isLightMode?: boolean;
}

export const SpecialistDirectoryModal: React.FC<SpecialistDirectoryModalProps> = ({
  specialists,
  activeDoctor,
  onSelectDoctor,
  onOpenAddDoctor,
  onClose,
  isLightMode = false,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className={`border rounded-xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh] transition-colors ${
          isLightMode ? 'bg-[#FFFFFF] border-[#EAEAEA]' : 'bg-[#141720] border-[#232734]'
        }`}
      >
        {/* Header */}
        <div
          className={`p-4 border-b flex items-center justify-between shrink-0 ${
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
                Hospital Specialist Directory & Workstation Switcher
              </h3>
              <p className={`text-[11px] font-mono ${isLightMode ? 'text-[#787774]' : 'text-[#8E94A4]'}`}>
                {specialists.length} Active Medical & AYUSH Practitioners (AIIA New Delhi)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAddDoctor();
              }}
              className="px-2.5 py-1.5 rounded-md border border-[#EAEAEA] dark:border-[#232734] text-xs font-semibold flex items-center gap-1 hover:bg-[#F7F6F3] dark:hover:bg-[#1E222D] cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Doctor</span>
            </button>

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
        </div>

        {/* Directory Grid */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {specialists.map((doc) => {
            const isCurrent = doc.id === activeDoctor.id;

            return (
              <div
                key={doc.id}
                className={`p-3.5 rounded-xl border flex flex-col justify-between gap-3 transition-all ${
                  isCurrent
                    ? isLightMode
                      ? 'bg-[#FFFFFF] border-[#111111] shadow-xs'
                      : 'bg-[#1C202B] border-[#F4F4F6]'
                    : isLightMode
                    ? 'bg-[#FBFBFA] border-[#EAEAEA] hover:border-[#CCCCCC]'
                    : 'bg-[#10121A] border-[#232734] hover:border-[#353A4D]'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <h4 className={`text-xs font-bold ${isLightMode ? 'text-[#111111]' : 'text-[#F4F4F6]'}`}>
                        {doc.fullName}
                      </h4>
                      <p className={`text-[11px] font-medium ${isLightMode ? 'text-[#555555]' : 'text-[#A0A6B5]'}`}>
                        {doc.specialtyTitle}
                      </p>
                    </div>

                    <span
                      className={`text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                        doc.department.includes('AYUSH')
                          ? 'tag-pastel-yellow'
                          : isLightMode
                          ? 'tag-pastel-blue'
                          : 'tag-pastel-blue'
                      }`}
                    >
                      {doc.roomNumber}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-[#787774] dark:text-[#8E94A4] font-mono">
                    <span>Dept: <strong>{doc.department}</strong></span>
                    <span>•</span>
                    <span className="text-[#346538] dark:text-[#6EE787]">
                      {doc.availableSlotCount || 10} Slots
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#EAEAEA] dark:border-[#232734] flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#888888] truncate">{doc.email}</span>
                  {isCurrent ? (
                    <span className="tag-pastel-green px-2 py-0.5 text-[10px] font-mono font-bold rounded flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>Active</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectDoctor(doc);
                        onClose();
                      }}
                      className="px-2.5 py-1 rounded bg-[#111111] dark:bg-[#F4F4F6] text-[#FFFFFF] dark:text-[#0D0F14] text-[10px] font-bold uppercase tracking-wider active:scale-95 transition-all cursor-pointer"
                    >
                      Switch Workstation
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
