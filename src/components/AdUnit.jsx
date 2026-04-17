import React, { useEffect, useRef } from 'react';

const AdUnit = ({ slotId, format = 'auto' }) => {
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!slotId) return;
    
    if (!initializedRef.current) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        initializedRef.current = true;
      } catch (error) {
        // Silently fail if ad blocker or other error
        console.warn('AdSense push failed');
      }
    }
  }, [slotId]);

  if (!slotId) return null;

  return (
    <div className="ad-container">
      <ins
        className="adsbygoogle block w-full"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-2493026919792043"
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdUnit;