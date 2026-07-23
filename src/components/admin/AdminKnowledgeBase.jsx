import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Edit2, Trash2, Loader2, BrainCircuit, Search, X, Tag } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

const EMPTY_FORM = { id: null, question: '', answer: '', tags: '', page_link: '', is_active: true };

const AdminKnowledgeBase = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const { toast } = useToast();

  useEffect(() => { fetchEntries(); }, []);

  const fetchEntries = async () => {
    setLoading(true);
    const { data } = await supabase.from('knowledge_base').select('*').order('created_at', { ascending: false });
    setEntries(data || []);
    setLoading(false);
  };

  const openNew = () => {
    setForm(EMPTY_FORM);
    setEditing('new');
  };

  const openEdit = (entry) => {
    setForm({ ...entry, tags: (entry.tags || []).join(', ') });
    setEditing(entry.id);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      question: form.question.trim(),
      answer: form.answer.trim(),
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      page_link: form.page_link.trim(),
      is_active: form.is_active,
      updated_at: new Date(),
    };
    let error;
    if (form.id) {
      ({ error } = await supabase.from('knowledge_base').update(payload).eq('id', form.id));
    } else {
      ({ error } = await supabase.from('knowledge_base').insert([payload]));
    }
    setSaving(false);
    if (error) {
      toast({ variant: 'destructive', title: 'Save failed', description: error.message });
    } else {
      toast({ title: form.id ? 'Entry updated' : 'Entry added', description: 'Kuro assistant will use this immediately.' });
      setEditing(null);
      fetchEntries();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this Q&A entry?')) return;
    await supabase.from('knowledge_base').delete().eq('id', id);
    fetchEntries();
  };

  const filtered = entries.filter(e =>
    !search ||
    e.question.toLowerCase().includes(search.toLowerCase()) ||
    e.answer.toLowerCase().includes(search.toLowerCase()) ||
    (e.tags || []).some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  if (editing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setEditing(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4 mr-2" /> Cancel
          </Button>
          <h2 className="text-2xl font-bold text-white">{form.id ? 'Edit Entry' : 'New Q&A Entry'}</h2>
        </div>

        <Card className="bg-slate-800 border-slate-700 max-w-2xl">
          <CardContent className="pt-6">
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <Label className="text-slate-300">Question</Label>
                <Input
                  value={form.question}
                  onChange={e => setForm(p => ({ ...p, question: e.target.value }))}
                  placeholder="e.g. How much does it cost to study in Poland?"
                  required
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-slate-300">Answer</Label>
                <Textarea
                  value={form.answer}
                  onChange={e => setForm(p => ({ ...p, answer: e.target.value }))}
                  placeholder="Provide a clear, helpful answer..."
                  required
                  className="bg-slate-900 border-slate-700 text-white min-h-[120px]"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-slate-300">Tags (comma-separated)</Label>
                  <Input
                    value={form.tags}
                    onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
                    placeholder="e.g. poland, cost, visa"
                    className="bg-slate-900 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-slate-300">Link to page (optional)</Label>
                  <Input
                    value={form.page_link}
                    onChange={e => setForm(p => ({ ...p, page_link: e.target.value }))}
                    placeholder="e.g. /destinations/poland"
                    className="bg-slate-900 border-slate-700 text-white"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={form.is_active} onCheckedChange={c => setForm(p => ({ ...p, is_active: c }))} />
                <Label className="text-slate-300">Active (shown to users)</Label>
              </div>
              <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 w-full">
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <BrainCircuit className="w-4 h-4 mr-2" />}
                {form.id ? 'Update Entry' : 'Add Entry'}
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
          <h2 className="text-3xl font-bold text-white">Knowledge Base</h2>
          <p className="text-slate-400 text-sm mt-1">Q&amp;A pairs that power the Kuro assistant. No API — answers come from this table directly.</p>
        </div>
        <Button onClick={openNew} className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto">
          <Plus className="w-4 h-4 mr-2" /> Add Entry
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search questions or tags..."
          className="pl-9 bg-slate-800 border-slate-700 text-white"
        />
      </div>

      {loading && <div className="text-center py-12 text-slate-500"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 border border-dashed border-slate-700 rounded-xl text-slate-500">
          <BrainCircuit className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>{search ? 'No entries match your search.' : 'No entries yet. Add your first Q&A pair.'}</p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map(entry => (
          <Card key={entry.id} className={`border-slate-700 transition-colors ${entry.is_active ? 'bg-slate-800' : 'bg-slate-900 opacity-60'}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm mb-1 flex items-start gap-2">
                    <span className="text-blue-400 shrink-0">Q:</span>
                    {entry.question}
                  </p>
                  <p className="text-slate-400 text-sm line-clamp-2 flex items-start gap-2">
                    <span className="text-green-400 shrink-0">A:</span>
                    {entry.answer}
                  </p>
                  {entry.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {entry.tags.map(tag => (
                        <span key={tag} className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white" onClick={() => openEdit(entry)}>
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-300" onClick={() => handleDelete(entry.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminKnowledgeBase;
