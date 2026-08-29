import React from 'react';
import { Stethoscope, Bell, User, Building2, Sun, Moon } from 'lucide-react';
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
  const unacknowledgedCount = alerts.filter(a => !a.isAcknowledged).length;

  return (
    <header className={`border-b px-6 py-3 flex items-center justify-between sticky top-0 z-40 transition-colors ${
      isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
    }`}>
      {/* Brand & Clinic Context */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-400 flex items-center justify-center shadow-md shadow-sky-500/20">
          <Stethoscope className="w-6 h-6 text-slate-950" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className={`text-lg font-black tracking-tight ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
              MediKiosk • Clinical Workstation
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-500/30 rounded-md">
              PHYSICIAN PORTAL
            </span>
          </div>
          <div className={`flex items-center gap-2 text-xs ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
            <Building2 className="w-3.5 h-3.5" />
            <span>All India Institute of Ayurveda (AIIA) • OPD Room #04</span>
          </div>
        </div>
      </div>

      {/* Right User Bar */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Light / Dark Mode Toggle */}
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label="Toggle Theme"
          className={`p-2.5 rounded-xl border transition-all ${
            isLightMode
              ? 'bg-slate-100 border-slate-300 text-amber-600 hover:bg-slate-200'
              : 'bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-750'
          }`}
        >
          {isLightMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Real-Time Priority Alert Bell */}
        <button
          type="button"
          onClick={onOpenAlerts}
          className={`relative p-2.5 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all ${
            unacknowledgedCount > 0
              ? 'bg-rose-500/20 border-rose-500/40 text-rose-600 dark:text-rose-300 animate-pulse'
              : isLightMode
              ? 'bg-slate-100 border-slate-300 text-slate-600 hover:text-slate-900'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>{unacknowledgedCount} Priority Alerts</span>
          {unacknowledgedCount > 0 && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full animate-ping" />
          )}
        </button>

        {/* Physician Profile Card */}
        <div className={`flex items-center gap-3 pl-3 border-l ${isLightMode ? 'border-slate-200' : 'border-slate-800'}`}>
          <div className={`w-9 h-9 rounded-full border flex items-center justify-center font-bold text-sm ${
            isLightMode ? 'bg-sky-100 border-sky-300 text-sky-700' : 'bg-slate-800 border-slate-700 text-sky-400'
          }`}>
            <User className="w-5 h-5" />
          </div>
          <div className="text-left hidden sm:block">
            <h4 className={`text-xs font-bold leading-tight ${isLightMode ? 'text-slate-900' : 'text-white'}`}>Dr. Rajesh Sharma</h4>
            <p className={`text-[11px] ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>Consultant Physician • MD</p>
          </div>
        </div>
      </div>
    </header>
  );
};
