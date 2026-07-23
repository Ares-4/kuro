import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Save, Loader2, Plus, Trash2, ExternalLink, ShieldCheck } from 'lucide-react';

const AdminVisaInfo = () => {
  const [destinations, setDestinations] = useState([]);
  const [selectedSlug, setSelectedSlug] = useState('');
  const [form, setForm] = useState({
    visa_type: '', processing_time: '', cost: '',
    documents: [], notes: '', official_link: '', last_verified: ''
  });
  const [newDoc, setNewDoc] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    supabase.from('destinations').select('name, slug').eq('is_active', true).order('name')
      .then(({ data }) => setDestinations(data || []));
  }, []);

  useEffect(() => {
    if (!selectedSlug) { resetForm(); return; }
    setLoading(true);
    supabase.from('destination_visa_info').select('*').eq('destination_slug', selectedSlug).maybeSingle()
      .then(({ data }) => {
        if (data) {
          setForm({
            visa_type: data.visa_type || '',
            processing_time: data.processing_time || '',
            cost: data.cost || '',
            documents: data.documents || [],
            notes: data.notes || '',
            official_link: data.official_link || '',
            last_verified: data.last_verified || '',
          });
        } else {
          resetForm();
        }
        setLoading(false);
      });
  }, [selectedSlug]);

  const resetForm = () => setForm({
    visa_type: '', processing_time: '', cost: '',
    documents: [], notes: '', official_link: '', last_verified: ''
  });

  const addDoc = () => {
    if (!newDoc.trim()) return;
    setForm(prev => ({ ...prev, documents: [...prev.documents, newDoc.trim()] }));
    setNewDoc('');
  };

  const removeDoc = (i) => setForm(prev => ({ ...prev, documents: prev.documents.filter((_, idx) => idx !== i) }));

  const handleSave = async () => {
    if (!selectedSlug) return;
    setSaving(true);
    const { error } = await supabase.from('destination_visa_info').upsert(
      { destination_slug: selectedSlug, ...form, updated_at: new Date() },
      { onConflict: 'destination_slug' }
    );
    setSaving(false);
    if (error) toast({ variant: 'destructive', title: 'Save failed', description: error.message });
    else toast({ title: 'Visa info saved', description: 'Visible on the destination page immediately.' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Visa Information</h2>
          <p className="text-slate-400 text-sm mt-1">Per-country visa details shown on destination pages with a last-verified date.</p>
        </div>
        <Button onClick={handleSave} disabled={saving || !selectedSlug} className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto">
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Visa Info
        </Button>
      </div>

      <div className="space-y-2">
        <Label className="text-slate-300">Select Destination</Label>
        <select
          value={selectedSlug}
          onChange={e => setSelectedSlug(e.target.value)}
          className="w-full md:w-72 bg-slate-800 border border-slate-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">— choose a destination —</option>
          {destinations.map(d => (
            <option key={d.slug} value={d.slug}>{d.name}</option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-slate-400 py-8">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading...
        </div>
      )}

      {!loading && selectedSlug && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader><CardTitle className="text-white text-base">Visa Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label className="text-slate-400 text-xs">Visa Type</Label>
                <Input value={form.visa_type} onChange={e => setForm(p => ({ ...p, visa_type: e.target.value }))}
                  placeholder="e.g. Student Visa (Type D)" className="bg-slate-900 border-slate-700 text-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-slate-400 text-xs">Processing Time</Label>
                  <Input value={form.processing_time} onChange={e => setForm(p => ({ ...p, processing_time: e.target.value }))}
                    placeholder="e.g. 4–6 weeks" className="bg-slate-900 border-slate-700 text-white" />
                </div>
                <div className="space-y-1">
                  <Label className="text-slate-400 text-xs">Visa Cost</Label>
                  <Input value={form.cost} onChange={e => setForm(p => ({ ...p, cost: e.target.value }))}
                    placeholder="e.g. €80" className="bg-slate-900 border-slate-700 text-white" />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-slate-400 text-xs">Notes / Special Requirements</Label>
                <Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  placeholder="Any important caveats, recent policy changes..." className="bg-slate-900 border-slate-700 text-white h-24" />
              </div>
              <div className="space-y-1">
                <Label className="text-slate-400 text-xs">Official Embassy / Immigration Link</Label>
                <Input value={form.official_link} onChange={e => setForm(p => ({ ...p, official_link: e.target.value }))}
                  placeholder="https://..." className="bg-slate-900 border-slate-700 text-white" />
              </div>
              <div className="space-y-1">
                <Label className="text-slate-400 text-xs">Last Verified Date</Label>
                <Input type="date" value={form.last_verified} onChange={e => setForm(p => ({ ...p, last_verified: e.target.value }))}
                  className="bg-slate-900 border-slate-700 text-white" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader><CardTitle className="text-white text-base flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-blue-400" /> Required Documents</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input value={newDoc} onChange={e => setNewDoc(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addDoc())}
                  placeholder="e.g. Passport copy" className="bg-slate-900 border-slate-700 text-white" />
                <Button onClick={addDoc} size="icon" className="bg-blue-600 hover:bg-blue-700 shrink-0">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {form.documents.length === 0 && (
                <p className="text-slate-500 text-sm text-center py-4">No documents added yet.</p>
              )}
              <ul className="space-y-2">
                {form.documents.map((doc, i) => (
                  <li key={i} className="flex items-center justify-between bg-slate-900 px-3 py-2 rounded-lg border border-slate-700">
                    <span className="text-slate-200 text-sm flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-green-400 shrink-0" /> {doc}
                    </span>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400 hover:text-red-300" onClick={() => removeDoc(i)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {!selectedSlug && !loading && (
        <div className="text-center py-16 text-slate-500">
          Select a destination above to manage its visa information.
        </div>
      )}
    </div>
  );
};

export default AdminVisaInfo;
