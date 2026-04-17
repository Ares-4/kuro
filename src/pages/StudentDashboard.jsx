import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, BookOpen, Users, Settings, LogOut, Menu, X, GraduationCap, MapPin, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useInactivityLogout } from '@/hooks/useInactivityLogout'; // Import hook
import DashboardHome from '@/components/dashboard/DashboardHome';
import ApplicationsView from '@/components/dashboard/ApplicationsView';
import ProgramsView from '@/components/dashboard/ProgramsView';
import StudentHub from '@/components/dashboard/StudentHub';
import StudentSettings from '@/components/dashboard/StudentSettings';
import CountriesView from '@/components/dashboard/CountriesView';
import ApplicationForm from '@/components/dashboard/ApplicationForm';
import ApplicationPage from '@/components/dashboard/ApplicationPage';
import NoticeView from '@/components/dashboard/NoticeView';

const StudentDashboard = () => {
  const { signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Initialize inactivity logout for students
  useInactivityLogout(signOut, '/login');

  const navigation = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'My Applications', icon: FileText, path: '/dashboard/applications' },
    { name: 'Study Destinations', icon: MapPin, path: '/dashboard/countries' },
    { name: 'Browse Programs', icon: GraduationCap, path: '/dashboard/programs' },
    { name: 'Notices', icon: Bell, path: '/dashboard/notices' },
    { name: 'Student Hub', icon: Users, path: '/dashboard/hub' },
    { name: 'Settings', icon: Settings, path: '/dashboard/settings' }
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <>
      <Helmet>
        <title>Student Dashboard - Kuro Educational</title>
      </Helmet>

      <div className="min-h-screen bg-slate-950">
        {/* Mobile Header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 z-50">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">Student Portal</span>
            </div>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white">
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className={`fixed top-0 left-0 h-full w-64 bg-slate-900/95 backdrop-blur-sm border-r border-slate-800 z-40 transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-6 border-b border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl font-bold text-white">Kuro Student</span>
            </div>
            <p className="text-sm text-slate-400">Portal Access</p>
          </div>

          <nav className="p-4 space-y-2">
            {navigation.map((item) => {
              // Exact match for root dashboard, startsWith for others
              const isActive = item.path === '/dashboard' 
                ? location.pathname === item.path 
                : location.pathname.startsWith(item.path);
                
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800">
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="w-full text-slate-300 border-slate-700 hover:bg-slate-800"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:ml-64 pt-16 lg:pt-0">
          <div className="p-4 md:p-8">
            <Routes>
              <Route path="/" element={<DashboardHome />} />
              <Route path="/applications" element={<ApplicationsView />} />
              <Route path="/application/:applicationId" element={<ApplicationPage />} />
              <Route path="/apply/:programId" element={<ApplicationForm />} />
              <Route path="/programs" element={<ProgramsView />} />
              <Route path="/notices" element={<NoticeView />} />
              <Route path="/hub" element={<StudentHub />} />
              <Route path="/countries" element={<CountriesView />} />
              <Route path="/settings" element={<StudentSettings />} />
            </Routes>
          </div>
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </>
  );
};

export default StudentDashboard;