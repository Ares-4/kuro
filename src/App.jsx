import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

import { AuthProvider } from '@/contexts/SupabaseAuthContext';
import { SystemSettingsProvider } from '@/contexts/SystemSettingsContext';
import { ReadinessProvider } from '@/contexts/ReadinessContext';
import ProtectedAdminRoute from '@/components/ProtectedAdminRoute';

import { Toaster } from '@/components/ui/toaster';
import ErrorBoundary from '@/components/ErrorBoundary';
import ProtectedRoute from '@/components/ProtectedRoute';
import KuroChatWidget from '@/components/chat/KuroChatWidget';
import TawkToWidget from '@/components/TawkToWidget';
import Layout from '@/components/Layout';
import ConsentBanner from '@/components/ConsentBanner';
import { applyStoredConsent } from '@/utils/consent';

// Pages

// Route-level code splitting. After a deploy, a tab opened on the old build
// asks for chunk files that no longer exist, so reload once to pick up the new
// build instead of showing the error boundary.
const lazyPage = (factory) =>
  React.lazy(() =>
    factory()
      .then((mod) => {
        try { sessionStorage.removeItem('kuro_chunk_reload'); } catch { /* storage blocked */ }
        return mod;
      })
      .catch((error) => {
        let alreadyReloaded = true;
        try {
          alreadyReloaded = sessionStorage.getItem('kuro_chunk_reload') === '1';
          if (!alreadyReloaded) sessionStorage.setItem('kuro_chunk_reload', '1');
        } catch { /* storage blocked */ }
        if (!alreadyReloaded) {
          window.location.reload();
          return new Promise(() => {});
        }
        throw error;
      })
  );

import HomePage from '@/pages/HomePage';
const AdminLogin = lazyPage(() => import('@/pages/AdminLogin'));
const AboutPage = lazyPage(() => import('@/pages/AboutPage'));
const DestinationsPage = lazyPage(() => import('@/pages/DestinationsPage'));
const DestinationResolver = lazyPage(() => import('@/components/DestinationResolver'));
const ContactPage = lazyPage(() => import('@/pages/ContactPage'));
const ServicesPage = lazyPage(() => import('@/pages/ServicesPage'));
const ProcessPage = lazyPage(() => import('@/pages/ProcessPage'));
const WhyKuroPage = lazyPage(() => import('@/pages/WhyKuroPage'));
const FaqsPage = lazyPage(() => import('@/pages/FaqsPage'));
const EligibilityPage = lazyPage(() => import('@/pages/EligibilityPage'));
const ResourcesPage = lazyPage(() => import('@/pages/ResourcesPage'));
const BlogDetailPage = lazyPage(() => import('@/pages/BlogDetailPage'));
const LoginPage = lazyPage(() => import('@/pages/LoginPage'));
const SignupPage = lazyPage(() => import('@/pages/SignupPage'));
const ForgotPasswordPage = lazyPage(() => import('@/pages/ForgotPasswordPage'));
const StudentDashboard = lazyPage(() => import('@/pages/StudentDashboard'));
const AdminDashboard = lazyPage(() => import('@/pages/AdminDashboard'));
const DynamicPage = lazyPage(() => import('@/pages/DynamicPage'));
const CourseDetailPage = lazyPage(() => import('@/pages/CourseDetailPage'));
const ReadinessCheckPage = lazyPage(() => import('@/pages/ReadinessCheckPage'));
const PaymentSuccess = lazyPage(() => import('@/pages/PaymentSuccess'));
const PrivacyPolicy = lazyPage(() => import('@/pages/PrivacyPolicy'));
const TermsOfService = lazyPage(() => import('@/pages/TermsOfService'));
const ScholarshipsPage = lazyPage(() => import('@/pages/ScholarshipsPage'));
const ScholarshipDetailPage = lazyPage(() => import('@/pages/ScholarshipDetailPage'));
const UniversitiesPage = lazyPage(() => import('@/pages/UniversitiesPage'));
const UniversityDetailPage = lazyPage(() => import('@/pages/UniversityDetailPage'));
const DeadlinesPage = lazyPage(() => import('@/pages/DeadlinesPage'));
const IntakePlannerPage = lazyPage(() => import('@/pages/IntakePlannerPage'));
const NotFoundPage = lazyPage(() => import('@/pages/NotFoundPage'));

const PageLoader = () => (
  <div className="min-h-screen bg-slate-950 flex items-center justify-center">
    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
  </div>
);

function App() {
  useEffect(() => {
    applyStoredConsent();
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <SystemSettingsProvider>
          <ReadinessProvider>
            <ConsentBanner />
            <React.Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public Website Routes wrapped in Layout */}
                <Route element={<Layout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/destinations" element={<DestinationsPage />} />
                  <Route path="/destinations/:country" element={<DestinationResolver />} />
                  <Route path="/services" element={<ServicesPage />} />
                  <Route path="/process" element={<ProcessPage />} />
                  <Route path="/why-kuro" element={<WhyKuroPage />} />
                  <Route path="/faqs" element={<FaqsPage />} />
                  <Route path="/eligibility" element={<EligibilityPage />} />
                  <Route path="/courses/:id" element={<CourseDetailPage />} />
                  <Route path="/readiness-check" element={<ReadinessCheckPage />} />
                  <Route path="/intake-planner" element={<IntakePlannerPage />} />
                  <Route path="/resources" element={<ResourcesPage />} />
                  <Route path="/blog/:slug" element={<BlogDetailPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/page/:slug" element={<DynamicPage />} />
                  <Route path="/payment-success" element={<PaymentSuccess />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/terms-of-service" element={<TermsOfService />} />
                  <Route path="/scholarships" element={<ScholarshipsPage />} />
                  <Route path="/scholarships/:id" element={<ScholarshipDetailPage />} />
                  <Route path="/universities" element={<UniversitiesPage />} />
                  <Route path="/universities/:id" element={<UniversityDetailPage />} />
                  <Route path="/deadlines" element={<DeadlinesPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>

                {/* Auth Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                
                {/* Admin Login Route */}
                <Route path="/admin-login" element={<AdminLogin />} />

                {/* Student App */}
                <Route
                  path="/dashboard/*"
                  element={
                    <ProtectedRoute>
                      <StudentDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Admin App */}
                <Route
                  path="/admin/*"
                  element={
                    <ProtectedAdminRoute>
                      <AdminDashboard />
                    </ProtectedAdminRoute>
                  }
                />

              </Routes>
            </React.Suspense>

            <TawkToWidget />
            <KuroChatWidget />
            <Toaster />
          </ReadinessProvider>
        </SystemSettingsProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
