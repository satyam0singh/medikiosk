import React, { useState } from 'react';
import { Users, Search, Clock, CheckCircle2, ChevronRight, RefreshCw, UserPlus } from 'lucide-react';

export interface QueueItem {
  encounterId: string;
  patientId: string;
  fullName: string;
  age: number;
  gender: string;
  abhaId: string;
  chiefComplaint: string;
  hasRedFlag: boolean;
  status: 'AWAITING' | 'IN_PROGRESS' | 'COMPLETED';
  department?: string;
  assignedDoctorName?: string;
  queueTime: string;
}

interface PatientQueueSidebarProps {
  queue: QueueItem[];
  selectedEncounterId: string;
  selectedDepartment: string;
  onSelectDepartment: (dept: string) => void;
  onSelectEncounter: (encounterId: string) => void;
  onOpenAddPatient: () => void;
  onRefresh: () => void;
  isLoading?: boolean;
  isLightMode?: boolean;
}

const DEPARTMENTS = [
  'ALL',
  'General Medicine',
  'Kayachikitsa / AYUSH',
  'Cardiology',
  'Orthopedics',
  'Pulmonology',
  'Gastroenterology',
];

export const PatientQueueSidebar: React.FC<PatientQueueSidebarProps> = ({
  queue,
  selectedEncounterId,
  selectedDepartment,
  onSelectDepartment,
  onSelectEncounter,
  onOpenAddPatient,
  onRefresh,
  isLoading = false,
  isLightMode = false,
}) => {
  const [filter, setFilter] = useState('');

  const filteredQueue = queue.filter((item) => {
    const matchesSearch =
      item.fullName.toLowerCase().includes(filter.toLowerCase()) ||
      item.abhaId.includes(filter) ||
      item.chiefComplaint.toLowerCase().includes(filter.toLowerCase());

    const matchesDept =
      selectedDepartment === 'ALL' ||
      (item.department && item.department.toLowerCase().includes(selectedDepartment.toLowerCase()));

    return matchesSearch && matchesDept;
  });

  return (
    <aside
      className={`w-full md:w-80 lg:w-88 border-r flex flex-col shrink-0 h-full transition-colors ${
        isLightMode ? 'bg-[#FBFBFA] border-[#EAEAEA]' : 'bg-[#10121A] border-[#232734]'
      }`}
    >
      {/* Queue Header */}
      <div className={`p-3 sm:p-3.5 border-b space-y-2.5 shrink-0 ${isLightMode ? 'border-[#EAEAEA] bg-[#FFFFFF]' : 'border-[#232734] bg-[#141720]'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 font-bold text-xs ${isLightMode ? 'text-[#111111]' : 'text-[#F4F4F6]'}`}>
              <Users className="w-3.5 h-3.5 text-[#555555] dark:text-[#8E94A4]" />
              <span>OPD Patient Queue</span>
            </div>
            <span
              className={`px-1.5 py-0.2 font-mono text-[10px] rounded-full tabular-nums ${
                isLightMode ? 'tag-pastel-blue' : 'tag-pastel-blue'
              }`}
            >
              {filteredQueue.length}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onRefresh}
              title="Refresh Queue"
              className={`p-1.5 rounded-md border transition-all active:scale-95 cursor-pointer ${
                isLightMode
                  ? 'bg-[#FBFBFA] border-[#EAEAEA] text-[#666666] hover:bg-[#F0F0EF]'
                  : 'bg-[#1E222D] border-[#2D3242] text-[#A0A6B5] hover:bg-[#282D3D]'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              type="button"
              onClick={onOpenAddPatient}
              title="Add Walk-In Patient"
              className="p-1.5 rounded-md bg-[#111111] dark:bg-[#F4F4F6] text-[#FFFFFF] dark:text-[#0D0F14] text-xs font-bold flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search patient / ABHA / symptom..."
            className={`w-full min-h-[36px] border rounded-md py-1.5 pl-8 pr-2.5 text-xs font-medium outline-none transition-colors ${
              isLightMode
                ? 'bg-[#FBFBFA] border-[#EAEAEA] text-[#111111] placeholder-[#999999] focus:border-[#111111]'
                : 'bg-[#1A1D27] border-[#2A2E3D] text-[#F4F4F6] placeholder-[#5D6373] focus:border-[#F4F4F6]'
            }`}
          />
          <Search className={`w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 ${isLightMode ? 'text-[#999999]' : 'text-[#5D6373]'}`} />
        </div>

        {/* Dynamic Department Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto whitespace-nowrap pb-0.5 pt-0.5">
          {DEPARTMENTS.map((dept) => {
            const isSelected = selectedDepartment === dept;
            const label = dept === 'ALL' ? 'All Depts' : dept.split(' ')[0];

            return (
              <button
                key={dept}
                type="button"
                onClick={() => onSelectDepartment(dept)}
                className={`text-[10px] font-mono px-2 py-1 rounded transition-all active:scale-95 cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-[#111111] dark:bg-[#F4F4F6] text-[#FFFFFF] dark:text-[#0D0F14] font-bold'
                    : isLightMode
                    ? 'bg-[#F4F4F2] text-[#666666] hover:text-[#111111]'
                    : 'bg-[#1E222D] text-[#8E94A4] hover:text-[#FFFFFF]'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Queue List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {filteredQueue.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <p className="text-xs text-[#888888]">No patients in this department</p>
            <button
              type="button"
              onClick={onOpenAddPatient}
              className="text-[11px] font-bold text-[#1F6C9F] dark:text-[#70B8FF] hover:underline"
            >
              + Register Walk-In Patient
            </button>
          </div>
        ) : (
          filteredQueue.map((item) => {
            const isSelected = item.encounterId === selectedEncounterId;

            return (
              <button
                key={item.encounterId}
                type="button"
                onClick={() => onSelectEncounter(item.encounterId)}
                className={`w-full p-3 sm:p-3.5 rounded-lg border text-left transition-all min-h-[72px] cursor-pointer relative ${
                  isSelected
                    ? isLightMode
                      ? 'bg-[#FFFFFF] border-[#111111] shadow-xs'
                      : 'bg-[#1C202B] border-[#F4F4F6]'
                    : isLightMode
                    ? 'bg-[#FFFFFF] border-[#EAEAEA] hover:border-[#CCCCCC]'
                    : 'bg-[#141720] border-[#232734] hover:border-[#353A4D]'
                }`}
              >
                {/* Top Row: Name & Tag */}
                <div className="flex items-start justify-between gap-1.5 mb-1">
                  <h4 className={`text-xs font-bold truncate ${isLightMode ? 'text-[#111111]' : 'text-[#F4F4F6]'}`}>
                    {item.fullName}
                  </h4>
                  <div className="flex items-center gap-1 shrink-0">
                    {item.hasRedFlag ? (
                      <span className="tag-pastel-red px-1.5 py-0.2 rounded text-[9px] font-mono font-bold">
                        EMERGENCY
                      </span>
                    ) : item.status === 'COMPLETED' ? (
                      <span className="tag-pastel-green px-1.5 py-0.2 rounded text-[9px] font-mono font-bold flex items-center gap-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>SIGNED</span>
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono text-[#888888] px-1 py-0.2 rounded bg-[#F0F0EF] dark:bg-[#1E222D]">
                        {item.department ? item.department.split(' ')[0] : 'OPD'}
                      </span>
                    )}
                    <ChevronRight className="w-3.5 h-3.5 text-[#888888] md:hidden" />
                  </div>
                </div>

                {/* Sub row: Demographics */}
                <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-[#787774] dark:text-[#8E94A4] mb-1 font-mono tabular-nums">
                  <span>{item.gender}</span>
                  <span>•</span>
                  <span>{item.age}y</span>
                  <span>•</span>
                  <span className="truncate">{item.abhaId}</span>
                </div>

                {/* Chief Complaint & Time */}
                <div className="flex items-center justify-between text-[10px]">
                  <span
                    className={`truncate max-w-[180px] px-1.5 py-0.5 rounded ${
                      isLightMode ? 'bg-[#F4F4F2] text-[#444444]' : 'bg-[#1A1D27] text-[#9EA5B5]'
                    }`}
                  >
                    {item.chiefComplaint}
                  </span>
                  <div className="flex items-center gap-1 text-[#888888] font-mono tabular-nums">
                    <Clock className="w-2.5 h-2.5" />
                    <span>{item.queueTime}</span>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
};
