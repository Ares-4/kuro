import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';
import App, { preloadRoute } from './App';
import './index.css';

import { PublicSiteSettingsProvider } from '@/contexts/PublicSiteSettingsContext';
import { AdminAuthProvider } from '@/contexts/AdminAuthContext';
import { envConfig } from '@/config/environment';
import StartupErrorModal from '@/components/StartupErrorModal';
import { initContactClickTracking } from '@/lib/analytics';

initContactClickTracking();

const Root = () => {
  const [isConfigValid, setIsConfigValid] = useState(envConfig.isValid);
  const [missingVars, setMissingVars] = useState(envConfig.missing || []);

  const handleRetry = () => {
    window.location.reload();
  };

  useEffect(() => {
    if (import.meta.env.DEV) {
      if (isConfigValid) {
        console.log('✅ Environment configuration valid');
      } else {
        console.error('❌ Startup blocked: Invalid configuration');
      }
    }
  }, [isConfigValid]);

  if (!isConfigValid) {
    return <StartupErrorModal missingVars={missingVars} onRetry={handleRetry} />;
  }

  return (
    <BrowserRouter>
      <PublicSiteSettingsProvider>
        <AdminAuthProvider>
          <App />
          <SpeedInsights />
        </AdminAuthProvider>
      </PublicSiteSettingsProvider>
    </BrowserRouter>
  );
};

// Fetch this URL's page chunk first (capped at 3s) so React replaces the
// prerendered HTML directly with the page, not with a loading spinner.
const mount = () => ReactDOM.createRoot(document.getElementById('root')).render(<Root />);
Promise.race([
  preloadRoute(window.location.pathname).catch(() => {}),
  new Promise((resolve) => setTimeout(resolve, 3000)),
]).finally(mount);