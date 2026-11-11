import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

import { AuthProvider } from '@/contexts/SupabaseAuthContext';
import { SystemSettingsProvider } from '@/contexts/SystemSettingsContext';
import { ReadinessProvider } from '@/contexts/ReadinessContext';
import ProtectedAdminRoute from '@/components/ProtectedAdminRoute';

import { Toaster } from '@/components/ui/toaster';
import ErrorBoundary from '@/components/ErrorBoundary';
import ProtectedRoute from '@/components/ProtectedRoute';
// Chat assistant is not needed for first paint: load it shortly after the page.
const KuroChatWidget = React.lazy(() => import('@/components/chat/KuroChatWidget'));
const DeferredChatWidget = () => {
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => {
    let timer;
    const start = () => { timer = setTimeout(() => setReady(true), 3000); };
    if (document.readyState === 'complete') start(); else window.addEventListener('load', start, { once: true });
    return () => { clearTimeout(timer); window.removeEventListener('load', start); };
  }, []);
  return ready ? <React.Suspense fallback={null}><KuroChatWidget /></React.Suspense> : null;
};
import Layout from '@/components/Layout';
import ConsentBanner from '@/components/ConsentBanner';
import { applyStoredConsent } from '@/utils/consent';

// Pages

// Route-level code splitting. After a deploy, a tab opened on the old build
// asks for chunk files that no longer exist, so reload once to pick up the new
// build instead of showing the error boundary.
// The import promise is memoised so preload() (see preloadRoute) and
// React.lazy share one download.
const lazyPage = (factory) => {
  let promise;
  const load = () => {
    if (!promise) promise = loadChunk(factory);
    return promise;
  };
  const Component = React.lazy(load);
  Component.preload = load;
  return Component;
};

const loadChunk = (factory) =>
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
      });

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
const ResourcesPage = lazyPage(() => import('@/pages/ResourcesPage'));
const BlogDetailPage = lazyPage(() => import('@/pages/BlogDetailPage'));
const LoginPage = lazyPage(() => import('@/pages/LoginPage'));
const SignupPage = lazyPage(() => import('@/pages/SignupPage'));
const ForgotPasswordPage = lazyPage(() => import('@/pages/ForgotPasswordPage'));
const StudentDashboard = lazyPage(() => import('@/pages/StudentDashboard'));
const WelcomePage = lazyPage(() => import('@/pages/WelcomePage'));
const AdminDashboard = lazyPage(() => import('@/pages/AdminDashboard'));
const DynamicPage = lazyPage(() => import('@/pages/DynamicPage'));
const CourseDetailPage = lazyPage(() => import('@/pages/CourseDetailPage'));
const CoursesPage = lazyPage(() => import('@/pages/CoursesPage'));
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

// main.jsx downloads the current URL's page chunk before mounting React, so
// the prerendered HTML is replaced straight by the real page instead of a
// spinner followed by the page (the main cause of slow LCP on mobile).
const PRELOAD_ROUTES = [
  [/^\/about$/, AboutPage],
  [/^\/destinations$/, DestinationsPage],
  [/^\/destinations\/[^/]+$/, DestinationResolver],
  [/^\/services$/, ServicesPage],
  [/^\/process$/, ProcessPage],
  [/^\/why-kuro$/, WhyKuroPage],
  [/^\/faqs$/, FaqsPage],
  [/^\/courses$/, CoursesPage],
  [/^\/courses\/[^/]+$/, CourseDetailPage],
  [/^\/readiness-check$/, ReadinessCheckPage],
  [/^\/intake-planner$/, IntakePlannerPage],
  [/^\/resources$/, ResourcesPage],
  [/^\/blog\/[^/]+$/, BlogDetailPage],
  [/^\/contact$/, ContactPage],
  [/^\/page\/[^/]+$/, DynamicPage],
  [/^\/privacy-policy$/, PrivacyPolicy],
  [/^\/terms-of-service$/, TermsOfService],
  [/^\/scholarships$/, ScholarshipsPage],
  [/^\/scholarships\/[^/]+$/, ScholarshipDetailPage],
  [/^\/universities$/, UniversitiesPage],
  [/^\/universities\/[^/]+$/, UniversityDetailPage],
  [/^\/deadlines$/, DeadlinesPage],
];

export const preloadRoute = (pathname) => {
  const path = (pathname || '/').replace(/\/+$/, '') || '/';
  const match = PRELOAD_ROUTES.find(([pattern]) => pattern.test(path));
  return match ? match[1].preload() : Promise.resolve();
};

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
                  {/* The USD 29 eligibility check was retired (Nov 2026) in favour of the readiness check ladder. */}
                  <Route path="/eligibility" element={<Navigate to="/readiness-check" replace />} />
                  <Route path="/courses" element={<CoursesPage />} />
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

                <Route path="/welcome" element={<ProtectedRoute><WelcomePage /></ProtectedRoute>} />

                {/* Student App */}
                <Route
                  path="/dashboard/*"
                  element={
                    <ProtectedRoute requireProfile>
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
            <DeferredChatWidget />
            <Toaster />
          </ReadinessProvider>
        </SystemSettingsProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
