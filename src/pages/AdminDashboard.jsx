import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useInactivityLogout } from '@/hooks/useInactivityLogout';
import { Menu, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Components
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminCourses from '@/components/admin/AdminCourses';
import AdminDestinations from '@/components/admin/AdminDestinations';
import AdminUniversities from '@/components/admin/AdminUniversities';
import AdminApplications from '@/components/admin/AdminApplications';
import BlogManager from '@/components/admin/content/BlogManager';
import PageEditor from '@/components/admin/builder/PageEditor';
import AdminBuilder from '@/components/admin/AdminBuilder';
import AdminSettings from '@/components/admin/AdminSettings';
import AdminContentManager from '@/components/admin/content/AdminContentManager'; 
import AdminNotices from '@/components/admin/AdminNotices';
import PromoManager from '@/components/admin/PromoManager';
import PromoPlacementEditor from '@/components/admin/PromoPlacementEditor';
import PromoDiagnostics from '@/components/admin/PromoDiagnostics';
import AdminLeads from '@/components/admin/AdminLeads';
import AdminModerators from '@/components/admin/AdminModerators';
import AdminGroups from '@/components/admin/AdminGroups';
import PublicContentPage from '@/pages/admin/PublicContentPage';

const AdminDashboard = () => {
  const { logoutAdmin } = useAdminAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  useInactivityLogout(logoutAdmin, '/admin-login');

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden">
      <AdminSidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      <div className="flex-1 flex flex-col md:pl-64 h-full w-full transition-all duration-300">
        <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-2 font-bold text-lg">
            <LayoutDashboard className="w-6 h-6 text-blue-500" />
            Kuro Admin
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu className="w-6 h-6 text-slate-300" />
          </Button>
        </div>

        <main className="flex-1 overflow-auto bg-slate-950 scroll-smooth">
          <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
            <Routes>
              <Route path="/" element={<Navigate to="/admin/applications" replace />} />
              <Route path="/applications" element={<AdminApplications />} />
              <Route path="/leads" element={<AdminLeads />} />
              <Route path="/notices" element={<AdminNotices />} />
              <Route path="/destinations" element={<AdminDestinations />} />
              <Route path="/universities" element={<AdminUniversities />} />
              <Route path="/courses" element={<AdminCourses />} />
              <Route path="/groups" element={<AdminGroups />} /> 
              <Route path="/moderators" element={<AdminModerators />} />
              <Route path="/blog" element={<BlogManager />} />
              <Route path="/public-content" element={<PublicContentPage />} />
              <Route path="/builder" element={<AdminBuilder />} />
              <Route path="/builder/edit/:pageId" element={<PageEditor onBack={() => window.history.back()} />} />
              <Route path="/content" element={<AdminContentManager />} />
              <Route path="/promos" element={<PromoManager />} />
              <Route path="/promos/placement" element={<PromoPlacementEditor />} />
              <Route path="/promos/diagnostics" element={<PromoDiagnostics />} />
              <Route path="/settings" element={<AdminSettings />} />
              <Route path="*" element={<div className="text-slate-400 p-8 text-center">Page not found</div>} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;