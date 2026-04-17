import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Save, Sparkles } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { getSiteSetting, setSiteSetting } from '@/lib/settingsStore';

const DEFAULTS = {
  readiness: {
    title: 'Unsure about your eligibility?',
    text:
      "Don't waste money on failed applications. Get a personalized 10-page analysis of your academic and visa profile for just €2.99.",
    buttonText: 'Start Readiness Check',
    price: '€2.99',
    visible_pages: ['/services']
  },
  guide: {
    title: 'The Ultimate Study in Europe Guide 2025',
    text:
      'Download our 50-page PDF covering tuition fees, visa interviews, and cost of living comparisons for 15+ countries.',
    buttonText: 'Get Guide',
    visible_pages: ['/resources']
  }
};

const AVAILABLE_PAGES = [
  { id: '/', label: 'Homepage' },
  { id: '/services', label: 'Services Page' },
  { id: '/destinations', label: 'Destinations Page' },
  { id: '/readiness-check', label: 'Readiness Check Page' },
  { id: '/resources', label: 'Resources Page' }
];

const PromoEditor = () => {
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
      const value = await getSiteSetting('promo_banners');

      if (value && typeof value === 'object') {
        setData({
          readiness: {
            ...DEFAULTS.readiness,
            ...(value.readiness || {}),
            visible_pages: Array.isArray(value?.readiness?.visible_pages)
              ? value.readiness.visible_pages
              : DEFAULTS.readiness.visible_pages
          },
          guide: {
            ...DEFAULTS.guide,
            ...(value.guide || {}),
            visible_pages: Array.isArray(value?.guide?.visible_pages)
              ? value.guide.visible_pages
              : DEFAULTS.guide.visible_pages
          }
        });
      } else {
        setData(DEFAULTS);
      }
    } catch (error) {
      console.error('PromoEditor fetch error:', error);
      toast({
        variant: 'destructive',
        title: 'Error loading promos',
        description: error?.message || 'Failed to load promo banners.'
      });
      setData(DEFAULTS);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        readiness: {
          title: (data.readiness?.title || '').trim(),
          text: (data.readiness?.text || '').trim(),
          buttonText: (data.readiness?.buttonText || '').trim(),
          price: (data.readiness?.price || '').trim(),
          visible_pages: Array.isArray(data.readiness?.visible_pages) ? data.readiness.visible_pages : []
        },
        guide: {
          title: (data.guide?.title || '').trim(),
          text: (data.guide?.text || '').trim(),
          buttonText: (data.guide?.buttonText || '').trim(),
          visible_pages: Array.isArray(data.guide?.visible_pages) ? data.guide.visible_pages : []
        }
      };

      await setSiteSetting('promo_banners', payload);

      toast({ title: 'Saved', description: 'Promotional banners updated.' });
    } catch (error) {
      console.error('PromoEditor save error:', error);
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: error?.message || 'Failed to save promo banners.'
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSection = (section, field, value) => {
    setData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const togglePage = (section, pageId) => {
    setData((prev) => {
      const current = Array.isArray(prev?.[section]?.visible_pages) ? prev[section].visible_pages : [];
      const next = current.includes(pageId) ? current.filter((p) => p !== pageId) : [...current, pageId];

      return {
        ...prev,
        [section]: {
          ...prev[section],
          visible_pages: next
        }
      };
    });
  };

  if (loading) return <div className="p-4 text-slate-400">Loading editor...</div>;

  return (
    <div className="space-y-6">
      {/* Readiness Check Banner */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-400" /> Readiness Check Banner
          </CardTitle>
          <CardDescription className="text-slate-400">
            Promotes the paid eligibility check service.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-slate-200">Headline</Label>
            <Input
              value={data.readiness.title}
              onChange={(e) => updateSection('readiness', 'title', e.target.value)}
              className="bg-slate-900 border-slate-700 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-200">Body Text</Label>
            <Textarea
              value={data.readiness.text}
              onChange={(e) => updateSection('readiness', 'text', e.target.value)}
              className="bg-slate-900 border-slate-700 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-200">Button Label</Label>
              <Input
                value={data.readiness.buttonText}
                onChange={(e) => updateSection('readiness', 'buttonText', e.target.value)}
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-200">Price Display</Label>
              <Input
                value={data.readiness.price}
                onChange={(e) => updateSection('readiness', 'price', e.target.value)}
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <Label className="text-slate-200 block mb-2">Display On Pages</Label>
            <div className="flex flex-wrap gap-4">
              {AVAILABLE_PAGES.map((page) => (
                <div key={page.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`readiness-${page.id}`}
                    checked={(data.readiness.visible_pages || []).includes(page.id)}
                    onCheckedChange={() => togglePage('readiness', page.id)}
                    className="border-slate-500 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <label
                    htmlFor={`readiness-${page.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-300"
                  >
                    {page.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guide Banner */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-green-400" /> Free Guide Banner
          </CardTitle>
          <CardDescription className="text-slate-400">
            Promotes the lead magnet (PDF download).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-slate-200">Headline</Label>
            <Input
              value={data.guide.title}
              onChange={(e) => updateSection('guide', 'title', e.target.value)}
              className="bg-slate-900 border-slate-700 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-200">Body Text</Label>
            <Textarea
              value={data.guide.text}
              onChange={(e) => updateSection('guide', 'text', e.target.value)}
              className="bg-slate-900 border-slate-700 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-200">Button Label</Label>
            <Input
              value={data.guide.buttonText}
              onChange={(e) => updateSection('guide', 'buttonText', e.target.value)}
              className="bg-slate-900 border-slate-700 text-white"
            />
          </div>

          <div className="space-y-2 pt-2">
            <Label className="text-slate-200 block mb-2">Display On Pages</Label>
            <div className="flex flex-wrap gap-4">
              {AVAILABLE_PAGES.map((page) => (
                <div key={page.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`guide-${page.id}`}
                    checked={(data.guide.visible_pages || []).includes(page.id)}
                    onCheckedChange={() => togglePage('guide', page.id)}
                    className="border-slate-500 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                  />
                  <label
                    htmlFor={`guide-${page.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-300"
                  >
                    {page.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end sticky bottom-6 z-10">
        <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto shadow-lg" type="button">
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Save Banners
        </Button>
      </div>
    </div>
  );
};

export default PromoEditor;