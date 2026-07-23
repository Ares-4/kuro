import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Edit2, Trash2, Loader2, GraduationCap, X, ExternalLink, Link2, Sparkles } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

const COUNTRIES = ['Poland','UK','Canada','Australia','USA','Germany','Lithuania','Latvia','Hungary','Malta','Cyprus','Austria'];
const LEVELS    = ['Undergraduate','Masters','PhD','Any level'];

const EMPTY = {
  id: null, title: '', provider: '', countries: [], levels: [],
  amount: '', deadline: '', description: '', link: '', is_active: true,
};

const MultiSelect = ({ options, value = [], onChange, placeholder }) => (
  <div className="flex flex-wrap gap-1.5">
    {options.map(opt => {
      const active = value.includes(opt);
      return (
        <button key={opt} type="button"
          onClick={() => onChange(active ? value.filter(v => v !== opt) : [...value, opt])}
          className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
            active
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-slate-200'
          }`}
        >
          {opt}
        </button>
      );
    })}
  </div>
);

const AdminScholarships = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const [importing, setImporting] = useState(false);
  const { toast } = useToast();

  const handleImport = async () => {
    if (!importUrl.startsWith('http')) return;
    setImporting(true);
    try {
      let res;
      try {
        res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/scrape-scholarship`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', apikey: import.meta.env.VITE_SUPABASE_ANON_KEY },
            body: JSON.stringify({ url: importUrl }),
          }
        );
      } catch {
        throw new Error('Could not reach the import service. Check your connection.');
      }
      if (!res.ok) throw new Error(`Import service returned ${res.status}. The edge function may not be deployed.`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setForm(p => ({
        ...p,
        title:       data.title       || p.title,
        provider:    data.provider    || p.provider,
        description: data.description || p.description,
        amount:      data.amount      || p.amount,
        deadline:    data.deadline    || p.deadline,
        link:        importUrl,
      }));
      toast({ title: 'Fields pre-filled', description: 'Review and adjust before saving.' });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Import failed', description: err.message });
    }
    setImporting(false);
  };

  useEffect(() => { fetch(); }, []);

  const fetch = async () => {
    setLoading(true);
    const { data } = await supabase.from('scholarships').select('*').order('deadline', { ascending: true, nullsLast: true });
    setList(data || []);
    setLoading(false);
  };

  const openNew  = () => { setForm(EMPTY); setEditing('new'); };
  const openEdit = (s) => { setForm({ ...s, deadline: s.deadline || '' }); setEditing(s.id); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, deadline: form.deadline || null, updated_at: new Date() };
    let error;
    if (form.id) ({ error } = await supabase.from('scholarships').update(payload).eq('id', form.id));
    else          ({ error } = await supabase.from('scholarships').insert([{ ...payload, id: undefined }]));
    setSaving(false);
    if (error) toast({ variant: 'destructive', title: 'Save failed', description: error.message });
    else { toast({ title: 'Scholarship saved' }); setEditing(null); fetch(); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this scholarship?')) return;
    await supabase.from('scholarships').delete().eq('id', id);
    fetch();
  };

  const daysLeft = (date) => {
    if (!date) return null;
    const d = Math.ceil((new Date(date) - new Date()) / 86400000);
    return d;
  };

  if (editing) return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => setEditing(null)} className="text-slate-400 hover:text-white">
          <X className="w-4 h-4 mr-2" /> Cancel
        </Button>
        <h2 className="text-2xl font-bold text-white">{form.id ? 'Edit scholarship' : 'New scholarship'}</h2>
      </div>
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="pt-6">
          <form onSubmit={handleSave} className="space-y-4">
            {!form.id && (
              <div className="flex gap-2 p-3 rounded-lg border border-blue-700/30 bg-blue-900/10">
                <div className="relative flex-1">
                  <Link2 className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                  <Input
                    value={importUrl}
                    onChange={e => setImportUrl(e.target.value)}
                    placeholder="Paste a scholarship URL to auto-fill fields…"
                    className="pl-8 bg-slate-900 border-slate-700 text-white text-sm"
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleImport())}
                  />
                </div>
                <Button type="button" onClick={handleImport} disabled={importing || !importUrl.startsWith('http')}
                  className="bg-blue-700 hover:bg-blue-600 shrink-0 gap-1.5">
                  {importing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  Import
                </Button>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1 md:col-span-2">
                <Label className="text-slate-300">Title</Label>
                <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. DAAD Scholarship for African Students" required
                  className="bg-slate-900 border-slate-700 text-white" />
              </div>
              <div className="space-y-1">
                <Label className="text-slate-300">Provider / Organisation</Label>
                <Input value={form.provider} onChange={e => setForm(p => ({ ...p, provider: e.target.value }))}
                  placeholder="e.g. German Academic Exchange" required
                  className="bg-slate-900 border-slate-700 text-white" />
              </div>
              <div className="space-y-1">
                <Label className="text-slate-300">Amount</Label>
                <Input value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                  placeholder="e.g. €850/month or Full tuition"
                  className="bg-slate-900 border-slate-700 text-white" />
              </div>
              <div className="space-y-1">
                <Label className="text-slate-300">Application deadline</Label>
                <Input type="date" value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))}
                  className="bg-slate-900 border-slate-700 text-white" />
              </div>
              <div className="space-y-1">
                <Label className="text-slate-300">Link to apply</Label>
                <Input value={form.link} onChange={e => setForm(p => ({ ...p, link: e.target.value }))}
                  placeholder="https://..." className="bg-slate-900 border-slate-700 text-white" />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-slate-300">Countries</Label>
              <MultiSelect options={COUNTRIES} value={form.countries}
                onChange={v => setForm(p => ({ ...p, countries: v }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-slate-300">Study levels</Label>
              <MultiSelect options={LEVELS} value={form.levels}
                onChange={v => setForm(p => ({ ...p, levels: v }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-slate-300">Description</Label>
              <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Eligibility, requirements, what's covered..." rows={4}
                className="bg-slate-900 border-slate-700 text-white" />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.is_active} onCheckedChange={c => setForm(p => ({ ...p, is_active: c }))} />
              <Label className="text-slate-300">Published (visible to students)</Label>
            </div>
            <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 w-full">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <GraduationCap className="w-4 h-4 mr-2" />}
              {form.id ? 'Save changes' : 'Publish scholarship'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Scholarships</h2>
          <p className="text-slate-400 text-sm mt-1">Funding opportunities shown to students, filterable by country and study level.</p>
        </div>
        <Button onClick={openNew} className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto">
          <Plus className="w-4 h-4 mr-2" /> Add scholarship
        </Button>
      </div>

      {loading && <div className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-500" /></div>}

      {!loading && list.length === 0 && (
        <div className="text-center py-16 border border-dashed border-slate-700 rounded-xl text-slate-500">
          <GraduationCap className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>No scholarships yet. Add your first one.</p>
        </div>
      )}

      <div className="space-y-3">
        {list.map(s => {
          const days = daysLeft(s.deadline);
          return (
            <div key={s.id} className={`rounded-xl border p-4 transition-opacity ${s.is_active ? '' : 'opacity-50'}`}
              style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)' }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-semibold text-white text-sm">{s.title}</p>
                    {!s.is_active && <span className="text-[10px] px-2 py-0.5 rounded border bg-slate-800 text-slate-500 border-slate-700">Hidden</span>}
                    {days !== null && days > 0 && days <= 14 && (
                      <span className="text-[10px] px-2 py-0.5 rounded border bg-amber-500/10 text-amber-400 border-amber-500/20 font-semibold">{days}d left</span>
                    )}
                    {days !== null && days <= 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded border bg-red-500/10 text-red-400 border-red-500/20 font-semibold">Expired</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">{s.provider} · {s.amount || 'Amount TBD'} · Deadline: {s.deadline ? new Date(s.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Open'}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(s.countries || []).map(c => <span key={c} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">{c}</span>)}
                    {(s.levels || []).map(l => <span key={l} className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/30 text-blue-400 border border-blue-800">{l}</span>)}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {s.link && <a href={s.link} target="_blank" rel="noopener noreferrer" className="p-1.5 text-slate-400 hover:text-white"><ExternalLink className="w-3.5 h-3.5" /></a>}
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white" onClick={() => openEdit(s)}><Edit2 className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-300" onClick={() => handleDelete(s.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminScholarships;
