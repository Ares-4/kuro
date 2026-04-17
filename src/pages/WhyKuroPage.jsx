import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Globe2, HeartHandshake, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SEO from '@/components/SEO';
import { getPageContent } from '@/lib/contentService';
import { DEFAULT_CONTENT } from '@/lib/defaultContent';
import AdUnit from '@/components/AdUnit';
import { ADSENSE_SLOTS } from '@/config/adsenseSlots';

const WhyKuroPage = ({ contentOverride }) => {
  const [content, setContent] = useState(DEFAULT_CONTENT.why_kuro);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (contentOverride) {
      setContent({ ...DEFAULT_CONTENT.why_kuro, ...contentOverride });
      setLoading(false);
      return;
    }
    const loadContent = async () => {
      const data = await getPageContent('why_kuro');
      setContent(data);
      setLoading(false);
    };
    loadContent();
  }, [contentOverride]);

  return (
    <>
      <SEO 
        title={content.meta_title} 
        description={content.meta_description} 
      />
      <div className="min-h-screen bg-slate-950 text-slate-50 pt-20">
        
        {/* Hero */}
        <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">{content.page_heading}</h1>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              {content.page_intro}
            </p>
          </div>
        </section>

        <AdUnit slotId={ADSENSE_SLOTS.whyKuroTop} />

        {/* Differentiators */}
        <section className="py-12 container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors">
              <Globe2 className="w-10 h-10 text-blue-500 mb-6" />
              <h3 className="text-xl font-bold text-white mb-3">{content.benefit_1_title}</h3>
              <p className="text-slate-400">{content.benefit_1_description}</p>
            </div>
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors">
              <ShieldCheck className="w-10 h-10 text-green-500 mb-6" />
              <h3 className="text-xl font-bold text-white mb-3">{content.benefit_2_title}</h3>
              <p className="text-slate-400">{content.benefit_2_description}</p>
            </div>
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors">
              <HeartHandshake className="w-10 h-10 text-pink-500 mb-6" />
              <h3 className="text-xl font-bold text-white mb-3">{content.benefit_3_title}</h3>
              <p className="text-slate-400">{content.benefit_3_description}</p>
            </div>
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors">
              <TrendingUp className="w-10 h-10 text-purple-500 mb-6" />
              <h3 className="text-xl font-bold text-white mb-3">{content.benefit_4_title}</h3>
              <p className="text-slate-400">{content.benefit_4_description}</p>
            </div>
          </div>
        </section>

        {/* Approach */}
        <section className="py-20 bg-slate-900">
           <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
             <div className="flex-1 space-y-6">
               <h2 className="text-3xl font-bold text-white">Our Approach</h2>
               <p className="text-slate-400 text-lg">
                 We believe education is a right, not a privilege. Our consultancy was founded on the principle of making global education accessible to African students through transparent guidance and honest advice.
               </p>
               <p className="text-slate-400 text-lg">
                 Unlike others, we don't promise what we can't deliver. We evaluate your profile realistically and provide a strategic roadmap to success.
               </p>
             </div>
             <div className="flex-1">
               <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 relative">
                 <div className="absolute -top-4 -right-4 w-20 h-20 bg-blue-600 rounded-full opacity-20 blur-xl" />
                 <h3 className="text-2xl font-bold text-white mb-4">Our Commitment</h3>
                 <ul className="space-y-3">
                   {['100% Transparency on Costs', 'No Hidden Fees', 'Honest Visa Advice', 'Long-term Career Focus'].map((item, i) => (
                     <li key={i} className="flex items-center gap-3 text-slate-300">
                       <ShieldCheck className="w-5 h-5 text-green-500" /> {item}
                     </li>
                   ))}
                 </ul>
               </div>
             </div>
           </div>
        </section>

        {/* Team */}
        <section className="py-20 container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-12">Our Expert Team</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
             {[1, 2, 3].map((i) => (
               <div key={i} className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                 <div className="w-24 h-24 bg-slate-800 rounded-full mx-auto mb-4 flex items-center justify-center">
                   <Users className="w-10 h-10 text-slate-600" />
                 </div>
                 <h3 className="text-lg font-bold text-white">Education Consultant</h3>
                 <p className="text-slate-400 text-sm">Senior Advisor</p>
               </div>
             ))}
          </div>
          <div className="mt-16">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 h-14 px-8 text-lg" asChild>
              <Link to="/eligibility">Start Your Journey</Link>
            </Button>
          </div>
        </section>

        <AdUnit slotId={ADSENSE_SLOTS.whyKuroBottom} />
        
      </div>
    </>
  );
};

export default WhyKuroPage;