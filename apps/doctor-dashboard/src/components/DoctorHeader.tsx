import React, { useState, useEffect } from 'react';
import { Stethoscope, Bell, User, Building2, Sun, Moon, Clock, ShieldCheck } from 'lucide-react';
import { RedFlagAlert } from '@medikiosk/shared-types';

interface DoctorHeaderProps {
  alerts: RedFlagAlert[];
  onOpenAlerts: () => void;
  isLightMode: boolean;
  onToggleTheme: () => void;
}

export const DoctorHeader: React.FC<DoctorHeaderProps> = ({
  alerts,
  onOpenAlerts,
  isLightMode,
  onToggleTheme,
}) => {
  const unacknowledgedCount = alerts.filter((a) => !a.isAcknowledged).length;
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header
      className={`border-b px-6 py-3.5 flex items-center justify-between sticky top-0 z-40 transition-colors ${
        isLightMode
          ? 'bg-white/95 backdrop-blur-md border-slate-200 shadow-sm shadow-slate-200/50'
          : 'bg-slate-900/95 backdrop-blur-md border-slate-800 shadow-lg shadow-black/20'
      }`}
    >
      {/* Brand & Clinic Context */}
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-600 via-sky-500 to-teal-400 flex items-center justify-center shadow-lg shadow-sky-500/20 text-slate-950 font-black">
          <Stethoscope className="w-6 h-6 stroke-[2.4]" />
        </div>
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className={`text-lg font-black tracking-tight ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
              MediKiosk <span className="font-semibold text-slate-400">|</span> Clinical Workstation
            </h1>
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-sky-500/15 text-sky-600 dark:text-sky-300 border border-sky-500/30 rounded-md">
              PHYSICIAN PORTAL
            </span>
            <div className="hidden lg:flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <ShieldCheck className="w-3 h-3" />
              <span>ABDM Linked</span>
            </div>
          </div>
          <div className={`flex items-center gap-2 text-xs font-medium ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
            <Building2 className="w-3.5 h-3.5 text-sky-500" />
            <span>All India Institute of Ayurveda (AIIA) • OPD Room #04 (General Medicine)</span>
          </div>
        </div>
      </div>

      {/* Right Controls: Clock, Theme, Alert Bell, Physician Badge */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Real-time Clock */}
        <div
          className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold tabular-nums ${
            isLightMode ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-950 border-slate-800 text-slate-300'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-sky-500" />
          <span>{time || '10:30 AM'}</span>
        </div>

        {/* Light / Dark Mode Toggle */}
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label="Toggle Theme"
          className={`p-2.5 rounded-xl border transition-all active:scale-95 ${
            isLightMode
              ? 'bg-slate-100 border-slate-300 text-amber-600 hover:bg-slate-200'
              : 'bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-750'
          }`}
        >
          {isLightMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Priority Emergency Alert Bell */}
        <button
          type="button"
          onClick={onOpenAlerts}
          className={`relative px-3.5 py-2 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all active:scale-95 ${
            unacknowledgedCount > 0
              ? 'bg-rose-500/15 border-rose-500/40 text-rose-600 dark:text-rose-300 shadow-sm shadow-rose-500/10'
              : isLightMode
              ? 'bg-slate-100 border-slate-300 text-slate-600 hover:text-slate-900'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
          }`}
        >
          <Bell className={`w-4 h-4 ${unacknowledgedCount > 0 ? 'text-rose-500 animate-bounce' : ''}`} />
          <span className="tabular-nums font-black">{unacknowledgedCount} Priority Alerts</span>
          {unacknowledgedCount > 0 && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full animate-ping" />
          )}
        </button>

        {/* Physician Profile Card */}
        <div className={`flex items-center gap-3 pl-3 border-l ${isLightMode ? 'border-slate-200' : 'border-slate-800'}`}>
          <div
            className={`w-9 h-9 rounded-2xl border flex items-center justify-center font-bold text-sm shadow-sm ${
              isLightMode ? 'bg-sky-100 border-sky-300 text-sky-700' : 'bg-slate-800 border-slate-700 text-sky-400'
            }`}
          >
            <User className="w-4 h-4" />
          </div>
          <div className="text-left hidden sm:block">
            <h4 className={`text-xs font-bold leading-tight ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
              Dr. Rajesh Sharma
            </h4>
            <p className={`text-[11px] font-medium ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
              Consultant Physician • MD
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
