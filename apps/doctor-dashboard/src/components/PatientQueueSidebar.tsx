import React, { useState } from 'react';
import { Users, Search, AlertCircle } from 'lucide-react';

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
    <aside className={`w-80 border-r flex flex-col shrink-0 h-[calc(100vh-61px)] transition-colors ${
      isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'
    }`}>
      {/* Queue Header */}
      <div className={`p-4 border-b space-y-3 ${isLightMode ? 'border-slate-200' : 'border-slate-800'}`}>
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-2 font-extrabold text-sm ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
            <Users className="w-4 h-4 text-sky-500" />
            <span>OPD Intake Queue</span>
          </div>
          <span className={`px-2 py-0.5 font-bold text-xs rounded-full ${
            isLightMode ? 'bg-sky-100 text-sky-700' : 'bg-sky-500/20 text-sky-300'
          }`}>
            {queue.length} Patients
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search patient / ABHA / symptom..."
            className={`w-full border rounded-xl py-2 pl-9 pr-3 text-xs outline-none focus:border-sky-500 transition-colors ${
              isLightMode
                ? 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'
                : 'bg-slate-950 border-slate-800 text-slate-200 placeholder-slate-500'
            }`}
          />
          <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${isLightMode ? 'text-slate-400' : 'text-slate-500'}`} />
        </div>
      </div>

      {/* Queue List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredQueue.map((item) => {
          const isSelected = item.encounterId === selectedEncounterId;

          return (
            <button
              key={item.encounterId}
              onClick={() => onSelectEncounter(item.encounterId)}
              className={`w-full p-3.5 rounded-2xl border text-left transition-all relative ${
                isSelected
                  ? isLightMode
                    ? 'bg-sky-50 border-sky-500 shadow-sm'
                    : 'bg-sky-500/10 border-sky-500/50 shadow-md shadow-sky-500/10'
                  : isLightMode
                  ? 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                  : 'bg-slate-900 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {/* Top Row: Name & Red Flag */}
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <h4 className={`text-sm font-bold truncate ${isLightMode ? 'text-slate-900' : 'text-white'}`}>{item.fullName}</h4>
                {item.hasRedFlag && (
                  <span className="px-2 py-0.5 bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30 text-[10px] font-black rounded-md flex items-center gap-1 shrink-0 animate-pulse">
                    <AlertCircle className="w-3 h-3" />
                    <span>PRIORITY</span>
                  </span>
                )}
              </div>

              {/* Demographics & ABHA */}
              <p className={`text-xs mb-2 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                {item.gender} • {item.age} yrs • <span className={`font-mono ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>{item.abhaId}</span>
              </p>

              {/* Chief Complaint Pill */}
              <div className={`flex items-center justify-between text-xs pt-2 border-t ${
                isLightMode ? 'border-slate-100' : 'border-slate-800/60'
              }`}>
                <span className={`font-medium truncate max-w-[170px] ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>
                  {item.chiefComplaint}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    item.status === 'COMPLETED'
                      ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300'
                      : item.status === 'IN_PROGRESS'
                      ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300'
                      : isLightMode
                      ? 'bg-slate-100 text-slate-600'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.status}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
};
