import React, { useState, useEffect } from 'react';

function diff(target) {
  const total = target - Date.now();
  if (total <= 0) return null;
  const s = Math.floor(total / 1000);
  return {
    days:    Math.floor(s / 86400),
    hours:   Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

const pad = n => String(n).padStart(2, '0');

const CountdownTimer = ({ targetDate, onExpire }) => {
  const [remaining, setRemaining] = useState(() => diff(new Date(targetDate).getTime()));

  useEffect(() => {
    if (!remaining) { onExpire?.(); return; }
    const id = setInterval(() => {
      const next = diff(new Date(targetDate).getTime());
      setRemaining(next);
      if (!next) { clearInterval(id); onExpire?.(); }
    }, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  if (!remaining) return null;

  const units = [
    { label: 'days',    value: remaining.days },
    { label: 'hours',   value: remaining.hours },
    { label: 'min',     value: remaining.minutes },
    { label: 'sec',     value: remaining.seconds },
  ];

  return (
    <div className="flex items-center gap-2">
      {units.map(({ label, value }, i) => (
        <React.Fragment key={label}>
          <div className="flex flex-col items-center">
            <span className="font-mono font-bold text-white tabular-nums leading-none text-lg">
              {pad(value)}
            </span>
            <span className="text-[9px] uppercase tracking-widest text-slate-500 mt-0.5">{label}</span>
          </div>
          {i < units.length - 1 && (
            <span className="text-slate-600 font-bold text-lg leading-none mb-3">:</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default CountdownTimer;
