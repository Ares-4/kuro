import React, { useEffect, useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import SEO from '@/components/SEO';
import { getPageContent } from '@/lib/contentService';
import { DEFAULT_CONTENT } from '@/lib/defaultContent';
import AdUnit from '@/components/AdUnit';
import { ADSENSE_SLOTS } from '@/config/adsenseSlots';

const FaqsPage = ({ contentOverride }) => {
  const [content, setContent] = useState(DEFAULT_CONTENT.faqs);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (contentOverride) {
      setContent({ ...DEFAULT_CONTENT.faqs, ...contentOverride });
      setLoading(false);
      return;
    }
    const loadContent = async () => {
      const data = await getPageContent('faqs');
      setContent(data);
      setLoading(false);
    };
    loadContent();
  }, [contentOverride]);

  const faqs = {
    general: [
      { q: "What does Kuro Education Consultancy do?", a: "We help students find universities abroad, apply for admissions, secure visas, and settle in their new country." },
      { q: "How much do your services cost?", a: "We offer various packages starting from free consultations to premium end-to-end support. Check our Services page for details." },
      { q: "Where are you located?", a: "We are based in Zimbabwe but operate globally, assisting students from across Africa." }
    ],
    destinations: [
      { q: "Which is the cheapest country to study?", a: "Poland and other Eastern European countries offer very affordable tuition and living costs compared to the UK or USA." },
      { q: "Can I study without IELTS?", a: "Some universities in Poland or Cyprus may accept alternative proof of English, but IELTS is generally recommended for visa success." },
      { q: "What is the cost of living in Europe?", a: "It ranges from €500/month in Poland to €1000+/month in Germany or France." }
    ],
    services: [
      { q: "How long does the process take?", a: "Typically 3-6 months from application to arrival. We recommend starting early." },
      { q: "Do you guarantee a visa?", a: "No ethical agency can guarantee a visa as it is the sole discretion of the embassy. However, our expertise maximizes your chances." }
    ],
    compliance: [
      { q: "What happens if my visa is rejected?", a: "We analyze the refusal reason and can help you re-apply or appeal if feasible." },
      { q: "Do I need to show financial proof?", a: "Yes, almost all student visas require proof of funds to cover tuition and living expenses for at least one year." }
    ]
  };

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": Object.values(faqs).flat().map(faq => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  };

  return (
    <>
      <SEO 
        title={content.meta_title} 
        description={content.meta_description}
        schema={schema}
      />
      <div className="min-h-screen bg-slate-950 text-slate-50 pt-20">
        <section className="py-20 text-center container mx-auto px-4 bg-slate-900 border-b border-slate-800">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">{content.page_heading}</h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            {content.page_intro}
          </p>
        </section>

        <AdUnit slotId={ADSENSE_SLOTS.faqsTop} />

        <section className="py-8 container mx-auto px-4 max-w-4xl">
          <div className="space-y-12">
            {Object.entries(faqs).map(([category, items]) => (
              <div key={category}>
                <h2 className="text-2xl font-bold text-white mb-6 capitalize">{category} Questions</h2>
                <Accordion type="single" collapsible className="w-full space-y-4">
                  {items.map((item, idx) => (
                    <AccordionItem key={idx} value={`${category}-${idx}`} className="bg-slate-900 border border-slate-800 rounded-lg px-4">
                      <AccordionTrigger className="text-lg font-medium text-slate-200 hover:text-blue-400 hover:no-underline py-4">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-400 pb-4 leading-relaxed">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        </section>

        <AdUnit slotId={ADSENSE_SLOTS.faqsBottom} />

      </div>
    </>
  );
};

export default FaqsPage;