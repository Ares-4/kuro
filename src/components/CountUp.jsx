import React, { useEffect, useRef, useState } from 'react';

// Counts a figure like "200+", "90%+" or "2,400" up from zero once it scrolls
// into view, keeping its prefix/suffix. The real value is rendered first, so
// prerendered HTML, crawlers and reduced-motion users always see the true
// figure; the animation only runs for people actually watching the page.
const parse = (value) => {
  const m = String(value ?? '').match(/^(\D*)([\d,]+(?:\.\d+)?)(.*)$/);
  if (!m) return null;
  return { prefix: m[1], number: Number(m[2].replace(/,/g, '')), suffix: m[3], grouped: m[2].includes(',') };
};

const CountUp = ({ value, duration = 1400, className, style }) => {
  const ref = useRef(null);
  const [display, setDisplay] = useState(String(value ?? ''));
  const parsed = parse(value);

  useEffect(() => {
    setDisplay(String(value ?? ''));
    const el = ref.current;
    if (!el || !parsed || typeof window === 'undefined') return undefined;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce || navigator.webdriver || !('IntersectionObserver' in window)) return undefined;

    let raf;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const fmt = (n) => (parsed.grouped ? Math.round(n).toLocaleString('en-US') : String(Math.round(n)));
      const tick = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        setDisplay(`${parsed.prefix}${fmt(parsed.number * eased)}${parsed.suffix}`);
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.6 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  return <span ref={ref} className={className} style={style}>{display}</span>;
};

export default CountUp;
