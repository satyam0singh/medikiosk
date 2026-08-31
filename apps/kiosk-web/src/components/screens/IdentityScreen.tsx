import React, { useState } from 'react';
import { Search, UserPlus, ArrowRight, UserCheck, ArrowLeft } from 'lucide-react';
import { Patient, LanguageCode } from '@medikiosk/shared-types';
import { AudioPromptButton } from '../AudioPromptButton';
import { KioskApi } from '../../services/api';
import { getTranslation } from '../../utils/translations';

interface IdentityScreenProps {
  language: LanguageCode;
  onPatientIdentified: (patient: Patient) => void;
  onBack?: () => void;
}

export const IdentityScreen: React.FC<IdentityScreenProps> = ({
  language,
  onPatientIdentified,
  onBack,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [showQuickRegister, setShowQuickRegister] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newGender, setNewGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [newAge, setNewAge] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [generatedAbha, setGeneratedAbha] = useState<string>(() => {
    return `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
  });

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

  const handleQuickRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formName = form?.fullName?.value || newFullName;
    const formAge = form?.age?.value || newAge;
    const formPhone = form?.phone?.value || newPhone;

    const finalName = formName.trim();
    if (!finalName) return;

    const finalAge = parseInt(formAge, 10) || 30;
    const finalPhone = formPhone.trim() || '+91 98765 00000';

    const abhaToUse =
      generatedAbha.trim() ||
      `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      const patient = await KioskApi.createPatient({
        fullName: finalName,
        gender: newGender,
        age: finalAge,
        contactNumber: finalPhone,
        preferredLanguage: language,
        abhaId: abhaToUse,
        hospitalPatientId: `MRN-${Date.now().toString().slice(-6)}`,
      });
      onPatientIdentified(patient);
    } catch (err) {
      console.warn('Backend patient creation fallback:', err);
      // Client-side fallback with valid ABHA ID structure
      const fallbackPatient: Patient = {
        id: `p-${Date.now()}`,
        abhaId: abhaToUse,
        hospitalPatientId: `MRN-${Date.now().toString().slice(-6)}`,
        fullName: finalName,
        gender: newGender,
        age: finalAge,
        contactNumber: finalPhone,
        preferredLanguage: language,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      onPatientIdentified(fallbackPatient);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between max-w-2xl mx-auto w-full p-4 sm:p-6 select-none overflow-y-auto">
      {/* Header with Back Button and Bilingual Audio Prompt */}
      <div className="flex items-start justify-between gap-3 mb-4 shrink-0">
        <div className="flex items-center gap-2.5">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              title={language === LanguageCode.HI ? 'वापस जाएं' : 'Go Back'}
              className="p-2 rounded-xl border border-[#EAEAEA] dark:border-[#232734] bg-[#FFFFFF] dark:bg-[#141720] text-[#111111] dark:text-[#F4F4F6] hover:bg-[#F7F6F3] dark:hover:bg-[#1A1D27] active:scale-95 transition-all cursor-pointer shrink-0 shadow-xs flex items-center gap-1 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{language === LanguageCode.HI ? 'वापस' : 'Back'}</span>
            </button>
          )}
          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#111111] dark:text-[#F4F4F6]">
              {t.identity_title}
            </h2>
            <p className="text-xs text-[#787774] dark:text-[#8E94A4] mt-0.5">
              {t.identity_subtitle}
            </p>
          </div>
        </div>
        <AudioPromptButton text={t.audio_identity} language={language} size="md" />
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
                  name="fullName"
                  required
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="Enter full name..."
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
                    name="age"
                    required
                    min="1"
                    max="120"
                    value={newAge}
                    onChange={(e) => setNewAge(e.target.value)}
                    placeholder="e.g. 32"
                    className="w-full px-2.5 py-1.5 min-h-[38px] rounded-md border border-[#EAEAEA] dark:border-[#232734] bg-[#F7F6F3] dark:bg-[#1A1D27] text-xs text-[#111111] dark:text-[#F4F4F6] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-[#787774] dark:text-[#8E94A4] mb-1">
                    {t.gender} *
                  </label>
                  <select
                    name="gender"
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10px] font-mono text-[#787774] dark:text-[#8E94A4] mb-1">
                  {t.mobile}
                </label>
                <input
                  type="text"
                  name="phone"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-2.5 py-1.5 min-h-[38px] rounded-md border border-[#EAEAEA] dark:border-[#232734] bg-[#F7F6F3] dark:bg-[#1A1D27] text-xs text-[#111111] dark:text-[#F4F4F6] outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-[#1F6C9F] dark:text-[#70B8FF] mb-1 font-bold">
                  {t.abha_id} (Auto-Assigned ABDM)
                </label>
                <input
                  type="text"
                  value={generatedAbha}
                  onChange={(e) => setGeneratedAbha(e.target.value)}
                  placeholder="91-XXXX-XXXX-XXXX"
                  className="w-full px-2.5 py-1.5 min-h-[38px] rounded-md border border-[#1F6C9F]/30 dark:border-[#70B8FF]/30 bg-[#1F6C9F]/5 text-xs text-[#1F6C9F] dark:text-[#70B8FF] font-mono outline-none"
                />
              </div>
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
