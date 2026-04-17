import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SEO from '@/components/SEO';
import DestinationCard from '@/components/DestinationCard';
import { getCountryFallbackImage } from '@/lib/imageUtils';
import { getPageContent } from '@/lib/contentService';
import { DEFAULT_CONTENT } from '@/lib/defaultContent';
import AdUnit from '@/components/AdUnit';
import { ADSENSE_SLOTS } from '@/config/adsenseSlots';

const getCountries = () => {
  return [
    {
      name: "European Union",
      countries: [
        { name: "Poland", slug: "poland", highlights: ["Low Tuition", "Schengen Visa"] },
        { name: "Germany", slug: "germany", highlights: ["Free Education", "Top Engineering"] },
        { name: "Lithuania", slug: "lithuania", highlights: ["Affordable Living", "Tech Hub"] },
        { name: "Latvia", slug: "latvia", highlights: ["Baltic Charm", "IT Programs"] },
        { name: "Hungary", slug: "hungary", highlights: ["Historic Universities", "Central Europe"] },
        { name: "Malta", slug: "malta", highlights: ["English Speaking", "Mediterranean"] },
        { name: "Cyprus", slug: "cyprus", highlights: ["Great Climate", "Tourism Studies"] }
      ]
    },
    {
      name: "North America",
      countries: [
        { name: "USA", slug: "usa", highlights: ["Ivy League", "Global Leader"] },
        { name: "Canada", slug: "canada", highlights: ["Post-Study Work", "High Quality Life"] }
      ]
    },
    {
      name: "Oceania",
      countries: [
        { name: "Australia", slug: "australia", highlights: ["Great Lifestyle", "Top Research"] }
      ]
    },
    {
      name: "United Kingdom",
      countries: [
        { name: "UK", slug: "uk", highlights: ["Short Masters", "Historic"] }
      ]
    }
  ];
};

const DestinationsPage = ({ contentOverride }) => {
  const [content, setContent] = useState(DEFAULT_CONTENT.destinations);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (contentOverride) {
      setContent({ ...DEFAULT_CONTENT.destinations, ...contentOverride });
      setLoading(false);
      return;
    }
    const loadContent = async () => {
      const data = await getPageContent('destinations');
      setContent(data);
      setLoading(false);
    };
    loadContent();
  }, [contentOverride]);

  const regions = getCountries();

  return (
    <>
      <SEO 
        title={content.meta_title} 
        description={content.meta_description}
      />
      <div className="min-h-screen bg-slate-950 text-slate-50 pt-20">
        
        {/* Hero Section */}
        <section className="relative py-20 bg-slate-900 border-b border-slate-800">
          <div className="absolute inset-0 bg-blue-600/5 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900/0 to-slate-900/0" />
          <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-white">
              {content.page_heading}
            </h1>
            <p className="text-xl text-slate-400 mb-8">
              {content.page_intro}
            </p>
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700" asChild>
              <Link to="/eligibility">Check Your Eligibility</Link>
            </Button>
          </div>
        </section>

        <AdUnit slotId={ADSENSE_SLOTS.destinationsTop} />

        {/* Regions Grid */}
        <div className="container mx-auto px-4 py-8 space-y-20">
          {regions.map((region, idx) => (
            <motion.div 
              key={region.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-4 mb-8">
                <Globe className="w-6 h-6 text-blue-500" />
                <h2 className="text-3xl font-bold text-white">{region.name}</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {region.countries.map((country) => (
                  <DestinationCard 
                    key={country.slug}
                    name={country.name}
                    slug={country.slug}
                    image={getCountryFallbackImage(country.name)} 
                    highlights={country.highlights}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <AdUnit slotId={ADSENSE_SLOTS.destinationsBottom} />
        
      </div>
    </>
  );
};

export default DestinationsPage;