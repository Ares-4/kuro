import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Save, Globe, Lock } from 'lucide-react';

const DEFAULTS = {
  id: null,
  site_name: '',
  description: '',
  logo_url: '',
  contact_email: '',
  contact_phone: '',
  address: '',
  meta_keywords: '',
  social_links: {
    facebook: '',
    twitter: '',
    instagram: '',
    linkedin: ''
  }
};

const GeneralSettings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [data, setData] = useState(DEFAULTS);

  useEffect(() => {
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      // Always fetch the ACTIVE row (singleton pattern)
      const { data: settings, error } = await supabase
        .from('site_identity')
        .select('*')
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;

      if (settings) {
        setData({
          ...DEFAULTS,
          ...settings,
          id: settings.id ?? null,
          site_name: settings.site_name || '',
          description: settings.description || '',
          logo_url: settings.logo_url || '',
          contact_email: settings.contact_email || '',
          contact_phone: settings.contact_phone || '',
          address: settings.address || '',
          meta_keywords: settings.meta_keywords || '',
          social_links: {
            facebook: settings.social_links?.facebook || '',
            twitter: settings.social_links?.twitter || '',
            instagram: settings.social_links?.instagram || '',
            linkedin: settings.social_links?.linkedin || ''
          }
        });
      } else {
        // No active row yet: keep defaults, create on save
        setData(DEFAULTS);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        variant: 'destructive',
        title: 'Error loading settings',
        description: error?.message || 'Failed to load site identity.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        site_name: (data.site_name || '').trim(),
        description: (data.description || '').trim(),
        logo_url: (data.logo_url || '').trim(),
        contact_email: (data.contact_email || '').trim(),
        contact_phone: (data.contact_phone || '').trim(),
        address: (data.address || '').trim(),
        meta_keywords: (data.meta_keywords || '').trim(),
        social_links: data.social_links || DEFAULTS.social_links,
        // Keep singleton row active
        is_active: true
      };

      // Strategy:
      // 1) If we have an ID, update that row.
      // 2) Else, update the active row (if one exists).
      // 3) If nothing updated, insert a new active row.
      if (data.id) {
        const { error: updateByIdError } = await supabase
          .from('site_identity')
          .update(payload)
          .eq('id', data.id);

        if (updateByIdError) throw updateByIdError;
      } else {
        const { data: updated, error: updateActiveError } = await supabase
          .from('site_identity')
          .update(payload)
          .eq('is_active', true)
          .select('id')
          .maybeSingle();

        if (updateActiveError) throw updateActiveError;

        if (!updated?.id) {
          const { error: insertError } = await supabase
            .from('site_identity')
            .insert([payload]);

          if (insertError) throw insertError;
        }
      }

      toast({
        title: 'Settings Saved',
        description: 'General site settings updated successfully.'
      });
      await fetchSettings();
    } catch (error) {
      console.error('Save Failed:', error);
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: error?.message || 'Failed to save settings.'
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSocial = (key, value) => {
    setData((prev) => ({
      ...prev,
      social_links: { ...prev.social_links, [key]: value }
    }));
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
        Loading settings...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Site Identity & SEO</CardTitle>
          <CardDescription className="text-slate-400">
            Manage your website&apos;s core information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-200">Site Name</Label>
              <Input
                value={data.site_name}
                onChange={(e) => setData({ ...data, site_name: e.target.value })}
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-200">Logo URL</Label>
              <Input
                value={data.logo_url}
                onChange={(e) => setData({ ...data, logo_url: e.target.value })}
                className="bg-slate-900 border-slate-700 text-white"
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-200">Meta Description (Default)</Label>
            <Textarea
              value={data.description}
              onChange={(e) => setData({ ...data, description: e.target.value })}
              className="bg-slate-900 border-slate-700 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-200">Keywords (Comma separated)</Label>
            <Input
              value={data.meta_keywords}
              onChange={(e) => setData({ ...data, meta_keywords: e.target.value })}
              className="bg-slate-900 border-slate-700 text-white"
              placeholder="study abroad, education, university..."
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Contact Information</CardTitle>
          <CardDescription className="text-slate-400">Publicly visible contact details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-200">Contact Email</Label>
              <Input
                value={data.contact_email}
                onChange={(e) => setData({ ...data, contact_email: e.target.value })}
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-200">Phone Number</Label>
              <Input
                value={data.contact_phone}
                onChange={(e) => setData({ ...data, contact_phone: e.target.value })}
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-200">Physical Address</Label>
            <Textarea
              value={data.address}
              onChange={(e) => setData({ ...data, address: e.target.value })}
              className="bg-slate-900 border-slate-700 text-white"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Social Media Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-200">Facebook</Label>
              <Input
                value={data.social_links.facebook}
                onChange={(e) => updateSocial('facebook', e.target.value)}
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-200">Twitter (X)</Label>
              <Input
                value={data.social_links.twitter}
                onChange={(e) => updateSocial('twitter', e.target.value)}
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-200">Instagram</Label>
              <Input
                value={data.social_links.instagram}
                onChange={(e) => updateSocial('instagram', e.target.value)}
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-200">LinkedIn</Label>
              <Input
                value={data.social_links.linkedin}
                onChange={(e) => updateSocial('linkedin', e.target.value)}
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center bg-slate-900/50 p-4 rounded-lg border border-slate-800 sticky bottom-6 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Lock className="w-4 h-4 text-green-500" />
          <span>SSL Certificate Active</span>
          <span className="mx-2">|</span>
          <Globe className="w-4 h-4 text-blue-500" />
          <span>Changes apply immediately</span>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 min-w-[150px]"
          type="button"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default GeneralSettings;