import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import SEO from '@/components/SEO';
import { getPageContent } from '@/lib/contentService';
import { DEFAULT_CONTENT } from '@/lib/defaultContent';
import AdUnit from '@/components/AdUnit';
import { ADSENSE_SLOTS } from '@/config/adsenseSlots';

const fadeUp = { hidden: { opacity: 0, y: 22 }, show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.55, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] } }) };

const FAQS = {
  general: [
    { q: "What does Kuro Education Consultancy do?", a: "We help students find universities abroad, apply for admissions, secure visas, and settle in their new country." },
    { q: "How much do your services cost?", a: "We offer various packages starting from free consultations to premium end-to-end support. Check our Services page for details." },
    { q: "Where are you located?", a: "We are based in Zimbabwe but operate globally, assisting students from across Africa." },
  ],
  destinations: [
    { q: "Which is the cheapest country to study?", a: "Poland and other Eastern European countries offer very affordable tuition and living costs compared to the UK or USA." },
    { q: "Can I study without IELTS?", a: "Some universities in Poland or Cyprus may accept alternative proof of English, but IELTS is generally recommended for visa success." },
    { q: "What is the cost of living in Europe?", a: "It ranges from €500/month in Poland to €1,000+ per month in Germany or France." },
  ],
  services: [
    { q: "How long does the process take?", a: "Typically 3–6 months from application to arrival. We recommend starting early." },
    { q: "Do you guarantee a visa?", a: "No ethical agency can guarantee a visa as it is the sole discretion of the embassy. However, our expertise maximises your chances." },
  ],
  compliance: [
    { q: "What happens if my visa is rejected?", a: "We analyse the refusal reason and can help you re-apply or appeal if feasible." },
    { q: "Do I need to show financial proof?", a: "Yes, almost all student visas require proof of funds to cover tuition and living expenses for at least one year." },
  ],
};

const CATEGORY_LABELS = { general: 'General', destinations: 'Destinations', services: 'Services', compliance: 'Compliance' };

const FaqsPage = ({ contentOverride }) => {
  const [content, setContent] = useState(DEFAULT_CONTENT.faqs);

  useEffect(() => {
    if (contentOverride) { setContent({ ...DEFAULT_CONTENT.faqs, ...contentOverride }); return; }
    getPageContent('faqs').then(data => setContent(data));
  }, [contentOverride]);

  const schema = {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: Object.values(FAQS).flat().map(f => ({
      "@type": "Question", name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <SEO title={content.meta_title} description={content.meta_description} schema={schema} />
      <div className="text-slate-50">

        {/* Hero */}
        <section className="relative pt-28 pb-16 border-b border-white/5">
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(37,99,235,0.18), transparent 65%)' }} />
          <div style={{ width: 'var(--container-narrow)', marginInline: 'auto', padding: '0 1rem' }} className="text-center">
            <motion.span initial="hidden" animate="show" variants={fadeUp} className="eyebrow">Got questions?</motion.span>
            <motion.h1 initial="hidden" animate="show" variants={fadeUp} custom={1}
              className="font-display font-bold text-white mt-4 mb-5"
              style={{ fontSize: 'var(--fs-4xl)', letterSpacing: '-0.03em', lineHeight: 1.04 }}>
              {content.page_heading}
            </motion.h1>
            <motion.p initial="hidden" animate="show" variants={fadeUp} custom={2}
              className="text-slate-300 max-w-xl mx-auto" style={{ fontSize: 'var(--fs-lg)' }}>
              {content.page_intro}
            </motion.p>
          </div>
        </section>

        <section className="py-20">
          <div style={{ width: 'var(--container-narrow)', marginInline: 'auto', padding: '0 1rem' }}>
            <AdUnit slotId={ADSENSE_SLOTS.faqsTop} />

            <div className="space-y-14 mt-8">
              {Object.entries(FAQS).map(([category, items], ci) => (
                <motion.div key={category} initial="hidden" whileInView="show" custom={0}
                  viewport={{ once: true, margin: '-60px' }} variants={fadeUp}>
                  <h2 className="font-display font-semibold text-white mb-5"
                    style={{ fontSize: 'var(--fs-xl)' }}>
                    {CATEGORY_LABELS[category]}
                  </h2>
                  <Accordion type="single" collapsible className="space-y-2">
                    {items.map((item, idx) => (
                      <AccordionItem key={idx} value={`${category}-${idx}`}
                        className="rounded-xl border border-white/8 overflow-hidden"
                        style={{ background: 'rgba(255,255,255,0.025)' }}>
                        <AccordionTrigger className="px-5 py-4 text-slate-200 hover:text-blue-400 hover:no-underline font-medium text-left">
                          {item.q}
                        </AccordionTrigger>
                        <AccordionContent className="px-5 pb-4 text-slate-400 leading-relaxed">
                          {item.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </motion.div>
              ))}
            </div>

            <AdUnit slotId={ADSENSE_SLOTS.faqsBottom} />
          </div>
        </section>

      </div>
    </>
  );
};

export default FaqsPage;
