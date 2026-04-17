import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Save, Image as ImageIcon } from 'lucide-react';

const DEFAULTS = {
  id: null,
  hero_title: 'Your Future Starts Here',
  hero_subtitle: 'Discover universities abroad and apply with confidence.',
  hero_image: '',
  cta_text: 'Get Started',
  cta_link: '/signup',
  show_features: true,
  show_testimonials: true,
  show_blog: true,
  is_active: true,
};

const LandingPageEditor = () => {
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
      // Always edit the ACTIVE row (singleton pattern)
      const { data: pageData, error } = await supabase
        .from('landing_page_settings')
        .select('*')
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;

      if (pageData) {
        setData({
          ...DEFAULTS,
          ...pageData,
          // harden booleans (null -> default)
          show_features: pageData.show_features ?? true,
          show_testimonials: pageData.show_testimonials ?? true,
          show_blog: pageData.show_blog ?? true,
          // harden strings
          hero_title: pageData.hero_title ?? DEFAULTS.hero_title,
          hero_subtitle: pageData.hero_subtitle ?? DEFAULTS.hero_subtitle,
          hero_image: pageData.hero_image ?? '',
          cta_text: pageData.cta_text ?? DEFAULTS.cta_text,
          cta_link: pageData.cta_link ?? DEFAULTS.cta_link,
          // ensure active stays true for the row we edit
          is_active: true,
        });
      } else {
        // No active row found: keep defaults, but we will create on save
        setData(DEFAULTS);
      }
    } catch (error) {
      console.error('LandingPageEditor fetch error:', error);
      toast({
        variant: 'destructive',
        title: 'Error loading data',
        description: error?.message || 'Failed to load landing page settings.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        hero_title: data.hero_title?.trim() || DEFAULTS.hero_title,
        hero_subtitle: data.hero_subtitle?.trim() || DEFAULTS.hero_subtitle,
        hero_image: (data.hero_image || '').trim(),
        cta_text: (data.cta_text || '').trim() || DEFAULTS.cta_text,
        cta_link: (data.cta_link || '').trim() || DEFAULTS.cta_link,
        show_features: !!data.show_features,
        show_testimonials: !!data.show_testimonials,
        show_blog: !!data.show_blog,
        // IMPORTANT: keep the singleton row active
        is_active: true,
      };

      // Strategy:
      // 1) If we have an ID (we loaded an active row), update that exact row.
      // 2) Else, update the active row (if one exists).
      // 3) If nothing updated (no active row existed), insert a new active row.
      //
      // This avoids duplicates and works with UUID IDs.

      if (data.id) {
        const { error: updateByIdError } = await supabase
          .from('landing_page_settings')
          .update(payload)
          .eq('id', data.id);

        if (updateByIdError) throw updateByIdError;
      } else {
        // Try update active row (covers cases where editor didn't have id yet)
        const { data: updated, error: updateActiveError } = await supabase
          .from('landing_page_settings')
          .update(payload)
          .eq('is_active', true)
          .select('id')
          .maybeSingle();

        if (updateActiveError) throw updateActiveError;

        // If no active row existed, insert one as active
        if (!updated?.id) {
          const { error: insertError } = await supabase
            .from('landing_page_settings')
            .insert([payload]);

          if (insertError) throw insertError;
        }
      }

      toast({ title: 'Homepage Updated', description: 'Changes saved successfully.' });
      await fetchData();
    } catch (error) {
      console.error('LandingPageEditor save error:', error);
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: error?.message || 'Failed to save landing page settings.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading editor...</div>;

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Hero Section</CardTitle>
          <CardDescription className="text-slate-400">Customize the main banner.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-slate-200">Main Title</Label>
            <Input
              value={data.hero_title}
              onChange={(e) => setData({ ...data, hero_title: e.target.value })}
              className="bg-slate-900 border-slate-700 text-white font-bold text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-200">Subtitle</Label>
            <Textarea
              value={data.hero_subtitle}
              onChange={(e) => setData({ ...data, hero_subtitle: e.target.value })}
              className="bg-slate-900 border-slate-700 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-200">Background Image URL</Label>
            <div className="flex gap-2">
              <Input
                value={data.hero_image}
                onChange={(e) => setData({ ...data, hero_image: e.target.value })}
                className="bg-slate-900 border-slate-700 text-white"
                placeholder="https://..."
              />
              <Button
                variant="outline"
                className="border-slate-600 text-slate-300"
                title="Upload coming soon"
                type="button"
              >
                <ImageIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-200">CTA Button Text</Label>
              <Input
                value={data.cta_text || ''}
                onChange={(e) => setData({ ...data, cta_text: e.target.value })}
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-200">CTA Button Link</Label>
              <Input
                value={data.cta_link || ''}
                onChange={(e) => setData({ ...data, cta_link: e.target.value })}
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Section Visibility</CardTitle>
          <CardDescription className="text-slate-400">
            Show or hide sections on the homepage.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between bg-slate-900/50 p-3 rounded border border-slate-700">
            <Label className="text-slate-200 cursor-pointer" htmlFor="feat">
              Show "Why Choose Us"
            </Label>
            <Switch
              id="feat"
              checked={!!data.show_features}
              onCheckedChange={(c) => setData({ ...data, show_features: c })}
            />
          </div>

          <div className="flex items-center justify-between bg-slate-900/50 p-3 rounded border border-slate-700">
            <Label className="text-slate-200 cursor-pointer" htmlFor="testi">
              Show Testimonials
            </Label>
            <Switch
              id="testi"
              checked={!!data.show_testimonials}
              onCheckedChange={(c) => setData({ ...data, show_testimonials: c })}
            />
          </div>

          <div className="flex items-center justify-between bg-slate-900/50 p-3 rounded border border-slate-700">
            <Label className="text-slate-200 cursor-pointer" htmlFor="blog">
              Show Latest News
            </Label>
            <Switch
              id="blog"
              checked={!!data.show_blog}
              onCheckedChange={(c) => setData({ ...data, show_blog: c })}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end sticky bottom-6 z-10">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto min-w-[150px] shadow-lg"
          type="button"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Homepage
        </Button>
      </div>
    </div>
  );
};

export default LandingPageEditor;