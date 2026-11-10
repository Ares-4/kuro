import React, { useCallback, useEffect, useState } from 'react';
import { UserPlus, UserCheck, CreditCard, AlertTriangle, Bell, CheckCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/customSupabaseClient';

// Inbox for admin_notifications: new accounts, completed profiles, payments and
// payment problems (written by DB triggers and the stripe-webhook function).

const TYPE_META = {
  new_account: { icon: UserPlus, color: 'text-blue-400', label: 'New account' },
  profile_completed: { icon: UserCheck, color: 'text-emerald-400', label: 'Profile' },
  readiness_paid: { icon: CreditCard, color: 'text-emerald-400', label: 'Payment' },
  payment_success: { icon: CreditCard, color: 'text-emerald-400', label: 'Payment' },
  payment_orphaned: { icon: AlertTriangle, color: 'text-amber-400', label: 'Payment issue' },
  payment_amount_mismatch: { icon: AlertTriangle, color: 'text-red-400', label: 'Payment issue' },
};

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'accounts', label: 'Accounts', types: ['new_account', 'profile_completed'] },
  { key: 'payments', label: 'Payments', types: ['readiness_paid', 'payment_success', 'payment_orphaned', 'payment_amount_mismatch'] },
];

const timeAgo = (iso) => {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const UNREAD_EVENT = 'kuro-admin-notifications-changed';

const AdminNotifications = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('admin_notifications')
      .select('id, type, title, body, is_read, created_at')
      .order('created_at', { ascending: false })
      .limit(200);
    if (!error) setItems(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 60_000);
    return () => clearInterval(t);
  }, [load]);

  const markRead = async (ids) => {
    if (!ids.length) return;
    setItems((list) => list.map((n) => (ids.includes(n.id) ? { ...n, is_read: true } : n)));
    await supabase.from('admin_notifications').update({ is_read: true }).in('id', ids);
    window.dispatchEvent(new Event(UNREAD_EVENT));
  };

  const active = FILTERS.find((f) => f.key === filter);
  const shown = items.filter((n) =>
    filter === 'unread' ? !n.is_read : active?.types ? active.types.includes(n.type) : true);
  const unreadIds = items.filter((n) => !n.is_read).map((n) => n.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Notifications</h1>
          <p className="text-slate-400">New student accounts, completed profiles and payments.</p>
        </div>
        <Button onClick={() => markRead(unreadIds)} disabled={!unreadIds.length} variant="outline" className="border-slate-700 text-slate-200 bg-transparent hover:bg-slate-800 w-full md:w-auto">
          <CheckCheck className="w-4 h-4 mr-2" /> Mark all read ({unreadIds.length})
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${filter === f.key ? 'bg-blue-600 border-blue-500 text-white' : 'border-slate-700 text-slate-300 hover:bg-slate-800'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
      ) : shown.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-slate-700 rounded-xl">
          <Bell className="w-8 h-8 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">Nothing here yet.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {shown.map((n) => {
            const meta = TYPE_META[n.type] || { icon: Bell, color: 'text-slate-400', label: n.type || 'Notice' };
            const Icon = meta.icon;
            return (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => !n.is_read && markRead([n.id])}
                  className={`w-full text-left flex gap-3 p-4 rounded-xl border transition-colors ${n.is_read ? 'border-slate-800 bg-slate-900/40' : 'border-blue-800/60 bg-blue-950/30 hover:bg-blue-950/50'}`}
                >
                  <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${meta.color}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`font-semibold ${n.is_read ? 'text-slate-300' : 'text-white'}`}>{n.title}</p>
                      <span className="text-[11px] uppercase tracking-wide text-slate-500">{meta.label}</span>
                      {!n.is_read && <span className="w-2 h-2 rounded-full bg-blue-400" aria-label="Unread" />}
                    </div>
                    {n.body && <p className="text-sm text-slate-400 mt-1 break-words">{n.body}</p>}
                    <p className="text-xs text-slate-500 mt-1.5">{timeAgo(n.created_at)}</p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default AdminNotifications;
