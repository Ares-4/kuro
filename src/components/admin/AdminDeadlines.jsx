import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Edit2, Trash2, Loader2, CalendarClock, X, ExternalLink } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

const COUNTRIES = ['Poland','UK','Canada','Australia','USA','Germany','Lithuania','Latvia','Hungary','Malta','Cyprus','Austria'];
const TYPES = ['application_deadline','enrollment_deadline','scholarship_deadline','document_deadline','other'];

const COUNTRY_INTAKES = {
  Poland:    ['February', 'September'],
  Germany:   ['April', 'October'],
  UK:        ['January', 'September', 'October'],
  Lithuania: ['February', 'September'],
  Latvia:    ['February', 'September'],
  Hungary:   ['February', 'September'],
  default:   ['January', 'February', 'March', 'September', 'October'],
};

const TYPE_LABELS = {
  application_deadline: 'Application deadline',
  enrollment_deadline: 'Enrollment deadline',
  scholarship_deadline: 'Scholarship deadline',
  document_deadline: 'Document deadline',
  other: 'Other',
};

const EMPTY = {
  id: null, university_name: '', program_name: '', country: '',
  deadline_date: '', type: 'application_deadline', notes: '', link: '',
  intake_year: new Date().getFullYear(), intake_season: 'September',
  is_active: true,
};

const AdminDeadlines = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [filterCountry, setFilterCountry] = useState('');
  const [universities, setUniversities] = useState([]);
  const [uniSearch, setUniSearch] = useState('');
  const [showUniSuggestions, setShowUniSuggestions] = useState(false);
  const { toast } = useToast();

  useEffect(() => { load(); loadUniversities(); }, []);

  const loadUniversities = async () => {
    const { data } = await supabase.from('universities').select('name').eq('is_active', true).order('name');
    setUniversities(data?.map(u => u.name) || []);
  };

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('university_deadlines')
      .select('*')
      .order('deadline_date', { ascending: true, nullsLast: true });
    setList(data || []);
    setLoading(false);
  };

  const openNew  = () => { setForm(EMPTY); setEditing('new'); };
  const openEdit = (d) => { setForm({ ...d, deadline_date: d.deadline_date?.slice(0, 10) || '' }); setEditing(d.id); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, deadline_date: form.deadline_date || null, updated_at: new Date() };
    let error;
    if (form.id) ({ error } = await supabase.from('university_deadlines').update(payload).eq('id', form.id));
    else          ({ error } = await supabase.from('university_deadlines').insert([{ ...payload, id: undefined }]));
    setSaving(false);
    if (error) toast({ variant: 'destructive', title: 'Save failed', description: error.message });
    else { toast({ title: 'Deadline saved' }); setEditing(null); load(); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this deadline?')) return;
    await supabase.from('university_deadlines').delete().eq('id', id);
    load();
  };

  const daysLeft = (date) => {
    if (!date) return null;
    return Math.ceil((new Date(date) - new Date()) / 86400000);
  };

  const visible = filterCountry ? list.filter(d => d.country === filterCountry) : list;

  if (editing) return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => setEditing(null)} className="text-slate-400 hover:text-white">
          <X className="w-4 h-4 mr-2" /> Cancel
        </Button>
        <h2 className="text-2xl font-bold text-white">{form.id ? 'Edit deadline' : 'New deadline'}</h2>
      </div>
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="pt-6">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1 md:col-span-2 relative">
                <Label className="text-slate-300">University / Institution</Label>
                <Input
                  value={uniSearch || form.university_name}
                  onChange={e => {
                    setUniSearch(e.target.value);
                    setForm(p => ({ ...p, university_name: e.target.value }));
                    setShowUniSuggestions(true);
                  }}
                  onBlur={() => setTimeout(() => setShowUniSuggestions(false), 150)}
                  onFocus={() => setShowUniSuggestions(true)}
                  placeholder="e.g. University of Warsaw" required
                  className="bg-slate-900 border-slate-700 text-white"
                />
                {showUniSuggestions && universities.filter(u => u.toLowerCase().includes((uniSearch || form.university_name).toLowerCase())).length > 0 && (
                  <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-md shadow-xl max-h-48 overflow-y-auto">
                    {universities
                      .filter(u => u.toLowerCase().includes((uniSearch || form.university_name).toLowerCase()))
                      .slice(0, 8)
                      .map(u => (
                        <button key={u} type="button"
                          className="w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 transition-colors"
                          onMouseDown={() => { setForm(p => ({ ...p, university_name: u })); setUniSearch(''); setShowUniSuggestions(false); }}>
                          {u}
                        </button>
                      ))
                    }
                  </div>
                )}
              </div>
              <div className="space-y-1 md:col-span-2">
                <Label className="text-slate-300">Program name</Label>
                <Input value={form.program_name} onChange={e => setForm(p => ({ ...p, program_name: e.target.value }))}
                  placeholder="e.g. MSc Computer Science"
                  className="bg-slate-900 border-slate-700 text-white" />
              </div>
              <div className="space-y-1">
                <Label className="text-slate-300">Country</Label>
                <select value={form.country} onChange={e => {
                    const c = e.target.value;
                    const intakes = COUNTRY_INTAKES[c] || COUNTRY_INTAKES.default;
                    setForm(p => ({ ...p, country: c, intake_season: intakes[0] }));
                  }} required
                  className="w-full h-10 px-3 rounded-md bg-slate-900 border border-slate-700 text-white text-sm">
                  <option value="">Select country</option>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-slate-300">Deadline type</Label>
                <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                  className="w-full h-10 px-3 rounded-md bg-slate-900 border border-slate-700 text-white text-sm">
                  {TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-slate-300">Deadline date</Label>
                <Input type="date" value={form.deadline_date} onChange={e => setForm(p => ({ ...p, deadline_date: e.target.value }))} required
                  className="bg-slate-900 border-slate-700 text-white" />
              </div>
              <div className="space-y-1">
                <Label className="text-slate-300">Intake year</Label>
                <Input type="number" value={form.intake_year} onChange={e => setForm(p => ({ ...p, intake_year: parseInt(e.target.value) }))}
                  className="bg-slate-900 border-slate-700 text-white" />
              </div>
              <div className="space-y-1">
                <Label className="text-slate-300">Intake season</Label>
                <select value={form.intake_season} onChange={e => setForm(p => ({ ...p, intake_season: e.target.value }))}
                  className="w-full h-10 px-3 rounded-md bg-slate-900 border border-slate-700 text-white text-sm">
                  {(COUNTRY_INTAKES[form.country] || COUNTRY_INTAKES.default).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-slate-300">Link</Label>
                <Input value={form.link} onChange={e => setForm(p => ({ ...p, link: e.target.value }))}
                  placeholder="https://..."
                  className="bg-slate-900 border-slate-700 text-white" />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-slate-300">Notes</Label>
              <Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                placeholder="Additional requirements or info..." rows={3}
                className="bg-slate-900 border-slate-700 text-white" />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.is_active} onCheckedChange={c => setForm(p => ({ ...p, is_active: c }))} />
              <Label className="text-slate-300">Published (visible to students)</Label>
            </div>
            <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 w-full">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CalendarClock className="w-4 h-4 mr-2" />}
              {form.id ? 'Save changes' : 'Add deadline'}
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
          <h2 className="text-3xl font-bold text-white">Application deadlines</h2>
          <p className="text-slate-400 text-sm mt-1">Tracked deadlines shown to students as a countdown board.</p>
        </div>
        <Button onClick={openNew} className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto">
          <Plus className="w-4 h-4 mr-2" /> Add deadline
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilterCountry('')}
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${!filterCountry ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500'}`}>
          All
        </button>
        {COUNTRIES.map(c => (
          <button key={c} onClick={() => setFilterCountry(c)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${filterCountry === c ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500'}`}>
            {c}
          </button>
        ))}
      </div>

      {loading && <div className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-500" /></div>}

      {!loading && visible.length === 0 && (
        <div className="text-center py-16 border border-dashed border-slate-700 rounded-xl text-slate-500">
          <CalendarClock className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>No deadlines yet. Add your first one.</p>
        </div>
      )}

      <div className="space-y-3">
        {visible.map(d => {
          const days = daysLeft(d.deadline_date);
          return (
            <div key={d.id} className={`rounded-xl border p-4 transition-opacity ${d.is_active ? '' : 'opacity-50'}`}
              style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)' }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-semibold text-white text-sm">{d.university_name}</p>
                    {!d.is_active && <span className="text-[10px] px-2 py-0.5 rounded border bg-slate-800 text-slate-500 border-slate-700">Hidden</span>}
                    {days !== null && days > 0 && days <= 30 && (
                      <span className="text-[10px] px-2 py-0.5 rounded border bg-amber-500/10 text-amber-400 border-amber-500/20 font-semibold">{days}d left</span>
                    )}
                    {days !== null && days <= 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded border bg-red-500/10 text-red-400 border-red-500/20 font-semibold">Passed</span>
                    )}
                    <span className="text-[10px] px-2 py-0.5 rounded border bg-slate-800 text-slate-400 border-slate-700">{TYPE_LABELS[d.type] || d.type}</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {d.program_name && <>{d.program_name} · </>}
                    {d.country} · {d.intake_season} {d.intake_year} ·{' '}
                    {d.deadline_date ? new Date(d.deadline_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD'}
                  </p>
                  {d.notes && <p className="text-xs text-slate-500 mt-1 line-clamp-1">{d.notes}</p>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {d.link && <a href={d.link} target="_blank" rel="noopener noreferrer" className="p-1.5 text-slate-400 hover:text-white"><ExternalLink className="w-3.5 h-3.5" /></a>}
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white" onClick={() => openEdit(d)}><Edit2 className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-300" onClick={() => handleDelete(d.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminDeadlines;
