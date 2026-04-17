import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Palette, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { getSiteSetting, setSiteSetting, getSystemSetting, setSystemSetting } from '@/lib/settingsStore';

/**
 * IMPORTANT ARCHITECTURE NOTE (why this is updated):
 * - Your PUBLIC Navbar branding reads from `system_settings` key `portal_branding`.
 * - Your existing theme settings are stored in `site_settings` key `theme_settings`.
 *
 * Therefore:
 * - Save primary_color/font_family into BOTH places so the public UI and any future theming stay consistent.
 *   - portal_branding.primary_color + portal_branding.font_family
 *   - theme_settings.primary_color + theme_settings.secondary_color + theme_settings.font_family + theme_settings.custom_css
 */

const DEFAULTS = {
  primary_color: '#2563eb',
  secondary_color: '#1e293b',
  font_family: 'Inter',
  custom_css: ''
};

const StyleEditor = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [data, setData] = useState(DEFAULTS);

  const previewStyle = useMemo(
    () => ({ backgroundColor: data.primary_color, fontFamily: data.font_family }),
    [data.primary_color, data.font_family]
  );

  useEffect(() => {
    const fetchStyles = async () => {
      setLoading(true);
      try {
        // 1) Theme settings (site_settings)
        const themeValue = await getSiteSetting('theme_settings');

        // 2) Branding settings (system_settings)
        const brandingValue = await getSystemSetting('portal_branding');

        // Merge priority:
        // - theme_settings if present
        // - fallback to portal_branding for primary_color/font_family
        // - fallback defaults
        const merged = {
          ...DEFAULTS,
          ...(themeValue && typeof themeValue === 'object' ? themeValue : {}),
          primary_color:
            (themeValue && themeValue.primary_color) ||
            (brandingValue && brandingValue.primary_color) ||
            DEFAULTS.primary_color,
          font_family:
            (themeValue && themeValue.font_family) ||
            (brandingValue && brandingValue.font_family) ||
            DEFAULTS.font_family
        };

        setData({
          primary_color: merged.primary_color,
          secondary_color: merged.secondary_color ?? DEFAULTS.secondary_color,
          font_family: merged.font_family,
          custom_css: merged.custom_css ?? ''
        });
      } catch (error) {
        console.error('StyleEditor fetch error:', error);
        toast({
          variant: 'destructive',
          title: 'Error loading styles',
          description: error?.message || 'Failed to load theme settings.'
        });
        setData(DEFAULTS);
      } finally {
        setLoading(false);
      }
    };

    fetchStyles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        primary_color: (data.primary_color || '').trim() || DEFAULTS.primary_color,
        secondary_color: (data.secondary_color || '').trim() || DEFAULTS.secondary_color,
        font_family: (data.font_family || '').trim() || DEFAULTS.font_family,
        custom_css: data.custom_css || ''
      };

      // Save theme settings (site_settings)
      await setSiteSetting('theme_settings', payload);

      // Also keep portal_branding in sync (system_settings) so Navbar updates.
      const currentBranding = (await getSystemSetting('portal_branding')) || {};
      await setSystemSetting('portal_branding', {
        ...currentBranding,
        primary_color: payload.primary_color,
        font_family: payload.font_family
      });

      toast({ title: 'Styles Saved', description: 'Theme settings updated.' });
    } catch (error) {
      console.error('StyleEditor save error:', error);
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: error?.message || 'Failed to save theme settings.'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Palette className="w-5 h-5" /> Global Branding
        </CardTitle>
        <CardDescription className="text-slate-400">Configure global colors and styles.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-200">Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={data.primary_color}
                  onChange={(e) => setData({ ...data, primary_color: e.target.value })}
                  className="w-12 h-10 p-1 bg-slate-900 border-slate-700"
                />
                <Input
                  value={data.primary_color}
                  onChange={(e) => setData({ ...data, primary_color: e.target.value })}
                  className="flex-1 bg-slate-900 border-slate-700 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-200">Secondary Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={data.secondary_color}
                  onChange={(e) => setData({ ...data, secondary_color: e.target.value })}
                  className="w-12 h-10 p-1 bg-slate-900 border-slate-700"
                />
                <Input
                  value={data.secondary_color}
                  onChange={(e) => setData({ ...data, secondary_color: e.target.value })}
                  className="flex-1 bg-slate-900 border-slate-700 text-white"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-200">Font Family</Label>
              <select
                className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-white"
                value={data.font_family}
                onChange={(e) => setData({ ...data, font_family: e.target.value })}
              >
                <option value="Inter">Inter (Default)</option>
                <option value="Roboto">Roboto</option>
                <option value="Open Sans">Open Sans</option>
                <option value="Lato">Lato</option>
              </select>
            </div>

            <div className="p-4 bg-slate-900 rounded border border-slate-700 text-center">
              <p className="text-sm text-slate-400 mb-2">Preview Button</p>
              <Button style={previewStyle} type="button">
                Primary Action
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-slate-200">Custom CSS</Label>
          <Textarea
            placeholder=".my-class { color: red; }"
            value={data.custom_css}
            onChange={(e) => setData({ ...data, custom_css: e.target.value })}
            className="bg-slate-900 border-slate-700 text-white font-mono text-sm h-32"
          />
          <p className="text-xs text-slate-500">Advanced: Add custom CSS overrides here.</p>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700" type="button">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Save Branding
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StyleEditor;