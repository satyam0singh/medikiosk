import React, { useState, useEffect } from 'react';
import { HeartPulse, Globe, AlertTriangle, Sun, Moon, Clock, ShieldCheck } from 'lucide-react';
import { LanguageCode } from '@medikiosk/shared-types';

interface HeaderProps {
  currentLanguage: LanguageCode;
  onToggleLanguage: (lang: LanguageCode) => void;
  onEmergencyClick: () => void;
  isLightMode: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLanguage,
  onToggleLanguage,
  onEmergencyClick,
  isLightMode,
  onToggleTheme,
}) => {
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
      className={`border-b px-6 py-3 flex items-center justify-between sticky top-0 z-50 transition-colors ${
        isLightMode ? 'bg-[#FFFFFF] border-[#EAEAEA]' : 'bg-[#141720] border-[#232734]'
      }`}
    >
      {/* Brand & Clinic Context */}
      <div className="flex items-center gap-3.5">
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm border ${
            isLightMode ? 'bg-[#F7F6F3] border-[#EAEAEA] text-[#111111]' : 'bg-[#1E222D] border-[#2D3242] text-[#F4F4F6]'
          }`}
        >
          <HeartPulse className="w-4 h-4 stroke-[2]" />
        </div>
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className={`text-base font-bold tracking-tight ${isLightMode ? 'text-[#111111]' : 'text-[#F4F4F6]'}`}>
              MediKiosk
            </h1>
            <span
              className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full ${
                isLightMode ? 'tag-pastel-blue' : 'tag-pastel-blue'
              }`}
            >
              OPD Intake
            </span>
            <div
              className={`hidden md:flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full ${
                isLightMode ? 'tag-pastel-green' : 'tag-pastel-green'
              }`}
            >
              <ShieldCheck className="w-3 h-3" />
              <span>ABDM Linked</span>
            </div>
          </div>
          <p className={`text-[11px] ${isLightMode ? 'text-[#787774]' : 'text-[#8E94A4]'}`}>
            All India Institute of Ayurveda (AIIA) • Kiosk #01
          </p>
        </div>
      </div>

      {/* Right Controls: Clock, Theme, Language, Emergency */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Real-time Clock */}
        <div
          className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono tabular-nums border ${
            isLightMode ? 'bg-[#FBFBFA] border-[#EAEAEA] text-[#555555]' : 'bg-[#10121A] border-[#232734] text-[#A0A6B5]'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>{time || '10:30 AM'}</span>
        </div>

        {/* Light / Dark Mode Toggle */}
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label="Toggle Theme"
          className={`p-2 rounded-md border transition-all active:scale-95 ${
            isLightMode
              ? 'bg-[#FBFBFA] border-[#EAEAEA] text-[#666666] hover:bg-[#F0F0EF]'
              : 'bg-[#1A1D27] border-[#2A2E3D] text-[#C4C9D6] hover:bg-[#222634]'
          }`}
        >
          {isLightMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>

        {/* Language Switcher */}
        <div
          className={`flex items-center rounded-md p-0.5 border ${
            isLightMode ? 'bg-[#F7F6F3] border-[#EAEAEA]' : 'bg-[#10121A] border-[#232734]'
          }`}
        >
          <button
            type="button"
            onClick={() => onToggleLanguage(LanguageCode.EN)}
            className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 transition-all ${
              currentLanguage === LanguageCode.EN
                ? isLightMode
                  ? 'bg-[#FFFFFF] text-[#111111] shadow-xs'
                  : 'bg-[#282D3D] text-[#FFFFFF]'
                : isLightMode
                ? 'text-[#777777] hover:text-[#111111]'
                : 'text-[#888888] hover:text-[#FFFFFF]'
            }`}
          >
            <Globe className="w-3 h-3" /> EN
          </button>
          <button
            type="button"
            onClick={() => onToggleLanguage(LanguageCode.HI)}
            className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 transition-all ${
              currentLanguage === LanguageCode.HI
                ? isLightMode
                  ? 'bg-[#FFFFFF] text-[#111111] shadow-xs'
                  : 'bg-[#282D3D] text-[#FFFFFF]'
                : isLightMode
                ? 'text-[#777777] hover:text-[#111111]'
                : 'text-[#888888] hover:text-[#FFFFFF]'
            }`}
          >
            <Globe className="w-3 h-3" /> हिंदी
          </button>
        </div>

        {/* Emergency Triage Alert Button */}
        <button
          type="button"
          onClick={onEmergencyClick}
          className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 ${
            isLightMode ? 'tag-pastel-red' : 'tag-pastel-red'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span className="hidden sm:inline uppercase tracking-wider font-mono text-[10px]">
            {currentLanguage === LanguageCode.HI ? 'आपातकाल' : 'Emergency'}
          </span>
        </button>
      </div>
    </header>
  );
};
