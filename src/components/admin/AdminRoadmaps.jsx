import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Trash2, Save, Loader2, GripVertical, ChevronUp, ChevronDown, MapPin } from 'lucide-react';

const EMPTY_STEP = { title: '', description: '', docs_required: '', typical_timeline: '' };

const AdminRoadmaps = () => {
  const [destinations, setDestinations] = useState([]);
  const [selectedSlug, setSelectedSlug] = useState('');
  const [steps, setSteps] = useState([]);
  const [notices, setNotices] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    supabase.from('destinations').select('name, slug').eq('is_active', true).order('name')
      .then(({ data }) => setDestinations(data || []));
  }, []);

  useEffect(() => {
    if (!selectedSlug) { setSteps([]); setNotices(''); return; }
    setLoading(true);
    supabase.from('destination_roadmaps').select('steps, notices').eq('destination_slug', selectedSlug).maybeSingle()
      .then(({ data, error }) => {
        if (error && error.message?.includes('notices')) {
          // Column doesn't exist yet — fetch without it
          supabase.from('destination_roadmaps').select('steps').eq('destination_slug', selectedSlug).maybeSingle()
            .then(({ data: d }) => { setSteps(d?.steps || []); setNotices(''); setLoading(false); });
        } else {
          setSteps(data?.steps || []);
          setNotices(data?.notices || '');
          setLoading(false);
        }
      });
  }, [selectedSlug]);

  const addStep = () => setSteps(prev => [...prev, { ...EMPTY_STEP, order: prev.length + 1 }]);

  const updateStep = (index, field, value) => {
    setSteps(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  const removeStep = (index) => setSteps(prev => prev.filter((_, i) => i !== index));

  const moveStep = (index, dir) => {
    const next = index + dir;
    if (next < 0 || next >= steps.length) return;
    const arr = [...steps];
    [arr[index], arr[next]] = [arr[next], arr[index]];
    setSteps(arr);
  };

  const handleSave = async () => {
    if (!selectedSlug) return;
    setSaving(true);
    const payload = steps.map((s, i) => ({
      ...s,
      order: i + 1,
      docs_required: typeof s.docs_required === 'string'
        ? s.docs_required.split(',').map(d => d.trim()).filter(Boolean)
        : s.docs_required,
    }));
    let { error } = await supabase.from('destination_roadmaps').upsert(
      { destination_slug: selectedSlug, steps: payload, notices: notices.trim() || null, updated_at: new Date() },
      { onConflict: 'destination_slug' }
    );
    // If notices column doesn't exist yet, retry without it
    if (error?.message?.includes('notices')) {
      ({ error } = await supabase.from('destination_roadmaps').upsert(
        { destination_slug: selectedSlug, steps: payload, updated_at: new Date() },
        { onConflict: 'destination_slug' }
      ));
      if (!error) toast({ title: 'Roadmap saved', description: 'Run the SQL migration to enable the notices field.' });
    }
    setSaving(false);
    if (error) toast({ variant: 'destructive', title: 'Save failed', description: error.message });
    else toast({ title: 'Roadmap saved', description: 'Students will see the updated roadmap immediately.' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Application Roadmaps</h2>
          <p className="text-slate-400 text-sm mt-1">Per-country step-by-step guides shown to students on destination pages.</p>
        </div>
        <Button onClick={handleSave} disabled={saving || !selectedSlug} className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto">
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Roadmap
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
          <Loader2 className="w-5 h-5 animate-spin" /> Loading roadmap...
        </div>
      )}

      {!loading && selectedSlug && (
        <div className="space-y-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-4 space-y-1">
              <Label className="text-slate-400 text-xs">Important Notices / Announcements (shown to students)</Label>
              <Textarea
                value={notices}
                onChange={e => setNotices(e.target.value)}
                placeholder="e.g. Visa processing times have increased. Allow extra 4–6 weeks..."
                className="bg-slate-900 border-slate-700 text-white h-20 resize-none"
              />
            </CardContent>
          </Card>

          {steps.length === 0 && (
            <div className="text-center py-12 border border-dashed border-slate-700 rounded-xl text-slate-500">
              <MapPin className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p>No steps yet. Add the first step below.</p>
            </div>
          )}

          {steps.map((step, i) => (
            <Card key={i} className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-base flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold shrink-0">
                      {i + 1}
                    </span>
                    Step {i + 1}
                  </CardTitle>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-white" onClick={() => moveStep(i, -1)} disabled={i === 0}>
                      <ChevronUp className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-white" onClick={() => moveStep(i, 1)} disabled={i === steps.length - 1}>
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-300" onClick={() => removeStep(i)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-slate-400 text-xs">Step Title</Label>
                    <Input
                      value={step.title}
                      onChange={e => updateStep(i, 'title', e.target.value)}
                      placeholder="e.g. Submit application"
                      className="bg-slate-900 border-slate-700 text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-slate-400 text-xs">Typical Timeline</Label>
                    <Input
                      value={step.typical_timeline}
                      onChange={e => updateStep(i, 'typical_timeline', e.target.value)}
                      placeholder="e.g. 1–2 weeks"
                      className="bg-slate-900 border-slate-700 text-white"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-slate-400 text-xs">Description</Label>
                  <Textarea
                    value={step.description}
                    onChange={e => updateStep(i, 'description', e.target.value)}
                    placeholder="What happens in this step..."
                    className="bg-slate-900 border-slate-700 text-white h-20"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-slate-400 text-xs">Required Documents (comma-separated)</Label>
                  <Input
                    value={Array.isArray(step.docs_required) ? step.docs_required.join(', ') : step.docs_required}
                    onChange={e => updateStep(i, 'docs_required', e.target.value)}
                    placeholder="e.g. Passport, Transcripts, Bank Statement"
                    className="bg-slate-900 border-slate-700 text-white"
                  />
                </div>
              </CardContent>
            </Card>
          ))}

          <Button variant="outline" onClick={addStep} className="w-full border-dashed border-slate-600 text-slate-400 hover:text-white hover:border-slate-400">
            <Plus className="w-4 h-4 mr-2" /> Add Step
          </Button>
        </div>
      )}

      {!selectedSlug && !loading && (
        <div className="text-center py-16 text-slate-500">
          Select a destination above to manage its roadmap.
        </div>
      )}
    </div>
  );
};

export default AdminRoadmaps;
