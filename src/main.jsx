import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

import { PublicSiteSettingsProvider } from '@/contexts/PublicSiteSettingsContext';
import { AdminAuthProvider } from '@/contexts/AdminAuthContext';
import { envConfig } from '@/config/environment';
import StartupErrorModal from '@/components/StartupErrorModal';

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
        </AdminAuthProvider>
      </PublicSiteSettingsProvider>
    </BrowserRouter>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <Root />
);