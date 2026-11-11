import React, { useCallback, useEffect, useState } from 'react';
import { Clock, CheckCircle2, Upload, Mail, ChevronDown, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

// Paid readiness checks. The EUR 19 Premium report is promised "reviewed by an
// expert, PDF within 24 hours": this queue shows time left, the student's
// answers, and lets an admin upload the PDF and email it in one place.

const hoursLeft = (iso) => (new Date(iso).getTime() - Date.now()) / 3600000;
const fmtLeft = (h) => (h <= 0 ? `${Math.ceil(-h)} h overdue` : h < 1 ? `${Math.round(h * 60)} min left` : `${Math.floor(h)} h left`);
const ANSWER_SKIP = new Set(['plan', 'email', 'phone']);

const OrderRow = ({ order, onChanged }) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState('');
  const premium = order.product === 'readiness_premium';
  const h = order.due_at ? hoursLeft(order.due_at) : null;
  const urgent = premium && order.status !== 'delivered' && h !== null && h < 6;

  const upload = async (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf') { toast({ title: 'PDF only', variant: 'destructive' }); return; }
    setBusy('upload');
    const path = `${order.id}-${crypto.randomUUID()}.pdf`;
    const { error } = await supabase.storage.from('readiness-reports').upload(path, file, { contentType: 'application/pdf' });
    if (error) { setBusy(''); toast({ title: 'Upload failed', description: error.message, variant: 'destructive' }); return; }
    const { data } = supabase.storage.from('readiness-reports').getPublicUrl(path);
    await supabase.from('readiness_orders').update({ report_url: data.publicUrl, status: 'in_review' }).eq('id', order.id);
    setBusy('');
    toast({ title: 'Report uploaded', description: 'Check it, then email it to the student.' });
    onChanged();
  };

  const deliver = async () => {
    if (!order.report_url || !order.email) return;
    setBusy('send');
    const { error } = await supabase.functions.invoke('send-email', {
      body: { to: order.email, templateName: 'readiness_report', data: { name: order.answers?.name || 'there', link: order.report_url } },
    });
    if (error) { setBusy(''); toast({ title: 'Email failed', description: 'Check Admin > Notifications for the email error.', variant: 'destructive' }); return; }
    await supabase.from('readiness_orders').update({ status: 'delivered', delivered_at: new Date().toISOString() }).eq('id', order.id);
    setBusy('');
    toast({ title: 'Report delivered', description: `Emailed to ${order.email}.` });
    onChanged();
  };

  return (
    <li className={`rounded-xl border p-4 ${urgent ? 'border-amber-500/50 bg-amber-950/20' : 'border-slate-800 bg-slate-900/50'}`}>
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="min-w-0">
          <p className="font-semibold text-white">{order.email || 'No email'} <span className="text-xs font-medium text-slate-400 ml-2">{premium ? 'Premium €19' : 'Basic €2.99'}</span></p>
          <p className="text-xs text-slate-400 mt-0.5">Paid {new Date(order.created_at).toLocaleString('en-GB')} · {order.answers?.destination || 'destination not recorded'}</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          {order.status === 'delivered'
            ? <span className="flex items-center gap-1.5 text-emerald-300"><CheckCircle2 className="w-4 h-4" /> Delivered</span>
            : premium && h !== null && <span className={`flex items-center gap-1.5 font-semibold ${h <= 0 ? 'text-red-400' : urgent ? 'text-amber-300' : 'text-blue-300'}`}>{h <= 0 ? <AlertTriangle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}{fmtLeft(h)}</span>}
          <button type="button" onClick={() => setOpen((o) => !o)} className="text-slate-400 hover:text-white p-1" aria-label="Show answers">
            <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {open && (
        <dl className="mt-4 grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
          {Object.entries(order.answers || {}).filter(([k, v]) => !ANSWER_SKIP.has(k) && v !== '' && v != null).map(([k, v]) => (
            <div key={k} className="flex gap-2"><dt className="text-slate-500 shrink-0">{k.replace(/_/g, ' ')}:</dt><dd className="text-slate-200 break-words">{String(v)}</dd></div>
          ))}
          {!order.answers && <p className="text-slate-500">No answers linked to this order.</p>}
        </dl>
      )}

      {premium && order.status !== 'delivered' && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800 cursor-pointer">
            {busy === 'upload' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {order.report_url ? 'Replace report PDF' : 'Upload report PDF'}
            <input type="file" accept="application/pdf" className="hidden" onChange={(e) => upload(e.target.files?.[0])} />
          </label>
          {order.report_url && <a href={order.report_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-300 hover:underline">Preview</a>}
          <Button size="sm" onClick={deliver} disabled={!order.report_url || busy === 'send'} className="bg-blue-600 hover:bg-blue-700">
            {busy === 'send' ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Mail className="w-4 h-4 mr-1.5" /> Email report and mark delivered</>}
          </Button>
        </div>
      )}
    </li>
  );
};

const AdminReadinessOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('open');

  const load = useCallback(async () => {
    const { data } = await supabase.from('readiness_orders').select('*').order('created_at', { ascending: false }).limit(200);
    setOrders(data || []);
    setLoading(false);
  }, []);
  useEffect(() => { load(); const t = setInterval(load, 60000); return () => clearInterval(t); }, [load]);

  const shown = orders.filter((o) => filter === 'all' || (filter === 'open' ? o.product === 'readiness_premium' && o.status !== 'delivered' : o.status === 'delivered'));
  const openCount = orders.filter((o) => o.product === 'readiness_premium' && o.status !== 'delivered').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Readiness orders</h1>
        <p className="text-slate-400">Premium reports are promised within 24 hours of payment.</p>
      </div>
      <div className="flex gap-2">
        {[['open', `To deliver (${openCount})`], ['delivered', 'Delivered'], ['all', 'All']].map(([k, label]) => (
          <button key={k} onClick={() => setFilter(k)} className={`px-3 py-1.5 rounded-full text-sm border ${filter === k ? 'bg-blue-600 border-blue-500 text-white' : 'border-slate-700 text-slate-300 hover:bg-slate-800'}`}>{label}</button>
        ))}
      </div>
      {loading ? <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
        : shown.length === 0 ? <p className="text-center py-16 text-slate-400 border border-dashed border-slate-700 rounded-xl">{filter === 'open' ? 'No reports waiting. New Premium orders appear here as soon as they are paid.' : 'No orders yet.'}</p>
        : <ul className="space-y-3">{shown.map((o) => <OrderRow key={o.id} order={o} onChanged={load} />)}</ul>}
    </div>
  );
};

export default AdminReadinessOrders;
