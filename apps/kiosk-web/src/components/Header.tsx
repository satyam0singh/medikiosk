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
    <header className={`border-b px-6 py-3.5 flex items-center justify-between sticky top-0 z-50 transition-all duration-200 ${
      isLightMode
        ? 'bg-white/95 backdrop-blur-md border-slate-200 shadow-sm shadow-slate-100'
        : 'bg-slate-900/90 backdrop-blur-md border-slate-800/80 shadow-lg shadow-black/20'
    }`}>
      {/* Hospital & MediKiosk Brand */}
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-500 via-emerald-400 to-cyan-400 flex items-center justify-center shadow-lg shadow-teal-500/20 text-slate-950 font-black">
          <HeartPulse className="w-6 h-6 stroke-[2.5]" />
        </div>
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className={`text-xl font-extrabold tracking-tight ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
              MediKiosk
            </h1>
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/30 rounded-md">
              PATIENT INTAKE
            </span>
            <div className="hidden md:flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <ShieldCheck className="w-3 h-3" />
              <span>ABDM Verified</span>
            </div>
          </div>
          <p className={`text-xs font-medium ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
            All India Institute of Ayurveda (AIIA) • Digital OPD Kiosk #01
          </p>
        </div>
      </div>

      {/* Right Controls: Clock, Theme, Language, Emergency */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Real-time Clock */}
        <div className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold ${
          isLightMode ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-950 border-slate-800 text-slate-300'
        }`}>
          <Clock className="w-3.5 h-3.5 text-teal-500" />
          <span>{time || '10:30 AM'}</span>
        </div>

        {/* Light / Dark Mode Toggle */}
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label="Toggle Theme"
          className={`p-2.5 rounded-xl border transition-all active:scale-95 ${
            isLightMode
              ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-amber-600'
              : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-amber-300'
          }`}
        >
          {isLightMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Language Switcher */}
        <div className={`flex items-center rounded-xl p-1 border ${
          isLightMode ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'
        }`}>
          <button
            onClick={() => onToggleLanguage(LanguageCode.EN)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              currentLanguage === LanguageCode.EN
                ? 'bg-teal-500 text-slate-950 shadow-sm'
                : isLightMode ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" /> English
          </button>
          <button
            onClick={() => onToggleLanguage(LanguageCode.HI)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              currentLanguage === LanguageCode.HI
                ? 'bg-teal-500 text-slate-950 shadow-sm'
                : isLightMode ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" /> हिंदी
          </button>
        </div>

        {/* Emergency Triage Assistance Button */}
        <button
          onClick={onEmergencyClick}
          className="bg-rose-500/15 hover:bg-rose-500/25 text-rose-600 dark:text-rose-400 border border-rose-500/40 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 active:scale-95 transition-all shadow-sm"
        >
          <AlertTriangle className="w-4 h-4 text-rose-500 animate-pulse" />
          <span className="hidden sm:inline font-black uppercase tracking-wider">
            {currentLanguage === LanguageCode.HI ? 'आपातकाल (Emergency)' : 'Emergency'}
          </span>
        </button>
      </div>
    </header>
  );
};
