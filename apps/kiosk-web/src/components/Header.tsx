import React from 'react';
import { HeartPulse, Globe, AlertTriangle, Sun, Moon } from 'lucide-react';
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
  return (
    <header className={`backdrop-blur-md border-b px-6 py-4 flex items-center justify-between sticky top-0 z-50 transition-colors ${
      isLightMode ? 'bg-white/90 border-teal-200 shadow-sm' : 'bg-slate-900/80 border-teal-500/20'
    }`}>
      {/* Brand & Organization */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-teal-500/20">
          <HeartPulse className="w-7 h-7 text-slate-950 font-bold" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className={`text-2xl font-black tracking-tight ${isLightMode ? 'text-slate-900' : 'text-white'}`}>MediKiosk</h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/30 rounded-full">
              SIH 2026
            </span>
          </div>
          <p className={`text-xs font-medium ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
            All India Institute of Ayurveda (AIIA) • OPD Case-Taking
          </p>
        </div>
      </div>

      {/* Right Controls: Theme, Language & Emergency */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Light / Dark Mode Toggle */}
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label="Toggle Theme"
          className={`p-2.5 rounded-2xl border transition-all ${
            isLightMode
              ? 'bg-slate-100 border-slate-300 text-amber-600 hover:bg-slate-200'
              : 'bg-slate-800/90 border-slate-700 text-amber-300 hover:bg-slate-700'
          }`}
        >
          {isLightMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Language Selector */}
        <div className={`flex items-center rounded-2xl p-1 border ${
          isLightMode ? 'bg-slate-100 border-slate-300' : 'bg-slate-800/90 border-slate-700'
        }`}>
          <button
            onClick={() => onToggleLanguage(LanguageCode.EN)}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all ${
              currentLanguage === LanguageCode.EN
                ? 'bg-teal-500 text-slate-950 shadow-md'
                : isLightMode ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4" /> English
          </button>
          <button
            onClick={() => onToggleLanguage(LanguageCode.HI)}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all ${
              currentLanguage === LanguageCode.HI
                ? 'bg-teal-500 text-slate-950 shadow-md'
                : isLightMode ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4" /> हिंदी
          </button>
        </div>

        {/* Emergency Triage Assistance Button */}
        <button
          onClick={onEmergencyClick}
          className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 active:scale-95 transition-all"
        >
          <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
          <span className="hidden sm:inline">{currentLanguage === LanguageCode.HI ? 'आपातकालीन सहायता' : 'Emergency Help'}</span>
        </button>
      </div>
    </header>
  );
};
