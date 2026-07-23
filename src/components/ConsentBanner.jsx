import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { hasConsentChoice, acceptConsent, rejectConsent } from '@/utils/consent';
import '@/styles/ConsentBanner.css';

const ConsentBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show if no choice has been made yet
    if (!hasConsentChoice()) {
      // Small delay to allow main content to paint first
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    acceptConsent();
    setIsVisible(false);
  };

  const handleReject = () => {
    rejectConsent();
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="consent-banner-overlay" role="dialog" aria-live="polite">
      <div className="consent-banner-text">
        <p>
          We use cookies and similar technologies to personalize content, tailor and measure ads, 
          and provide a better experience. By clicking "Accept All", you agree to this use. 
          Read our <Link to="/privacy-policy">Privacy Policy</Link> for more information.
        </p>
      </div>
      <div className="consent-banner-actions">
        <button onClick={handleReject} className="consent-btn consent-btn-reject">
          Reject Optional
        </button>
        <button onClick={handleAccept} className="consent-btn consent-btn-accept">
          Accept All
        </button>
      </div>
    </div>
  );
};

export default ConsentBanner;