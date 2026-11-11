import React from 'react';

// Looping background: faint flight arcs from Harare to the European cities
// Kuro students study in. A short glowing dash travels each arc on a loop.
// Pure SVG + CSS (stroke-dashoffset), fixed behind the page, no JS per frame.
// Motion stops under prefers-reduced-motion (see .flight-* rules in index.css).

// Rough positions on a 1440x900 canvas: Africa low-right, Europe across the top.
const ORIGIN = { x: 930, y: 860 }; // Harare
const CITIES = [
  { name: 'Warsaw', x: 860, y: 170, hue: 'blue', dur: 14, delay: 0 },
  { name: 'Berlin', x: 720, y: 190, hue: 'teal', dur: 17, delay: -5 },
  { name: 'Vilnius', x: 960, y: 120, hue: 'violet', dur: 19, delay: -11 },
  { name: 'Vienna', x: 780, y: 260, hue: 'amber', dur: 15, delay: -8 },
  { name: 'Budapest', x: 870, y: 280, hue: 'teal', dur: 21, delay: -2 },
  { name: 'Riga', x: 940, y: 80, hue: 'blue', dur: 23, delay: -15 },
  { name: 'Nicosia', x: 1130, y: 400, hue: 'amber', dur: 18, delay: -13 },
  { name: 'Valletta', x: 690, y: 420, hue: 'violet', dur: 20, delay: -6 },
];

// Quadratic arc bowed sideways so lines read as flight paths, not straight rays.
const arc = (c, i) => {
  const mx = (ORIGIN.x + c.x) / 2 + (i % 2 ? 1 : -1) * (120 + i * 18);
  const my = (ORIGIN.y + c.y) / 2;
  return `M ${ORIGIN.x} ${ORIGIN.y} Q ${mx} ${my} ${c.x} ${c.y}`;
};

const FlightPaths = () => (
  <svg
    className="flight-paths"
    viewBox="0 0 1440 900"
    preserveAspectRatio="xMidYMid slice"
    aria-hidden="true"
    focusable="false"
  >
    <defs>
      <radialGradient id="fp-fade" cx="62%" cy="45%" r="60%">
        <stop offset="0%" stopColor="#fff" stopOpacity="1" />
        <stop offset="100%" stopColor="#fff" stopOpacity="0" />
      </radialGradient>
      <mask id="fp-mask"><rect width="1440" height="900" fill="url(#fp-fade)" /></mask>
    </defs>
    <g mask="url(#fp-mask)">
      {CITIES.map((c, i) => (
        <g key={c.name} className={`flight-route hue-${c.hue}`}>
          <path d={arc(c, i)} className="flight-track" />
          <path
            d={arc(c, i)}
            className="flight-comet"
            pathLength="1000"
            style={{ animationDuration: `${c.dur}s`, animationDelay: `${c.delay}s` }}
          />
          <circle cx={c.x} cy={c.y} r="3" className="flight-city" style={{ animationDelay: `${c.delay}s` }} />
        </g>
      ))}
      <circle cx={ORIGIN.x} cy={ORIGIN.y} r="4" className="flight-origin" />
    </g>
  </svg>
);

export default FlightPaths;
