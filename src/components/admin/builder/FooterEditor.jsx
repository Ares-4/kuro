import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Save } from 'lucide-react';
import { getSiteSetting, setSiteSetting } from '@/lib/settingsStore';

const DEFAULTS = {
  copyright_text: '© 2024 Kuro Educational. All rights reserved.',
  footer_description: 'Empowering students to achieve their global education dreams.',
  links_column_1_title: 'Company',
  links_column_2_title: 'Resources',
  show_social_links: true,
  show_newsletter: true
};

const FooterEditor = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [data, setData] = useState(DEFAULTS);

  useEffect(() => {
    const fetchFooter = async () => {
      setLoading(true);
      try {
        const value = await getSiteSetting('footer_settings');
        if (value && typeof value === 'object') {
          setData({
            ...DEFAULTS,
            ...value,
            // harden booleans in case null/undefined come back
            show_social_links: value.show_social_links ?? DEFAULTS.show_social_links,
            show_newsletter: value.show_newsletter ?? DEFAULTS.show_newsletter
          });
        } else {
          setData(DEFAULTS);
        }
      } catch (error) {
        console.error('FooterEditor fetch error:', error);
        toast({
          variant: 'destructive',
          title: 'Error loading footer',
          description: error?.message || 'Failed to load footer settings.'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFooter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        footer_description: (data.footer_description || '').trim(),
        copyright_text: (data.copyright_text || '').trim(),
        links_column_1_title: (data.links_column_1_title || '').trim(),
        links_column_2_title: (data.links_column_2_title || '').trim(),
        show_social_links: !!data.show_social_links,
        show_newsletter: !!data.show_newsletter
      };

      await setSiteSetting('footer_settings', payload);

      toast({ title: 'Footer Saved', description: 'Footer settings updated.' });
    } catch (error) {
      console.error('FooterEditor save error:', error);
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: error?.message || 'Failed to save footer settings.'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Footer Configuration</CardTitle>
        <CardDescription className="text-slate-400">
          Manage the content at the bottom of your site.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-slate-200">Footer Description</Label>
          <Textarea
            value={data.footer_description}
            onChange={(e) => setData({ ...data, footer_description: e.target.value })}
            className="bg-slate-900 border-slate-700 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-slate-200">Copyright Text</Label>
          <Input
            value={data.copyright_text}
            onChange={(e) => setData({ ...data, copyright_text: e.target.value })}
            className="bg-slate-900 border-slate-700 text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-slate-200">Column 1 Title</Label>
            <Input
              value={data.links_column_1_title}
              onChange={(e) => setData({ ...data, links_column_1_title: e.target.value })}
              className="bg-slate-900 border-slate-700 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-200">Column 2 Title</Label>
            <Input
              value={data.links_column_2_title}
              onChange={(e) => setData({ ...data, links_column_2_title: e.target.value })}
              className="bg-slate-900 border-slate-700 text-white"
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700" type="button">
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Footer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FooterEditor;