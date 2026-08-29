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

  const handleSelectDemoPatient = (demoPatient: Patient) => {
    onPatientIdentified(demoPatient);
  };

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

  return (
    <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-6">
      {/* Title & Prompt Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            {language === LanguageCode.HI ? 'मरीज पहचान व सत्यापन' : 'Patient Identification'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            {language === LanguageCode.HI
              ? 'आभा संख्या, मोबाइल नंबर या त्वरित पंजीकरण द्वारा शुरू करें'
              : 'Search via ABHA ID, Mobile Number, or select a seeded record below'}
          </p>
        </div>
        <AudioPromptButton text={promptText} language={language} size="md" />
      </div>

      {/* 1-Tap Fast Demo Card (SIH Evaluator Convenience) */}
      <div className="border border-teal-500/30 rounded-3xl p-6 bg-teal-500/10 mb-8 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <h4 className="text-xs font-black uppercase tracking-wider text-teal-700 dark:text-teal-300">
            {language === LanguageCode.HI ? 'त्वरित डेमो मरीज (1-टैप परीक्षण)' : '1-Tap Quick Demo (Seeded Clinical Test Cases)'}
          </h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {DEMO_PATIENTS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSelectDemoPatient(p)}
              className="p-4 rounded-2xl border border-teal-500/30 bg-white dark:bg-slate-900 hover:border-teal-500 flex items-center justify-between text-left transition-all active:scale-[0.98] shadow-sm hover:shadow-md"
            >
              <div>
                <h5 className="text-sm font-bold">{p.fullName}</h5>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {p.gender} • {p.age} yrs • <span className="font-mono text-teal-600 dark:text-teal-400">{p.abhaId}</span>
                </p>
              </div>
              <div className="w-8 h-8 rounded-xl bg-teal-500 text-slate-950 flex items-center justify-center font-bold">
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Search Input Box */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
          <Search className="w-5 h-5" />
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
          className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-medium text-sm sm:text-base outline-none focus:border-teal-500 shadow-sm"
        />
        {isSearching && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
            <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-3 mb-8">
          <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {language === LanguageCode.HI ? 'खोज परिणाम' : 'Search Results'}
          </h4>
          {searchResults.map((patient) => (
            <div
              key={patient.id}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between shadow-sm"
            >
              <div>
                <h5 className="font-bold text-slate-900 dark:text-white">{patient.fullName}</h5>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {patient.gender} • {patient.age} yrs • ABHA: <span className="font-mono text-teal-600 dark:text-teal-400">{patient.abhaId || 'N/A'}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => onPatientIdentified(patient)}
                className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all"
              >
                <UserCheck className="w-4 h-4" />
                <span>{language === LanguageCode.HI ? 'चयन करें' : 'Select'}</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Quick Registration Collapsible */}
      <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setShowQuickRegister(!showQuickRegister)}
          className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1.5"
        >
          <UserPlus className="w-4 h-4" />
          <span>
            {showQuickRegister
              ? (language === LanguageCode.HI ? 'पंजीकरण फॉर्म बंद करें' : 'Close Registration Form')
              : (language === LanguageCode.HI ? 'नया मरीज त्वरित पंजीकरण करें (+)' : 'Register New Walk-in Patient (+)')}
          </span>
        </button>

        {showQuickRegister && (
          <form onSubmit={handleQuickRegister} className="mt-4 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-md">
            <h4 className="font-bold text-sm">
              {language === LanguageCode.HI ? 'नया मरीज विवरण' : 'New Patient Fast Registration'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Full Name (पूरा नाम)</label>
                <input
                  type="text"
                  required
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="e.g. Amit Verma"
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Age (आयु)</label>
                <input
                  type="number"
                  required
                  value={newAge}
                  onChange={(e) => setNewAge(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Gender (लिंग)</label>
                <select
                  value={newGender}
                  onChange={(e) => setNewGender(e.target.value as any)}
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm outline-none focus:border-teal-500"
                >
                  <option value="MALE">Male (पुरुष)</option>
                  <option value="FEMALE">Female (महिला)</option>
                  <option value="OTHER">Other (अन्य)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Mobile Number (मोबाइल)</label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm outline-none focus:border-teal-500"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-3.5 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl font-bold text-sm shadow-md active:scale-95 transition-all"
            >
              {language === LanguageCode.HI ? 'पंजीकृत करें और आगे बढ़ें' : 'Register & Continue'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
