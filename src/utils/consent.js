export const getStoredConsent = () => {
  return localStorage.getItem('kuro_consent_choice');
};

export const saveConsent = (choice) => {
  localStorage.setItem('kuro_consent_choice', choice);
};

export const applyConsent = (choice) => {
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }

  const consentConfig = choice === 'accepted' 
    ? {
        'ad_storage': 'granted',
        'ad_user_data': 'granted',
        'ad_personalization': 'granted',
        'analytics_storage': 'granted'
      }
    : {
        'ad_storage': 'denied',
        'ad_user_data': 'denied',
        'ad_personalization': 'denied',
        'analytics_storage': 'denied'
      };

  gtag('consent', 'update', consentConfig);
};

export const applyStoredConsent = () => {
  // The consent 'default' is set inline in index.html before gtag('config'),
  // so the first hit already respects the visitor's choice. Here we only
  // re-apply a stored choice as an update.
  const storedChoice = getStoredConsent();
  if (storedChoice) {
    applyConsent(storedChoice);
  }
};

export const acceptConsent = () => {
  saveConsent('accepted');
  applyConsent('accepted');
};

export const rejectConsent = () => {
  saveConsent('rejected');
  applyConsent('rejected');
};

export const hasConsentChoice = () => {
  return getStoredConsent() !== null;
};