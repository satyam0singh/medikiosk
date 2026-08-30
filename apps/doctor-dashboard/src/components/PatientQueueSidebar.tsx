import React, { useState } from 'react';
import { Users, Search, AlertCircle, Clock, CheckCircle2, ChevronRight } from 'lucide-react';

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
      className={`w-80 border-r flex flex-col shrink-0 h-[calc(100vh-61px)] transition-colors ${
        isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/70 border-slate-800'
      }`}
    >
      {/* Queue Header */}
      <div className={`p-4 border-b space-y-3 ${isLightMode ? 'border-slate-200 bg-white' : 'border-slate-800 bg-slate-900/50'}`}>
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-2 font-black text-sm tracking-tight ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
            <Users className="w-4 h-4 text-sky-500" />
            <span>OPD Patient Queue</span>
          </div>
          <span
            className={`px-2.5 py-0.5 font-mono font-bold text-xs rounded-full tabular-nums ${
              isLightMode ? 'bg-sky-100 text-sky-700 border border-sky-200' : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
            }`}
          >
            {queue.length} Queued
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
                ? 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
                : 'bg-slate-950 border-slate-800 text-slate-200 placeholder-slate-500'
            }`}
          />
          <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${isLightMode ? 'text-slate-400' : 'text-slate-500'}`} />
        </div>
      </div>

      {/* Queue List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filteredQueue.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
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
                className={`w-full p-3.5 rounded-2xl border text-left transition-all relative group ${
                  isSelected
                    ? isLightMode
                      ? 'bg-white border-sky-500 shadow-md shadow-sky-500/10 ring-2 ring-sky-500/20'
                      : 'bg-sky-500/10 border-sky-500 shadow-lg shadow-sky-500/10 ring-1 ring-sky-500/40'
                    : isLightMode
                    ? 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Top Row: Name & Red Flag / Status */}
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h4 className={`text-sm font-bold truncate ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                    {item.fullName}
                  </h4>
                  {item.hasRedFlag ? (
                    <span className="px-2 py-0.5 bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-[10px] font-black rounded-md flex items-center gap-1 shrink-0 animate-pulse">
                      <AlertCircle className="w-3 h-3" />
                      <span>PRIORITY</span>
                    </span>
                  ) : item.status === 'COMPLETED' ? (
                    <span className="px-2 py-0.5 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-black rounded-md flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>VERIFIED</span>
                    </span>
                  ) : null}
                </div>

                {/* Sub row: Demographics */}
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">
                  <span>{item.gender}</span>
                  <span>•</span>
                  <span className="font-mono tabular-nums">{item.age} yrs</span>
                  <span>•</span>
                  <span className="font-mono text-[11px] truncate text-slate-400">{item.abhaId}</span>
                </div>

                {/* Chief Complaint Badge */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[11px] font-semibold truncate max-w-[190px] px-2 py-0.5 rounded-md ${
                      isLightMode ? 'bg-slate-100 text-slate-700' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.chiefComplaint}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                    <Clock className="w-3 h-3" />
                    <span>{item.queueTime}</span>
                  </div>
                </div>

                {/* Active Indicator Chevron */}
                {isSelected && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 text-sky-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
};
