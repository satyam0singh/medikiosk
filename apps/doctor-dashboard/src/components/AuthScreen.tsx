import React, { useState } from 'react';
import { Shield, Lock, CheckCircle2, HeartPulse, User, Eye, EyeOff, ArrowRight, UserPlus, Sun, Moon } from 'lucide-react';
import { UserRole } from '@medikiosk/shared-types';

export interface AuthUser {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: UserRole | 'TRIAGE_OFFICER' | 'ADMIN';
  department?: string;
  specialtyTitle?: string;
}

interface AuthScreenProps {
  onLoginSuccess: (user: AuthUser) => void;
  isLightMode: boolean;
  onToggleTheme: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onLoginSuccess,
  isLightMode,
  onToggleTheme,
}) => {
  const [username, setUsername] = useState('triage');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const DEMO_USERS: Record<string, AuthUser> = {
    admin: {
      id: 'usr-admin-01',
      username: 'admin',
      fullName: 'System Administrator',
      email: 'admin@medikiosk.com',
      role: 'ADMIN',
      specialtyTitle: 'Platform Administrator',
    },
    doctor: {
      id: 'usr-doc-01',
      username: 'doctor',
      fullName: 'Dr. Rajesh Sharma',
      email: 'doctor@medikiosk.com',
      role: UserRole.PHYSICIAN,
      department: 'General Medicine',
      specialtyTitle: 'Consultant Physician • MD',
    },
    triage: {
      id: 'usr-triage-01',
      username: 'triage',
      fullName: 'Triage Officer Singh',
      email: 'triage@medikiosk.com',
      role: 'TRIAGE_OFFICER',
      department: 'Central Triage',
      specialtyTitle: 'Senior Clinical Triage Officer',
    },
    ayush: {
      id: 'usr-ayush-01',
      username: 'ayush',
      fullName: 'Dr. Anand Vaidya',
      email: 'ayush@medikiosk.com',
      role: UserRole.AYUSH_PRACTITIONER,
      department: 'Kayachikitsa / AYUSH',
      specialtyTitle: 'Senior AYUSH Specialist • BAMS MD',
    },
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const cleanUser = username.trim().toLowerCase().replace('@', '');
      const matched = DEMO_USERS[cleanUser];

      if (matched) {
        onLoginSuccess(matched);
      } else {
        onLoginSuccess({
          id: `usr-${Date.now()}`,
          username: cleanUser,
          fullName: `Dr. ${username.toUpperCase()}`,
          email: `${cleanUser}@medikiosk.com`,
          role: cleanUser.includes('admin')
            ? 'ADMIN'
            : cleanUser.includes('triage')
            ? 'TRIAGE_OFFICER'
            : UserRole.PHYSICIAN,
          department: 'General Medicine',
          specialtyTitle: 'Physician',
        });
      }
    }, 350);
  };

  const handleSelectPreset = (key: string) => {
    setUsername(key);
    setPassword('password123');
    setError(null);
  };

  return (
    <div
      className={`min-h-screen w-full flex items-center justify-center p-3 sm:p-6 transition-colors duration-200 ${
        isLightMode ? 'bg-[#F4F4F3] text-[#111111]' : 'bg-[#090A0F] text-[#F4F4F6]'
      }`}
    >
      {/* Theme Toggle Floating Button */}
      <button
        type="button"
        onClick={onToggleTheme}
        aria-label="Toggle Theme"
        className={`fixed top-4 right-4 p-2.5 rounded-xl border shadow-sm transition-all active:scale-95 cursor-pointer z-50 ${
          isLightMode
            ? 'bg-[#FFFFFF] border-[#EAEAEA] text-[#555555] hover:bg-[#F7F6F3]'
            : 'bg-[#181C28] border-[#2B3142] text-[#A0A6B5] hover:bg-[#22283A]'
        }`}
      >
        {isLightMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-blue-400" />}
      </button>

      {/* Outer Double-Bezel Card Container */}
      <div
        className={`w-full max-w-5xl rounded-3xl overflow-hidden border shadow-2xl flex flex-col md:flex-row min-h-[640px] transition-colors duration-200 ${
          isLightMode
            ? 'bg-[#FFFFFF] border-[#E5E5E5] shadow-[0_20px_50px_rgba(0,0,0,0.06)]'
            : 'bg-[#12151E] border-[#232734] shadow-[0_25px_60px_rgba(0,0,0,0.5)]'
        }`}
      >
        {/* Left Side: Brand Narrative Hero Banner */}
        <div
          className={`w-full md:w-5/12 p-6 sm:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r relative overflow-hidden transition-colors ${
            isLightMode
              ? 'bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0A0F1D] border-[#E5E5E5] text-[#FFFFFF]'
              : 'bg-gradient-to-br from-[#0D1B2A] via-[#111C2E] to-[#0A1118] border-[#232734] text-[#FFFFFF]'
          }`}
        >
          {/* Subtle Ambient Orb */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-[#1F6C9F]/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          {/* Brand Header */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl bg-[#1E2738] border border-[#2D3952] flex items-center justify-center text-[#70B8FF] shadow-inner">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold text-base tracking-tight text-[#FFFFFF]">MediKiosk</h1>
                <p className="text-[10px] font-mono tracking-widest uppercase text-[#70B8FF]">Clinical Intake</p>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1F6C9F]/20 border border-[#1F6C9F]/40 text-[#70B8FF] text-[11px] font-medium mb-5">
              <Shield className="w-3.5 h-3.5" />
              <span>Secure clinical workspace</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug text-[#FFFFFF] mb-3">
              Better prepared. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#70B8FF] via-[#6EE787] to-[#38BDF8]">
                Better reviewed.
              </span>
            </h2>

            <p className="text-xs text-[#94A3B8] leading-relaxed max-w-sm mb-6">
              Access your MediKiosk workspace to review clinical intake, patient information, safety signals and
              verification workflows.
            </p>
          </div>

          {/* 3 Value Pillars */}
          <div className="space-y-2.5 relative z-10">
            <div className="p-3 rounded-xl bg-[#141A26]/80 border border-[#222C3E] flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-[#1F6C9F]/20 text-[#70B8FF] mt-0.5">
                <Shield className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#FFFFFF]">Role-based access</h4>
                <p className="text-[11px] text-[#94A3B8]">Workspace access follows your assigned role.</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#141A26]/80 border border-[#222C3E] flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-[#1F6C9F]/20 text-[#70B8FF] mt-0.5">
                <Lock className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#FFFFFF]">Protected workspace</h4>
                <p className="text-[11px] text-[#94A3B8]">Clinical workflows are separated from public access.</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#141A26]/80 border border-[#222C3E] flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-[#1F6C9F]/20 text-[#70B8FF] mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#FFFFFF]">Physician controlled</h4>
                <p className="text-[11px] text-[#94A3B8]">Verification remains part of the clinical workflow.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form (Fully Theme-Aware) */}
        <div
          className={`w-full md:w-7/12 p-6 sm:p-10 flex flex-col justify-between transition-colors duration-200 ${
            isLightMode ? 'bg-[#FFFFFF] text-[#111111]' : 'bg-[#12151E] text-[#F4F4F6]'
          }`}
        >
          <div>
            {/* Top Form Eyebrow */}
            <div className="mb-6">
              <span
                className={`text-[10px] font-mono uppercase tracking-widest block mb-1 ${
                  isLightMode ? 'text-[#1F6C9F] font-bold' : 'text-[#70B8FF]'
                }`}
              >
                SECURE ACCESS
              </span>
              <h2
                className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                  isLightMode ? 'text-[#111111]' : 'text-[#FFFFFF]'
                }`}
              >
                Welcome back
              </h2>
              <p className={`text-xs mt-1 ${isLightMode ? 'text-[#666666]' : 'text-[#8E94A4]'}`}>
                Sign in to continue to your MediKiosk clinical workspace.
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSignIn} className="space-y-4">
              {/* Username Input */}
              <div className="space-y-1.5">
                <label
                  className={`text-xs font-semibold block ${
                    isLightMode ? 'text-[#333333]' : 'text-[#D1D5DB]'
                  }`}
                >
                  Clinical ID or username
                </label>
                <div className="relative">
                  <div
                    className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none ${
                      isLightMode ? 'text-[#888888]' : 'text-[#5D6373]'
                    }`}
                  >
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    required
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs transition-colors focus:outline-none focus:ring-1 ${
                      isLightMode
                        ? 'bg-[#FBFBFA] border border-[#E5E5E5] text-[#111111] placeholder-[#888888] focus:border-[#1F6C9F] focus:ring-[#1F6C9F]'
                        : 'bg-[#181C28] border border-[#2B3142] text-[#FFFFFF] placeholder-[#5D6373] focus:border-[#70B8FF] focus:ring-[#70B8FF]'
                    }`}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    className={`text-xs font-semibold ${
                      isLightMode ? 'text-[#333333]' : 'text-[#D1D5DB]'
                    }`}
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setPassword('password123')}
                    className={`text-[11px] hover:underline cursor-pointer ${
                      isLightMode ? 'text-[#1F6C9F] font-semibold' : 'text-[#70B8FF]'
                    }`}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <div
                    className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none ${
                      isLightMode ? 'text-[#888888]' : 'text-[#5D6373]'
                    }`}
                  >
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-xs font-mono transition-colors focus:outline-none focus:ring-1 ${
                      isLightMode
                        ? 'bg-[#FBFBFA] border border-[#E5E5E5] text-[#111111] placeholder-[#888888] focus:border-[#1F6C9F] focus:ring-[#1F6C9F]'
                        : 'bg-[#181C28] border border-[#2B3142] text-[#FFFFFF] placeholder-[#5D6373] focus:border-[#70B8FF] focus:ring-[#70B8FF]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute inset-y-0 right-0 pr-3.5 flex items-center cursor-pointer ${
                      isLightMode ? 'text-[#888888] hover:text-[#222222]' : 'text-[#5D6373] hover:text-[#9EA5B5]'
                    }`}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 text-xs font-mono">
                  {error}
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-[#FFFFFF] font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer shadow-lg shadow-blue-600/20"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign in</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Registration & Demo Dev Box */}
            <div className="mt-5 space-y-3">
              {/* Register Banner */}
              <div
                className={`p-3.5 rounded-xl border flex items-center justify-between transition-colors ${
                  isLightMode
                    ? 'bg-[#FBFBFA] border-[#E5E5E5]'
                    : 'bg-[#181C28] border-[#2B3142]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      isLightMode ? 'bg-[#E1F3FE] text-[#1F6C9F]' : 'bg-[#22283A] text-[#70B8FF]'
                    }`}
                  >
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <div>
                    <h4
                      className={`text-xs font-bold ${
                        isLightMode ? 'text-[#111111]' : 'text-[#FFFFFF]'
                      }`}
                    >
                      New to MediKiosk?
                    </h4>
                    <p className={`text-[11px] ${isLightMode ? 'text-[#666666]' : 'text-[#8E94A4]'}`}>
                      Create an account to continue.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleSelectPreset('doctor')}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors ${
                    isLightMode
                      ? 'bg-[#FFFFFF] border-[#E0E0E0] hover:bg-[#F0F0EF] text-[#111111]'
                      : 'bg-[#22283A] border-[#3A4259] hover:bg-[#2B3349] text-[#FFFFFF]'
                  }`}
                >
                  <span>Register</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Development Quick Access Preset Chips */}
              <div
                className={`p-3.5 rounded-xl border transition-colors ${
                  isLightMode
                    ? 'bg-[#F7F6F3] border-[#EAEAEA]'
                    : 'bg-[#141824] border-[#23293D]'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <HeartPulse className={`w-3.5 h-3.5 ${isLightMode ? 'text-[#1F6C9F]' : 'text-[#70B8FF]'}`} />
                  <span
                    className={`text-xs font-bold ${
                      isLightMode ? 'text-[#111111]' : 'text-[#FFFFFF]'
                    }`}
                  >
                    Development access
                  </span>
                </div>
                <div
                  className={`flex flex-wrap items-center gap-1.5 mb-1.5 text-xs ${
                    isLightMode ? 'text-[#555555]' : 'text-[#8E94A4]'
                  }`}
                >
                  <span>Demo staff accounts:</span>
                  {(['admin', 'doctor', 'triage', 'ayush'] as const).map((roleKey) => (
                    <button
                      key={roleKey}
                      type="button"
                      onClick={() => handleSelectPreset(roleKey)}
                      className={`px-2 py-0.5 rounded font-mono text-[11px] font-semibold border cursor-pointer transition-colors ${
                        username === roleKey
                          ? 'bg-[#2563EB] text-[#FFFFFF] border-[#3B82F6]'
                          : isLightMode
                          ? 'bg-[#FFFFFF] text-[#333333] border-[#D0D0D0] hover:bg-[#EAEAEA]'
                          : 'bg-[#1D2233] text-[#CBD5E1] border-[#333C54] hover:bg-[#283047]'
                      }`}
                    >
                      {roleKey}
                    </button>
                  ))}
                </div>
                <p className={`text-[11px] font-mono ${isLightMode ? 'text-[#777777]' : 'text-[#64748B]'}`}>
                  Password:{' '}
                  <code
                    className={`px-1 py-0.5 rounded font-semibold ${
                      isLightMode ? 'bg-[#EAEAEA] text-[#222222]' : 'bg-[#0F131D] text-[#94A3B8]'
                    }`}
                  >
                    password123
                  </code>
                </p>
              </div>
            </div>
          </div>

          {/* Micro Footer */}
          <div
            className={`mt-6 pt-4 border-t text-center text-[10px] flex items-center justify-center gap-1.5 font-mono ${
              isLightMode ? 'border-[#EAEAEA] text-[#888888]' : 'border-[#232734] text-[#64748B]'
            }`}
          >
            <Lock className="w-3 h-3" />
            <span>Protected clinical workspace • Access controlled according to MediKiosk role and permissions.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
