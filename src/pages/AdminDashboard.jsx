import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useInactivityLogout } from '@/hooks/useInactivityLogout';
import { Menu, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminOverview from '@/components/admin/AdminOverview';
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
import AdminRoadmaps from '@/components/admin/AdminRoadmaps';
import AdminVisaInfo from '@/components/admin/AdminVisaInfo';
import AdminKnowledgeBase from '@/components/admin/AdminKnowledgeBase';
import AdminCountryUpdates from '@/components/admin/AdminCountryUpdates';
import AdminScholarships from '@/components/admin/AdminScholarships';
import AdminDeadlines from '@/components/admin/AdminDeadlines';
import FaqManager from '@/components/admin/content/FaqManager';
import MediaManager from '@/components/admin/content/MediaManager';
import EmailTemplateManager from '@/components/admin/content/EmailTemplateManager';
import ContentAnalytics from '@/components/admin/content/ContentAnalytics';
import CommunityModeration from '@/components/admin/content/CommunityModeration';

const AdminDashboard = () => {
  const { logoutAdmin } = useAdminAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useInactivityLogout(logoutAdmin, '/admin-login');

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--ink)' }}>
      {/* Subtle aurora for admin too */}
      <div className="aurora" aria-hidden="true" style={{ opacity: 0.4 }}>
        <div className="aurora-blob one"   style={{ opacity: 0.15 }} />
        <div className="aurora-blob two"   style={{ opacity: 0.12 }} />
        <div className="aurora-blob three" style={{ opacity: 0.08 }} />
      </div>
      <div className="grid-overlay" aria-hidden="true" style={{ opacity: 0.35 }} />

      <AdminSidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      <div className="relative z-10 flex-1 flex flex-col md:pl-56 h-full w-full transition-all duration-300">
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b shrink-0 sticky top-0 z-20"
          style={{ background: 'rgba(15,23,42,0.9)', backdropFilter: 'blur(16px)', borderColor: 'var(--line-2)' }}
        >
          <div className="flex items-center gap-2 font-display font-bold text-white text-base">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            Kuro Admin
          </div>
          <Button variant="ghost" size="icon-sm" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu className="w-5 h-5 text-slate-300" />
          </Button>
        </div>

        <main className="flex-1 overflow-auto scroll-smooth">
          <div className="p-5 md:p-8 max-w-7xl mx-auto w-full">
            <Routes>
              <Route path="/"                       element={<Navigate to="/admin/applications" replace />} />
              <Route path="/overview"               element={<AdminOverview />} />
              <Route path="/applications"           element={<AdminApplications />} />
              <Route path="/leads"                  element={<AdminLeads />} />
              <Route path="/notices"                element={<AdminNotices />} />
              <Route path="/destinations"           element={<AdminDestinations />} />
              <Route path="/universities"           element={<AdminUniversities />} />
              <Route path="/courses"                element={<AdminCourses />} />
              <Route path="/groups"                 element={<AdminGroups />} />
              <Route path="/moderators"             element={<AdminModerators />} />
              <Route path="/blog"                   element={<BlogManager />} />
              <Route path="/public-content"         element={<PublicContentPage />} />
              <Route path="/builder"                element={<AdminBuilder />} />
              <Route path="/builder/edit/:pageId"   element={<PageEditor onBack={() => window.history.back()} />} />
              <Route path="/content"                element={<AdminContentManager />} />
              <Route path="/promos"                 element={<PromoManager />} />
              <Route path="/promos/placement"       element={<PromoPlacementEditor />} />
              <Route path="/promos/diagnostics"     element={<PromoDiagnostics />} />
              <Route path="/country-updates"         element={<AdminCountryUpdates />} />
              <Route path="/roadmaps"               element={<AdminRoadmaps />} />
              <Route path="/visa-info"              element={<AdminVisaInfo />} />
              <Route path="/knowledge-base"         element={<AdminKnowledgeBase />} />
              <Route path="/scholarships"           element={<AdminScholarships />} />
              <Route path="/deadlines"              element={<AdminDeadlines />} />
              <Route path="/faqs"                   element={<FaqManager />} />
              <Route path="/media"                  element={<MediaManager />} />
              <Route path="/email-templates"        element={<EmailTemplateManager />} />
              <Route path="/content-analytics"      element={<ContentAnalytics />} />
              <Route path="/community-moderation"   element={<CommunityModeration />} />
              <Route path="/settings"               element={<AdminSettings />} />
              <Route path="*" element={<div className="p-8 text-center" style={{ color: 'var(--fg-4)' }}>Page not found</div>} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
