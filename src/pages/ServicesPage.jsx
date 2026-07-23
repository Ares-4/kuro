import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Shield, Plane, BookOpen, Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SEO from '@/components/SEO';
import { getPageContent } from '@/lib/contentService';
import { DEFAULT_CONTENT } from '@/lib/defaultContent';
import AdUnit from '@/components/AdUnit';
import { ADSENSE_SLOTS } from '@/config/adsenseSlots';

const fadeUp = { hidden: { opacity: 0, y: 22 }, show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.55, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] } }) };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.09 } } };

const ServicesPage = ({ contentOverride }) => {
  const [content, setContent] = useState(DEFAULT_CONTENT.services);

  useEffect(() => {
    if (contentOverride) { setContent({ ...DEFAULT_CONTENT.services, ...contentOverride }); return; }
    getPageContent('services').then(data => setContent(data));
  }, [contentOverride]);

  const services = [
    { title: content.admissions_title, icon: BookOpen, accent: 'rgba(37,99,235,0.08)', iconColor: 'text-blue-400', description: content.admissions_desc, features: ["University selection", "Application preparation", "Document review", "Submission & follow-up"], timeline: "2–4 months" },
    { title: content.visa_title,       icon: Shield,   accent: 'rgba(52,211,153,0.08)', iconColor: 'text-emerald-400', description: content.visa_desc, features: ["Visa strategy analysis", "Document checklist", "Application guidance", "Embassy liaison"], timeline: "1–3 months" },
    { title: content.relocation_title, icon: Plane,    accent: 'rgba(139,92,246,0.08)', iconColor: 'text-violet-400', description: content.relocation_desc, features: ["Pre-arrival orientation", "Housing guidance", "Airport pickup", "Local onboarding"], timeline: "Ongoing" },
    { title: content.concierge_title,  icon: Star,     accent: 'rgba(251,191,36,0.08)', iconColor: 'text-amber-400', description: content.concierge_desc, features: ["Dedicated advisor", "Priority support", "Career guidance", "Mentorship access"], timeline: "6–12 months+", popular: true },
  ];

  return (
    <>
      <SEO title={content.meta_title} description={content.meta_description} />
      <div className="text-slate-50">

        {/* Hero */}
        <section className="relative pt-28 pb-16 border-b border-white/5">
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(37,99,235,0.18), transparent 65%)' }} />
          <div style={{ width: 'var(--container-narrow)', marginInline: 'auto', padding: '0 1rem' }} className="text-center">
            <motion.span initial="hidden" animate="show" variants={fadeUp} className="eyebrow">What we offer</motion.span>
            <motion.h1 initial="hidden" animate="show" variants={fadeUp} custom={1}
              className="font-display font-bold text-white mt-4 mb-5"
              style={{ fontSize: 'var(--fs-4xl)', letterSpacing: '-0.03em', lineHeight: 1.04 }}>
              {content.page_heading}
            </motion.h1>
            <motion.p initial="hidden" animate="show" variants={fadeUp} custom={2}
              className="text-slate-300 max-w-2xl mx-auto" style={{ fontSize: 'var(--fs-lg)' }}>
              {content.page_intro}
            </motion.p>
          </div>
        </section>

        <section className="py-20">
          <div style={{ width: 'var(--container)', marginInline: 'auto', padding: '0 1rem' }}>
            <AdUnit slotId={ADSENSE_SLOTS.servicesTop} />

            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}
              variants={stagger} className="grid md:grid-cols-2 xl:grid-cols-4 gap-5 mt-8">
              {services.map((s, i) => (
                <motion.div key={i} variants={fadeUp} custom={i}
                  className={`bento-cell spotlight-card flex flex-col relative ${s.popular ? 'ring-1 ring-blue-500/40' : ''}`}>
                  {s.popular && (
                    <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-bl-xl uppercase tracking-widest">
                      Most popular
                    </div>
                  )}
                  <div className="relative z-10 flex flex-col flex-grow">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                      style={{ background: s.accent, border: '1px solid rgba(148,163,184,0.1)' }}>
                      <s.icon className={`w-5 h-5 ${s.iconColor}`} />
                    </div>
                    <h3 className="font-display font-semibold text-white text-lg mb-2">{s.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed mb-5">{s.description}</p>
                    <ul className="space-y-2 mb-5 flex-grow">
                      {s.features.map((f, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-slate-300">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                      <span className="text-xs text-slate-500">{s.timeline}</span>
                      <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300 gap-1 p-0 h-auto" asChild>
                        <Link to="/signup">Apply <ArrowRight className="w-3.5 h-3.5" /></Link>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <AdUnit slotId={ADSENSE_SLOTS.servicesBottom} />
          </div>
        </section>

      </div>
    </>
  );
};

export default ServicesPage;
