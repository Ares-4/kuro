import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { usePublicSiteSettings } from '@/contexts/PublicSiteSettingsContext';

// Floating "Chat on WhatsApp" button for public pages. The number comes from
// Admin > Settings (site_identity.contact_phone); the button hides if it is
// empty. Pages can pre-fill the message with useWhatsAppMessage(text), e.g. a
// course page sends "I'm interested in <course> at <university>". Clicks are
// counted in GA4 as contact_click (method whatsapp) by lib/analytics.

const DEFAULT_MESSAGE = "Hi Kuro, I'd like help with studying abroad.";
const WhatsAppContext = createContext({ setMessage: () => {} });

export const WhatsAppProvider = ({ children }) => {
  const [message, setMessage] = useState(null);
  const value = useMemo(() => ({ message, setMessage }), [message]);
  return <WhatsAppContext.Provider value={value}>{children}</WhatsAppContext.Provider>;
};

/** Pre-fill the WhatsApp message while this page is mounted. */
export const useWhatsAppMessage = (text) => {
  const { setMessage } = useContext(WhatsAppContext);
  useEffect(() => {
    if (!text) return undefined;
    setMessage(text);
    return () => setMessage(null);
  }, [text, setMessage]);
};

const WhatsAppIcon = (props) => (
  <svg viewBox="0 0 32 32" aria-hidden="true" {...props}>
    <path fill="currentColor" d="M16.04 3C9.4 3 4 8.33 4 14.9c0 2.3.67 4.53 1.93 6.45L4 29l7.9-2.05a12.2 12.2 0 0 0 4.14.73C22.67 27.68 28 22.35 28 15.8 28 9.26 22.67 3 16.04 3Zm0 22.5c-1.3 0-2.6-.26-3.8-.76l-.27-.12-4.69 1.22 1.25-4.48-.18-.29a9.86 9.86 0 0 1-1.53-5.17c0-5.43 4.45-9.85 9.92-9.85 5.46 0 9.9 4.42 9.9 9.85 0 5.43-4.44 9.6-10.6 9.6Zm5.44-7.33c-.3-.15-1.77-.86-2.04-.96-.28-.1-.48-.15-.68.15s-.78.96-.96 1.16c-.18.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.89-.78-1.49-1.75-1.66-2.05-.18-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.6-.92-2.2-.24-.57-.49-.5-.67-.5h-.58c-.2 0-.52.07-.8.37-.27.3-1.04 1.01-1.04 2.47s1.07 2.86 1.22 3.06c.15.2 2.1 3.2 5.08 4.48.71.3 1.27.49 1.7.63.72.22 1.37.19 1.88.12.58-.09 1.77-.72 2.02-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35Z" />
  </svg>
);

const WhatsAppButton = () => {
  const { identity } = usePublicSiteSettings();
  const { message } = useContext(WhatsAppContext);
  const digits = (identity?.contact_phone || '').replace(/[^\d]/g, '');
  if (digits.length < 8) return null;

  const href = `https://wa.me/${digits}?text=${encodeURIComponent(message || DEFAULT_MESSAGE)}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Kuro on WhatsApp"
      className="group fixed right-6 bottom-24 z-40 flex items-center gap-2 rounded-full bg-[#25D366] text-white shadow-[0_8px_30px_rgba(37,211,102,0.45)] transition-transform hover:scale-105 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300/60"
      style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
    >
      <span className="flex h-14 w-14 items-center justify-center">
        <WhatsAppIcon className="h-7 w-7" />
      </span>
      <span className="pointer-events-none absolute right-16 hidden whitespace-nowrap rounded-full bg-slate-900/90 px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 md:block">
        Chat on WhatsApp
      </span>
    </a>
  );
};

export default WhatsAppButton;
