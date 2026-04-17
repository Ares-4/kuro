import React, { useEffect, useState } from 'react';
import { ClipboardList, Search, FileText, CheckCircle, Plane, Home } from 'lucide-react';
import SEO from '@/components/SEO';
import { getPageContent } from '@/lib/contentService';
import { DEFAULT_CONTENT } from '@/lib/defaultContent';
import AdUnit from '@/components/AdUnit';
import { ADSENSE_SLOTS } from '@/config/adsenseSlots';

const ProcessPage = ({ contentOverride }) => {
  const [content, setContent] = useState(DEFAULT_CONTENT.process);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (contentOverride) {
      setContent({ ...DEFAULT_CONTENT.process, ...contentOverride });
      setLoading(false);
      return;
    }
    const loadContent = async () => {
      const data = await getPageContent('process');
      setContent(data);
      setLoading(false);
    };
    loadContent();
  }, [contentOverride]);

  const steps = [
    {
      id: 1,
      title: content.step_1_title,
      description: content.step_1_description,
      timeline: "1 Week",
      deliverables: "Eligibility Report, Country Shortlist",
      icon: ClipboardList
    },
    {
      id: 2,
      title: content.step_2_title,
      description: content.step_2_description,
      timeline: "1-2 Weeks",
      deliverables: "University List, Requirement Checklist",
      icon: Search
    },
    {
      id: 3,
      title: content.step_3_title,
      description: content.step_3_description,
      timeline: "2-4 Weeks",
      deliverables: "Submitted Applications",
      icon: FileText
    },
    {
      id: 4,
      title: content.step_4_title,
      description: content.step_4_description,
      timeline: "4-8 Weeks",
      deliverables: "Unconditional Offer Letter",
      icon: CheckCircle
    },
    {
      id: 5,
      title: content.step_5_title,
      description: content.step_5_description,
      timeline: "4-12 Weeks",
      deliverables: "Student Visa",
      icon: Plane
    },
    {
      id: 6,
      title: content.step_6_title,
      description: content.step_6_description,
      timeline: "Ongoing",
      deliverables: "Accommodation, Airport Pickup",
      icon: Home
    }
  ];

  return (
    <>
      <SEO 
        title={content.meta_title} 
        description={content.meta_description} 
      />
      <div className="min-h-screen bg-slate-950 text-slate-50 pt-20">
        <section className="py-20 text-center container mx-auto px-4 bg-slate-900 border-b border-slate-800">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">{content.page_heading}</h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            {content.page_intro}
          </p>
        </section>

        <AdUnit slotId={ADSENSE_SLOTS.processTop} />

        <section className="py-12 container mx-auto px-4 relative">
          <div className="absolute left-4 md:left-1/2 top-12 bottom-12 w-1 bg-gradient-to-b from-blue-500 to-purple-500 hidden md:block" />
          
          <div className="space-y-12 relative">
            {steps.map((step, index) => (
              <div key={step.id} className={`flex flex-col md:flex-row gap-8 items-center ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                <div className="flex-1 w-full">
                  <div className={`bg-slate-900 p-8 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-colors shadow-xl ${index % 2 === 0 ? 'md:text-left' : 'md:text-right'}`}>
                    <div className={`flex items-center gap-4 mb-4 ${index % 2 === 0 ? '' : 'md:flex-row-reverse'}`}>
                      <div className="w-12 h-12 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xl shrink-0">
                        {step.id}
                      </div>
                      <h3 className="text-2xl font-bold text-white">{step.title}</h3>
                    </div>
                    <p className="text-slate-400 mb-6 leading-relaxed">
                      {step.description}
                    </p>
                    <div className={`flex gap-6 text-sm ${index % 2 === 0 ? '' : 'md:justify-end'}`}>
                      <div>
                        <span className="block text-slate-500 font-semibold text-xs uppercase">Est. Timeline</span>
                        <span className="text-blue-400 font-medium">{step.timeline}</span>
                      </div>
                      <div>
                        <span className="block text-slate-500 font-semibold text-xs uppercase">Key Outcome</span>
                        <span className="text-green-400 font-medium">{step.deliverables}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="hidden md:flex w-16 h-16 rounded-full bg-slate-950 border-4 border-blue-500 z-10 items-center justify-center shadow-lg shadow-blue-500/20">
                  <step.icon className="w-6 h-6 text-blue-400" />
                </div>

                <div className="flex-1 hidden md:block" />
              </div>
            ))}
          </div>
        </section>

        <AdUnit slotId={ADSENSE_SLOTS.processBottom} />

      </div>
    </>
  );
};

export default ProcessPage;