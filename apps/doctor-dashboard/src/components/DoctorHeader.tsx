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
}

export const DoctorHeader: React.FC<DoctorHeaderProps> = ({
  alerts,
  activeDoctor,
  onOpenAlerts,
  onOpenSpecialists,
  onOpenAddPatient,
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
          <span className="sm:hidden">+ Patient</span>
        </button>

        {/* Real-time Clock */}
        <div
          className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono tabular-nums border ${
            isLightMode ? 'bg-[#FBFBFA] border-[#EAEAEA] text-[#555555]' : 'bg-[#10121A] border-[#232734] text-[#A0A6B5]'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>{time || '10:30 AM'}</span>
        </div>

        {/* Theme Toggle */}
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

        {/* Priority Emergency Alerts Button */}
        <button
          type="button"
          onClick={onOpenAlerts}
          className={`px-2 sm:px-2.5 py-1.5 min-h-[36px] rounded-md text-xs font-mono tabular-nums flex items-center gap-1 sm:gap-1.5 transition-all active:scale-95 border cursor-pointer ${
            unacknowledgedCount > 0
              ? 'tag-pastel-red font-bold'
              : isLightMode
              ? 'bg-[#FBFBFA] border-[#EAEAEA] text-[#666666]'
              : 'bg-[#1A1D27] border-[#2A2E3D] text-[#C4C9D6]'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{unacknowledgedCount} Alerts</span>
          <span className="sm:hidden">{unacknowledgedCount}</span>
        </button>

        {/* Active Specialist Profile & Switcher Trigger */}
        <button
          type="button"
          onClick={onOpenSpecialists}
          className={`flex items-center gap-1.5 sm:gap-2 p-1 sm:px-2 sm:py-1 rounded-md border text-left transition-all active:scale-95 cursor-pointer ${
            isLightMode
              ? 'bg-[#FBFBFA] border-[#EAEAEA] hover:border-[#CCCCCC]'
              : 'bg-[#1A1D27] border-[#2A2E3D] hover:border-[#3E4558]'
          }`}
        >
          <div
            className={`w-7 h-7 rounded-md border flex items-center justify-center font-bold text-xs shrink-0 ${
              isLightMode ? 'bg-[#FFFFFF] border-[#EAEAEA] text-[#111111]' : 'bg-[#1E222D] border-[#2D3242] text-[#F4F4F6]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
          </div>
          <div className="text-left hidden md:block max-w-[130px]">
            <h4 className={`text-xs font-bold leading-tight truncate ${isLightMode ? 'text-[#111111]' : 'text-[#F4F4F6]'}`}>
              {activeDoctor.fullName}
            </h4>
            <p className={`text-[10px] truncate ${isLightMode ? 'text-[#787774]' : 'text-[#8E94A4]'}`}>
              {activeDoctor.specialtyTitle}
            </p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-[#888888] shrink-0" />
        </button>
      </div>
    </header>
  );
};
