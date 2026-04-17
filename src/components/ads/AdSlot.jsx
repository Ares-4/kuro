import React, { useEffect, useState } from 'react';
import { getPromoBanners } from '@/lib/settingsStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const AdSlot = ({ page, slot, className = '' }) => {
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchAndFilterBanner = async () => {
      try {
        const allBanners = await getPromoBanners();
        
        // Defensive coding: ensure we have a valid object
        const bannersData = (allBanners && typeof allBanners === 'object' && !Array.isArray(allBanners)) 
          ? allBanners 
          : {};

        const bannersList = Object.values(bannersData);

        // Filter logic
        const matchingBanners = bannersList.filter(b => {
          // Guard against malformed banner objects
          if (!b || typeof b !== 'object') return false;

          const isActive = b.isActive;
          
          // Check if pages is defined and is array
          const pagesList = Array.isArray(b.pages) ? b.pages : [];
          const matchesPage = pagesList.includes('all') || pagesList.includes(page);
          
          // Check if zones is defined and is array
          const zonesList = Array.isArray(b.zones) ? b.zones : [];
          const matchesZone = zonesList.includes(slot);
          
          return isActive && matchesPage && matchesZone;
        });

        // Sort by priority (descending)
        matchingBanners.sort((a, b) => (b.priority || 0) - (a.priority || 0));

        if (isMounted) {
          // Pick top one
          setBanner(matchingBanners.length > 0 ? matchingBanners[0] : null);
        }
      } catch (err) {
        console.error("AdSlot Error:", err);
      }
    };

    fetchAndFilterBanner();
    return () => { isMounted = false; };
  }, [page, slot]);

  if (!banner) return null;

  const animationVariants = {
    fade: { initial: { opacity: 0 }, animate: { opacity: 1 } },
    slide: { initial: { y: 20, opacity: 0 }, animate: { y: 0, opacity: 1 } },
    bounce: { initial: { scale: 0.9, opacity: 0 }, animate: { scale: 1, opacity: 1 }, transition: { type: 'spring', bounce: 0.5 } }
  };

  const selectedAnim = animationVariants[banner.animation] || animationVariants.fade;

  return (
    <AnimatePresence>
      <motion.div
        key={banner.id}
        initial={selectedAnim.initial}
        animate={selectedAnim.animate}
        className={`w-full rounded-xl overflow-hidden shadow-lg relative ${className}`}
        style={{ 
          backgroundColor: banner.backgroundColor,
          color: banner.textColor
        }}
      >
        <div className={`p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 ${banner.position === 'center' ? 'text-center md:text-center justify-center' : banner.position === 'right' ? 'text-right md:text-right flex-row-reverse' : 'text-left'}`}>
          
          <div className="text-4xl md:text-5xl shrink-0 animate-in zoom-in duration-500">
            {banner.emoji}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-xl md:text-2xl font-bold mb-2 leading-tight">
              {banner.title}
            </h3>
            {banner.description && (
              <p className="opacity-90 text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
                {banner.description}
              </p>
            )}
          </div>

          {banner.buttonText && banner.buttonLink && (
             <div className="shrink-0">
               <Button 
                 asChild
                 size="lg"
                 className="font-bold shadow-md transition-transform hover:scale-105"
                 style={{ 
                   backgroundColor: 'rgba(255,255,255,0.2)',
                   color: 'inherit',
                   border: '1px solid rgba(255,255,255,0.4)'
                 }}
               >
                 <Link to={banner.buttonLink}>
                   {banner.buttonText}
                 </Link>
               </Button>
             </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AdSlot;