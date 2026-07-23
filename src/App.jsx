import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

import { AuthProvider } from '@/contexts/SupabaseAuthContext';
import { SystemSettingsProvider } from '@/contexts/SystemSettingsContext';
import { ReadinessProvider } from '@/contexts/ReadinessContext';
import ProtectedAdminRoute from '@/components/ProtectedAdminRoute';
import AdminLogin from '@/pages/AdminLogin';

import { Toaster } from '@/components/ui/toaster';
import ErrorBoundary from '@/components/ErrorBoundary';
import ProtectedRoute from '@/components/ProtectedRoute';
import KuroChatWidget from '@/components/chat/KuroChatWidget';
import TawkToWidget from '@/components/TawkToWidget';
import Layout from '@/components/Layout';
import ConsentBanner from '@/components/ConsentBanner';
import { applyStoredConsent } from '@/utils/consent';

// Pages
import HomePage from '@/pages/HomePage';
import AboutPage from '@/pages/AboutPage';
import DestinationsPage from '@/pages/DestinationsPage';
import DestinationResolver from '@/components/DestinationResolver';
import ContactPage from '@/pages/ContactPage';
import ServicesPage from '@/pages/ServicesPage';
import ProcessPage from '@/pages/ProcessPage';
import WhyKuroPage from '@/pages/WhyKuroPage';
import FaqsPage from '@/pages/FaqsPage';
import EligibilityPage from '@/pages/EligibilityPage';
import ResourcesPage from '@/pages/ResourcesPage';
import BlogDetailPage from '@/pages/BlogDetailPage';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import StudentDashboard from '@/pages/StudentDashboard';
import AdminDashboard from '@/pages/AdminDashboard';
import DynamicPage from '@/pages/DynamicPage';
import CourseDetailPage from '@/pages/CourseDetailPage';
import ReadinessCheckPage from '@/pages/ReadinessCheckPage';
import PaymentSuccess from '@/pages/PaymentSuccess';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import TermsOfService from '@/pages/TermsOfService';
import ScholarshipsPage from '@/pages/ScholarshipsPage';
import DeadlinesPage from '@/pages/DeadlinesPage';

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
                  <Route path="/resources" element={<ResourcesPage />} />
                  <Route path="/blog/:slug" element={<BlogDetailPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/page/:slug" element={<DynamicPage />} />
                  <Route path="/payment-success" element={<PaymentSuccess />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/terms-of-service" element={<TermsOfService />} />
                  <Route path="/scholarships" element={<ScholarshipsPage />} />
                  <Route path="/deadlines" element={<DeadlinesPage />} />
                </Route>

                {/* Auth Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                
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

                <Route path="*" element={<Navigate to="/" replace />} />
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