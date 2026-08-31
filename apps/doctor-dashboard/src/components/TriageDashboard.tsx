import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  Search,
  Layers,
  Clock,
  User,
  Shield,
  LogOut,
  Bell,
  Check,
  Send,
  ChevronRight,
  HeartPulse,
  Sun,
  Moon,
} from 'lucide-react';
import { RedFlagAlert } from '@medikiosk/shared-types';

export interface TriageDashboardProps {
  currentUser: {
    username: string;
    fullName: string;
    role: string;
  };
  onLogout: () => void;
  onNavigateToDoctor?: () => void;
  isLightMode: boolean;
  onToggleTheme: () => void;
}

export interface TriageSafetyAlert extends RedFlagAlert {
  patientName?: string;
  patientGender?: string;
  patientAbha?: string;
  department?: string;
  status?: 'ACTIVE' | 'ACKNOWLEDGED' | 'ESCALATED' | 'RESOLVED';
  escalatedTo?: string;
  resolutionNote?: string;
}

export const TriageDashboard: React.FC<TriageDashboardProps> = ({
  currentUser,
  onLogout,
  onNavigateToDoctor,
  isLightMode,
  onToggleTheme,
}) => {
  const [alerts, setAlerts] = useState<TriageSafetyAlert[]>([]);

  const [selectedAlertId, setSelectedAlertId] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<'All' | 'Active' | 'Acknowledged' | 'Escalated' | 'Resolved'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarTab, setSidebarTab] = useState<'dashboard' | 'alerts' | 'red_flag'>('dashboard');

  const fetchDbAlerts = async () => {
    try {
      const res = await fetch('/api/v1/safety/alerts');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const mapped: TriageSafetyAlert[] = json.data.map((r: any) => ({
            id: r.id,
            encounterId: r.encounterId,
            patientId: r.patientId,
            patientName: r.patientName || 'Emergency Patient',
            patientGender: r.patientGender || 'UNKNOWN',
            patientAbha: r.patientAbha || 'N/A',
            department: r.department || 'Emergency / Cardiology',
            ruleId: r.ruleId || 'rf_chest_pain_severe',
            severity: r.severity || 'CRITICAL_EMERGENCY',
            alertMessage: r.alertMessage || 'Emergency Triage Alert Triggered',
            timestamp: r.createdAt ? new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
            isAcknowledged: Boolean(r.isAcknowledged),
            status: r.isAcknowledged ? 'ACKNOWLEDGED' : 'ACTIVE',
            triggerFacts: Array.isArray(r.triggerFacts) ? r.triggerFacts : [],
          }));
          setAlerts(mapped);
          if (mapped.length > 0) {
            setSelectedAlertId((prev) => (prev && mapped.some((m) => m.id === prev) ? prev : mapped[0].id));
          }
        }
      }
    } catch (err) {
      console.warn('Error polling triage alerts from PostgreSQL:', err);
    }
  };

  useEffect(() => {
    fetchDbAlerts();
    const interval = setInterval(fetchDbAlerts, 3500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let bcTriage: BroadcastChannel | null = null;
    let bcSync: BroadcastChannel | null = null;
    try {
      bcTriage = new BroadcastChannel('medikiosk_triage_alerts');
      bcTriage.onmessage = () => {
        fetchDbAlerts();
      };

      bcSync = new BroadcastChannel('medikiosk_sync');
      bcSync.onmessage = () => {
        fetchDbAlerts();
      };
    } catch {}

    return () => {
      if (bcTriage) bcTriage.close();
      if (bcSync) bcSync.close();
    };
  }, []);

  const filteredAlerts = alerts.filter((alert) => {
    const matchesFilter =
      activeFilter === 'All' ||
      (activeFilter === 'Active' && (!alert.status || alert.status === 'ACTIVE')) ||
      (activeFilter === 'Acknowledged' && alert.status === 'ACKNOWLEDGED') ||
      (activeFilter === 'Escalated' && alert.status === 'ESCALATED') ||
      (activeFilter === 'Resolved' && alert.status === 'RESOLVED');

    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      alert.patientName?.toLowerCase().includes(q) ||
      alert.ruleId?.toLowerCase().includes(q) ||
      alert.alertMessage?.toLowerCase().includes(q) ||
      alert.patientAbha?.toLowerCase().includes(q) ||
      alert.encounterId?.toLowerCase().includes(q);

    return matchesFilter && matchesSearch;
  });

  const selectedAlert = alerts.find((a) => a.id === selectedAlertId) || filteredAlerts[0] || alerts[0];

  const [showRedirectModal, setShowRedirectModal] = useState(false);
  const [redirectDoctor, setRedirectDoctor] = useState('Dr. Priya Nair');
  const [redirectDept, setRedirectDept] = useState('Cardiology');

  const handleAcknowledge = async (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'ACKNOWLEDGED', isAcknowledged: true } : a))
    );
    try {
      await fetch(`/api/v1/safety/alerts/${id}/acknowledge`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: '00000000-0000-0000-0000-000000000003' }),
      });
    } catch (err) {
      console.warn('Error acknowledging alert in DB:', err);
    }
  };

  const handleEscalateToDoctor = (id: string, doctorName = redirectDoctor, dept = redirectDept) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status: 'ESCALATED', escalatedTo: `${doctorName} (${dept})` }
          : a
      )
    );

    // Update patient in live queue dynamically
    try {
      const targetAlert = alerts.find((a) => a.id === id);
      const liveQueue = JSON.parse(localStorage.getItem('medikiosk_live_queue') || '[]');
      const updatedQueue = liveQueue.map((item: any) => {
        if (
          item.abhaId === targetAlert?.patientAbha ||
          item.encounterId === targetAlert?.encounterId ||
          item.fullName === targetAlert?.patientName
        ) {
          return {
            ...item,
            department: dept,
            assignedDoctor: doctorName,
            readiness: 'CRITICAL',
            hasRedFlag: true,
            status: 'CHECKED_IN',
          };
        }
        return item;
      });

      // If patient wasn't in queue, add them
      const exists = updatedQueue.some(
        (it: any) => it.abhaId === targetAlert?.patientAbha || it.encounterId === targetAlert?.encounterId
      );
      if (!exists && targetAlert) {
        updatedQueue.unshift({
          id: `pat-esc-${Date.now()}`,
          encounterId: targetAlert.encounterId,
          patientId: targetAlert.patientId,
          fullName: targetAlert.patientName || 'Emergency Patient',
          gender: targetAlert.patientGender || 'MALE',
          dob: 'Aug 24, 2002',
          age: 45,
          phone: '+91 98765 00000',
          abhaId: targetAlert.patientAbha || '91-4829-1029-4820',
          intakeDate: 'Aug 31, 2026',
          intakeTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          chiefComplaint: targetAlert.alertMessage || 'Emergency Triage Escalation',
          symptomLocation: 'Chest / Vital Organs',
          medicalHistory: ['Acute Clinical Emergency'],
          readiness: 'CRITICAL',
          status: 'CHECKED_IN',
          flagsCount: 1,
          department: dept,
          assignedDoctor: doctorName,
          questionnaireResponses: [
            {
              question: 'Triage Safety Alert Trigger',
              response: targetAlert.alertMessage,
              sourceType: 'AI_CLINICAL_JUDGE',
              confidence: 0.98,
            },
          ],
        });
      }

      localStorage.setItem('medikiosk_live_queue', JSON.stringify(updatedQueue));

      // Broadcast update
      const bc = new BroadcastChannel('medikiosk_sync');
      bc.postMessage({ type: 'QUEUE_UPDATED' });
      bc.close();
    } catch (e) {
      console.warn('Queue update failed:', e);
    }

    setShowRedirectModal(false);
  };

  const handleResolve = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status: 'RESOLVED',
              resolutionNote: 'Reviewed by Triage Officer. Vital signs stable, cleared for routine OPD.',
            }
          : a
      )
    );
  };

  const activeCount = alerts.filter((a) => !a.status || a.status === 'ACTIVE').length;
  const escalatedCount = alerts.filter((a) => a.status === 'ESCALATED').length;
  const resolvedCount = alerts.filter((a) => a.status === 'RESOLVED').length;
  const criticalCount = alerts.filter(
    (a) => a.severity === 'CRITICAL_EMERGENCY' && a.status !== 'RESOLVED'
  ).length;

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        isLightMode ? 'bg-[#FBFBFA] text-[#111111]' : 'bg-[#090A0F] text-[#F4F4F6]'
      }`}
    >
      {/* Top Main Navigation Bar */}
      <header
        className={`h-14 border-b px-4 sm:px-6 flex items-center justify-between shrink-0 z-40 transition-colors ${
          isLightMode ? 'bg-[#FFFFFF] border-[#EAEAEA]' : 'bg-[#12151E] border-[#232734]'
        }`}
      >
        {/* Brand */}
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
            <span className="text-[10px] font-mono tracking-wider uppercase tag-pastel-blue px-1.5 py-0.5 rounded">
              SAFETY / TRIAGE
            </span>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="relative max-w-md w-full hidden md:block mx-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patients, records or workflows"
            className={`w-full pl-9 pr-4 py-1.5 rounded-lg text-xs transition-colors focus:outline-none focus:ring-1 ${
              isLightMode
                ? 'bg-[#F7F6F3] border border-[#EAEAEA] text-[#111111] placeholder-[#888888] focus:border-[#1F6C9F]'
                : 'bg-[#181C28] border border-[#2B3142] text-[#FFFFFF] placeholder-[#5D6373] focus:border-[#70B8FF]'
            }`}
          />
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]" />
        </div>

        {/* Right Tools & User Info */}
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

          <button
            type="button"
            title="Notifications"
            className={`p-2 rounded-lg border transition-colors cursor-pointer ${
              isLightMode
                ? 'bg-[#F7F6F3] border-[#EAEAEA] text-[#555555] hover:bg-[#EFEFEF]'
                : 'bg-[#181C28] border-[#2B3142] text-[#8E94A4] hover:text-[#FFFFFF]'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
          </button>

          {/* User Profile Pill */}
          <div
            className={`flex items-center gap-2 pl-2 border-l ${
              isLightMode ? 'border-[#EAEAEA]' : 'border-[#232734]'
            }`}
          >
            <div className="w-7 h-7 rounded-full bg-[#2563EB] text-[#FFFFFF] font-bold text-xs flex items-center justify-center">
              {currentUser.username.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block text-left">
              <span
                className={`block text-xs font-bold leading-none ${
                  isLightMode ? 'text-[#111111]' : 'text-[#FFFFFF]'
                }`}
              >
                {currentUser.username}
              </span>
              <span className="text-[10px] text-[#888888] font-mono leading-none">Triage Officer</span>
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

      {/* Main Content Area */}
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
                Triage Officer
              </p>
            </div>

            <nav className="space-y-1">
              <button
                type="button"
                onClick={() => setSidebarTab('dashboard')}
                className={`w-full p-2.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                  sidebarTab === 'dashboard'
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
                <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
              </button>

              <button
                type="button"
                onClick={() => setSidebarTab('alerts')}
                className={`w-full p-2.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                  sidebarTab === 'alerts'
                    ? isLightMode
                      ? 'bg-[#E1F3FE] text-[#1F6C9F] font-bold border border-[#C4E5FB]'
                      : 'bg-[#1F6C9F]/20 text-[#70B8FF] border border-[#1F6C9F]/30'
                    : isLightMode
                    ? 'text-[#555555] hover:bg-[#F0F0EF] hover:text-[#111111]'
                    : 'text-[#8E94A4] hover:bg-[#181C28] hover:text-[#FFFFFF]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Bell className="w-4 h-4" />
                  <span>Active Alerts</span>
                </div>
                <span className="tag-pastel-red px-1.5 py-0.2 rounded text-[10px] font-mono font-bold">
                  {activeCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSidebarTab('red_flag')}
                className={`w-full p-2.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                  sidebarTab === 'red_flag'
                    ? isLightMode
                      ? 'bg-[#E1F3FE] text-[#1F6C9F] font-bold border border-[#C4E5FB]'
                      : 'bg-[#1F6C9F]/20 text-[#70B8FF] border border-[#1F6C9F]/30'
                    : isLightMode
                    ? 'text-[#555555] hover:bg-[#F0F0EF] hover:text-[#111111]'
                    : 'text-[#8E94A4] hover:bg-[#181C28] hover:text-[#FFFFFF]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-red-500" />
                  <span>Red Flag Queue</span>
                </div>
                <span className="tag-pastel-red px-1.5 py-0.2 rounded text-[10px] font-mono font-bold">
                  {criticalCount}
                </span>
              </button>
            </nav>

            {/* Secure Workspace Card */}
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
                <Shield className={`w-3.5 h-3.5 ${isLightMode ? 'text-[#1F6C9F]' : 'text-[#70B8FF]'}`} />
                <span>Secure workspace</span>
              </div>
              <p className={`text-[11px] leading-relaxed ${isLightMode ? 'text-[#666666]' : 'text-[#8E94A4]'}`}>
                Clinical workspace access is limited according to your MediKiosk role and permissions.
              </p>
            </div>
          </div>

          {/* Bottom Active User Card */}
          <div
            className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors ${
              isLightMode ? 'bg-[#FFFFFF] border-[#EAEAEA]' : 'bg-[#141824] border-[#23293D]'
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full border flex items-center justify-center font-bold text-xs ${
                  isLightMode
                    ? 'bg-[#E1F3FE] border-[#C4E5FB] text-[#1F6C9F]'
                    : 'bg-[#1F6C9F]/30 border-[#1F6C9F]/40 text-[#70B8FF]'
                }`}
              >
                T
              </div>
              <div>
                <span
                  className={`block text-xs font-bold ${
                    isLightMode ? 'text-[#111111]' : 'text-[#FFFFFF]'
                  }`}
                >
                  triage
                </span>
                <span className="text-[10px] text-[#888888]">Triage Officer</span>
              </div>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          </div>
        </aside>

        {/* Main Work Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ShieldAlert className="w-5 h-5 text-red-500" />
                <h2
                  className={`text-xl sm:text-2xl font-extrabold tracking-tight ${
                    isLightMode ? 'text-[#111111]' : 'text-[#FFFFFF]'
                  }`}
                >
                  Triage Command Centre
                </h2>
              </div>
              <p className={`text-xs ${isLightMode ? 'text-[#666666]' : 'text-[#8E94A4]'}`}>
                Monitor incoming safety alerts and coordinate clinical escalation.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full tag-pastel-green text-xs font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live • Updated {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </span>

              {onNavigateToDoctor && (
                <button
                  type="button"
                  onClick={onNavigateToDoctor}
                  className={`px-3 py-1.5 border rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors ${
                    isLightMode
                      ? 'bg-[#111111] text-[#FFFFFF] border-[#111111] hover:bg-[#222222]'
                      : 'bg-[#1E2738] hover:bg-[#28354D] border-[#2D3952] text-[#70B8FF]'
                  }`}
                >
                  <span>Doctor OPD Queue</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* 4 Metric KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Active Alerts */}
            <div
              className={`p-4 rounded-2xl border flex items-center justify-between transition-colors ${
                isLightMode ? 'bg-[#FFFFFF] border-[#EAEAEA]' : 'bg-[#12151E] border-[#232734]'
              }`}
            >
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#888888] block mb-1">
                  ACTIVE ALERTS
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-red-500">{activeCount}</span>
                <span className="text-[10px] text-[#888888] block mt-0.5">Awaiting triage action</span>
              </div>
              <div className="w-10 h-10 rounded-xl tag-pastel-red flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>

            {/* Escalated */}
            <div
              className={`p-4 rounded-2xl border flex items-center justify-between transition-colors ${
                isLightMode ? 'bg-[#FFFFFF] border-[#EAEAEA]' : 'bg-[#12151E] border-[#232734]'
              }`}
            >
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#888888] block mb-1">
                  ESCALATED
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-purple-600 dark:text-purple-400">
                  {escalatedCount}
                </span>
                <span className="text-[10px] text-[#888888] block mt-0.5">Transferred for attention</span>
              </div>
              <div className="w-10 h-10 rounded-xl tag-pastel-purple flex items-center justify-center text-purple-600 dark:text-purple-400">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>

            {/* Resolved */}
            <div
              className={`p-4 rounded-2xl border flex items-center justify-between transition-colors ${
                isLightMode ? 'bg-[#FFFFFF] border-[#EAEAEA]' : 'bg-[#12151E] border-[#232734]'
              }`}
            >
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#888888] block mb-1">
                  RESOLVED
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {resolvedCount}
                </span>
                <span className="text-[10px] text-[#888888] block mt-0.5">Closed alerts</span>
              </div>
              <div className="w-10 h-10 rounded-xl tag-pastel-green flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            {/* Critical */}
            <div
              className={`p-4 rounded-2xl border flex items-center justify-between transition-colors ${
                isLightMode ? 'bg-[#FFFFFF] border-[#EAEAEA]' : 'bg-[#12151E] border-[#232734]'
              }`}
            >
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#888888] block mb-1">
                  CRITICAL
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400">
                  {criticalCount}
                </span>
                <span className="text-[10px] text-[#888888] block mt-0.5">Highest priority</span>
              </div>
              <div className="w-10 h-10 rounded-xl tag-pastel-red flex items-center justify-center text-rose-600 dark:text-rose-400">
                <Layers className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Safety Alert Queue Section */}
          <div className="space-y-3">
            {/* Header & Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h3
                  className={`text-base font-bold ${
                    isLightMode ? 'text-[#111111]' : 'text-[#FFFFFF]'
                  }`}
                >
                  Safety alert queue
                </h3>
                <span className="tag-pastel-red px-2 py-0.5 rounded-full text-xs font-mono font-bold">
                  {filteredAlerts.length}
                </span>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto">
                {(['All', 'Active', 'Acknowledged', 'Escalated', 'Resolved'] as const).map((filterName) => (
                  <button
                    key={filterName}
                    type="button"
                    onClick={() => setActiveFilter(filterName)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                      activeFilter === filterName
                        ? 'bg-[#2563EB] text-[#FFFFFF] font-bold shadow-sm'
                        : isLightMode
                        ? 'bg-[#FFFFFF] text-[#555555] hover:text-[#111111] border border-[#EAEAEA]'
                        : 'bg-[#181C28] text-[#8E94A4] hover:text-[#FFFFFF] border border-[#2B3142]'
                    }`}
                  >
                    {filterName}
                  </button>
                ))}
              </div>
            </div>

            {/* Split Screen Queue & Alert Inspector */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              {/* Left Column: List of Alert Cards */}
              <div className="lg:col-span-5 space-y-2">
                {filteredAlerts.length === 0 ? (
                  <div
                    className={`p-8 rounded-2xl border text-center space-y-2 ${
                      isLightMode ? 'bg-[#FFFFFF] border-[#EAEAEA]' : 'bg-[#12151E] border-[#232734]'
                    }`}
                  >
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                    <h4
                      className={`text-sm font-bold ${
                        isLightMode ? 'text-[#111111]' : 'text-[#FFFFFF]'
                      }`}
                    >
                      No alerts in this view
                    </h4>
                    <p className={`text-xs ${isLightMode ? 'text-[#666666]' : 'text-[#8E94A4]'}`}>
                      All clinical safety signals are currently addressed.
                    </p>
                  </div>
                ) : (
                  filteredAlerts.map((alert) => {
                    const isSelected = alert.id === selectedAlert?.id;
                    const isCrit = alert.severity === 'CRITICAL_EMERGENCY';

                    return (
                      <button
                        key={alert.id}
                        type="button"
                        onClick={() => setSelectedAlertId(alert.id)}
                        className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer relative ${
                          isSelected
                            ? isLightMode
                              ? 'bg-[#F0F7FF] border-[#2563EB] shadow-md'
                              : 'bg-[#181D2A] border-[#3B82F6] shadow-lg shadow-blue-900/20'
                            : isLightMode
                            ? 'bg-[#FFFFFF] border-[#EAEAEA] hover:border-[#D0D0D0]'
                            : 'bg-[#12151E] border-[#232734] hover:border-[#3A4259]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg tag-pastel-red">
                              <AlertTriangle className="w-4 h-4" />
                            </div>
                            <div>
                              <h4
                                className={`text-xs font-bold leading-snug ${
                                  isLightMode ? 'text-[#111111]' : 'text-[#FFFFFF]'
                                }`}
                              >
                                Red flag detected: {alert.ruleId?.replace('rf_', '').replace('_', ' ') || 'chest pain'}
                              </h4>
                              <p className={`text-[11px] font-mono ${isLightMode ? 'text-[#666666]' : 'text-[#8E94A4]'}`}>
                                Patient: {alert.patientName || 'Intake Patient'}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-[#888888] shrink-0" />
                        </div>

                        {/* Status Badges */}
                        <div className="flex items-center gap-1.5 mb-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                              isCrit ? 'tag-pastel-red font-bold' : 'tag-pastel-yellow'
                            }`}
                          >
                            {alert.severity || 'CRITICAL'}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase ${
                              alert.status === 'RESOLVED'
                                ? 'tag-pastel-green'
                                : alert.status === 'ESCALATED'
                                ? 'tag-pastel-purple'
                                : alert.status === 'ACKNOWLEDGED'
                                ? 'tag-pastel-blue'
                                : 'tag-pastel-red'
                            }`}
                          >
                            {alert.status || 'ACTIVE'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-[#888888] font-mono">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>
                              {alert.createdAt
                                ? !isNaN(new Date(alert.createdAt).getTime())
                                  ? new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                  : alert.createdAt
                                : (alert as any).timestamp || 'Just now'}
                            </span>
                          </div>
                          <span>Session: {alert.encounterId?.slice(0, 8)}...</span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Right Column: Detailed Alert Viewer & Action Box */}
              {selectedAlert && (
                <div
                  className={`lg:col-span-7 space-y-4 border rounded-2xl p-5 sm:p-6 transition-colors ${
                    isLightMode ? 'bg-[#FFFFFF] border-[#EAEAEA]' : 'bg-[#12151E] border-[#232734]'
                  }`}
                >
                  {/* Alert Header */}
                  <div className={`border-b pb-4 ${isLightMode ? 'border-[#EAEAEA]' : 'border-[#232734]'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="tag-pastel-red px-2.5 py-0.5 rounded text-[10px] font-mono font-bold">
                        {selectedAlert.severity || 'CRITICAL'}
                      </span>
                      <span className="tag-pastel-red px-2.5 py-0.5 rounded text-[10px] font-mono uppercase">
                        {selectedAlert.status || 'ACTIVE'}
                      </span>
                    </div>

                    <h3
                      className={`text-lg font-bold mb-1 ${
                        isLightMode ? 'text-[#111111]' : 'text-[#FFFFFF]'
                      }`}
                    >
                      Red flag detected: {selectedAlert.ruleId?.replace('rf_', '').replace('_', ' ') || 'chest pain'}
                    </h3>
                    <p className={`text-xs font-mono ${isLightMode ? 'text-[#666666]' : 'text-[#8E94A4]'}`}>
                      {selectedAlert.createdAt && !isNaN(new Date(selectedAlert.createdAt).getTime())
                        ? new Date(selectedAlert.createdAt).toLocaleString()
                        : (selectedAlert as any).timestamp || 'Aug 31, 2026'} • Session: {selectedAlert.encounterId}
                    </p>
                  </div>

                  {/* Patient Context Box */}
                  <div
                    className={`p-4 rounded-xl border space-y-3 ${
                      isLightMode ? 'bg-[#FBFBFA] border-[#EAEAEA]' : 'bg-[#181C28] border-[#2B3142]'
                    }`}
                  >
                    <div
                      className={`flex items-center gap-2 text-xs font-bold ${
                        isLightMode ? 'text-[#111111]' : 'text-[#FFFFFF]'
                      }`}
                    >
                      <User className={`w-4 h-4 ${isLightMode ? 'text-[#1F6C9F]' : 'text-[#70B8FF]'}`} />
                      <span>Patient context</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-[#888888] block">PATIENT</span>
                        <strong className={`text-sm ${isLightMode ? 'text-[#111111]' : 'text-[#FFFFFF]'}`}>
                          {selectedAlert.patientName || 'Intake Patient'}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase text-[#888888] block">GENDER</span>
                        <span className={`font-mono ${isLightMode ? 'text-[#111111]' : 'text-[#FFFFFF]'}`}>
                          {selectedAlert.patientGender || 'MALE'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase text-[#888888] block">PATIENT ID / ABHA</span>
                        <span className="text-[#1F6C9F] dark:text-[#70B8FF] font-mono font-bold">
                          {selectedAlert.patientAbha || '91-4829-1029-4820'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase text-[#888888] block">ENCOUNTER ID</span>
                        <span className="text-[#888888] font-mono truncate block">{selectedAlert.encounterId}</span>
                      </div>
                    </div>
                  </div>

                  {/* Clinical Priority & Rule Details */}
                  <div className="p-4 rounded-xl tag-pastel-red space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold">
                      <AlertTriangle className="w-4 h-4" />
                      <span>CLINICAL PRIORITY: Immediate attention required</span>
                    </div>
                    <p className="text-xs leading-relaxed">{selectedAlert.alertMessage}</p>
                    <div className="text-[10px] font-mono">
                      Configured Red-Flag Rule: <code className="px-1 py-0.5 rounded font-bold">{selectedAlert.ruleId}</code>
                    </div>
                  </div>

                  {/* Event Trigger Facts */}
                  <div
                    className={`p-4 rounded-xl border space-y-2 ${
                      isLightMode ? 'bg-[#FBFBFA] border-[#EAEAEA]' : 'bg-[#181C28] border-[#2B3142]'
                    }`}
                  >
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#888888] block">
                      TRIGGER FACTS & CLINICAL EVIDENCE
                    </span>
                    <div className="space-y-1.5">
                      {selectedAlert.triggerFacts?.map((fact, i) => (
                        <div
                          key={i}
                          className={`flex items-center justify-between p-2 rounded-lg border text-xs font-mono ${
                            isLightMode
                              ? 'bg-[#FFFFFF] border-[#EAEAEA]'
                              : 'bg-[#12151E] border-[#232734]'
                          }`}
                        >
                          <span className={isLightMode ? 'text-[#555555]' : 'text-[#8E94A4]'}>{fact.field}</span>
                          <span className="text-[#1F6C9F] dark:text-[#70B8FF] font-bold">{String(fact.value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Triage Actions */}
                  <div className="pt-2 flex flex-wrap gap-2.5">
                    {selectedAlert.status !== 'ACKNOWLEDGED' && selectedAlert.status !== 'RESOLVED' && (
                      <button
                        type="button"
                        onClick={() => handleAcknowledge(selectedAlert.id)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                          isLightMode
                            ? 'bg-[#111111] text-[#FFFFFF] hover:bg-[#222222]'
                            : 'bg-[#1E2738] hover:bg-[#28354D] border border-[#2D3952] text-[#FFFFFF]'
                        }`}
                      >
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Acknowledge Alert</span>
                      </button>
                    )}

                    {selectedAlert.status !== 'ESCALATED' && selectedAlert.status !== 'RESOLVED' && (
                      <button
                        type="button"
                        onClick={() => setShowRedirectModal(true)}
                        className="px-4 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-[#FFFFFF] rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-md"
                      >
                        <Send className="w-4 h-4" />
                        <span>Escalate & Redirect to Doctor</span>
                      </button>
                    )}

                    {selectedAlert.status !== 'RESOLVED' && (
                      <button
                        type="button"
                        onClick={() => handleResolve(selectedAlert.id)}
                        className="px-4 py-2.5 tag-pastel-green rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Dismiss / Resolve Alert</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Specialist Redirection & Escalation Modal */}
      {showRedirectModal && selectedAlert && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`w-full max-w-md border rounded-3xl p-6 space-y-4 shadow-2xl transition-colors ${
              isLightMode ? 'bg-[#FFFFFF] border-[#EAEAEA]' : 'bg-[#12151E] border-[#232734]'
            }`}
          >
            <div className={`flex items-center justify-between border-b pb-3 ${isLightMode ? 'border-[#EAEAEA]' : 'border-[#232734]'}`}>
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-[#2563EB]" />
                <h3 className={`text-base font-bold ${isLightMode ? 'text-[#111111]' : 'text-[#FFFFFF]'}`}>
                  Escalate & Route Patient
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRedirectModal(false)}
                className="text-[#888888] hover:text-[#111111] dark:hover:text-[#FFFFFF] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className={`p-3 rounded-xl border ${isLightMode ? 'bg-[#FBFBFA] border-[#EAEAEA]' : 'bg-[#181C28] border-[#2B3142]'}`}>
                <span className="text-[10px] text-[#888888] uppercase block font-mono">PATIENT INTAKE</span>
                <strong className={`text-sm ${isLightMode ? 'text-[#111111]' : 'text-[#FFFFFF]'}`}>
                  {selectedAlert.patientName} ({selectedAlert.patientAbha})
                </strong>
                <p className="text-red-500 font-semibold mt-1">{selectedAlert.alertMessage}</p>
              </div>

              <div className="space-y-1.5">
                <label className={`font-semibold block ${isLightMode ? 'text-[#333333]' : 'text-[#D1D5DB]'}`}>
                  Select Destination Department & Doctor
                </label>
                <div className="space-y-2">
                  {[
                    { doc: 'Dr. Priya Nair', dept: 'Cardiology', room: 'Room #02' },
                    { doc: 'Dr. Rajesh Sharma', dept: 'General Medicine', room: 'Room #04' },
                    { doc: 'Dr. Anand Vaidya', dept: 'Kayachikitsa / AYUSH', room: 'Room #07' },
                    { doc: 'Dr. Suresh Menon', dept: 'Orthopedics', room: 'Room #05' },
                    { doc: 'Dr. Vikram Patel', dept: 'Pulmonology', room: 'Room #03' },
                  ].map((option) => (
                    <button
                      key={option.doc}
                      type="button"
                      onClick={() => {
                        setRedirectDoctor(option.doc);
                        setRedirectDept(option.dept);
                      }}
                      className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-colors cursor-pointer ${
                        redirectDoctor === option.doc
                          ? 'bg-[#2563EB]/10 border-[#2563EB] text-[#2563EB]'
                          : isLightMode
                          ? 'bg-[#FFFFFF] border-[#EAEAEA] text-[#111111] hover:bg-[#F7F6F3]'
                          : 'bg-[#181C28] border-[#2B3142] text-[#FFFFFF] hover:bg-[#22283A]'
                      }`}
                    >
                      <div>
                        <strong className="block text-xs">{option.doc}</strong>
                        <span className="text-[10px] text-[#888888]">{option.dept} • {option.room}</span>
                      </div>
                      {redirectDoctor === option.doc && <Check className="w-4 h-4 text-[#2563EB]" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRedirectModal(false)}
                  className={`px-4 py-2 rounded-xl cursor-pointer ${
                    isLightMode
                      ? 'bg-[#F7F6F3] text-[#666666] hover:text-[#111111]'
                      : 'bg-[#181C28] text-[#8E94A4] hover:text-[#FFFFFF]'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleEscalateToDoctor(selectedAlert.id, redirectDoctor, redirectDept)}
                  className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-[#FFFFFF] font-bold cursor-pointer shadow-sm"
                >
                  Confirm & Route Patient
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
