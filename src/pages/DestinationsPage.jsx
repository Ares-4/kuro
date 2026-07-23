import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Globe, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SEO from '@/components/SEO';
import DestinationCard from '@/components/DestinationCard';
import { getCountryFallbackImage } from '@/lib/imageUtils';
import { getPageContent } from '@/lib/contentService';
import { DEFAULT_CONTENT } from '@/lib/defaultContent';
import AdUnit from '@/components/AdUnit';
import { ADSENSE_SLOTS } from '@/config/adsenseSlots';
import { supabase } from '@/lib/customSupabaseClient';

const FALLBACK_REGIONS = [
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

const DestinationsPage = ({ contentOverride }) => {
  const [content, setContent] = useState(DEFAULT_CONTENT.destinations);
  const [loading, setLoading] = useState(true);
  const [liveDestinations, setLiveDestinations] = useState([]);

  useEffect(() => {
    if (contentOverride) {
      setContent({ ...DEFAULT_CONTENT.destinations, ...contentOverride });
    } else {
      getPageContent('destinations').then(data => setContent(data));
    }

    supabase
      .from('destinations')
      .select('*')
      .eq('is_active', true)
      .order('name')
      .then(({ data }) => {
        setLiveDestinations(data || []);
        setLoading(false);
      });
  }, [contentOverride]);

  const regions = liveDestinations.length > 0
    ? [{ name: 'All Destinations', countries: liveDestinations.map(d => ({
        name: d.name,
        slug: d.slug,
        image: d.image_url,
        highlights: [d.tuition_cost, d.living_cost].filter(Boolean),
        description: d.description,
      })) }]
    : FALLBACK_REGIONS;

  return (
    <>
      <SEO 
        title={content.meta_title} 
        description={content.meta_description}
      />
      <div className="text-slate-50">

        {/* Hero */}
        <section className="relative pt-28 pb-16 border-b border-white/5">
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(37,99,235,0.18), transparent 65%)' }} />
          <div style={{ width: 'var(--container-narrow)', marginInline: 'auto', padding: '0 1rem' }} className="text-center relative z-10">
            <motion.span initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="eyebrow">
              Explore destinations
            </motion.span>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="font-display font-bold grad-text mt-4 mb-5"
              style={{ fontSize: 'var(--fs-4xl)', letterSpacing: '-0.03em', lineHeight: 1.04 }}>
              {content.page_heading}
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-slate-300 mb-8 max-w-2xl mx-auto" style={{ fontSize: 'var(--fs-lg)' }}>
              {content.page_intro}
            </motion.p>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              <Button size="xl" className="bg-blue-600 hover:bg-blue-500" asChild>
                <Link to="/eligibility">Check your eligibility</Link>
              </Button>
            </motion.div>
          </div>
        </section>

        <section className="py-16">
          <div style={{ width: 'var(--container)', marginInline: 'auto', padding: '0 1rem' }}>
            <AdUnit slotId={ADSENSE_SLOTS.destinationsTop} />

            {loading && (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
              </div>
            )}

            <div className="space-y-16 mt-8">
              {!loading && regions.map((region, idx) => (
                <motion.div key={region.name}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }} viewport={{ once: true }}>
                  <div className="flex items-center gap-3 mb-6">
                    <Globe className="w-5 h-5 text-blue-400" />
                    <h2 className="font-display font-semibold text-white" style={{ fontSize: 'var(--fs-xl)' }}>{region.name}</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {region.countries.map((country) => (
                      <DestinationCard
                        key={country.slug}
                        name={country.name}
                        slug={country.slug}
                        image={country.image || getCountryFallbackImage(country.name)}
                        highlights={country.highlights}
                      />
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            <AdUnit slotId={ADSENSE_SLOTS.destinationsBottom} />
          </div>
        </section>

      </div>
    </>
  );
};

export default DestinationsPage;