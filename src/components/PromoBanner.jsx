import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { X, Mail, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import FunnelButton from '@/components/FunnelButton';
import { emailTriggers } from '@/lib/emailService';
import { useLocation } from 'react-router-dom';

const normalizePath = (pathname) => {
  if (!pathname) return '/';
  // remove trailing slashes (except root)
  let p = pathname.trim();
  if (p.length > 1) p = p.replace(/\/+$/, '');
  return p || '/';
};

const includesPath = (visiblePages = [], pathname = '/') => {
  const current = normalizePath(pathname);
  const pages = Array.isArray(visiblePages) ? visiblePages.map(normalizePath) : [];

  // allow "*" to mean show everywhere
  if (pages.includes('*')) return true;

  return pages.includes(current);
};

const DEFAULTS = {
  readiness: {
    title: 'Unsure about your eligibility?',
    text: "Don't waste money on failed applications. Get a personalized analysis...",
    buttonText: 'Start Readiness Check',
    price: '€2.99',
    visible_pages: []
  },
  guide: {
    title: 'The Ultimate Study in Europe Guide 2025',
    text: 'Download our 50-page PDF covering tuition fees...',
    buttonText: 'Get Guide',
    price: '',
    visible_pages: []
  }
};

const PromoBanner = ({ variant = 'readiness', className = '' }) => {
  const { toast } = useToast();
  const location = useLocation();

  const [isVisible, setIsVisible] = useState(false);
  const [content, setContent] = useState(DEFAULTS[variant] || DEFAULTS.readiness);

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const applyVariantContent = useCallback(
    (variantData) => {
      const merged = { ...(DEFAULTS[variant] || {}), ...(variantData || {}) };
      setContent(merged);
      setIsVisible(includesPath(merged.visible_pages, location.pathname));
    },
    [variant, location.pathname]
  );

  // Re-evaluate visibility when route changes
  useEffect(() => {
    setIsVisible(includesPath(content.visible_pages, location.pathname));
  }, [location.pathname, content.visible_pages]);

  useEffect(() => {
    let isMounted = true;

    const fetchContent = async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'promo_banners')
        .maybeSingle();

      if (!isMounted) return;
      if (error) return;

      const variantData = data?.value?.[variant];
      if (variantData) applyVariantContent(variantData);
      else {
        // if missing in DB, keep defaults but hide unless defaults specify
        setContent(DEFAULTS[variant] || DEFAULTS.readiness);
        setIsVisible(false);
      }
    };

    fetchContent();

    // IMPORTANT: listen to INSERT + UPDATE (upsert can be INSERT first)
    const channel = supabase
      .channel(`promo_banners_${variant}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'site_settings' },
        (payload) => {
          // Only react to promo_banners row changes
          const newRow = payload?.new;
          if (!newRow || newRow.key !== 'promo_banners') return;

          const nextVariant = newRow?.value?.[variant];
          if (nextVariant) applyVariantContent(nextVariant);
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [variant, applyVariantContent]);

  if (!isVisible) return null;

  const handleGuideSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
      await emailTriggers.sendGuideDownload(email);

      toast({
        title: 'Guide Sent',
        description: `We sent the PDF to ${email}. Check inbox and spam.`,
        variant: 'default'
      });

      await supabase.from('leads').insert({
        email,
        goal: 'guide_download',
        name: 'Guest User'
      });

      setEmail('');
      setTimeout(() => setIsVisible(false), 1500);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not send email. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderReadinessContent = () => (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 p-4 md:p-8 bg-gradient-to-r from-blue-900/40 to-slate-900 border border-blue-500/30 rounded-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="relative z-10 flex-1 text-center md:text-left">
        <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
          <span className="bg-blue-500/20 text-blue-300 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
            Premium Tool
          </span>
        </div>
        <h3 className="text-lg md:text-2xl font-bold text-white mb-2">{content.title}</h3>
        <p className="text-slate-300 max-w-xl text-sm md:text-base">{content.text}</p>
      </div>

      <div className="relative z-10 flex flex-shrink-0 gap-4 items-center mt-2 md:mt-0 w-full md:w-auto">
        <FunnelButton action="readiness" size="lg" text={content.buttonText} className="w-full md:w-auto" />
      </div>

      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-2 right-2 md:top-4 md:right-4 text-slate-500 hover:text-white transition-colors p-2"
        aria-label="Dismiss banner"
        type="button"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );

  const renderGuideContent = () => (
    <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 p-6 md:p-8 bg-slate-900 border border-slate-800 rounded-2xl relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="relative z-10 flex-1 text-center md:text-left">
        <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
          <span className="bg-green-500/20 text-green-300 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
            Free Resource
          </span>
        </div>
        <h3 className="text-lg md:text-2xl font-bold text-white mb-2">{content.title}</h3>
        <p className="text-slate-300 max-w-xl mb-4 md:mb-0 text-sm md:text-base">{content.text}</p>
        <div className="hidden md:flex gap-4 mt-4 text-sm text-slate-400">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-green-500" /> Visa Checklist
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-green-500" /> Budget Planner
          </span>
        </div>
      </div>

      <div className="relative z-10 w-full md:w-auto max-w-md mt-2 md:mt-0">
        <form onSubmit={handleGuideSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                type="email"
                placeholder="Enter your email"
                className="pl-9 bg-slate-950 border-slate-700 text-white focus:ring-green-500 w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-500 text-white font-bold whitespace-nowrap w-full sm:w-auto"
            >
              {isSubmitting ? 'Sending...' : content.buttonText}
            </Button>
          </div>
          <p className="text-xs text-slate-500 text-center md:text-left">
            We email the PDF immediately. No spam.
          </p>
        </form>
      </div>

      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-2 right-2 md:top-4 md:right-4 text-slate-500 hover:text-white transition-colors p-2"
        aria-label="Dismiss banner"
        type="button"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0 }}
        transition={{ duration: 0.35 }}
        className={`w-full ${className}`}
      >
        {variant === 'readiness' ? renderReadinessContent() : renderGuideContent()}
      </motion.div>
    </AnimatePresence>
  );
};

export default PromoBanner;