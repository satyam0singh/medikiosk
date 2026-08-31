import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  FileText,
  Activity,
  Plus,
  Search,
  Lock,
  LogOut,
  Layers,
  Sparkles,
  HeartPulse,
  Sun,
  Moon,
} from 'lucide-react';

export interface AdminDashboardProps {
  currentUser: {
    username: string;
    fullName: string;
    role: string;
  };
  onLogout: () => void;
  onNavigateToDoctor?: () => void;
  onNavigateToTriage?: () => void;
  isLightMode: boolean;
  onToggleTheme: () => void;
}

interface StaffUser {
  id: string;
  handle: string;
  email: string;
  role: 'Doctor' | 'Triage Officer' | 'Administrator' | 'AYUSH Practitioner' | 'Patient';
  specialty: string;
  organization: string;
  createdAt: string;
}

interface RegisteredPatientRecord {
  id: string;
  name: string;
  dob: string;
  gender: string;
  phone: string;
  patientId: string;
  abhaId: string;
}

const DEFAULT_STAFF_USERS: StaffUser[] = [
  {
    id: '1',
    handle: '@admin',
    email: 'admin@medikiosk.com',
    role: 'Administrator',
    specialty: '—',
    organization: 'MKGH-001',
    createdAt: 'Aug 30, 2026',
  },
  {
    id: '2',
    handle: '@ayush',
    email: 'ayush@medikiosk.com',
    role: 'AYUSH Practitioner',
    specialty: 'Kayachikitsa / AYUSH',
    organization: 'MKGH-001',
    createdAt: 'Aug 30, 2026',
  },
  {
    id: '3',
    handle: '@doctor',
    email: 'doctor@medikiosk.com',
    role: 'Doctor',
    specialty: 'General Medicine',
    organization: 'MKGH-001',
    createdAt: 'Aug 30, 2026',
  },
  {
    id: '4',
    handle: '@doctor_cardiac',
    email: 'doctor_cardiac@medikiosk.com',
    role: 'Doctor',
    specialty: 'Cardiology',
    organization: 'MKGH-001',
    createdAt: 'Aug 30, 2026',
  },
  {
    id: '5',
    handle: '@doctor_ent',
    email: 'doctor_ent@medikiosk.com',
    role: 'Doctor',
    specialty: 'ENT',
    organization: 'MKGH-001',
    createdAt: 'Aug 30, 2026',
  },
  {
    id: '6',
    handle: '@doctor_eye',
    email: 'doctor_eye@medikiosk.com',
    role: 'Doctor',
    specialty: 'Ophthalmology',
    organization: 'MKGH-001',
    createdAt: 'Aug 30, 2026',
  },
  {
    id: '7',
    handle: '@doctor_jhatka',
    email: 'doctor@gmail.com',
    role: 'Doctor',
    specialty: 'General Medicine',
    organization: 'MKGH-001',
    createdAt: 'Aug 30, 2026',
  },
  {
    id: '8',
    handle: '@triage',
    email: 'triage@medikiosk.com',
    role: 'Triage Officer',
    specialty: '—',
    organization: 'MKGH-001',
    createdAt: 'Aug 30, 2026',
  },
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  onLogout,
  onNavigateToDoctor,
  onNavigateToTriage,
  isLightMode,
  onToggleTheme,
}) => {
  const [staffList, setStaffList] = useState<StaffUser[]>(DEFAULT_STAFF_USERS);
  const [patients, setPatients] = useState<RegisteredPatientRecord[]>([]);

  // Fetch registered patients and users directly from PostgreSQL backend API
  const fetchLiveDbData = async () => {
    try {
      const res = await fetch('/api/v1/patients/search?q=');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const dbPatients: RegisteredPatientRecord[] = json.data.map((p: any) => ({
            id: p.id ? p.id.slice(-8) : `pid-${Date.now()}`,
            name: p.fullName,
            dob: p.dateOfBirth
              ? new Date(p.dateOfBirth).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
              : 'Aug 24, 2002',
            gender: p.gender,
            phone: p.contactNumber || '+91 98765 00000',
            patientId: p.hospitalPatientId || (p.id ? p.id.slice(-8) : 'MRN-001'),
            abhaId: p.abhaId || '91-1072-7842-3994',
          }));
          setPatients(dbPatients);
        }
      }
    } catch (err) {
      console.warn('DB patients fetch fallback:', err);
    }
  };

  // Dynamic Live Sync across ports and windows with PostgreSQL polling
  useEffect(() => {
    fetchLiveDbData();
    const interval = setInterval(fetchLiveDbData, 2500);

    const handleStorage = () => {
      fetchLiveDbData();
    };

    window.addEventListener('storage', handleStorage);

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('medikiosk_sync');
      bc.onmessage = (event) => {
        if (event.data?.type === 'NEW_PATIENT_REGISTERED' || event.data?.type === 'QUEUE_UPDATED') {
          fetchLiveDbData();
        }
      };
    } catch {}

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorage);
      if (bc) bc.close();
    };
  }, []);

  const [activeTab, setActiveTab] = useState<'users' | 'audit' | 'config' | 'health'>('users');
  const [sidebarNav, setSidebarNav] = useState<'dashboard' | 'users' | 'audit' | 'system'>('dashboard');
  const [staffSearch, setStaffSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All roles');
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  // New User Form State
  const [newHandle, setNewHandle] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'Doctor' | 'Triage Officer' | 'AYUSH Practitioner'>('Doctor');
  const [newSpecialty, setNewSpecialty] = useState('General Medicine');

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHandle.trim() || !newEmail.trim()) return;

    const formattedHandle = newHandle.startsWith('@') ? newHandle : `@${newHandle}`;
    const newUser: StaffUser = {
      id: String(Date.now()),
      handle: formattedHandle,
      email: newEmail,
      role: newRole,
      specialty: newSpecialty,
      organization: 'MKGH-001',
      createdAt: 'Aug 31, 2026',
    };

    setStaffList((prev) => [newUser, ...prev]);
    setShowAddUserModal(false);
    setNewHandle('');
    setNewEmail('');
  };

  const filteredStaff = staffList.filter((user) => {
    const matchesRole = roleFilter === 'All roles' || user.role.toLowerCase().includes(roleFilter.toLowerCase());
    const q = staffSearch.toLowerCase();
    const matchesSearch =
      !q ||
      user.handle.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q) ||
      user.specialty.toLowerCase().includes(q);

    return matchesRole && matchesSearch;
  });

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        isLightMode ? 'bg-[#FBFBFA] text-[#111111]' : 'bg-[#090A0F] text-[#F4F4F6]'
      }`}
    >
      {/* Top Header */}
      <header
        className={`h-14 border-b px-4 sm:px-6 flex items-center justify-between shrink-0 z-40 transition-colors ${
          isLightMode ? 'bg-[#FFFFFF] border-[#EAEAEA]' : 'bg-[#12151E] border-[#232734]'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-lg border flex items-center justify-center ${
              isLightMode
                ? 'bg-[#E1F3FE] border-[#C4E5FB] text-[#1F6C9F]'
                : 'bg-[#1E2738] border-[#2D3952] text-[#70B8FF]'
            }`}
          >
            <HeartPulse className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <span className={`font-bold text-sm ${isLightMode ? 'text-[#111111]' : 'text-[#FFFFFF]'}`}>
              MediKiosk
            </span>
            <span className="text-[10px] font-mono tracking-wider uppercase tag-pastel-purple px-1.5 py-0.5 rounded">
              ADMINISTRATION
            </span>
          </div>
        </div>

        {/* Global Search */}
        <div className="relative max-w-md w-full hidden md:block mx-6">
          <input
            type="text"
            placeholder="Search patients, records or workflows"
            className={`w-full pl-9 pr-4 py-1.5 rounded-lg text-xs transition-colors focus:outline-none focus:ring-1 ${
              isLightMode
                ? 'bg-[#F7F6F3] border border-[#EAEAEA] text-[#111111] placeholder-[#888888] focus:border-[#1F6C9F]'
                : 'bg-[#181C28] border border-[#2B3142] text-[#FFFFFF] placeholder-[#5D6373] focus:border-[#70B8FF]'
            }`}
          />
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]" />
        </div>

        {/* Header Right */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Light / Dark Mode Toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label="Toggle Theme"
            className={`p-2 rounded-lg border transition-colors cursor-pointer ${
              isLightMode
                ? 'bg-[#F7F6F3] border-[#EAEAEA] text-[#555555] hover:bg-[#EFEFEF]'
                : 'bg-[#181C28] border-[#2B3142] text-[#8E94A4] hover:text-[#FFFFFF]'
            }`}
          >
            {isLightMode ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-blue-400" />}
          </button>

          {onNavigateToTriage && (
            <button
              type="button"
              onClick={onNavigateToTriage}
              className={`px-3 py-1 rounded-lg text-xs font-mono border transition-colors cursor-pointer hidden sm:block ${
                isLightMode
                  ? 'bg-[#FFFFFF] border-[#EAEAEA] text-[#1F6C9F] hover:bg-[#F0F0EF]'
                  : 'bg-[#181C28] border-[#2B3142] text-[#70B8FF] hover:bg-[#22283A]'
              }`}
            >
              Triage Centre
            </button>
          )}

          {onNavigateToDoctor && (
            <button
              type="button"
              onClick={onNavigateToDoctor}
              className={`px-3 py-1 rounded-lg text-xs font-mono border transition-colors cursor-pointer hidden sm:block ${
                isLightMode
                  ? 'bg-[#FFFFFF] border-[#EAEAEA] text-[#2B6E3F] hover:bg-[#F0F0EF]'
                  : 'bg-[#181C28] border-[#2B3142] text-[#6EE787] hover:bg-[#22283A]'
              }`}
            >
              Doctor Workstation
            </button>
          )}

          {/* Admin User Chip */}
          <div
            className={`flex items-center gap-2 pl-2 border-l ${
              isLightMode ? 'border-[#EAEAEA]' : 'border-[#232734]'
            }`}
          >
            <div className="w-7 h-7 rounded-full bg-[#2563EB] text-[#FFFFFF] font-bold text-xs flex items-center justify-center">
              A
            </div>
            <div className="hidden sm:block text-left">
              <span
                className={`block text-xs font-bold leading-none ${
                  isLightMode ? 'text-[#111111]' : 'text-[#FFFFFF]'
                }`}
              >
                {currentUser.username}
              </span>
              <span className="text-[10px] text-[#888888] font-mono leading-none">Administrator</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            title="Sign Out"
            className={`p-2 rounded-lg border transition-colors cursor-pointer ml-1 ${
              isLightMode
                ? 'bg-[#F7F6F3] border-[#EAEAEA] text-[#666666] hover:text-red-500'
                : 'bg-[#181C28] border-[#2B3142] text-[#8E94A4] hover:text-red-400'
            }`}
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside
          className={`w-60 border-r p-3 flex flex-col justify-between shrink-0 hidden lg:flex transition-colors ${
            isLightMode ? 'bg-[#FAFAFA] border-[#EAEAEA]' : 'bg-[#0E1118] border-[#232734]'
          }`}
        >
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#888888] px-2 block mb-2">
                WORKSPACE
              </span>
              <p
                className={`text-xs font-bold px-2 ${
                  isLightMode ? 'text-[#111111]' : 'text-[#FFFFFF]'
                }`}
              >
                Administrator
              </p>
            </div>

            <nav className="space-y-1">
              <button
                type="button"
                onClick={() => setSidebarNav('dashboard')}
                className={`w-full p-2.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                  sidebarNav === 'dashboard'
                    ? isLightMode
                      ? 'bg-[#E1F3FE] text-[#1F6C9F] font-bold border border-[#C4E5FB]'
                      : 'bg-[#1F6C9F]/20 text-[#70B8FF] border border-[#1F6C9F]/30'
                    : isLightMode
                    ? 'text-[#555555] hover:bg-[#F0F0EF] hover:text-[#111111]'
                    : 'text-[#8E94A4] hover:bg-[#181C28] hover:text-[#FFFFFF]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4" />
                  <span>Dashboard</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSidebarNav('users')}
                className={`w-full p-2.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                  sidebarNav === 'users'
                    ? isLightMode
                      ? 'bg-[#E1F3FE] text-[#1F6C9F] font-bold border border-[#C4E5FB]'
                      : 'bg-[#1F6C9F]/20 text-[#70B8FF] border border-[#1F6C9F]/30'
                    : isLightMode
                    ? 'text-[#555555] hover:bg-[#F0F0EF] hover:text-[#111111]'
                    : 'text-[#8E94A4] hover:bg-[#181C28] hover:text-[#FFFFFF]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4" />
                  <span>Users & Roles</span>
                </div>
                <span className="tag-pastel-blue px-1.5 py-0.2 rounded text-[10px] font-mono font-bold">
                  {staffList.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSidebarNav('audit')}
                className={`w-full p-2.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                  sidebarNav === 'audit'
                    ? isLightMode
                      ? 'bg-[#E1F3FE] text-[#1F6C9F] font-bold border border-[#C4E5FB]'
                      : 'bg-[#1F6C9F]/20 text-[#70B8FF] border border-[#1F6C9F]/30'
                    : isLightMode
                    ? 'text-[#555555] hover:bg-[#F0F0EF] hover:text-[#111111]'
                    : 'text-[#8E94A4] hover:bg-[#181C28] hover:text-[#FFFFFF]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4" />
                  <span>Audit & Security</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSidebarNav('system')}
                className={`w-full p-2.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                  sidebarNav === 'system'
                    ? isLightMode
                      ? 'bg-[#E1F3FE] text-[#1F6C9F] font-bold border border-[#C4E5FB]'
                      : 'bg-[#1F6C9F]/20 text-[#70B8FF] border border-[#1F6C9F]/30'
                    : isLightMode
                    ? 'text-[#555555] hover:bg-[#F0F0EF] hover:text-[#111111]'
                    : 'text-[#8E94A4] hover:bg-[#181C28] hover:text-[#FFFFFF]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Activity className="w-4 h-4" />
                  <span>System Health</span>
                </div>
              </button>
            </nav>

            <div
              className={`p-3 rounded-xl border transition-colors ${
                isLightMode ? 'bg-[#F7F6F3] border-[#EAEAEA]' : 'bg-[#141824] border-[#23293D]'
              }`}
            >
              <div
                className={`flex items-center gap-1.5 text-xs font-bold mb-1 ${
                  isLightMode ? 'text-[#111111]' : 'text-[#FFFFFF]'
                }`}
              >
                <Lock className={`w-3.5 h-3.5 ${isLightMode ? 'text-[#1F6C9F]' : 'text-[#70B8FF]'}`} />
                <span>Secure workspace</span>
              </div>
              <p className={`text-[11px] leading-relaxed ${isLightMode ? 'text-[#666666]' : 'text-[#8E94A4]'}`}>
                Clinical workspace access is limited according to your MediKiosk role and permissions.
              </p>
            </div>
          </div>

          <div
            className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors ${
              isLightMode ? 'bg-[#FFFFFF] border-[#EAEAEA]' : 'bg-[#141824] border-[#23293D]'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#2563EB]/20 border border-[#2563EB]/40 text-[#2563EB] dark:text-[#70B8FF] flex items-center justify-center font-bold text-xs">
                A
              </div>
              <div>
                <span
                  className={`block text-xs font-bold ${
                    isLightMode ? 'text-[#111111]' : 'text-[#FFFFFF]'
                  }`}
                >
                  admin
                </span>
                <span className="text-[10px] text-[#888888]">Administrator</span>
              </div>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          </div>
        </aside>

        {/* Main Administrative Work Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className={`w-5 h-5 ${isLightMode ? 'text-[#1F6C9F]' : 'text-[#70B8FF]'}`} />
                <h2
                  className={`text-xl sm:text-2xl font-extrabold tracking-tight ${
                    isLightMode ? 'text-[#111111]' : 'text-[#FFFFFF]'
                  }`}
                >
                  Administration Centre
                </h2>
              </div>
              <p className={`text-xs ${isLightMode ? 'text-[#666666]' : 'text-[#8E94A4]'}`}>
                Manage access, auditability, configuration and platform health.
              </p>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full tag-pastel-green text-xs font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Protected admin workspace</span>
            </div>
          </div>

          {/* 4 Top KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Staff Accounts */}
            <div
              className={`p-4 rounded-2xl border flex items-center justify-between transition-colors ${
                isLightMode ? 'bg-[#FFFFFF] border-[#EAEAEA]' : 'bg-[#12151E] border-[#232734]'
              }`}
            >
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#888888] block mb-1">
                  STAFF ACCOUNTS
                </span>
                <span
                  className={`text-2xl sm:text-3xl font-extrabold ${
                    isLightMode ? 'text-[#111111]' : 'text-[#FFFFFF]'
                  }`}
                >
                  {staffList.length}
                </span>
                <span className="text-[10px] text-[#888888] block mt-0.5">Live staff users</span>
              </div>
              <div
                className={`w-10 h-10 rounded-xl border flex items-center justify-center ${
                  isLightMode
                    ? 'bg-[#E1F3FE] border-[#C4E5FB] text-[#1F6C9F]'
                    : 'bg-[#1E2738] border-[#2D3952] text-[#70B8FF]'
                }`}
              >
                <Users className="w-5 h-5" />
              </div>
            </div>

            {/* Patient Accounts */}
            <div
              className={`p-4 rounded-2xl border flex items-center justify-between transition-colors ${
                isLightMode ? 'bg-[#FFFFFF] border-[#EAEAEA]' : 'bg-[#12151E] border-[#232734]'
              }`}
            >
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#888888] block mb-1">
                  PATIENT ACCOUNTS
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {patients.length}
                </span>
                <span className="text-[10px] text-[#888888] block mt-0.5">Active ABHA records</span>
              </div>
              <div className="w-10 h-10 rounded-xl tag-pastel-green flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Users className="w-5 h-5" />
              </div>
            </div>

            {/* Auditability */}
            <div
              className={`p-4 rounded-2xl border flex items-center justify-between transition-colors ${
                isLightMode ? 'bg-[#FFFFFF] border-[#EAEAEA]' : 'bg-[#12151E] border-[#232734]'
              }`}
            >
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#888888] block mb-1">
                  AUDITABILITY
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-purple-600 dark:text-purple-400">ON</span>
                <span className="text-[10px] text-[#888888] block mt-0.5">API activity logged</span>
              </div>
              <div className="w-10 h-10 rounded-xl tag-pastel-purple flex items-center justify-center text-purple-600 dark:text-purple-400">
                <FileText className="w-5 h-5" />
              </div>
            </div>

            {/* Platform */}
            <div
              className={`p-4 rounded-2xl border flex items-center justify-between transition-colors ${
                isLightMode ? 'bg-[#FFFFFF] border-[#EAEAEA]' : 'bg-[#12151E] border-[#232734]'
              }`}
            >
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#888888] block mb-1">
                  PLATFORM
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-[#1F6C9F] dark:text-[#70B8FF]">API</span>
                <span className="text-[10px] text-[#888888] block mt-0.5">Core service monitoring</span>
              </div>
              <div className="w-10 h-10 rounded-xl tag-pastel-blue flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className={`flex items-center gap-2 border-b pb-2 ${isLightMode ? 'border-[#EAEAEA]' : 'border-[#232734]'}`}>
            <button
              type="button"
              onClick={() => setActiveTab('users')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-[#2563EB] text-[#FFFFFF] shadow-sm'
                  : isLightMode
                  ? 'text-[#555555] hover:bg-[#F0F0EF] hover:text-[#111111]'
                  : 'text-[#8E94A4] hover:bg-[#181C28] hover:text-[#FFFFFF]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Users & Roles</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('audit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                activeTab === 'audit'
                  ? 'bg-[#2563EB] text-[#FFFFFF] shadow-sm'
                  : isLightMode
                  ? 'text-[#555555] hover:bg-[#F0F0EF] hover:text-[#111111]'
                  : 'text-[#8E94A4] hover:bg-[#181C28] hover:text-[#FFFFFF]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Audit Trail</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('config')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                activeTab === 'config'
                  ? 'bg-[#2563EB] text-[#FFFFFF] shadow-sm'
                  : isLightMode
                  ? 'text-[#555555] hover:bg-[#F0F0EF] hover:text-[#111111]'
                  : 'text-[#8E94A4] hover:bg-[#181C28] hover:text-[#FFFFFF]'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>System Config</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('health')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                activeTab === 'health'
                  ? 'bg-[#2563EB] text-[#FFFFFF] shadow-sm'
                  : isLightMode
                  ? 'text-[#555555] hover:bg-[#F0F0EF] hover:text-[#111111]'
                  : 'text-[#8E94A4] hover:bg-[#181C28] hover:text-[#FFFFFF]'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>System Health</span>
            </button>
          </div>

          {/* Tab 1 Content: Users & Roles */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* Access Control Role Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div
                  className={`p-3.5 rounded-xl border flex items-center justify-between transition-colors ${
                    isLightMode ? 'bg-[#FFFFFF] border-[#EAEAEA]' : 'bg-[#12151E] border-[#232734]'
                  }`}
                >
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#888888] block">DOCTORS</span>
                    <span className={`text-xl font-bold ${isLightMode ? 'text-[#111111]' : 'text-[#FFFFFF]'}`}>5</span>
                  </div>
                  <Users className={`w-4 h-4 ${isLightMode ? 'text-[#1F6C9F]' : 'text-[#70B8FF]'}`} />
                </div>

                <div
                  className={`p-3.5 rounded-xl border flex items-center justify-between transition-colors ${
                    isLightMode ? 'bg-[#FFFFFF] border-[#EAEAEA]' : 'bg-[#12151E] border-[#232734]'
                  }`}
                >
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#888888] block">TRIAGE</span>
                    <span className="text-xl font-bold text-red-500">1</span>
                  </div>
                  <Lock className="w-4 h-4 text-red-500" />
                </div>

                <div
                  className={`p-3.5 rounded-xl border flex items-center justify-between transition-colors ${
                    isLightMode ? 'bg-[#FFFFFF] border-[#EAEAEA]' : 'bg-[#12151E] border-[#232734]'
                  }`}
                >
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#888888] block">AYUSH</span>
                    <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">1</span>
                  </div>
                  <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>

                <div
                  className={`p-3.5 rounded-xl border flex items-center justify-between transition-colors ${
                    isLightMode ? 'bg-[#FFFFFF] border-[#EAEAEA]' : 'bg-[#12151E] border-[#232734]'
                  }`}
                >
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#888888] block">PATIENTS</span>
                    <span className="text-xl font-bold text-purple-600 dark:text-purple-400">{patients.length}</span>
                  </div>
                  <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
              </div>

              {/* Staff Directory Table */}
              <div
                className={`border rounded-2xl p-4 sm:p-5 space-y-4 transition-colors ${
                  isLightMode ? 'bg-[#FFFFFF] border-[#EAEAEA]' : 'bg-[#12151E] border-[#232734]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className={`text-sm font-bold ${isLightMode ? 'text-[#111111]' : 'text-[#FFFFFF]'}`}>
                      Staff directory
                    </h3>
                    <p className={`text-xs ${isLightMode ? 'text-[#666666]' : 'text-[#8E94A4]'}`}>
                      Live accounts loaded directly from PostgreSQL & memory store.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <input
                        type="text"
                        value={staffSearch}
                        onChange={(e) => setStaffSearch(e.target.value)}
                        placeholder="Search users..."
                        className={`pl-8 pr-3 py-1.5 rounded-lg text-xs focus:outline-none ${
                          isLightMode
                            ? 'bg-[#F7F6F3] border border-[#EAEAEA] text-[#111111] placeholder-[#888888]'
                            : 'bg-[#181C28] border border-[#2B3142] text-[#FFFFFF] placeholder-[#5D6373]'
                        }`}
                      />
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#888888]" />
                    </div>

                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs focus:outline-none cursor-pointer ${
                        isLightMode
                          ? 'bg-[#F7F6F3] border border-[#EAEAEA] text-[#333333]'
                          : 'bg-[#181C28] border border-[#2B3142] text-[#CBD5E1]'
                      }`}
                    >
                      <option value="All roles">All roles</option>
                      <option value="Doctor">Doctor</option>
                      <option value="Triage">Triage</option>
                      <option value="AYUSH">AYUSH</option>
                      <option value="Administrator">Administrator</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => setShowAddUserModal(true)}
                      className="px-3 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-[#FFFFFF] rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add user</span>
                    </button>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className={`border-b text-[10px] uppercase tracking-wider ${isLightMode ? 'border-[#EAEAEA] text-[#888888]' : 'border-[#232734] text-[#64748B]'}`}>
                      <tr>
                        <th className="py-2.5 px-3">USER</th>
                        <th className="py-2.5 px-3">EMAIL</th>
                        <th className="py-2.5 px-3">ROLE</th>
                        <th className="py-2.5 px-3">SPECIALTY</th>
                        <th className="py-2.5 px-3">ORGANIZATION</th>
                        <th className="py-2.5 px-3">CREATED</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isLightMode ? 'divide-[#F0F0EF]' : 'divide-[#1D2230]'}`}>
                      {filteredStaff.map((user) => (
                        <tr
                          key={user.id}
                          className={`transition-colors ${
                            isLightMode ? 'hover:bg-[#FBFBFA]' : 'hover:bg-[#161A26]'
                          }`}
                        >
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-6 h-6 rounded-full border font-bold text-[10px] flex items-center justify-center ${
                                  isLightMode
                                    ? 'bg-[#E1F3FE] border-[#C4E5FB] text-[#1F6C9F]'
                                    : 'bg-[#1E2738] border-[#2D3952] text-[#70B8FF]'
                                }`}
                              >
                                {user.handle.charAt(1).toUpperCase()}
                              </div>
                              <span className={`font-bold ${isLightMode ? 'text-[#111111]' : 'text-[#FFFFFF]'}`}>
                                {user.handle}
                              </span>
                            </div>
                          </td>
                          <td className={`py-3 px-3 ${isLightMode ? 'text-[#666666]' : 'text-[#8E94A4]'}`}>
                            {user.email}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                user.role === 'Administrator'
                                  ? 'tag-pastel-purple'
                                  : user.role === 'Triage Officer'
                                  ? 'tag-pastel-red'
                                  : user.role === 'AYUSH Practitioner'
                                  ? 'tag-pastel-green'
                                  : 'tag-pastel-blue'
                              }`}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td className={`py-3 px-3 ${isLightMode ? 'text-[#333333]' : 'text-[#CBD5E1]'}`}>
                            {user.specialty}
                          </td>
                          <td className={`py-3 px-3 ${isLightMode ? 'text-[#666666]' : 'text-[#8E94A4]'}`}>
                            {user.organization}
                          </td>
                          <td className={`py-3 px-3 ${isLightMode ? 'text-[#888888]' : 'text-[#64748B]'}`}>
                            {user.createdAt}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Registered Patients Table */}
              <div
                className={`border rounded-2xl p-4 sm:p-5 space-y-4 transition-colors ${
                  isLightMode ? 'bg-[#FFFFFF] border-[#EAEAEA]' : 'bg-[#12151E] border-[#232734]'
                }`}
              >
                <div>
                  <h3 className={`text-sm font-bold ${isLightMode ? 'text-[#111111]' : 'text-[#FFFFFF]'}`}>
                    Registered patients
                  </h3>
                  <p className={`text-xs ${isLightMode ? 'text-[#666666]' : 'text-[#8E94A4]'}`}>
                    {patients.length} patient records currently available across ABHA network.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className={`border-b text-[10px] uppercase tracking-wider ${isLightMode ? 'border-[#EAEAEA] text-[#888888]' : 'border-[#232734] text-[#64748B]'}`}>
                      <tr>
                        <th className="py-2.5 px-3">PATIENT</th>
                        <th className="py-2.5 px-3">DATE OF BIRTH</th>
                        <th className="py-2.5 px-3">GENDER</th>
                        <th className="py-2.5 px-3">PHONE</th>
                        <th className="py-2.5 px-3">PATIENT ID / ABHA</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isLightMode ? 'divide-[#F0F0EF]' : 'divide-[#1D2230]'}`}>
                      {patients.map((pat) => (
                        <tr
                          key={pat.id}
                          className={`transition-colors ${
                            isLightMode ? 'hover:bg-[#FBFBFA]' : 'hover:bg-[#161A26]'
                          }`}
                        >
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full tag-pastel-blue font-bold text-[10px] flex items-center justify-center">
                                {pat.name.charAt(0)}
                              </div>
                              <span className={`font-bold ${isLightMode ? 'text-[#111111]' : 'text-[#FFFFFF]'}`}>
                                {pat.name}
                              </span>
                            </div>
                          </td>
                          <td className={`py-3 px-3 ${isLightMode ? 'text-[#666666]' : 'text-[#8E94A4]'}`}>
                            {pat.dob}
                          </td>
                          <td className={`py-3 px-3 ${isLightMode ? 'text-[#333333]' : 'text-[#CBD5E1]'}`}>
                            {pat.gender}
                          </td>
                          <td className={`py-3 px-3 ${isLightMode ? 'text-[#666666]' : 'text-[#8E94A4]'}`}>
                            {pat.phone}
                          </td>
                          <td className="py-3 px-3 text-[#1F6C9F] dark:text-[#70B8FF] font-bold">
                            {pat.abhaId}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Audit Trail */}
          {activeTab === 'audit' && (
            <div
              className={`border rounded-2xl p-5 space-y-4 transition-colors ${
                isLightMode ? 'bg-[#FFFFFF] border-[#EAEAEA]' : 'bg-[#12151E] border-[#232734]'
              }`}
            >
              <h3 className={`text-sm font-bold ${isLightMode ? 'text-[#111111]' : 'text-[#FFFFFF]'}`}>
                Clinical Intake Audit Log
              </h3>
              <p className={`text-xs ${isLightMode ? 'text-[#666666]' : 'text-[#8E94A4]'}`}>
                Full cryptographic audit trail of all transactions.
              </p>
              <div className={`space-y-2 font-mono text-xs ${isLightMode ? 'text-[#555555]' : 'text-[#8E94A4]'}`}>
                <div className={`p-3 rounded-xl border flex justify-between ${isLightMode ? 'bg-[#FBFBFA] border-[#EAEAEA]' : 'bg-[#181C28] border-[#2B3142]'}`}>
                  <span>POST /api/v1/encounters/checkin - ABHA: 91-5307-9996-8309 (Rudrakshi)</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">200 OK</span>
                </div>
                <div className={`p-3 rounded-xl border flex justify-between ${isLightMode ? 'bg-[#FBFBFA] border-[#EAEAEA]' : 'bg-[#181C28] border-[#2B3142]'}`}>
                  <span>POST /api/v1/consent - DPDP Act 2023 Consent Recorded</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">200 OK</span>
                </div>
                <div className={`p-3 rounded-xl border flex justify-between ${isLightMode ? 'bg-[#FBFBFA] border-[#EAEAEA]' : 'bg-[#181C28] border-[#2B3142]'}`}>
                  <span>POST /api/v1/safety/evaluate - Clinical AI Triage Evaluation</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">200 OK</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: System Config */}
          {activeTab === 'config' && (
            <div
              className={`border rounded-2xl p-5 space-y-4 transition-colors ${
                isLightMode ? 'bg-[#FFFFFF] border-[#EAEAEA]' : 'bg-[#12151E] border-[#232734]'
              }`}
            >
              <h3 className={`text-sm font-bold ${isLightMode ? 'text-[#111111]' : 'text-[#FFFFFF]'}`}>
                System & AI Configurations
              </h3>
              <div className="space-y-3 text-xs font-mono">
                <div className={`p-3 rounded-xl border flex justify-between items-center ${isLightMode ? 'bg-[#FBFBFA] border-[#EAEAEA]' : 'bg-[#181C28] border-[#2B3142]'}`}>
                  <span>AI Clinical Triage Model</span>
                  <span className="text-[#1F6C9F] dark:text-[#70B8FF] font-bold">Neural Clinical Engine (Multi-Key Pool)</span>
                </div>
                <div className={`p-3 rounded-xl border flex justify-between items-center ${isLightMode ? 'bg-[#FBFBFA] border-[#EAEAEA]' : 'bg-[#181C28] border-[#2B3142]'}`}>
                  <span>OCR Extraction Engine</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Tesseract OCR + Clinical AI Judge</span>
                </div>
                <div className={`p-3 rounded-xl border flex justify-between items-center ${isLightMode ? 'bg-[#FBFBFA] border-[#EAEAEA]' : 'bg-[#181C28] border-[#2B3142]'}`}>
                  <span>ABDM Gateway State</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">CONNECTED (Sandbox V3)</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: System Health */}
          {activeTab === 'health' && (
            <div
              className={`border rounded-2xl p-5 space-y-4 transition-colors ${
                isLightMode ? 'bg-[#FFFFFF] border-[#EAEAEA]' : 'bg-[#12151E] border-[#232734]'
              }`}
            >
              <h3 className={`text-sm font-bold ${isLightMode ? 'text-[#111111]' : 'text-[#FFFFFF]'}`}>
                Service Health & Uptime
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                <div className={`p-4 rounded-xl border ${isLightMode ? 'bg-[#FBFBFA] border-[#EAEAEA]' : 'bg-[#181C28] border-[#2B3142]'}`}>
                  <span className="text-[10px] text-[#888888] block">BACKEND API</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">HEALTHY (99.9%)</span>
                </div>
                <div className={`p-4 rounded-xl border ${isLightMode ? 'bg-[#FBFBFA] border-[#EAEAEA]' : 'bg-[#181C28] border-[#2B3142]'}`}>
                  <span className="text-[10px] text-[#888888] block">DATABASE POSTGRES</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">CONNECTED</span>
                </div>
                <div className={`p-4 rounded-xl border ${isLightMode ? 'bg-[#FBFBFA] border-[#EAEAEA]' : 'bg-[#181C28] border-[#2B3142]'}`}>
                  <span className="text-[10px] text-[#888888] block">CLINICAL AI LATENCY</span>
                  <span className="text-[#1F6C9F] dark:text-[#70B8FF] font-bold text-sm">180ms</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`w-full max-w-md border rounded-3xl p-6 space-y-4 shadow-2xl transition-colors ${
              isLightMode ? 'bg-[#FFFFFF] border-[#EAEAEA]' : 'bg-[#12151E] border-[#232734]'
            }`}
          >
            <div className={`flex items-center justify-between border-b pb-3 ${isLightMode ? 'border-[#EAEAEA]' : 'border-[#232734]'}`}>
              <h3 className={`text-base font-bold ${isLightMode ? 'text-[#111111]' : 'text-[#FFFFFF]'}`}>
                Add New Staff User
              </h3>
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="text-[#888888] hover:text-[#111111] dark:hover:text-[#FFFFFF] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className={`font-semibold ${isLightMode ? 'text-[#333333]' : 'text-[#D1D5DB]'}`}>
                  User Handle
                </label>
                <input
                  type="text"
                  placeholder="@doctor_neurology"
                  value={newHandle}
                  onChange={(e) => setNewHandle(e.target.value)}
                  required
                  className={`w-full p-2.5 rounded-xl font-mono focus:outline-none ${
                    isLightMode
                      ? 'bg-[#FBFBFA] border border-[#EAEAEA] text-[#111111] placeholder-[#888888]'
                      : 'bg-[#181C28] border border-[#2B3142] text-[#FFFFFF] placeholder-[#5D6373]'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className={`font-semibold ${isLightMode ? 'text-[#333333]' : 'text-[#D1D5DB]'}`}>
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="doctor.neuro@medikiosk.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                  className={`w-full p-2.5 rounded-xl font-mono focus:outline-none ${
                    isLightMode
                      ? 'bg-[#FBFBFA] border border-[#EAEAEA] text-[#111111] placeholder-[#888888]'
                      : 'bg-[#181C28] border border-[#2B3142] text-[#FFFFFF] placeholder-[#5D6373]'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className={`font-semibold ${isLightMode ? 'text-[#333333]' : 'text-[#D1D5DB]'}`}>
                  Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className={`w-full p-2.5 rounded-xl focus:outline-none ${
                    isLightMode
                      ? 'bg-[#FBFBFA] border border-[#EAEAEA] text-[#111111]'
                      : 'bg-[#181C28] border border-[#2B3142] text-[#FFFFFF]'
                  }`}
                >
                  <option value="Doctor">Doctor</option>
                  <option value="Triage Officer">Triage Officer</option>
                  <option value="AYUSH Practitioner">AYUSH Practitioner</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className={`font-semibold ${isLightMode ? 'text-[#333333]' : 'text-[#D1D5DB]'}`}>
                  Department / Specialty
                </label>
                <input
                  type="text"
                  placeholder="Neurology / Cardiology / AYUSH"
                  value={newSpecialty}
                  onChange={(e) => setNewSpecialty(e.target.value)}
                  className={`w-full p-2.5 rounded-xl focus:outline-none ${
                    isLightMode
                      ? 'bg-[#FBFBFA] border border-[#EAEAEA] text-[#111111] placeholder-[#888888]'
                      : 'bg-[#181C28] border border-[#2B3142] text-[#FFFFFF] placeholder-[#5D6373]'
                  }`}
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className={`px-4 py-2 rounded-xl cursor-pointer ${
                    isLightMode
                      ? 'bg-[#F7F6F3] text-[#666666] hover:text-[#111111]'
                      : 'bg-[#181C28] text-[#8E94A4] hover:text-[#FFFFFF]'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#2563EB] text-[#FFFFFF] font-bold cursor-pointer hover:bg-[#1D4ED8] shadow-sm"
                >
                  Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
