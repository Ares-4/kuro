// GA4 conversion events. gtag and Consent Mode v2 are bootstrapped in index.html,
// so every event here follows the visitor's cookie choice automatically: with
// consent denied GA only receives cookieless pings, never identifiers.
// Never pass personal data (email, name, phone) in params.

const gtag = (...args) => {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag === 'function') window.gtag(...args);
  else window.dataLayer.push(args);
};

export const track = (event, params = {}) => {
  try { gtag('event', event, params); } catch { /* analytics must never break the page */ }
};

/**
 * Track, then run `next` once GA has sent the hit (or after `timeoutMs`).
 * Use before a full-page redirect so the event is not lost.
 */
export const trackThen = (event, params, next, timeoutMs = 800) => {
  let done = false;
  const go = () => { if (!done) { done = true; next(); } };
  setTimeout(go, timeoutMs);
  try { gtag('event', event, { ...params, event_callback: go, event_timeout: timeoutMs }); } catch { go(); }
};

export const READINESS_PRODUCTS = {
  readiness_basic: { name: 'Basic Readiness Check', value: 2.99 },
  readiness_premium: { name: 'Premium Visa Risk Report', value: 19 },
};

const readinessItem = (product) => ({
  item_id: product,
  item_name: READINESS_PRODUCTS[product]?.name || product,
  price: READINESS_PRODUCTS[product]?.value || 0,
  quantity: 1,
});

export const trackBeginCheckout = (product, next) => trackThen('begin_checkout', {
  currency: 'EUR', value: READINESS_PRODUCTS[product]?.value || 0, items: [readinessItem(product)],
}, next);

/** Purchase once per Stripe session, even if the success page is reloaded. */
export const trackPurchase = (sessionId, product) => {
  if (!sessionId || !READINESS_PRODUCTS[product]) return;
  const key = `kuro_ga_purchase_${sessionId}`;
  try { if (localStorage.getItem(key)) return; localStorage.setItem(key, '1'); } catch { /* still track */ }
  track('purchase', {
    transaction_id: sessionId, currency: 'EUR', value: READINESS_PRODUCTS[product].value, items: [readinessItem(product)],
  });
};

/** lead_source: guide_download | contact_form | readiness_check */
export const trackLead = (leadSource, extra = {}) => track('generate_lead', { lead_source: leadSource, ...extra });

export const trackSignUp = (method) => track('sign_up', { method });

/** One listener for every WhatsApp / phone / email link on the site. */
export const initContactClickTracking = () => {
  if (typeof document === 'undefined') return;
  document.addEventListener('click', (e) => {
    const href = e.target?.closest?.('a[href]')?.getAttribute('href') || '';
    let method = null;
    // Only links to a number (wa.me/<digits>); wa.me/?text=... is a share link, not a contact.
    if (/^https?:\/\/(wa\.me\/\d|api\.whatsapp\.com\/send\?phone=\d|chat\.whatsapp\.com\/)/i.test(href)) method = 'whatsapp';
    else if (href.startsWith('tel:')) method = 'phone';
    else if (href.startsWith('mailto:')) method = 'email';
    if (method) track('contact_click', { method, page_path: window.location.pathname });
  }, { capture: true });
};
