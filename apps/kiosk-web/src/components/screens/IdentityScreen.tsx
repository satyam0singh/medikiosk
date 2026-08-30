import React, { useState } from 'react';
import { Search, UserPlus, ArrowRight, UserCheck, Sparkles } from 'lucide-react';
import { Patient, LanguageCode } from '@medikiosk/shared-types';
import { AudioPromptButton } from '../AudioPromptButton';
import { KioskApi } from '../../services/api';

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

  const promptText =
    language === LanguageCode.HI
      ? 'कृपया अपना आभा नंबर, मोबाइल नंबर दर्ज करें या त्वरित डेमो मरीज चुनें।'
      : 'Please enter your ABHA number, mobile number, or select a demo patient to continue.';

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
            {language === LanguageCode.HI ? 'मरीज पहचान व सत्यापन' : 'Patient Identification'}
          </h2>
          <p className="text-xs text-[#787774] dark:text-[#8E94A4] mt-0.5">
            {language === LanguageCode.HI
              ? 'आभा संख्या, मोबाइल नंबर या त्वरित पंजीकरण द्वारा शुरू करें'
              : 'Search via ABHA ID, Mobile Number, or select a seeded record below'}
          </p>
        </div>
        <AudioPromptButton text={promptText} language={language} size="md" />
      </div>

      {/* 1-Tap Seeded Demo Cases with Dynamic Aspect Ratio */}
      <div className="p-3.5 sm:p-4 rounded-xl border border-[#EAEAEA] dark:border-[#232734] bg-[#F7F6F3] dark:bg-[#141720] mb-4 shrink-0">
        <div className="flex items-center gap-1.5 mb-2.5">
          <Sparkles className="w-3.5 h-3.5 text-[#1F6C9F] dark:text-[#70B8FF]" />
          <h4 className="text-[10px] font-mono uppercase tracking-wider text-[#555555] dark:text-[#9EA5B5]">
            {language === LanguageCode.HI ? 'त्वरित डेमो मरीज (1-टैप परीक्षण)' : '1-Tap Seeded Clinical Cases'}
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
                  {p.gender} • {p.age}y • <span className="text-[#1F6C9F] dark:text-[#70B8FF]">{p.abhaId}</span>
                </p>
              </div>
              <div className="w-7 h-7 rounded-md bg-[#111111] dark:bg-[#F4F4F6] text-[#FFFFFF] dark:text-[#0D0F14] flex items-center justify-center font-bold shrink-0">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Search Input Box */}
      <div className="relative mb-4 shrink-0">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#888888]">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={
            language === LanguageCode.HI
              ? 'आभा संख्या (ABHA ID), मोबाइल या नाम दर्ज करें...'
              : 'Enter ABHA ID (e.g. 91-4829-1029-4820), Mobile, or Name...'
          }
          className="w-full min-h-[46px] pl-10 pr-4 py-2.5 rounded-lg border border-[#EAEAEA] dark:border-[#232734] bg-[#FFFFFF] dark:bg-[#141720] text-[#111111] dark:text-[#F4F4F6] placeholder-[#999999] dark:placeholder-[#5D6373] text-xs font-medium outline-none focus:border-[#111111] dark:focus:border-[#F4F4F6] transition-colors"
        />
        {isSearching && (
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center">
            <div className="w-4 h-4 border-2 border-[#111111] dark:border-[#F4F4F6] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-2 mb-4">
          {searchResults.map((patient) => (
            <div
              key={patient.id}
              className="p-3 rounded-lg border border-[#EAEAEA] dark:border-[#232734] bg-[#FFFFFF] dark:bg-[#141720] flex items-center justify-between"
            >
              <div className="min-w-0 pr-2">
                <h5 className="font-bold text-xs text-[#111111] dark:text-[#F4F4F6] truncate">{patient.fullName}</h5>
                <p className="text-[11px] text-[#787774] dark:text-[#8E94A4] font-mono tabular-nums truncate">
                  {patient.gender} • {patient.age} yrs • ABHA:{' '}
                  <span className="text-[#1F6C9F] dark:text-[#70B8FF]">{patient.abhaId || 'N/A'}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => onPatientIdentified(patient)}
                className="px-3 py-1.5 min-h-[38px] bg-[#111111] dark:bg-[#F4F4F6] text-[#FFFFFF] dark:text-[#0D0F14] rounded-md font-medium text-xs flex items-center gap-1 active:scale-95 transition-all shrink-0"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>{language === LanguageCode.HI ? 'चयन करें' : 'Select'}</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Quick Registration Collapsible */}
      <div className="mt-auto pt-3 border-t border-[#EAEAEA] dark:border-[#232734]">
        <button
          type="button"
          onClick={() => setShowQuickRegister(!showQuickRegister)}
          className="text-xs font-mono uppercase tracking-wider text-[#555555] dark:text-[#8E94A4] hover:text-[#111111] dark:hover:text-[#FFFFFF] flex items-center gap-1.5 cursor-pointer py-1"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>
            {showQuickRegister
              ? language === LanguageCode.HI
                ? 'फॉर्म बंद करें'
                : 'Close Form'
              : language === LanguageCode.HI
              ? '+ नया मरीज त्वरित पंजीकरण'
              : '+ Register Walk-in Patient'}
          </span>
        </button>

        {showQuickRegister && (
          <form
            onSubmit={handleQuickRegister}
            className="mt-3 p-4 sm:p-5 rounded-xl border border-[#EAEAEA] dark:border-[#232734] bg-[#FFFFFF] dark:bg-[#141720] space-y-3"
          >
            <h4 className="font-bold text-xs text-[#111111] dark:text-[#F4F4F6]">
              {language === LanguageCode.HI ? 'नया मरीज विवरण' : 'Walk-in Patient Fast Registration'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-medium text-[#787774] dark:text-[#8E94A4] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="e.g. Amit Verma"
                  className="w-full p-2.5 rounded-md border border-[#EAEAEA] dark:border-[#232734] bg-[#FBFBFA] dark:bg-[#10121A] text-xs outline-none focus:border-[#111111] dark:focus:border-[#F4F4F6]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#787774] dark:text-[#8E94A4] mb-1">Age</label>
                <input
                  type="number"
                  required
                  value={newAge}
                  onChange={(e) => setNewAge(e.target.value)}
                  className="w-full p-2.5 rounded-md border border-[#EAEAEA] dark:border-[#232734] bg-[#FBFBFA] dark:bg-[#10121A] text-xs outline-none focus:border-[#111111] dark:focus:border-[#F4F4F6]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#787774] dark:text-[#8E94A4] mb-1">Gender</label>
                <select
                  value={newGender}
                  onChange={(e) => setNewGender(e.target.value as any)}
                  className="w-full p-2.5 rounded-md border border-[#EAEAEA] dark:border-[#232734] bg-[#FBFBFA] dark:bg-[#10121A] text-xs outline-none focus:border-[#111111] dark:focus:border-[#F4F4F6]"
                >
                  <option value="MALE">Male (पुरुष)</option>
                  <option value="FEMALE">Female (महिला)</option>
                  <option value="OTHER">Other (अन्य)</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#787774] dark:text-[#8E94A4] mb-1">Mobile Number</label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full p-2.5 rounded-md border border-[#EAEAEA] dark:border-[#232734] bg-[#FBFBFA] dark:bg-[#10121A] text-xs outline-none focus:border-[#111111] dark:focus:border-[#F4F4F6]"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-2.5 min-h-[44px] bg-[#111111] dark:bg-[#F4F4F6] text-[#FFFFFF] dark:text-[#0D0F14] rounded-md font-medium text-xs active:scale-95 transition-all mt-1 cursor-pointer"
            >
              {language === LanguageCode.HI ? 'पंजीकृत करें और आगे बढ़ें' : 'Register & Continue'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
