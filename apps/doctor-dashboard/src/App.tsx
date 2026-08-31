import React, { useState, useEffect, useCallback } from 'react';
import { AuthScreen, AuthUser } from './components/AuthScreen';
import { TriageDashboard } from './components/TriageDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { DoctorWorkspace } from './components/DoctorWorkspace';
import { DoctorSpecialist, UserRole } from '@medikiosk/shared-types';
import { DoctorApi } from './services/api';

const DEFAULT_SPECIALISTS: DoctorSpecialist[] = [
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    email: 'dr.sharma@aiia.gov.in',
    fullName: 'Dr. Rajesh Sharma',
    role: UserRole.PHYSICIAN,
    department: 'General Medicine',
    specialtyTitle: 'Consultant Physician • MD',
    roomNumber: 'Room #04',
    isActive: true,
    availableSlotCount: 14,
  },
  {
    id: 'a0000000-0000-0000-0000-000000000003',
    email: 'dr.vaidya@aiia.gov.in',
    fullName: 'Dr. Anand Vaidya',
    role: UserRole.AYUSH_PRACTITIONER,
    department: 'Kayachikitsa / AYUSH',
    specialtyTitle: 'Senior AYUSH Specialist • BAMS MD',
    roomNumber: 'Room #07',
    isActive: true,
    availableSlotCount: 18,
  },
  {
    id: 'a0000000-0000-0000-0000-000000000005',
    email: 'dr.priya.cardio@aiia.gov.in',
    fullName: 'Dr. Priya Nair',
    role: UserRole.PHYSICIAN,
    department: 'Cardiology',
    specialtyTitle: 'Cardiologist • DM Cardiology',
    roomNumber: 'Room #02',
    isActive: true,
    availableSlotCount: 8,
  },
  {
    id: 'a0000000-0000-0000-0000-000000000006',
    email: 'dr.menon.ortho@aiia.gov.in',
    fullName: 'Dr. Suresh Menon',
    role: UserRole.PHYSICIAN,
    department: 'Orthopedics',
    specialtyTitle: 'Orthopedic Consultant • MS Ortho',
    roomNumber: 'Room #05',
    isActive: true,
    availableSlotCount: 12,
  },
  {
    id: 'a0000000-0000-0000-0000-000000000007',
    email: 'dr.patel.chest@aiia.gov.in',
    fullName: 'Dr. Vikram Patel',
    role: UserRole.PHYSICIAN,
    department: 'Pulmonology',
    specialtyTitle: 'Chest Physician • MD Pulm',
    roomNumber: 'Room #03',
    isActive: true,
    availableSlotCount: 10,
  },
  {
    id: 'a0000000-0000-0000-0000-000000000008',
    email: 'dr.roy.gastro@aiia.gov.in',
    fullName: 'Dr. Ananya Roy',
    role: UserRole.PHYSICIAN,
    department: 'Gastroenterology',
    specialtyTitle: 'Gastroenterologist • DM Gastro',
    roomNumber: 'Room #06',
    isActive: true,
    availableSlotCount: 11,
  },
];

export const App: React.FC = () => {
  // Theme State (Persisted in localStorage, defaults to Dark mode)
  const [isLightMode, setIsLightMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('medikiosk_theme');
      if (saved) return saved === 'light';
      return false; // Default to sleek dark mode
    } catch {
      return false;
    }
  });

  const handleToggleTheme = () => {
    setIsLightMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('medikiosk_theme', next ? 'light' : 'dark');
      } catch {}
      return next;
    });
  };

  // Authentication & Active Workspace Router
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('medikiosk_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeWorkspace, setActiveWorkspace] = useState<'TRIAGE' | 'ADMIN' | 'DOCTOR'>(() => {
    try {
      const saved = localStorage.getItem('medikiosk_auth_user');
      if (saved) {
        const u = JSON.parse(saved);
        if (u.role === 'ADMIN') return 'ADMIN';
        if (u.role === 'TRIAGE_OFFICER') return 'TRIAGE';
      }
      return 'DOCTOR';
    } catch {
      return 'DOCTOR';
    }
  });

  const handleLoginSuccess = (user: AuthUser) => {
    setAuthUser(user);
    try {
      localStorage.setItem('medikiosk_auth_user', JSON.stringify(user));
    } catch {}

    if (user.role === 'ADMIN') {
      setActiveWorkspace('ADMIN');
    } else if (user.role === 'TRIAGE_OFFICER') {
      setActiveWorkspace('TRIAGE');
    } else {
      setActiveWorkspace('DOCTOR');
    }
  };

  const handleLogout = () => {
    setAuthUser(null);
    try {
      localStorage.removeItem('medikiosk_auth_user');
    } catch {}
  };

  // Dynamic Specialists Directory
  const [specialists, setSpecialists] = useState<DoctorSpecialist[]>(DEFAULT_SPECIALISTS);
  const [activeDoctor, setActiveDoctor] = useState<DoctorSpecialist>(DEFAULT_SPECIALISTS[0]);

  // Sync class on root document
  useEffect(() => {
    const root = document.documentElement;
    if (isLightMode) {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
  }, [isLightMode]);

  // Fetch Specialists Directory
  const fetchSpecialists = useCallback(async () => {
    try {
      const list = await DoctorApi.getDoctors();
      if (list && list.length > 0) {
        setSpecialists(list);
      }
    } catch (err) {
      console.warn('Specialists fallback to defaults:', err);
    }
  }, []);

  useEffect(() => {
    fetchSpecialists();
  }, [fetchSpecialists]);

  const handleSelectActiveDoctor = (doc: DoctorSpecialist) => {
    setActiveDoctor(doc);
  };

  // 1. If not logged in -> Show Authentication Portal (Image 1)
  if (!authUser) {
    return (
      <AuthScreen
        onLoginSuccess={handleLoginSuccess}
        isLightMode={isLightMode}
        onToggleTheme={handleToggleTheme}
      />
    );
  }

  // 2. If Triage Workspace -> Show Triage Command Centre (Images 2 & 3)
  if (activeWorkspace === 'TRIAGE') {
    return (
      <TriageDashboard
        currentUser={authUser}
        onLogout={handleLogout}
        onNavigateToDoctor={() => setActiveWorkspace('DOCTOR')}
        isLightMode={isLightMode}
        onToggleTheme={handleToggleTheme}
      />
    );
  }

  // 3. If Admin Workspace -> Show Administration Centre (Images 4 & 5)
  if (activeWorkspace === 'ADMIN') {
    return (
      <AdminDashboard
        currentUser={authUser}
        onLogout={handleLogout}
        onNavigateToDoctor={() => setActiveWorkspace('DOCTOR')}
        onNavigateToTriage={() => setActiveWorkspace('TRIAGE')}
        isLightMode={isLightMode}
        onToggleTheme={handleToggleTheme}
      />
    );
  }

  // 4. Default: Physician Clinical Workspace (Matching Screenshots 2 & 3)
  return (
    <DoctorWorkspace
      currentUser={authUser}
      specialists={specialists}
      activeDoctor={activeDoctor}
      onSelectDoctor={handleSelectActiveDoctor}
      onNavigateToTriage={() => setActiveWorkspace('TRIAGE')}
      onNavigateToAdmin={() => setActiveWorkspace('ADMIN')}
      onLogout={handleLogout}
      isLightMode={isLightMode}
      onToggleTheme={handleToggleTheme}
    />
  );
};

export default App;
