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

  // Demo synthetic patients for instant 1-tap testing
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <UserCheck className="w-8 h-8 text-teal-400" />
            <span>{language === LanguageCode.HI ? 'मरीज की पहचान' : 'Patient Identification'}</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {language === LanguageCode.HI
              ? 'आभा कार्ड, मोबाइल नंबर या अस्पताल पंजीकरण संख्या से खोजें'
              : 'Search via ABHA Health ID, Mobile Number, or MRN'}
          </p>
        </div>
        <AudioPromptButton text={promptText} language={language} />
      </div>

      {/* 1-Tap Quick Demo Selection Banner */}
      <div className="bg-gradient-to-r from-teal-950/60 via-slate-900 to-slate-900 border border-teal-500/30 rounded-3xl p-5 mb-8 shadow-xl">
        <div className="flex items-center gap-2 text-teal-300 font-bold text-sm mb-3">
          <Sparkles className="w-4 h-4 text-teal-400" />
          <span>{language === LanguageCode.HI ? 'त्वरित 1-टच डेमो मरीज चुनें:' : 'Quick 1-Touch Demo Selection:'}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {DEMO_PATIENTS.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSelectDemoPatient(p)}
              className="kiosk-card p-4 rounded-2xl bg-slate-800/90 hover:bg-teal-600/20 border border-slate-700 hover:border-teal-400 flex items-center justify-between text-left group"
            >
              <div>
                <h4 className="font-bold text-white text-base group-hover:text-teal-300">{p.fullName}</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  {p.gender} • {p.age} yrs • ABHA: <span className="font-mono text-teal-400">{p.abhaId}</span>
                </p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-teal-500/20 group-hover:bg-teal-500 flex items-center justify-center text-teal-300 group-hover:text-slate-950 transition-colors">
                <ArrowRight className="w-5 h-5" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Search Input Box */}
      <div className="bg-slate-850 border border-slate-700 rounded-3xl p-6 shadow-xl mb-6">
        <label className="block text-sm font-bold text-slate-300 mb-2">
          {language === LanguageCode.HI ? 'खोजें (आभा आईडी / मोबाइल नंबर / नाम)' : 'Search (ABHA ID / Phone / Name)'}
        </label>
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={language === LanguageCode.HI ? 'उदा. 9876543210 या Ramesh' : 'e.g. 91-4829-1029-4820 or Ramesh'}
            className="w-full bg-slate-900 border-2 border-slate-700 focus:border-teal-400 rounded-2xl py-4 pl-12 pr-4 text-white text-lg font-medium outline-none transition-colors"
          />
          <Search className="w-6 h-6 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        </div>

        {/* Search Results List */}
        {isSearching && <p className="text-xs text-teal-400 mt-3 animate-pulse">Searching patient records...</p>}
        {searchResults.length > 0 && (
          <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
            {searchResults.map((p) => (
              <button
                key={p.id}
                onClick={() => onPatientIdentified(p)}
                className="w-full p-4 rounded-xl bg-slate-900 hover:bg-teal-500/20 border border-slate-700 hover:border-teal-400 flex items-center justify-between text-left"
              >
                <div>
                  <h4 className="font-bold text-white">{p.fullName}</h4>
                  <p className="text-xs text-slate-400">
                    {p.gender} • {p.age} yrs • MRN: {p.hospitalPatientId} • ABHA: {p.abhaId || 'N/A'}
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-teal-400" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick Register New Patient Toggle */}
      <div className="bg-slate-850/60 border border-slate-800 rounded-3xl p-6">
        <button
          type="button"
          onClick={() => setShowQuickRegister(!showQuickRegister)}
          className="w-full flex items-center justify-between font-bold text-teal-300 text-sm hover:text-teal-200"
        >
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            <span>{language === LanguageCode.HI ? 'नया मरीज पंजीकरण करें (त्वरित पर्चा)' : 'Register New Patient (Quick Intake)'}</span>
          </div>
          <span>{showQuickRegister ? '▲' : '▼'}</span>
        </button>

        {showQuickRegister && (
          <form onSubmit={handleQuickRegister} className="mt-5 space-y-4 pt-4 border-t border-slate-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  {language === LanguageCode.HI ? 'पूरा नाम' : 'Full Name'} *
                </label>
                <input
                  type="text"
                  required
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="e.g. Ankit Sharma"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  {language === LanguageCode.HI ? 'लिंग' : 'Gender'}
                </label>
                <select
                  value={newGender}
                  onChange={(e) => setNewGender(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm"
                >
                  <option value="MALE">Male (पुरुष)</option>
                  <option value="FEMALE">Female (महिला)</option>
                  <option value="OTHER">Other (अन्य)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  {language === LanguageCode.HI ? 'आयु (वर्ष)' : 'Age (Years)'}
                </label>
                <input
                  type="number"
                  value={newAge}
                  onChange={(e) => setNewAge(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  {language === LanguageCode.HI ? 'मोबाइल नंबर' : 'Phone Number'}
                </label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              className="kiosk-btn w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold mt-2"
            >
              <span>{language === LanguageCode.HI ? 'पंजीकरण कर आगे बढ़ें' : 'Register & Proceed'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
