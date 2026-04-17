import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Shield
} from 'lucide-react';
import { usePublicSiteSettings } from '@/contexts/PublicSiteSettingsContext';

const DEFAULT_FOOTER = {
  copyright_text: '© 2024 Kuro Educational. All rights reserved.',
  footer_description:
    'Empowering African students to achieve their dreams of studying abroad. We provide comprehensive guidance for admissions, visas, and settlement in Europe and beyond.',
  links_column_1_title: 'Company',
  links_column_2_title: 'Resources',
  show_social_links: true,
  show_newsletter: true
};

const Footer = () => {
  const { identity, siteSettings, systemSettings, loading } = usePublicSiteSettings();

  // Merge footer settings with defaults
  const footer = useMemo(() => {
    return { ...DEFAULT_FOOTER, ...(siteSettings?.footer_settings || {}) };
  }, [siteSettings?.footer_settings]);

  // Extract branding
  const branding = useMemo(() => {
    return systemSettings?.portal_branding || {};
  }, [systemSettings?.portal_branding]);

  const brandLabel = useMemo(() => {
    return (
      branding.company_name?.trim() ||
      identity?.site_name?.trim() ||
      'Kuro Educational Consultancy'
    );
  }, [branding.company_name, identity?.site_name]);

  const showSocial = !!footer.show_social_links;

  const social = useMemo(() => {
    const s = identity?.social_links || {};
    return {
      facebook: (s.facebook || '').trim(),
      twitter: (s.twitter || '').trim(),
      instagram: (s.instagram || '').trim(),
      linkedin: (s.linkedin || '').trim()
    };
  }, [identity?.social_links]);

  const phoneLink = useMemo(() => {
    const raw = (identity?.contact_phone || '').trim();
    if (!raw) return '';
    const digits = raw.replace(/[^\d]/g, '');
    if (digits.length >= 8) return `https://wa.me/${digits}`;
    return `tel:${raw}`;
  }, [identity?.contact_phone]);

  // Simple loading state
  if (loading) {
    return (
      <footer className="bg-slate-950 border-t border-slate-800 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="space-y-4">
                <div className="h-6 w-32 bg-slate-800 rounded animate-pulse" />
                <div className="h-4 w-full bg-slate-800 rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-slate-800 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-slate-950 border-t border-slate-800 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {branding.logo_url ? (
                <img
                  src={branding.logo_url}
                  alt={brandLabel}
                  className="h-8 w-8 object-contain"
                />
              ) : (
                <GraduationCap className="h-8 w-8 text-primary" />
              )}
              <span className="text-xl font-bold text-white line-clamp-1">
                {brandLabel}
              </span>
            </div>

            <p className="text-slate-400 text-sm leading-relaxed">
              {footer.footer_description}
            </p>

            {showSocial && (
              <div className="flex gap-4">
                {social.facebook && (
                  <a
                    href={social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-primary transition-colors"
                    aria-label="Facebook"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
                {social.twitter && (
                  <a
                    href={social.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-primary transition-colors"
                    aria-label="Twitter / X"
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                )}
                {social.instagram && (
                  <a
                    href={social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-primary transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {social.linkedin && (
                  <a
                    href={social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-primary transition-colors"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                )}

                {!social.facebook && !social.twitter && !social.instagram && !social.linkedin && (
                  <span className="text-xs text-slate-600">No social links configured.</span>
                )}
              </div>
            )}
          </div>

          {/* Column 1 */}
          <div>
            <h3 className="text-white font-bold mb-4">{footer.links_column_1_title}</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/about" className="hover:text-blue-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/destinations" className="hover:text-blue-400 transition-colors">
                  Destinations
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-blue-400 transition-colors">
                  Our Services
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-blue-400 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2 */}
          <div>
            <h3 className="text-white font-bold mb-4">{footer.links_column_2_title}</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/resources" className="hover:text-blue-400 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/readiness-check" className="hover:text-blue-400 transition-colors">
                  Readiness Check
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-blue-400 transition-colors">
                  FAQs
                </Link>
              </li>
              {phoneLink ? (
                <li>
                  <a href={phoneLink} className="hover:text-blue-400 transition-colors">
                    WhatsApp Support
                  </a>
                </li>
              ) : null}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold mb-4">Contact Us</h3>
            <ul className="space-y-4 text-sm text-slate-400">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>{identity?.address?.trim() || '—'}</span>
              </li>

              {identity?.contact_phone?.trim() ? (
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-green-400 shrink-0" />
                  <a
                    href={phoneLink}
                    className="hover:text-white transition-colors text-green-400 font-semibold"
                  >
                    {identity.contact_phone}
                  </a>
                </li>
              ) : null}

              {identity?.contact_email?.trim() ? (
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-primary shrink-0" />
                  <a
                    href={`mailto:${identity.contact_email}`}
                    className="hover:text-white transition-colors break-all"
                  >
                    {identity.contact_email}
                  </a>
                </li>
              ) : null}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">{footer.copyright_text}</p>

          <div className="flex items-center gap-6 text-sm text-slate-500">
            <Link to="/privacy-policy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms-of-service" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link
              to="/admin-login"
              className="text-slate-600 hover:text-primary transition-colors"
              title="Admin Portal"
            >
              <Shield className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;