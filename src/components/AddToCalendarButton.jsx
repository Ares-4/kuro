import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CalendarPlus, ChevronDown } from 'lucide-react';

const pad = (n) => String(n).padStart(2, '0');

const toDateStr = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
};

const toIcsDateTime = (date) => {
  const d = new Date(date);
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
};

const toIcsDate = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
};

const isDateOnly = (date) => {
  const d = new Date(date);
  return d.getHours() === 0 && d.getMinutes() === 0 && d.getSeconds() === 0;
};

const buildIcs = ({ title, description, date, url }) => {
  const allDay = isDateOnly(date);
  const start = allDay ? `DTSTART;VALUE=DATE:${toIcsDate(date)}` : `DTSTART:${toIcsDateTime(date)}`;
  const end   = allDay
    ? `DTEND;VALUE=DATE:${toIcsDate(new Date(new Date(date).getTime() + 86400000))}`
    : `DTEND:${toIcsDateTime(new Date(new Date(date).getTime() + 3600000))}`;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Kuro Education//EN',
    'BEGIN:VEVENT',
    start,
    end,
    `SUMMARY:${title}`,
    description ? `DESCRIPTION:${description.replace(/\n/g, '\\n')}` : '',
    url ? `URL:${url}` : '',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean).join('\r\n');
};

const downloadIcs = (event) => {
  const ics  = buildIcs(event);
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href  = URL.createObjectURL(blob);
  link.download = `${event.title.replace(/[^a-z0-9]/gi, '_').slice(0, 60)}.ics`;
  link.click();
  URL.revokeObjectURL(link.href);
};

const googleCalendarUrl = ({ title, description, date, url }) => {
  const allDay = isDateOnly(date);
  const start  = toDateStr(date);
  const end    = toDateStr(new Date(new Date(date).getTime() + (allDay ? 86400000 : 3600000)));
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: allDay ? `${start}/${end}` : `${toIcsDateTime(date)}/${toIcsDateTime(new Date(new Date(date).getTime() + 3600000))}`,
    details: [description, url].filter(Boolean).join('\n\n'),
  });
  return `https://calendar.google.com/calendar/render?${params}`;
};

const OPTIONS = [
  { id: 'google',  label: 'Google Calendar', icon: '🗓️' },
  { id: 'apple',   label: 'Apple Calendar',  icon: '🍎' },
  { id: 'outlook', label: 'Outlook',          icon: '📧' },
];

const AddToCalendarButton = ({ title, description, date, url, className = '' }) => {
  const [open, setOpen]   = useState(false);
  const [pos,  setPos]    = useState(null);
  const buttonRef         = useRef(null);
  const menuRef           = useRef(null);

  const openMenu = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPos({
        top:  rect.top  + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
    setOpen(true);
  };

  const closeMenu = () => setOpen(false);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        menuRef.current   && !menuRef.current.contains(e.target) &&
        buttonRef.current && !buttonRef.current.contains(e.target)
      ) closeMenu();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on scroll
  useEffect(() => {
    if (!open) return;
    const handler = () => closeMenu();
    window.addEventListener('scroll', handler, true);
    return () => window.removeEventListener('scroll', handler, true);
  }, [open]);

  const handleOption = (id) => {
    if (id === 'google') {
      window.open(googleCalendarUrl({ title, description, date, url }), '_blank', 'noopener,noreferrer');
    } else {
      downloadIcs({ title, description, date, url });
    }
    closeMenu();
  };

  const event = { title, description, date, url };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={open ? closeMenu : openMenu}
        className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-500 hover:text-white transition-colors ${className}`}
      >
        <CalendarPlus className="w-3.5 h-3.5" />
        Add to calendar
        <ChevronDown className={`w-3 h-3 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && pos && createPortal(
        <div
          ref={menuRef}
          style={{
            position: 'absolute',
            top:  pos.top - 6,
            left: pos.left,
            transform: 'translateY(-100%)',
            zIndex: 99999,
            minWidth: '11rem',
          }}
          className="rounded-xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden"
        >
          {OPTIONS.map(opt => (
            <button
              key={opt.id}
              onClick={() => handleOption(opt.id)}
              className="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <span>{opt.icon}</span>
              {opt.label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  );
};

export default AddToCalendarButton;
