import React, { useState } from 'react';
import { Share2, Link2, Check } from 'lucide-react';
import { track } from '@/lib/analytics';

// Share a page on WhatsApp, Facebook, LinkedIn or X, copy the link, or use the
// phone's own share sheet. Each share is a GA4 "share" event.

const Icon = ({ d, label }) => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true"><title>{label}</title><path fill="currentColor" d={d} /></svg>
);
const PATHS = {
  whatsapp: 'M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35M12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.31l-.34-.2-3.56.93.95-3.47-.22-.36a9.4 9.4 0 0 1-1.44-5.02c0-5.2 4.23-9.43 9.43-9.43a9.4 9.4 0 0 1 9.42 9.44c0 5.2-4.23 9.43-9.43 9.43M20.07 3.92A11.3 11.3 0 0 0 12.05.6C5.8.6.71 5.68.71 11.93c0 2 .52 3.95 1.52 5.66L.6 23.4l5.95-1.56a11.3 11.3 0 0 0 5.5 1.4c6.25 0 11.34-5.08 11.34-11.33 0-3.03-1.18-5.87-3.32-8z',
  facebook: 'M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07',
  linkedin: 'M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z',
  x: 'M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.4l-5.8-7.58-6.64 7.58H.48l8.6-9.83L0 1.15h7.59l5.24 6.93 6.07-6.93zm-1.29 19.49h2.04L6.48 3.24H4.3l13.31 17.4z',
};

const ShareButtons = ({ url, title, id }) => {
  const [copied, setCopied] = useState(false);
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const links = [
    ['whatsapp', 'WhatsApp', `https://wa.me/?text=${t}%20${u}`, 'hover:text-[#25D366]'],
    ['facebook', 'Facebook', `https://www.facebook.com/sharer/sharer.php?u=${u}`, 'hover:text-[#1877F2]'],
    ['linkedin', 'LinkedIn', `https://www.linkedin.com/sharing/share-offsite/?url=${u}`, 'hover:text-[#0A66C2]'],
    ['x', 'X', `https://twitter.com/intent/tweet?text=${t}&url=${u}`, 'hover:text-white'],
  ];
  const log = (method) => track('share', { method, content_type: 'article', item_id: id });

  const copy = async () => {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); log('copy_link'); } catch { /* ignore */ }
  };
  const native = async () => {
    try { await navigator.share({ title, url }); log('native'); } catch { /* cancelled */ }
  };
  const btn = 'w-9 h-9 rounded-full flex items-center justify-center border border-slate-700 text-slate-400 transition-colors hover:border-slate-500';

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-slate-400 text-sm mr-1">Share:</span>
      {links.map(([key, label, href, hover]) => (
        <a key={key} href={href} target="_blank" rel="noopener noreferrer" onClick={() => log(key)}
          className={`${btn} ${hover}`} aria-label={`Share on ${label}`}>
          <Icon d={PATHS[key]} label={label} />
        </a>
      ))}
      <button type="button" onClick={copy} className={`${btn} hover:text-white`} aria-label="Copy link">
        {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Link2 className="w-4 h-4" />}
      </button>
      {typeof navigator !== 'undefined' && navigator.share && (
        <button type="button" onClick={native} className={`${btn} hover:text-white sm:hidden`} aria-label="More sharing options">
          <Share2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default ShareButtons;
