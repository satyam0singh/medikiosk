import React, { useState } from 'react';
import { Users, Search, Clock, CheckCircle2 } from 'lucide-react';

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
  queueTime: string;
}

interface PatientQueueSidebarProps {
  queue: QueueItem[];
  selectedEncounterId: string;
  onSelectEncounter: (encounterId: string) => void;
  isLightMode?: boolean;
}

export const PatientQueueSidebar: React.FC<PatientQueueSidebarProps> = ({
  queue,
  selectedEncounterId,
  onSelectEncounter,
  isLightMode = false,
}) => {
  const [filter, setFilter] = useState('');

  const filteredQueue = queue.filter(
    (item) =>
      item.fullName.toLowerCase().includes(filter.toLowerCase()) ||
      item.abhaId.includes(filter) ||
      item.chiefComplaint.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <aside
      className={`w-72 border-r flex flex-col shrink-0 h-[calc(100vh-57px)] transition-colors ${
        isLightMode ? 'bg-[#FBFBFA] border-[#EAEAEA]' : 'bg-[#10121A] border-[#232734]'
      }`}
    >
      {/* Queue Header */}
      <div className={`p-3.5 border-b space-y-2.5 ${isLightMode ? 'border-[#EAEAEA] bg-[#FFFFFF]' : 'border-[#232734] bg-[#141720]'}`}>
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-1.5 font-bold text-xs ${isLightMode ? 'text-[#111111]' : 'text-[#F4F4F6]'}`}>
            <Users className="w-3.5 h-3.5 text-[#555555] dark:text-[#8E94A4]" />
            <span>OPD Queue</span>
          </div>
          <span
            className={`px-2 py-0.5 font-mono text-[10px] rounded-full tabular-nums ${
              isLightMode ? 'tag-pastel-blue' : 'tag-pastel-blue'
            }`}
          >
            {queue.length} Patients
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search patient / ABHA..."
            className={`w-full border rounded-md py-1.5 pl-8 pr-2.5 text-xs font-medium outline-none transition-colors ${
              isLightMode
                ? 'bg-[#FBFBFA] border-[#EAEAEA] text-[#111111] placeholder-[#999999] focus:border-[#111111]'
                : 'bg-[#1A1D27] border-[#2A2E3D] text-[#F4F4F6] placeholder-[#5D6373] focus:border-[#F4F4F6]'
            }`}
          />
          <Search className={`w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 ${isLightMode ? 'text-[#999999]' : 'text-[#5D6373]'}`} />
        </div>
      </div>

      {/* Queue List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {filteredQueue.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#888888]">
            No patients match filter
          </div>
        ) : (
          filteredQueue.map((item) => {
            const isSelected = item.encounterId === selectedEncounterId;

            return (
              <button
                key={item.encounterId}
                type="button"
                onClick={() => onSelectEncounter(item.encounterId)}
                className={`w-full p-3 rounded-lg border text-left transition-all relative ${
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
                  {item.hasRedFlag ? (
                    <span className="tag-pastel-red px-1.5 py-0.2 rounded text-[9px] font-mono font-bold shrink-0">
                      PRIORITY
                    </span>
                  ) : item.status === 'COMPLETED' ? (
                    <span className="tag-pastel-green px-1.5 py-0.2 rounded text-[9px] font-mono font-bold shrink-0 flex items-center gap-0.5">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      <span>SIGNED</span>
                    </span>
                  ) : null}
                </div>

                {/* Sub row: Demographics */}
                <div className="flex items-center gap-1.5 text-[11px] text-[#787774] dark:text-[#8E94A4] mb-1.5 font-mono tabular-nums">
                  <span>{item.gender}</span>
                  <span>•</span>
                  <span>{item.age}y</span>
                  <span>•</span>
                  <span className="truncate">{item.abhaId}</span>
                </div>

                {/* Chief Complaint & Time */}
                <div className="flex items-center justify-between text-[10px]">
                  <span
                    className={`truncate max-w-[150px] px-1.5 py-0.5 rounded ${
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
