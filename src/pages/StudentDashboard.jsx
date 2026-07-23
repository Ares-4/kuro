import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, FileText, BookOpen, Users, Settings,
  LogOut, GraduationCap, MapPin, Bell, X, Menu, ChevronRight,
  CalendarClock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useInactivityLogout } from '@/hooks/useInactivityLogout';
import DashboardHome from '@/components/dashboard/DashboardHome';
import ApplicationsView from '@/components/dashboard/ApplicationsView';
import ProgramsView from '@/components/dashboard/ProgramsView';
import StudentHub from '@/components/dashboard/StudentHub';
import StudentSettings from '@/components/dashboard/StudentSettings';
import CountriesView from '@/components/dashboard/CountriesView';
import ApplicationForm from '@/components/dashboard/ApplicationForm';
import ApplicationPage from '@/components/dashboard/ApplicationPage';
import NoticeView from '@/components/dashboard/NoticeView';

const NAV_SECTIONS = [
  {
    label: null,
    items: [
      { name: 'Dashboard',     icon: LayoutDashboard, path: '/dashboard' },
      { name: 'Applications',  icon: FileText,         path: '/dashboard/applications' },
      { name: 'Destinations',  icon: MapPin,           path: '/dashboard/countries' },
      { name: 'Programs',      icon: GraduationCap,    path: '/dashboard/programs' },
      { name: 'Notices',       icon: Bell,             path: '/dashboard/notices' },
      { name: 'Scholarships',  icon: GraduationCap,    path: '/scholarships' },
      { name: 'Deadlines',     icon: CalendarClock,    path: '/deadlines' },
    ],
  },
  {
    label: 'Account',
    items: [
      { name: 'Community', icon: Users,     path: '/dashboard/hub' },
      { name: 'Documents', icon: FileText,  path: '/dashboard/settings?tab=documents' },
      { name: 'Settings',  icon: Settings,  path: '/dashboard/settings' },
    ],
  },
];

const BOTTOM_TABS = [
  { name: 'Home',         icon: LayoutDashboard, path: '/dashboard' },
  { name: 'Apply',        icon: FileText,         path: '/dashboard/applications' },
  { name: 'Programs',     icon: GraduationCap,    path: '/dashboard/programs' },
  { name: 'Community',    icon: Users,            path: '/dashboard/hub' },
  { name: 'Settings',     icon: Settings,         path: '/dashboard/settings' },
];

const ease = [0.16, 1, 0.3, 1];

const StudentDashboard = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useInactivityLogout(signOut, '/login');

  const isActive = (path) =>
    path === '/dashboard' ? location.pathname === path : location.pathname.startsWith(path);

  const handleSignOut = async () => { await signOut(); navigate('/login'); };

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student';
  const initials = displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const SidebarNav = ({ onNavigate }) => (
    <>
      {NAV_SECTIONS.map((section, si) => (
        <div key={si} className="mb-1">
          {section.label && (
            <p className="px-3 pb-1.5 pt-3 text-[10px] font-bold tracking-[0.14em] uppercase"
              style={{ color: 'var(--fg-4)' }}>
              {section.label}
            </p>
          )}
          {section.items.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onNavigate}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all mb-0.5 group ${
                  active
                    ? 'text-blue-400'
                    : 'text-slate-400 hover:text-white'
                }`}
                style={active ? { background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.22)' } : { border: '1px solid transparent' }}
              >
                <item.icon className={`w-[18px] h-[18px] shrink-0 ${active ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                <span>{item.name}</span>
                {active && <ChevronRight className="w-3 h-3 ml-auto text-blue-400/50" />}
              </Link>
            );
          })}
        </div>
      ))}
    </>
  );

  return (
    <>
      <Helmet><title>Student Portal — Kuro Education</title></Helmet>

      {/* Aurora behind dashboard too */}
      <div className="aurora" aria-hidden="true">
        <div className="aurora-blob one"   style={{ opacity: 0.2 }} />
        <div className="aurora-blob two"   style={{ opacity: 0.15 }} />
        <div className="aurora-blob three" style={{ opacity: 0.12 }} />
      </div>
      <div className="grid-overlay" aria-hidden="true" style={{ opacity: 0.5 }} />

      <div className="relative z-10 min-h-screen flex" style={{ background: 'var(--ink)' }}>

        {/* ── Desktop sidebar ── */}
        <aside className="hidden lg:flex flex-col w-[240px] fixed inset-y-0 left-0 z-30 border-r"
          style={{ background: 'var(--wall)', borderColor: 'var(--line-2)' }}
        >
          {/* Brand */}
          <div className="flex items-center gap-2.5 p-6 border-b" style={{ borderColor: 'var(--line)' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)' }}>
              <GraduationCap className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="font-display font-bold text-white text-sm leading-none">KURO HUB</p>
              <p className="text-[9px] font-bold tracking-[0.18em] uppercase mt-0.5" style={{ color: 'var(--blue-400)' }}>STUDENT</p>
            </div>
          </div>

          {/* User */}
          <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--line)' }}>
            <div className="flex items-center gap-3 px-2 py-2.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold text-blue-400 shrink-0"
                style={{ background: 'rgba(37,99,235,0.18)', border: '1px solid rgba(37,99,235,0.3)' }}
              >
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{displayName}</p>
                <p className="text-xs truncate" style={{ color: 'var(--fg-4)' }}>{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto px-3 py-3">
            <SidebarNav onNavigate={undefined} />
          </nav>

          {/* Sign out */}
          <div className="p-3 border-t" style={{ borderColor: 'var(--line)' }}>
            <button onClick={handleSignOut}
              className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium transition-colors hover:bg-red-950/30"
              style={{ color: 'var(--rose-400)' }}
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </aside>

        {/* ── Mobile header ── */}
        <div className="lg:hidden fixed top-0 inset-x-0 z-40 h-14 flex items-center px-4 justify-between border-b"
          style={{ background: 'rgba(15,23,42,0.9)', backdropFilter: 'blur(16px)', borderColor: 'var(--line-2)' }}
        >
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)' }}>
              <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <span className="font-display font-bold text-white text-sm">KURO HUB</span>
          </Link>
          <div className="flex items-center gap-1">
            <Link to="/dashboard/notices" className="p-2 text-slate-400 hover:text-white transition-colors rounded-md">
              <Bell className="w-4.5 h-4.5" />
            </Link>
            <button onClick={() => setDrawerOpen(true)} className="p-2 text-slate-400 hover:text-white transition-colors rounded-md">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Mobile drawer ── */}
        <AnimatePresence>
          {drawerOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setDrawerOpen(false)}
                className="fixed inset-0 bg-black/65 z-50 lg:hidden"
              />
              <motion.aside
                initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 24, stiffness: 220 }}
                className="fixed inset-y-0 left-0 w-72 z-50 flex flex-col border-r lg:hidden"
                style={{ background: 'var(--wall)', borderColor: 'var(--line-2)' }}
              >
                <div className="flex items-center justify-between p-5 border-b shrink-0" style={{ borderColor: 'var(--line)' }}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)' }}>
                      <GraduationCap className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="font-display font-bold text-white text-sm">KURO HUB</p>
                      <p className="text-[9px] font-bold tracking-[0.16em] uppercase text-blue-400">STUDENT</p>
                    </div>
                  </div>
                  <button onClick={() => setDrawerOpen(false)} className="p-1.5 text-slate-400 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="px-3 py-3 border-b" style={{ borderColor: 'var(--line)' }}>
                  <div className="flex items-center gap-3 px-2 py-2.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold text-blue-400 shrink-0"
                      style={{ background: 'rgba(37,99,235,0.18)', border: '1px solid rgba(37,99,235,0.3)' }}
                    >
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{displayName}</p>
                      <p className="text-xs truncate" style={{ color: 'var(--fg-4)' }}>{user?.email}</p>
                    </div>
                  </div>
                </div>

                <nav className="flex-1 overflow-y-auto px-3 py-3">
                  <SidebarNav onNavigate={() => setDrawerOpen(false)} />
                </nav>

                <div className="p-3 border-t safe-pb" style={{ borderColor: 'var(--line)' }}>
                  <button onClick={handleSignOut}
                    className="flex items-center gap-3 px-3 py-3 w-full rounded-lg text-sm font-medium transition-colors hover:bg-red-950/30"
                    style={{ color: 'var(--rose-400)' }}
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* ── Main content ── */}
        <main className="flex-1 lg:ml-[240px] min-h-screen flex flex-col">
          <div className="pt-14 lg:pt-0 pb-20 lg:pb-0 flex-1">
            <div className="p-5 md:p-8 max-w-6xl mx-auto">
              <Routes>
                <Route path="/"                             element={<DashboardHome />} />
                <Route path="/applications"                 element={<ApplicationsView />} />
                <Route path="/application/:applicationId"  element={<ApplicationPage />} />
                <Route path="/apply/:programId"             element={<ApplicationForm />} />
                <Route path="/programs"                     element={<ProgramsView />} />
                <Route path="/notices"                      element={<NoticeView />} />
                <Route path="/hub"                          element={<StudentHub />} />
                <Route path="/countries"                    element={<CountriesView />} />
                <Route path="/settings"                     element={<StudentSettings />} />
              </Routes>
            </div>
          </div>

          {/* ── Mobile bottom tab bar ── */}
          <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 flex safe-pb border-t"
            style={{ background: 'rgba(10,12,20,0.95)', backdropFilter: 'blur(20px)', borderColor: 'var(--line-2)' }}
          >
            {BOTTOM_TABS.map((item) => {
              const active = isActive(item.path);
              return (
                <Link key={item.path} to={item.path}
                  className={`relative flex-1 flex flex-col items-center justify-center py-2.5 gap-1 text-[10px] font-medium transition-colors ${
                    active ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <item.icon className={`w-5 h-5 transition-transform ${active ? 'scale-110' : ''}`} />
                  {item.name}
                  {active && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-500 rounded-full" />}
                </Link>
              );
            })}
          </nav>
        </main>
      </div>
    </>
  );
};

export default StudentDashboard;
