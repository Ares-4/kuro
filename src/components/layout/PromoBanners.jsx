import React from 'react';
import PromoBanner from '@/components/PromoBanner';

const PromoBanners = () => {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Readiness Check Banner */}
      <PromoBanner variant="readiness" />

      {/* Guide Download Banner */}
      <PromoBanner variant="guide" />
    </div>
  );
};

export default PromoBanners;