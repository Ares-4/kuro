import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Edit2, Trash2, Loader2, Bell, X, CalendarCheck, AlertTriangle, Info } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import CountryUpdateCard from '@/components/CountryUpdateCard';

const DESTINATIONS = [
  'poland','uk','canada','australia','usa','germany',
  'lithuania','latvia','hungary','malta','cyprus','austria',
];

const TYPE_OPTS = [
  { value: 'appointment_window', label: 'Appointment window', icon: CalendarCheck },
  { value: 'deadline',           label: 'Deadline',           icon: AlertTriangle },
  { value: 'general',            label: 'General update',     icon: Info },
];

const EMPTY = {
  id: null, destination_slug: '', title: '', message: '',
  type: 'appointment_window', appointment_at: '', expires_at: '', is_active: true,
};

const AdminCountryUpdates = () => {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [filterSlug, setFilterSlug] = useState('');
  const { toast } = useToast();

  useEffect(() => { fetch(); }, []);

  const fetch = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('country_updates')
      .select('*')
      .order('created_at', { ascending: false });
    setUpdates(data || []);
    setLoading(false);
  };

  const openNew = () => { setForm(EMPTY); setEditing('new'); };

  const openEdit = (u) => {
    setForm({
      ...u,
      appointment_at: u.appointment_at ? u.appointment_at.slice(0, 16) : '',
      expires_at:     u.expires_at     ? u.expires_at.slice(0, 16)     : '',
    });
    setEditing(u.id);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.destination_slug || !form.title || !form.message) {
      toast({ variant: 'destructive', title: 'Missing fields', description: 'Country, title and message are required.' });
      return;
    }
    setSaving(true);
    const payload = {
      destination_slug: form.destination_slug,
      title:            form.title.trim(),
      message:          form.message.trim(),
      type:             form.type,
      appointment_at:   form.appointment_at || null,
      expires_at:       form.expires_at     || null,
      is_active:        form.is_active,
      updated_at:       new Date(),
    };
    let error;
    if (form.id) {
      ({ error } = await supabase.from('country_updates').update(payload).eq('id', form.id));
    } else {
      ({ error } = await supabase.from('country_updates').insert([payload]));
    }
    setSaving(false);
    if (error) {
      toast({ variant: 'destructive', title: 'Save failed', description: error.message });
    } else {
      toast({ title: form.id ? 'Update saved' : 'Update published', description: 'Students will see this immediately.' });
      setEditing(null);
      fetch();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this update?')) return;
    await supabase.from('country_updates').delete().eq('id', id);
    fetch();
  };

  const toggleActive = async (u) => {
    await supabase.from('country_updates').update({ is_active: !u.is_active }).eq('id', u.id);
    fetch();
  };

  const filtered = filterSlug ? updates.filter(u => u.destination_slug === filterSlug) : updates;

  if (editing) {
    return (
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setEditing(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4 mr-2" /> Cancel
          </Button>
          <h2 className="text-2xl font-bold text-white">{form.id ? 'Edit update' : 'New country update'}</h2>
        </div>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-slate-300">Country</Label>
                  <select
                    value={form.destination_slug}
                    onChange={e => setForm(p => ({ ...p, destination_slug: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">— select —</option>
                    {DESTINATIONS.map(d => (
                      <option key={d} value={d} className="capitalize">{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <Label className="text-slate-300">Update type</Label>
                  <select
                    value={form.type}
                    onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {TYPE_OPTS.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-slate-300">Title</Label>
                <Input
                  value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Polish student visa appointments now open"
                  required
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-slate-300">Message</Label>
                <Textarea
                  value={form.message}
                  onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                  placeholder="Full details of the update — include any instructions for applicants..."
                  required
                  className="bg-slate-900 border-slate-700 text-white min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-slate-300">
                    Appointment / opens at
                    <span className="text-slate-500 text-xs ml-1">(optional — triggers countdown)</span>
                  </Label>
                  <Input
                    type="datetime-local"
                    value={form.appointment_at}
                    onChange={e => setForm(p => ({ ...p, appointment_at: e.target.value }))}
                    className="bg-slate-900 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-slate-300">
                    Auto-expire at
                    <span className="text-slate-500 text-xs ml-1">(optional)</span>
                  </Label>
                  <Input
                    type="datetime-local"
                    value={form.expires_at}
                    onChange={e => setForm(p => ({ ...p, expires_at: e.target.value }))}
                    className="bg-slate-900 border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Switch checked={form.is_active} onCheckedChange={c => setForm(p => ({ ...p, is_active: c }))} />
                <Label className="text-slate-300">Publish immediately</Label>
              </div>

              {/* Live preview */}
              {form.title && form.message && form.destination_slug && (
                <div className="space-y-2">
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Preview</p>
                  <CountryUpdateCard update={{ ...form, created_at: new Date().toISOString() }} />
                </div>
              )}

              <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 w-full">
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Bell className="w-4 h-4 mr-2" />}
                {form.id ? 'Save changes' : 'Publish update'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Country updates</h2>
          <p className="text-slate-400 text-sm mt-1">Visa appointment windows, deadlines, and alerts shown per country to students.</p>
        </div>
        <Button onClick={openNew} className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto">
          <Plus className="w-4 h-4 mr-2" /> New update
        </Button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={filterSlug}
          onChange={e => setFilterSlug(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All countries</option>
          {DESTINATIONS.map(d => (
            <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
          ))}
        </select>
        <span className="text-xs text-slate-500">{filtered.length} update{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {loading && <div className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-500" /></div>}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 border border-dashed border-slate-700 rounded-xl text-slate-500">
          <Bell className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>No updates yet. Create one to notify students.</p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map(u => (
          <div key={u.id} className={`relative rounded-xl border transition-opacity ${u.is_active ? '' : 'opacity-50'}`}
            style={{ borderColor: 'rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)' }}>
            <div className="p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 capitalize">{u.destination_slug}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold uppercase tracking-wider ${
                    u.type === 'appointment_window' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    : u.type === 'deadline' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                  }`}>{u.type.replace('_', ' ')}</span>
                  {!u.is_active && <span className="text-[10px] px-2 py-0.5 rounded border bg-slate-800 text-slate-500 border-slate-700">Hidden</span>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Switch checked={u.is_active} onCheckedChange={() => toggleActive(u)} />
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white" onClick={() => openEdit(u)}>
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-300" onClick={() => handleDelete(u.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              <p className="text-white text-sm font-semibold mb-1">{u.title}</p>
              <p className="text-slate-400 text-xs line-clamp-2">{u.message}</p>
              {u.appointment_at && (
                <p className="text-blue-400 text-xs mt-2 flex items-center gap-1">
                  <CalendarCheck className="w-3 h-3" />
                  {new Date(u.appointment_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminCountryUpdates;
