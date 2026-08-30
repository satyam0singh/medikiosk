import React, { useState } from 'react';
import { Search, UserPlus, ArrowRight, UserCheck, Sparkles } from 'lucide-react';
import { Patient, LanguageCode } from '@medikiosk/shared-types';
import { AudioPromptButton } from '../AudioPromptButton';
import { KioskApi } from '../../services/api';
import { getTranslation } from '../../utils/translations';

interface IdentityScreenProps {
  language: LanguageCode;
  onPatientIdentified: (patient: Patient) => void;
}

export const IdentityScreen: React.FC<IdentityScreenProps> = ({
  language,
  onPatientIdentified,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [showQuickRegister, setShowQuickRegister] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newGender, setNewGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [newAge, setNewAge] = useState('45');
  const [newPhone, setNewPhone] = useState('+91 98765 00000');

  const t = getTranslation(language);

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const results = await KioskApi.searchPatients(term);
      setSearchResults(results);
    } catch (err) {
      console.error('Patient search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const DEMO_PATIENTS: Patient[] = [
    {
      id: 'b0000000-0000-0000-0000-000000000001',
      abhaId: '91-4829-1029-4820',
      hospitalPatientId: 'MRN-2026-00482',
      fullName: 'Ramesh Kumar (रमेश कुमार)',
      gender: 'MALE',
      age: 54,
      contactNumber: '+91 98765 43210',
      preferredLanguage: LanguageCode.HI,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'b0000000-0000-0000-0000-000000000002',
      abhaId: '91-7712-4458-9901',
      hospitalPatientId: 'MRN-2026-00483',
      fullName: 'Sunita Devi (सुनीता देवी - AYUSH Case)',
      gender: 'FEMALE',
      age: 48,
      contactNumber: '+91 98111 22334',
      preferredLanguage: LanguageCode.HI,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const handleQuickRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName.trim()) return;

    try {
      const patient = await KioskApi.createPatient({
        fullName: newFullName,
        gender: newGender,
        age: parseInt(newAge, 10),
        contactNumber: newPhone,
        preferredLanguage: language,
        hospitalPatientId: `MRN-${Date.now().toString().slice(-6)}`,
      });
      onPatientIdentified(patient);
    } catch (err) {
      alert(`Registration failed: ${(err as Error).message}`);
    }
  };

  return (
    <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full py-2 px-1 sm:px-4">
      {/* Title & Audio Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 shrink-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111111] dark:text-[#F4F4F6]">
            {t.identity_title}
          </h2>
          <p className="text-xs text-[#787774] dark:text-[#8E94A4] mt-0.5">
            {t.identity_subtitle}
          </p>
        </div>
        <AudioPromptButton text={t.audio_identity} language={language} size="md" />
      </div>

      {/* 1-Tap Seeded Demo Cases with Dynamic Aspect Ratio */}
      <div className="p-3.5 sm:p-4 rounded-xl border border-[#EAEAEA] dark:border-[#232734] bg-[#F7F6F3] dark:bg-[#141720] mb-4 shrink-0">
        <div className="flex items-center gap-1.5 mb-2.5">
          <Sparkles className="w-3.5 h-3.5 text-[#1F6C9F] dark:text-[#70B8FF]" />
          <h4 className="text-[10px] font-mono uppercase tracking-wider text-[#555555] dark:text-[#9EA5B5]">
            {t.seeded_cases}
          </h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
          {DEMO_PATIENTS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onPatientIdentified(p)}
              className="p-3 sm:p-3.5 min-h-[52px] rounded-lg border border-[#EAEAEA] dark:border-[#232734] bg-[#FFFFFF] dark:bg-[#1A1D27] hover:border-[#111111] dark:hover:border-[#F4F4F6] flex items-center justify-between text-left transition-all active:scale-[0.98] shadow-xs cursor-pointer"
            >
              <div className="min-w-0 pr-2">
                <h5 className="text-xs font-bold text-[#111111] dark:text-[#F4F4F6] truncate">{p.fullName}</h5>
                <p className="text-[10px] sm:text-[11px] text-[#787774] dark:text-[#8E94A4] mt-0.5 font-mono tabular-nums truncate">
                  {p.gender === 'MALE' ? t.male : t.female} • {p.age}y • <span className="text-[#1F6C9F] dark:text-[#70B8FF]">{p.abhaId}</span>
                </p>
              </div>
              <div className="w-7 h-7 rounded-full bg-[#111111] dark:bg-[#F4F4F6] text-[#FFFFFF] dark:text-[#0D0F14] flex items-center justify-center shrink-0">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ABHA / Mobile Live Search Box */}
      <div className="relative mb-4 shrink-0">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#787774] dark:text-[#8E94A4]" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={t.search_placeholder}
          className="w-full pl-9 pr-4 py-2.5 min-h-[44px] rounded-lg border border-[#EAEAEA] dark:border-[#232734] bg-[#FFFFFF] dark:bg-[#141720] text-[#111111] dark:text-[#F4F4F6] placeholder-[#888888] dark:placeholder-[#666666] text-xs font-mono outline-none focus:border-[#111111] dark:focus:border-[#F4F4F6] transition-colors"
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-3.5 h-3.5 border-2 border-[#111111] dark:border-[#F4F4F6] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Live Search Results */}
      {searchResults.length > 0 && (
        <div className="border border-[#EAEAEA] dark:border-[#232734] rounded-xl overflow-hidden mb-4 bg-[#FFFFFF] dark:bg-[#141720] shadow-xs shrink-0">
          <div className="divide-y divide-[#EAEAEA] dark:divide-[#232734]">
            {searchResults.map((p) => (
              <div
                key={p.id}
                className="p-3 sm:p-4 flex items-center justify-between hover:bg-[#F7F6F3] dark:hover:bg-[#1A1D27] transition-colors"
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-[#346538] dark:text-[#6EE787] shrink-0" />
                    <h5 className="font-bold text-xs sm:text-sm text-[#111111] dark:text-[#F4F4F6] truncate">
                      {p.fullName}
                    </h5>
                  </div>
                  <p className="text-[10px] sm:text-xs text-[#787774] dark:text-[#8E94A4] mt-0.5 font-mono tabular-nums">
                    {p.gender === 'MALE' ? t.male : t.female} • {p.age}y • ABHA: <span className="text-[#1F6C9F] dark:text-[#70B8FF]">{p.abhaId}</span> • MRN: {p.hospitalPatientId}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onPatientIdentified(p)}
                  className="px-3 py-1.5 min-h-[36px] bg-[#111111] dark:bg-[#F4F4F6] text-[#FFFFFF] dark:text-[#0D0F14] text-xs font-semibold rounded-md flex items-center gap-1 active:scale-95 transition-all cursor-pointer shrink-0"
                >
                  <span>{t.select_btn}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Walk-in Register Toggle & Form */}
      <div className="mt-auto pt-2 border-t border-[#EAEAEA] dark:border-[#232734] shrink-0">
        {!showQuickRegister ? (
          <button
            type="button"
            onClick={() => setShowQuickRegister(true)}
            className="w-full py-2.5 min-h-[44px] rounded-lg border border-dashed border-[#CCCCCC] dark:border-[#333A4D] hover:border-[#111111] dark:hover:border-[#F4F4F6] text-xs font-mono text-[#666666] dark:text-[#8E94A4] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{t.register_walkin}</span>
          </button>
        ) : (
          <form
            onSubmit={handleQuickRegister}
            className="p-3.5 sm:p-4 rounded-xl border border-[#EAEAEA] dark:border-[#232734] bg-[#FFFFFF] dark:bg-[#141720] space-y-3"
          >
            <div className="flex items-center justify-between border-b border-[#EAEAEA] dark:border-[#232734] pb-2">
              <h4 className="text-xs font-bold text-[#111111] dark:text-[#F4F4F6]">
                {t.register_walkin}
              </h4>
              <button
                type="button"
                onClick={() => setShowQuickRegister(false)}
                className="text-[10px] font-mono text-[#888888] hover:text-[#111111] dark:hover:text-[#F4F4F6]"
              >
                ✕ Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10px] font-mono text-[#787774] dark:text-[#8E94A4] mb-1">
                  {t.full_name} *
                </label>
                <input
                  type="text"
                  required
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="e.g. Vikas Sharma"
                  className="w-full px-2.5 py-1.5 min-h-[38px] rounded-md border border-[#EAEAEA] dark:border-[#232734] bg-[#F7F6F3] dark:bg-[#1A1D27] text-xs text-[#111111] dark:text-[#F4F4F6] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-mono text-[#787774] dark:text-[#8E94A4] mb-1">
                    {t.age} *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="120"
                    value={newAge}
                    onChange={(e) => setNewAge(e.target.value)}
                    className="w-full px-2.5 py-1.5 min-h-[38px] rounded-md border border-[#EAEAEA] dark:border-[#232734] bg-[#F7F6F3] dark:bg-[#1A1D27] text-xs text-[#111111] dark:text-[#F4F4F6] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-[#787774] dark:text-[#8E94A4] mb-1">
                    {t.gender} *
                  </label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 min-h-[38px] rounded-md border border-[#EAEAEA] dark:border-[#232734] bg-[#F7F6F3] dark:bg-[#1A1D27] text-xs text-[#111111] dark:text-[#F4F4F6] outline-none"
                  >
                    <option value="MALE">{t.male}</option>
                    <option value="FEMALE">{t.female}</option>
                    <option value="OTHER">{t.other}</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-[#787774] dark:text-[#8E94A4] mb-1">
                {t.mobile}
              </label>
              <input
                type="text"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="+91 98765 00000"
                className="w-full px-2.5 py-1.5 min-h-[38px] rounded-md border border-[#EAEAEA] dark:border-[#232734] bg-[#F7F6F3] dark:bg-[#1A1D27] text-xs text-[#111111] dark:text-[#F4F4F6] outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 min-h-[40px] bg-[#111111] dark:bg-[#F4F4F6] text-[#FFFFFF] dark:text-[#0D0F14] text-xs font-bold rounded-md hover:bg-[#222222] dark:hover:bg-[#EAEAEA] transition-colors cursor-pointer"
            >
              {t.submit_continue}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
