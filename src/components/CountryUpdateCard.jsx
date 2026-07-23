import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertTriangle, Info, CalendarCheck, ExternalLink, CheckCircle2 } from 'lucide-react';
import CountdownTimer from './CountdownTimer';
import AddToCalendarButton from './AddToCalendarButton';

const TYPE_CONFIG = {
  appointment_window: {
    icon: CalendarCheck,
    accent: 'rgba(37,99,235,0.15)',
    border: 'rgba(37,99,235,0.3)',
    iconColor: 'text-blue-400',
    badge: 'bg-blue-500/15 text-blue-300 border-blue-500/25',
    label: 'Appointment window',
  },
  deadline: {
    icon: AlertTriangle,
    accent: 'rgba(245,158,11,0.12)',
    border: 'rgba(245,158,11,0.3)',
    iconColor: 'text-amber-400',
    badge: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
    label: 'Deadline',
  },
  general: {
    icon: Info,
    accent: 'rgba(100,116,139,0.12)',
    border: 'rgba(100,116,139,0.2)',
    iconColor: 'text-slate-400',
    badge: 'bg-slate-500/15 text-slate-300 border-slate-500/25',
    label: 'Update',
  },
};

const FLAG_MAP = {
  poland: '🇵🇱', uk: '🇬🇧', canada: '🇨🇦', australia: '🇦🇺',
  usa: '🇺🇸', germany: '🇩🇪', lithuania: '🇱🇹', latvia: '🇱🇻',
  hungary: '🇭🇺', malta: '🇲🇹', cyprus: '🇨🇾', austria: '🇦🇹',
};

const CountryUpdateCard = ({ update, compact = false }) => {
  const [expired, setExpired] = useState(false);
  const cfg = TYPE_CONFIG[update.type] || TYPE_CONFIG.general;
  const Icon = cfg.icon;

  const appointmentDate = update.appointment_at ? new Date(update.appointment_at) : null;
  const isFuture = appointmentDate && appointmentDate > new Date();
  const isPast   = appointmentDate && appointmentDate <= new Date();
  const flag     = FLAG_MAP[update.destination_slug] || '🌍';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border p-4 space-y-3"
      style={{ background: cfg.accent, borderColor: cfg.border }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'rgba(0,0,0,0.2)', border: `1px solid ${cfg.border}` }}>
            <Icon className={`w-4 h-4 ${cfg.iconColor}`} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <span className="text-lg leading-none">{flag}</span>
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${cfg.badge}`}>
                {cfg.label}
              </span>
              <span className="text-xs text-slate-500 capitalize">{update.destination_slug}</span>
            </div>
            <p className="text-sm font-semibold text-white">{update.title}</p>
          </div>
        </div>
      </div>

      {/* Message */}
      <p className="text-slate-300 text-sm leading-relaxed">{update.message}</p>

      {/* Countdown or "Now open" */}
      {appointmentDate && (
        <div className="rounded-lg px-4 py-3 flex items-center justify-between gap-4 flex-wrap"
          style={{ background: 'rgba(0,0,0,0.25)', border: `1px solid ${cfg.border}` }}>
          {isFuture && !expired ? (
            <>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Opens in</p>
                <CountdownTimer targetDate={update.appointment_at} onExpire={() => setExpired(true)} />
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-0.5">On</p>
                  <p className="text-xs text-slate-300 font-medium">
                    {appointmentDate.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                  <p className="text-xs text-slate-400">
                    {appointmentDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })}
                  </p>
                </div>
                <AddToCalendarButton
                  title={update.title}
                  description={update.message}
                  date={update.appointment_at}
                  url={update.link}
                />
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <div>
                <p className="text-sm font-semibold text-emerald-300">Now open</p>
                <p className="text-xs text-slate-400">
                  Opened {appointmentDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} at{' '}
                  {appointmentDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer date */}
      <p className="text-[10px] text-slate-600">
        Posted {new Date(update.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
      </p>
    </motion.div>
  );
};

export default CountryUpdateCard;
