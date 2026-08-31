import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Bell,
  User,
  Sun,
  Moon,
  Clock,
  ShieldCheck,
  UserPlus,
  ChevronDown,
  LogOut,
} from 'lucide-react';
import { RedFlagAlert, DoctorSpecialist } from '@medikiosk/shared-types';

interface DoctorHeaderProps {
  alerts: RedFlagAlert[];
  activeDoctor: DoctorSpecialist;
  onOpenAlerts: () => void;
  onOpenSpecialists: () => void;
  onOpenAddPatient: () => void;
  isLightMode: boolean;
  onToggleTheme: () => void;
  onNavigateToTriage?: () => void;
  onNavigateToAdmin?: () => void;
  onLogout?: () => void;
}

export const DoctorHeader: React.FC<DoctorHeaderProps> = ({
  alerts,
  activeDoctor,
  onOpenAlerts,
  onOpenSpecialists,
  onOpenAddPatient,
  isLightMode,
  onToggleTheme,
  onNavigateToTriage,
  onNavigateToAdmin,
  onLogout,
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
      className={`border-b px-3 sm:px-5 py-2 sm:py-2.5 flex items-center justify-between shrink-0 z-40 transition-colors ${
        isLightMode ? 'bg-[#FFFFFF] border-[#EAEAEA]' : 'bg-[#141720] border-[#232734]'
      }`}
    >
      {/* Left: Brand & Clinic Context */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <div
          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 border ${
            isLightMode ? 'bg-[#F7F6F3] border-[#EAEAEA] text-[#111111]' : 'bg-[#1E222D] border-[#2D3242] text-[#F4F4F6]'
          }`}
        >
          <Stethoscope className="w-4 h-4 stroke-[2]" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <h1 className={`text-xs sm:text-base font-bold tracking-tight truncate ${isLightMode ? 'text-[#111111]' : 'text-[#F4F4F6]'}`}>
              MediKiosk <span className="font-normal text-[#888888] hidden md:inline">/ Workstation</span>
            </h1>
            <span
              className={`text-[9px] sm:text-[10px] font-mono uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded-full shrink-0 ${
                activeDoctor.department.includes('AYUSH') ? 'tag-pastel-yellow' : 'tag-pastel-blue'
              }`}
            >
              {activeDoctor.roomNumber || 'Room #04'}
            </span>
            <div
              className={`hidden xl:flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                isLightMode ? 'tag-pastel-green' : 'tag-pastel-green'
              }`}
            >
              <ShieldCheck className="w-3 h-3" />
              <span>ABDM Live</span>
            </div>
          </div>
          <div className={`hidden sm:flex items-center gap-1 text-[10px] truncate ${isLightMode ? 'text-[#787774]' : 'text-[#8E94A4]'}`}>
            <span className="truncate">AIIA Delhi • {activeDoctor.department}</span>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Workspace Quick Switchers */}
        {onNavigateToTriage && (
          <button
            type="button"
            onClick={onNavigateToTriage}
            className={`hidden lg:inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono border transition-all cursor-pointer ${
              isLightMode
                ? 'bg-[#FBFBFA] border-[#EAEAEA] text-[#70B8FF] hover:bg-[#F0F0EF]'
                : 'bg-[#181C28] border-[#2B3142] text-[#70B8FF] hover:bg-[#22283A]'
            }`}
          >
            <span>Triage</span>
          </button>
        )}

        {onNavigateToAdmin && (
          <button
            type="button"
            onClick={onNavigateToAdmin}
            className={`hidden lg:inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono border transition-all cursor-pointer ${
              isLightMode
                ? 'bg-[#FBFBFA] border-[#EAEAEA] text-[#A78BFA] hover:bg-[#F0F0EF]'
                : 'bg-[#181C28] border-[#2B3142] text-[#C4B5FD] hover:bg-[#22283A]'
            }`}
          >
            <span>Admin</span>
          </button>
        )}

        {/* Quick Add Patient Button */}
        <button
          type="button"
          onClick={onOpenAddPatient}
          className={`px-2.5 py-1.5 min-h-[36px] rounded-md text-xs font-semibold flex items-center gap-1.5 border transition-all active:scale-95 cursor-pointer ${
            isLightMode
              ? 'bg-[#111111] text-[#FFFFFF] border-[#111111] hover:bg-[#222222]'
              : 'bg-[#F4F4F6] text-[#0D0F14] border-[#F4F4F6] hover:bg-[#EAEAEB]'
          }`}
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">+ Walk-In Patient</span>
        </button>

        {/* Real-time Clock */}
        <div
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-mono tabular-nums border ${
            isLightMode ? 'bg-[#FBFBFA] border-[#EAEAEA] text-[#555555]' : 'bg-[#10121A] border-[#232734] text-[#A0A6B5]'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>{time || '10:30:00 AM'}</span>
        </div>

        {/* Light / Dark Mode Toggle */}
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label="Toggle Theme"
          className={`p-2 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-md border transition-all active:scale-95 cursor-pointer ${
            isLightMode
              ? 'bg-[#FBFBFA] border-[#EAEAEA] text-[#666666] hover:bg-[#F0F0EF]'
              : 'bg-[#1A1D27] border-[#2A2E3D] text-[#C4C9D6] hover:bg-[#222634]'
          }`}
        >
          {isLightMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>

        {/* Alerts Pill */}
        <button
          type="button"
          onClick={onOpenAlerts}
          className={`px-2.5 py-1.5 min-h-[36px] rounded-md text-xs font-mono flex items-center gap-1.5 border transition-all active:scale-95 cursor-pointer ${
            unacknowledgedCount > 0
              ? 'bg-red-500/10 border-red-500/30 text-red-500 dark:text-red-400 font-bold'
              : isLightMode
              ? 'bg-[#FBFBFA] border-[#EAEAEA] text-[#787774] hover:bg-[#F0F0EF]'
              : 'bg-[#1A1D27] border-[#2A2E3D] text-[#8E94A4] hover:bg-[#222634]'
          }`}
        >
          <Bell className={`w-3.5 h-3.5 ${unacknowledgedCount > 0 ? 'animate-bounce' : ''}`} />
          <span>{unacknowledgedCount} Alerts</span>
        </button>

        {/* Doctor Switcher Menu Pill */}
        <button
          type="button"
          onClick={onOpenSpecialists}
          className={`px-2.5 py-1 min-h-[36px] rounded-md border flex items-center gap-2 transition-all active:scale-95 cursor-pointer text-left ${
            isLightMode
              ? 'bg-[#FBFBFA] border-[#EAEAEA] text-[#111111] hover:bg-[#F0F0EF]'
              : 'bg-[#1A1D27] border-[#2A2E3D] text-[#F4F4F6] hover:bg-[#222634]'
          }`}
        >
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 border ${
              activeDoctor.department.includes('AYUSH')
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400'
                : 'bg-blue-500/15 border-blue-500/30 text-blue-600 dark:text-blue-400'
            }`}
          >
            <User className="w-3 h-3" />
          </div>
          <div className="hidden lg:block min-w-0 pr-1">
            <span className="block text-xs font-bold leading-none truncate">{activeDoctor.fullName}</span>
            <span className="text-[9px] text-[#888888] font-mono leading-none truncate">
              {activeDoctor.specialtyTitle}
            </span>
          </div>
          <ChevronDown className="w-3 h-3 text-[#888888]" />
        </button>

        {/* Logout Button */}
        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            title="Sign Out"
            className={`p-2 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-md border transition-all active:scale-95 cursor-pointer ${
              isLightMode
                ? 'bg-[#FBFBFA] border-[#EAEAEA] text-[#666666] hover:text-red-500'
                : 'bg-[#1A1D27] border-[#2A2E3D] text-[#C4C9D6] hover:text-red-400'
            }`}
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </header>
  );
};
