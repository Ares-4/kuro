import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Shield, ArrowUpRight } from 'lucide-react';
import { usePublicSiteSettings } from '@/contexts/PublicSiteSettingsContext';

const DEFAULT_FOOTER = {
  copyright_text: `© ${new Date().getFullYear()} Kuro Educational. All rights reserved.`,
  footer_description: 'Empowering African students to achieve their dreams of studying abroad. Comprehensive guidance for admissions, visas, and settlement in Europe and beyond.',
  links_column_1_title: 'Company',
  links_column_2_title: 'Resources',
  show_social_links: true,
};

const COL1_LINKS = [
  { label: 'About us',       to: '/about' },
  { label: 'Destinations',   to: '/destinations' },
  { label: 'Services',       to: '/services' },
  { label: 'How it works',   to: '/process' },
  { label: 'Why Kuro',       to: '/why-kuro' },
  { label: 'Contact',        to: '/contact' },
];

const COL2_LINKS = [
  { label: 'Scholarships',   to: '/scholarships' },
  { label: 'Deadlines',      to: '/deadlines' },
  { label: 'Readiness check', to: '/readiness-check' },
  { label: 'Blog & guides',  to: '/resources' },
  { label: 'FAQs',           to: '/faq' },
];

const SOCIAL_ICONS = { facebook: Facebook, twitter: Twitter, instagram: Instagram, linkedin: Linkedin };

const Footer = () => {
  const { identity, siteSettings, systemSettings, loading } = usePublicSiteSettings();

  const footer  = useMemo(() => ({ ...DEFAULT_FOOTER, ...(siteSettings?.footer_settings || {}) }), [siteSettings]);
  const branding = useMemo(() => systemSettings?.portal_branding || {}, [systemSettings]);
  const brandLabel = useMemo(() => branding.company_name?.trim() || identity?.site_name?.trim() || 'Kuro Educational', [branding, identity]);

  const social = useMemo(() => {
    const s = identity?.social_links || {};
    return { facebook: s.facebook?.trim() || '', twitter: s.twitter?.trim() || '', instagram: s.instagram?.trim() || '', linkedin: s.linkedin?.trim() || '' };
  }, [identity?.social_links]);

  const phoneLink = useMemo(() => {
    const raw = (identity?.contact_phone || '').trim();
    if (!raw) return '';
    const digits = raw.replace(/[^\d]/g, '');
    return digits.length >= 8 ? `https://wa.me/${digits}` : `tel:${raw}`;
  }, [identity?.contact_phone]);

  if (loading) return (
    <footer style={{ background: 'rgba(5,6,10,0.96)', borderTop: '1px solid rgba(148,163,184,0.07)' }} className="pt-16 pb-8">
      <div style={{ width: 'var(--container)', marginInline: 'auto', padding: '0 1rem' }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {[1,2,3,4].map(i => <div key={i} className="space-y-3">{[1,2,3].map(j => <div key={j} className="h-4 rounded skeleton" />)}</div>)}
        </div>
      </div>
    </footer>
  );

  const activeSocials = Object.entries(social).filter(([, url]) => url);

  return (
    <footer className="relative z-10 overflow-hidden" style={{ background: 'rgba(5,6,10,0.97)' }}>

      {/* Top glow separator */}
      <div className="relative h-px w-full">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(37,99,235,0.5) 30%, rgba(139,92,246,0.4) 70%, transparent 100%)' }} />
      </div>

      {/* Subtle grain overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.5 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.3'/></svg>\")" }} />

      <div style={{ width: 'var(--container)', marginInline: 'auto', padding: '0 1rem' }}>

        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1.2fr] gap-12 pt-16 pb-12">

          {/* ── Brand col ── */}
          <div className="space-y-6">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              {branding.logo_url
                ? <img src={branding.logo_url} alt={brandLabel} className="h-8 w-8 object-contain" />
                : <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)' }}>
                    <GraduationCap className="w-5 h-5 text-blue-400" />
                  </div>
              }
              <span className="font-display font-bold text-white text-lg group-hover:text-blue-400 transition-colors">{brandLabel}</span>
            </Link>

            <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
              {footer.footer_description}
            </p>

            {/* Social links */}
            {footer.show_social_links && activeSocials.length > 0 && (
              <div className="flex items-center gap-2">
                {activeSocials.map(([platform, url]) => {
                  const Icon = SOCIAL_ICONS[platform];
                  return (
                    <a key={platform} href={url} target="_blank" rel="noopener noreferrer"
                      aria-label={platform}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5"
                      style={{ background: 'rgba(148,163,184,0.06)', border: '1px solid rgba(148,163,184,0.1)' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(96,165,250,0.4)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(148,163,184,0.1)'}>
                      <Icon className="w-3.5 h-3.5 text-slate-400" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Company col ── */}
          <div>
            <p className="font-display font-semibold text-white text-sm mb-5 tracking-wide">
              {footer.links_column_1_title}
            </p>
            <ul className="space-y-3">
              {COL1_LINKS.map(({ label, to }) => (
                <li key={to}>
                  <Link to={to}
                    className="text-sm text-slate-500 hover:text-slate-200 transition-colors duration-150 flex items-center gap-1 group">
                    {label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-60 group-hover:translate-x-0 transition-all duration-150" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Resources col ── */}
          <div>
            <p className="font-display font-semibold text-white text-sm mb-5 tracking-wide">
              {footer.links_column_2_title}
            </p>
            <ul className="space-y-3">
              {COL2_LINKS.map(({ label, to }) => (
                <li key={to}>
                  <Link to={to}
                    className="text-sm text-slate-500 hover:text-slate-200 transition-colors duration-150 flex items-center gap-1 group">
                    {label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-60 group-hover:translate-x-0 transition-all duration-150" />
                  </Link>
                </li>
              ))}
              {phoneLink && (
                <li>
                  <a href={phoneLink}
                    className="text-sm text-slate-500 hover:text-slate-200 transition-colors duration-150 flex items-center gap-1 group">
                    WhatsApp support
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-60 group-hover:translate-x-0 transition-all duration-150" />
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* ── Contact col ── */}
          <div>
            <p className="font-display font-semibold text-white text-sm mb-5 tracking-wide">Contact</p>
            <ul className="space-y-4">
              {identity?.address?.trim() && (
                <li className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.15)' }}>
                    <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <span className="text-sm text-slate-500 leading-relaxed">{identity.address.trim()}</span>
                </li>
              )}
              {identity?.contact_phone?.trim() && (
                <li className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)' }}>
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <a href={phoneLink} className="text-sm text-slate-500 hover:text-emerald-400 transition-colors font-medium">
                    {identity.contact_phone}
                  </a>
                </li>
              )}
              {identity?.contact_email?.trim() && (
                <li className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.15)' }}>
                    <Mail className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <a href={`mailto:${identity.contact_email}`} className="text-sm text-slate-500 hover:text-blue-400 transition-colors break-all">
                    {identity.contact_email}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: '1px solid rgba(148,163,184,0.07)' }}>

          <p className="text-xs text-slate-600 tabular">{footer.copyright_text}</p>

          <div className="flex items-center gap-5">
            <Link to="/privacy-policy"
              className="text-xs text-slate-600 hover:text-slate-300 transition-colors duration-150">
              Privacy policy
            </Link>
            <span className="w-px h-3 bg-slate-800" />
            <Link to="/terms-of-service"
              className="text-xs text-slate-600 hover:text-slate-300 transition-colors duration-150">
              Terms of service
            </Link>
            <span className="w-px h-3 bg-slate-800" />
            <Link to="/admin-login" title="Admin portal"
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 group"
              style={{ background: 'rgba(148,163,184,0.04)', border: '1px solid rgba(148,163,184,0.08)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(37,99,235,0.1)'; e.currentTarget.style.borderColor = 'rgba(37,99,235,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(148,163,184,0.04)'; e.currentTarget.style.borderColor = 'rgba(148,163,184,0.08)'; }}>
              <Shield className="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-400 transition-colors" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
