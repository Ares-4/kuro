import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Shield, Plane, BookOpen, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import SEO from '@/components/SEO';
import { getPageContent } from '@/lib/contentService';
import { DEFAULT_CONTENT } from '@/lib/defaultContent';
import AdUnit from '@/components/AdUnit';
import { ADSENSE_SLOTS } from '@/config/adsenseSlots';

const ServicesPage = ({ contentOverride }) => {
  const [content, setContent] = useState(DEFAULT_CONTENT.services);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (contentOverride) {
      setContent({ ...DEFAULT_CONTENT.services, ...contentOverride });
      setLoading(false);
      return;
    }
    const loadContent = async () => {
      const data = await getPageContent('services');
      setContent(data);
      setLoading(false);
    };
    loadContent();
  }, [contentOverride]);

  const services = [
    {
      title: content.admissions_title,
      icon: BookOpen,
      description: content.admissions_desc,
      features: ["University Selection", "Application Preparation", "Document Review", "Submission & Follow-up"],
      timeline: "2-4 months",
      requires: "Academic records, Test scores",
      color: "blue"
    },
    {
      title: content.visa_title,
      icon: Shield,
      description: content.visa_desc,
      features: ["Visa Strategy Analysis", "Document Checklist", "Application Guidance", "Embassy Liaison"],
      timeline: "1-3 months",
      requires: "Financial proof, Medicals",
      color: "green"
    },
    {
      title: content.relocation_title,
      icon: Plane,
      description: content.relocation_desc,
      features: ["Pre-arrival Orientation", "Housing Guidance", "Airport Pickup", "Local Onboarding"],
      timeline: "Ongoing",
      requires: "Travel details",
      color: "purple"
    },
    {
      title: content.concierge_title,
      icon: Star,
      description: content.concierge_desc,
      features: ["Dedicated Advisor", "Priority Support", "Career Guidance", "Mentorship Access"],
      timeline: "6-12 months+",
      requires: "Career goals",
      isPopular: true,
      color: "yellow"
    }
  ];

  return (
    <>
      <SEO 
        title={content.meta_title} 
        description={content.meta_description} 
      />
      <div className="min-h-screen bg-slate-950 text-slate-50 pt-20">
        
        {/* Hero */}
        <section className="py-20 text-center container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">{content.page_heading}</h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
             {content.page_intro}
          </p>
        </section>

        <AdUnit slotId={ADSENSE_SLOTS.servicesTop} />

        {/* Services Grid */}
        <section className="py-8 container mx-auto px-4">
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-8">
            {services.map((s, i) => (
              <Card key={i} className={`bg-slate-900 border-slate-800 flex flex-col relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${s.isPopular ? 'border-blue-500/50 shadow-blue-900/20' : ''}`}>
                {s.isPopular && (
                  <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                    MOST POPULAR
                  </div>
                )}
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-${s.color}-900/20 flex items-center justify-center mb-4 text-${s.color}-500`}>
                    <s.icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-xl font-bold text-white">{s.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 flex-grow">
                  <p className="text-slate-400 text-sm">{s.description}</p>
                  
                  <div className="space-y-2">
                    {s.features.map((f, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-slate-800 space-y-2 text-xs text-slate-500">
                    <div className="flex justify-between">
                      <span>Timeline:</span>
                      <span className="text-slate-300">{s.timeline}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>You Provide:</span>
                      <span className="text-slate-300 truncate w-32 text-right" title={s.requires}>{s.requires}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-slate-800 hover:bg-blue-600 hover:text-white transition-colors" asChild>
                    <Link to="/signup">Apply Now</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>

        <AdUnit slotId={ADSENSE_SLOTS.servicesBottom} />

      </div>
    </>
  );
};

export default ServicesPage;