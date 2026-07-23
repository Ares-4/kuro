import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Globe2, HeartHandshake, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SEO from '@/components/SEO';
import { getPageContent } from '@/lib/contentService';
import { DEFAULT_CONTENT } from '@/lib/defaultContent';
import AdUnit from '@/components/AdUnit';
import { ADSENSE_SLOTS } from '@/config/adsenseSlots';

const fadeUp = { hidden: { opacity: 0, y: 22 }, show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.55, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] } }) };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.09 } } };

const BENEFIT_ICONS = [
  { icon: Globe2,         color: 'text-blue-400',    bg: 'rgba(37,99,235,0.08)' },
  { icon: ShieldCheck,    color: 'text-emerald-400', bg: 'rgba(52,211,153,0.08)' },
  { icon: HeartHandshake, color: 'text-rose-400',    bg: 'rgba(251,113,133,0.08)' },
  { icon: TrendingUp,     color: 'text-violet-400',  bg: 'rgba(139,92,246,0.08)' },
];

const WhyKuroPage = ({ contentOverride }) => {
  const [content, setContent] = useState(DEFAULT_CONTENT.why_kuro);

  useEffect(() => {
    if (contentOverride) { setContent({ ...DEFAULT_CONTENT.why_kuro, ...contentOverride }); return; }
    getPageContent('why_kuro').then(data => setContent(data));
  }, [contentOverride]);

  return (
    <>
      <SEO title={content.meta_title} description={content.meta_description} />
      <div className="text-slate-50">

        {/* Hero */}
        <section className="relative pt-28 pb-16 border-b border-white/5">
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(37,99,235,0.18), transparent 65%)' }} />
          <div style={{ width: 'var(--container-narrow)', marginInline: 'auto', padding: '0 1rem' }} className="text-center">
            <motion.span initial="hidden" animate="show" variants={fadeUp} className="eyebrow">Why choose us</motion.span>
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

        <AdUnit slotId={ADSENSE_SLOTS.whyKuroTop} />

        {/* Benefits */}
        <section className="py-24 border-b border-white/5">
          <div style={{ width: 'var(--container)', marginInline: 'auto', padding: '0 1rem' }}>
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}
              variants={stagger} className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {[1, 2, 3, 4].map((n, i) => {
                const { icon: Icon, color, bg } = BENEFIT_ICONS[i];
                return (
                  <motion.div key={n} variants={fadeUp} custom={i} className="bento-cell spotlight-card">
                    <div className="relative z-10">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                        style={{ background: bg, border: '1px solid rgba(148,163,184,0.1)' }}>
                        <Icon className={`w-5 h-5 ${color}`} />
                      </div>
                      <h3 className="font-display font-semibold text-white text-lg mb-2">{content[`benefit_${n}_title`]}</h3>
                      <p className="text-slate-400 text-sm leading-relaxed">{content[`benefit_${n}_description`]}</p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* Our Approach */}
        <section className="py-24 border-b border-white/5">
          <div style={{ width: 'var(--container)', marginInline: 'auto', padding: '0 1rem' }}
            className="grid md:grid-cols-2 gap-14 items-center">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}
              className="space-y-5">
              <span className="eyebrow">Our approach</span>
              <h2 className="font-display font-bold text-white" style={{ fontSize: 'var(--fs-3xl)', letterSpacing: '-0.03em' }}>Honest, strategic guidance</h2>
              <p className="text-slate-400 leading-relaxed">
                We believe education is a right, not a privilege. Our consultancy was founded on the principle of making global education accessible to African students through transparent guidance and honest advice.
              </p>
              <p className="text-slate-400 leading-relaxed">
                Unlike others, we don't promise what we can't deliver. We evaluate your profile realistically and provide a strategic roadmap to success.
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="glass p-8 rounded-2xl relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-20 blur-2xl"
                style={{ background: 'rgba(37,99,235,0.5)' }} />
              <h3 className="font-display font-semibold text-white text-xl mb-6 relative z-10">Our commitment</h3>
              <ul className="space-y-4 relative z-10">
                {['100% transparency on costs', 'No hidden fees', 'Honest visa advice', 'Long-term career focus'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300 text-sm">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 text-center">
          <div style={{ width: 'var(--container-narrow)', marginInline: 'auto', padding: '0 1rem' }}>
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
              <span className="eyebrow">Ready to start?</span>
              <h2 className="font-display font-bold text-white mt-4 mb-6"
                style={{ fontSize: 'var(--fs-3xl)', letterSpacing: '-0.03em' }}>
                Begin your journey with us
              </h2>
              <Button size="xl" className="bg-blue-600 hover:bg-blue-500" asChild>
                <Link to="/eligibility">Start readiness check</Link>
              </Button>
            </motion.div>
          </div>
        </section>

        <AdUnit slotId={ADSENSE_SLOTS.whyKuroBottom} />
      </div>
    </>
  );
};

export default WhyKuroPage;
