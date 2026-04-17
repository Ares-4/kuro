import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Building, Plane, FileText, Quote, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SEO from '@/components/SEO';
import { getCountryImageUrl } from '@/lib/imageUtils';
import { getPageContent } from '@/lib/contentService';
import { DEFAULT_CONTENT } from '@/lib/defaultContent';
import AdUnit from '@/components/AdUnit';
import { ADSENSE_SLOTS } from '@/config/adsenseSlots';

const HomePage = ({ contentOverride }) => {
  const [content, setContent] = useState(DEFAULT_CONTENT.home);
  const [storiesContent, setStoriesContent] = useState(DEFAULT_CONTENT.student_stories);
  const [teamContent, setTeamContent] = useState(DEFAULT_CONTENT.expert_team);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const [homeData, storiesData, teamData] = await Promise.all([
          getPageContent('home'),
          getPageContent('student_stories'),
          getPageContent('expert_team')
        ]);
        
        setContent(prev => ({ ...prev, ...homeData }));
        setStoriesContent(prev => ({ ...prev, ...storiesData }));
        setTeamContent(prev => ({ ...prev, ...teamData }));
      } catch (e) {
        console.error("Error loading home page content", e);
      } finally {
        setLoading(false);
      }
    };

    if (contentOverride) {
      const keys = Object.keys(contentOverride);
      if (keys.some(k => k.startsWith('hero_') || k.startsWith('featured_'))) {
         setContent(prev => ({ ...prev, ...contentOverride }));
      }
      if (keys.some(k => k.startsWith('stories_') || k.startsWith('story_'))) {
         setStoriesContent(prev => ({ ...prev, ...contentOverride }));
      }
      if (keys.some(k => k.startsWith('team_'))) {
         setTeamContent(prev => ({ ...prev, ...contentOverride }));
      }
      setLoading(false);
    } else {
      loadContent();
    }
  }, [contentOverride]);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Kuro Education Consultancy",
    "url": "https://kuroeduconsultancy.com",
    "logo": "https://kuroeduconsultancy.com/logo.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+48783042776",
      "contactType": "customer service"
    }
  };

  const heroImage = "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&q=80";

  return (
    <>
      <SEO 
        title={content.meta_title} 
        description={content.meta_description}
        schema={schema}
      />
      <div className="min-h-screen bg-slate-950 text-slate-50">
        
        {/* Hero Section */}
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
             <img 
               src={heroImage} 
               alt="Global Education"
               className="w-full h-full object-cover"
             />
             <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px]" />
             <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 via-slate-950/50 to-slate-950" />
          </div>

          <div className="container mx-auto px-4 relative z-10 text-center">
             <motion.div initial={{opacity: 0, y: 30}} animate={{opacity: 1, y: 0}} transition={{duration: 0.8}}>
               <Badge className="mb-6 bg-blue-600/20 text-blue-400 border-blue-500/30 px-4 py-1.5 text-sm uppercase tracking-wider">
                 Your Gateway to Global Education
               </Badge>
               <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold text-white mb-6 leading-tight max-w-5xl mx-auto">
                 {content.hero_title}
               </h1>
               <p className="text-lg sm:text-xl text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
                 {content.hero_subtitle}
               </p>
               <div className="flex flex-col sm:flex-row gap-4 justify-center">
                 <Button size="lg" className="h-14 px-8 text-lg bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-900/20" asChild>
                   <Link to="/eligibility">{content.hero_cta_label} <ArrowRight className="ml-2 w-5 h-5" /></Link>
                 </Button>
                 <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-slate-600 text-slate-200 hover:bg-slate-800" asChild>
                   <Link to="/destinations">Explore Destinations</Link>
                 </Button>
               </div>
             </motion.div>
          </div>
        </section>

        <AdUnit slotId={ADSENSE_SLOTS.homeTop} />

        {/* How It Works Preview */}
        <section className="py-20 bg-slate-900 border-y border-slate-800">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">How It Works</h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">A simplified path to your international education.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 relative">
               {[
                 { title: "Check Eligibility", desc: "Free assessment of your profile.", icon: ShieldCheck },
                 { title: "Apply & Visa", desc: "We handle the paperwork for you.", icon: FileText },
                 { title: "Fly & Study", desc: "Relocation support included.", icon: Plane }
               ].map((item, i) => (
                 <div key={i} className="text-center p-8 bg-slate-950 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-all hover:-translate-y-1">
                   <div className="w-16 h-16 rounded-full bg-blue-900/20 flex items-center justify-center mx-auto mb-6 text-blue-500">
                     <item.icon className="w-8 h-8" />
                   </div>
                   <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                   <p className="text-slate-400">{item.desc}</p>
                 </div>
               ))}
            </div>
            <div className="text-center mt-12">
              <Link to="/process" className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-2">
                View Full Process <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Expert Team Section */}
        <section className="py-24 bg-slate-950 relative">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">{teamContent.team_heading}</h2>
              <p className="text-lg text-slate-400">{teamContent.team_intro}</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map((num) => (
                <div key={num} className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl hover:bg-slate-900 transition-colors text-center group">
                  <div className="w-24 h-24 bg-slate-800 rounded-full mx-auto mb-6 flex items-center justify-center group-hover:bg-blue-900/30 transition-colors">
                     <User className="w-10 h-10 text-slate-400 group-hover:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">{teamContent[`team_member_${num}_name`]}</h3>
                  <p className="text-blue-400 text-sm font-medium mb-4">{teamContent[`team_member_${num}_title`]}</p>
                  <p className="text-slate-400 text-sm leading-relaxed">{teamContent[`team_member_${num}_bio`]}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-12">
               <Button className="bg-blue-600 hover:bg-blue-700 h-12 px-8" asChild>
                 <Link to="/contact">Start Your Journey</Link>
               </Button>
            </div>
          </div>
        </section>

        {/* Services Preview */}
        <section className="py-20 bg-slate-900/30 border-y border-slate-800">
          <div className="container mx-auto px-4">
             <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
               <div>
                 <h2 className="text-3xl md:text-5xl font-bold text-white mb-2">Our Services</h2>
                 <p className="text-slate-400">Comprehensive support packages tailored to your needs.</p>
               </div>
               <Button variant="outline" asChild><Link to="/services">View All Services</Link></Button>
             </div>
             
             <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {['Admissions', 'Visa Support', 'Relocation', 'Concierge'].map((s, i) => (
                  <Card key={i} className="bg-slate-900 border-slate-800 hover:border-blue-500/30 transition-colors">
                    <CardContent className="p-6">
                      <div className="w-10 h-10 bg-slate-800 rounded-lg mb-4 flex items-center justify-center text-blue-400 font-bold">
                        {i + 1}
                      </div>
                      <h3 className="font-bold text-white text-lg mb-2">{s}</h3>
                      <p className="text-slate-400 text-sm">Expert guidance to ensure your success in this stage.</p>
                    </CardContent>
                  </Card>
                ))}
             </div>
          </div>
        </section>

        {/* Student Stories Section */}
        <section className="py-24 bg-gradient-to-b from-slate-950 to-slate-900">
           <div className="container mx-auto px-4">
             <div className="text-center mb-16">
               <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">{storiesContent.stories_heading}</h2>
               <p className="text-lg text-slate-400 max-w-2xl mx-auto">{storiesContent.stories_intro}</p>
             </div>
             <div className="grid md:grid-cols-3 gap-8">
               {[1, 2, 3].map((num) => (
                 <div key={num} className="bg-slate-900 border border-slate-800 p-8 rounded-2xl relative">
                    <Quote className="w-8 h-8 text-blue-600/30 absolute top-6 left-6" />
                    <p className="text-slate-300 italic mb-6 mt-4 relative z-10 leading-relaxed">
                      "{storiesContent[`story_${num}_quote`]}"
                    </p>
                    <div className="flex items-center justify-end">
                      <span className="text-blue-400 font-semibold block">
                        - {storiesContent[`story_${num}_author`]}
                      </span>
                    </div>
                 </div>
               ))}
             </div>
           </div>
        </section>

        {/* Destinations Preview */}
        <section className="py-20 bg-slate-950">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-5xl font-bold text-white text-center mb-16">{content.featured_destinations_heading}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                'Canada', 'UK', 'Austria', 'Australia', 'USA', 'Poland'
              ].map((countryName) => (
                <Link key={countryName} to={`/destinations/${countryName.toLowerCase()}`} className="group block relative overflow-hidden rounded-2xl aspect-[4/3]">
                  <img 
                    src={getCountryImageUrl(countryName)} 
                    alt={countryName}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-6 left-6">
                    <h3 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">{countryName}</h3>
                    <p className="text-slate-300 text-sm flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                      Explore Universities <ArrowRight className="w-4 h-4" />
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-12">
               <Button size="lg" className="bg-slate-800 hover:bg-slate-700" asChild>
                 <Link to="/destinations">View All 50+ Countries</Link>
               </Button>
            </div>
          </div>
        </section>

        {/* Partners */}
        <section className="py-16 bg-slate-950 border-t border-slate-800">
           <div className="container mx-auto px-4 text-center">
             <p className="text-slate-500 uppercase tracking-widest text-sm font-semibold mb-8">Trusted by Top Institutions</p>
             <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
               {['Uni Warsaw', 'Melbourne U', 'Toronto U', 'Berlin Tech', 'NYU', 'London Met'].map((uni, i) => (
                 <div key={i} className="text-xl font-bold text-slate-300 flex items-center gap-2">
                   <Building className="w-6 h-6" /> {uni}
                 </div>
               ))}
             </div>
           </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 bg-blue-900/20 relative overflow-hidden">
           <div className="absolute inset-0 bg-slate-950/80" /> 
           <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
             <h2 className="text-4xl font-bold text-white mb-6">{content.cta_section_title}</h2>
             <p className="text-xl text-slate-300 mb-10">
               {content.cta_section_subtitle}
             </p>
             <Button size="lg" className="h-14 px-10 text-xl bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-900/30" asChild>
               <Link to="/signup">{content.cta_button_label}</Link>
             </Button>
           </div>
        </section>

        <AdUnit slotId={ADSENSE_SLOTS.homeBottom} />

      </div>
    </>
  );
};

export default HomePage;