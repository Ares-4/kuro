import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Save, ShieldCheck, Users, GraduationCap, Globe2 } from 'lucide-react';
import { getSiteSetting, setSiteSetting } from '@/lib/settingsStore';

const DEFAULTS = [
  { icon: 'ShieldCheck', value: '98%', label: 'Visa Success Rate' },
  { icon: 'Users', value: '500+', label: 'Students Placed' },
  { icon: 'GraduationCap', value: '35+', label: 'Partner Universities' },
  { icon: 'Globe2', value: '12', label: 'Countries Served' }
];

const CredibilityEditor = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [data, setData] = useState(DEFAULTS);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const value = await getSiteSetting('credibility_metrics');

      if (Array.isArray(value) && value.length) {
        // Harden shape (icon/value/label)
        const normalized = value.map((item, idx) => ({
          icon: typeof item?.icon === 'string' ? item.icon : (DEFAULTS[idx]?.icon || 'ShieldCheck'),
          value: typeof item?.value === 'string' ? item.value : (DEFAULTS[idx]?.value || ''),
          label: typeof item?.label === 'string' ? item.label : (DEFAULTS[idx]?.label || '')
        }));
        setData(normalized);
      } else {
        setData(DEFAULTS);
      }
    } catch (error) {
      console.error('CredibilityEditor fetch error:', error);
      toast({
        variant: 'destructive',
        title: 'Error loading settings',
        description: error?.message || 'Failed to load credibility metrics.'
      });
      setData(DEFAULTS);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Trim & validate minimal shape
      const payload = (data || []).map((item, idx) => ({
        icon: DEFAULTS[idx]?.icon || item.icon || 'ShieldCheck', // keep icons stable unless you build an icon selector
        value: (item.value || '').trim(),
        label: (item.label || '').trim()
      }));

      await setSiteSetting('credibility_metrics', payload);

      toast({ title: 'Saved', description: 'Credibility metrics updated.' });
    } catch (error) {
      console.error('CredibilityEditor save error:', error);
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: error?.message || 'Failed to save credibility metrics.'
      });
    } finally {
      setSaving(false);
    }
  };

  const updateItem = (index, field, value) => {
    setData((prev) => {
      const copy = Array.isArray(prev) ? [...prev] : [...DEFAULTS];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  if (loading) return <div className="p-4 text-slate-400">Loading editor...</div>;

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Credibility Metrics</CardTitle>
        <CardDescription className="text-slate-400">
          Edit the stats shown in the trust bar on the homepage.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.map((item, index) => (
            <div
              key={index}
              className="bg-slate-900/50 p-4 rounded border border-slate-700 space-y-3"
            >
              <div className="flex items-center gap-2 mb-2 text-slate-300">
                {index === 0 && <ShieldCheck className="w-4 h-4" />}
                {index === 1 && <Users className="w-4 h-4" />}
                {index === 2 && <GraduationCap className="w-4 h-4" />}
                {index === 3 && <Globe2 className="w-4 h-4" />}
                <span className="text-xs font-bold uppercase">Metric {index + 1}</span>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-slate-400">Value (e.g. 98%)</Label>
                <Input
                  value={item.value}
                  onChange={(e) => updateItem(index, 'value', e.target.value)}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-slate-400">Label (e.g. Visa Success)</Label>
                <Input
                  value={item.label}
                  onChange={(e) => updateItem(index, 'label', e.target.value)}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700" type="button">
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Metrics
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CredibilityEditor;