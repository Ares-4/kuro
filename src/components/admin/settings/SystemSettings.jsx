import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { useSystemSettings } from '@/contexts/SystemSettingsContext';

const DEFAULTS = {
  preferences: { currency: 'USD', timezone: 'UTC', language: 'en' },
  notifications: { email_alerts: true, weekly_digest: false, new_application_alert: true },
  branding: {
    company_name: 'Kuro Educational',
    primary_color: '#2563eb',
    logo_url: '',
    font_family: 'Inter'
  }
};

const SystemSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { refreshSettings } = useSystemSettings();

  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState(null); // 'system_preferences' | 'admin_notifications' | 'portal_branding'
  const [settings, setSettings] = useState(DEFAULTS);

  const isSaving = useMemo(() => savingKey !== null, [savingKey]);

  useEffect(() => {
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('key,value')
        .in('key', ['system_preferences', 'admin_notifications', 'portal_branding']);

      if (error) throw error;

      // Merge into defaults safely
      const next = structuredClone ? structuredClone(DEFAULTS) : JSON.parse(JSON.stringify(DEFAULTS));

      (data || []).forEach((item) => {
        if (item.key === 'system_preferences' && item.value && typeof item.value === 'object') {
          next.preferences = { ...next.preferences, ...item.value };
        }
        if (item.key === 'admin_notifications' && item.value && typeof item.value === 'object') {
          next.notifications = { ...next.notifications, ...item.value };
        }
        if (item.key === 'portal_branding' && item.value && typeof item.value === 'object') {
          next.branding = { ...next.branding, ...item.value };
        }
      });

      // Harden booleans
      next.notifications.email_alerts = !!next.notifications.email_alerts;
      next.notifications.weekly_digest = !!next.notifications.weekly_digest;
      next.notifications.new_application_alert = !!next.notifications.new_application_alert;

      setSettings(next);
    } catch (error) {
      console.error('SystemSettings fetch error:', error);
      toast({
        variant: 'destructive',
        title: 'Error loading settings',
        description: error?.message || 'Failed to load system settings.'
      });
      setSettings(DEFAULTS);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (sectionKey, dbKey) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Not signed in', description: 'Please sign in again.' });
      return;
    }

    setSavingKey(dbKey);
    try {
      const value = settings[sectionKey];

      const { error } = await supabase
        .from('system_settings')
        .upsert(
          [
            {
              key: dbKey,
              value,
              updated_by: user.id,
              updated_at: new Date()
            }
          ],
          { onConflict: 'key' }
        );

      if (error) throw error;

      toast({ title: 'Settings Saved', description: 'Configuration updated successfully.' });

      // Make public UI pick up changes immediately
      try {
        await refreshSettings();
      } catch (e) {
        // Don’t fail the save because a refresh fails
        console.warn('refreshSettings failed:', e);
      }

      // Optional logging; do not break saving if logs table is missing or blocked
      try {
        await supabase.from('activity_logs').insert({
          actor_id: user.id,
          action: 'UPDATE_SYSTEM_CONFIG',
          details: { section: sectionKey, key: dbKey }
        });
      } catch (e) {
        console.warn('activity log insert failed:', e);
      }
    } catch (error) {
      console.error('SystemSettings save error:', error);
      toast({
        variant: 'destructive',
        title: 'Save failed',
        description: error?.message || 'Failed to save settings.'
      });
    } finally {
      setSavingKey(null);
    }
  };

  if (loading) return <div>Loading config...</div>;

  return (
    <Card className="border-slate-700 bg-slate-800/50">
      <CardHeader>
        <CardTitle className="text-white">System Configuration</CardTitle>
        <CardDescription className="text-slate-400">Manage global settings for the platform.</CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="preferences" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-900 text-slate-400">
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
          </TabsList>

          {/* PREFERENCES */}
          <TabsContent value="preferences" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-200">Default Currency</Label>
                <select
                  className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-white"
                  value={settings.preferences.currency}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      preferences: { ...prev.preferences, currency: e.target.value }
                    }))
                  }
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-200">Timezone</Label>
                <select
                  className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-white"
                  value={settings.preferences.timezone}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      preferences: { ...prev.preferences, timezone: e.target.value }
                    }))
                  }
                >
                  <option value="UTC">UTC (GMT+0)</option>
                  <option value="Europe/Warsaw">Europe/Warsaw (GMT+1)</option>
                  <option value="EST">EST (GMT-5)</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-200">System Language</Label>
                <select
                  className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-white"
                  value={settings.preferences.language}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      preferences: { ...prev.preferences, language: e.target.value }
                    }))
                  }
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                </select>
              </div>
            </div>

            <Button
              onClick={() => handleSave('preferences', 'system_preferences')}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700"
              type="button"
            >
              {savingKey === 'system_preferences' ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Preferences
            </Button>
          </TabsContent>

          {/* NOTIFICATIONS */}
          <TabsContent value="notifications" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                <div className="space-y-0.5">
                  <Label className="text-base text-slate-200">Email Alerts</Label>
                  <p className="text-sm text-slate-400">Receive critical system alerts via email.</p>
                </div>
                <Switch
                  checked={!!settings.notifications.email_alerts}
                  onCheckedChange={(c) =>
                    setSettings((prev) => ({
                      ...prev,
                      notifications: { ...prev.notifications, email_alerts: c }
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                <div className="space-y-0.5">
                  <Label className="text-base text-slate-200">New Application Alerts</Label>
                  <p className="text-sm text-slate-400">Notify me when a student submits an application.</p>
                </div>
                <Switch
                  checked={!!settings.notifications.new_application_alert}
                  onCheckedChange={(c) =>
                    setSettings((prev) => ({
                      ...prev,
                      notifications: { ...prev.notifications, new_application_alert: c }
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                <div className="space-y-0.5">
                  <Label className="text-base text-slate-200">Weekly Digest</Label>
                  <p className="text-sm text-slate-400">Receive a weekly summary email.</p>
                </div>
                <Switch
                  checked={!!settings.notifications.weekly_digest}
                  onCheckedChange={(c) =>
                    setSettings((prev) => ({
                      ...prev,
                      notifications: { ...prev.notifications, weekly_digest: c }
                    }))
                  }
                />
              </div>
            </div>

            <Button
              onClick={() => handleSave('notifications', 'admin_notifications')}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700"
              type="button"
            >
              {savingKey === 'admin_notifications' ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Notifications
            </Button>
          </TabsContent>

          {/* BRANDING */}
          <TabsContent value="branding" className="space-y-4 mt-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label className="text-slate-200">Company Name</Label>
                <Input
                  value={settings.branding.company_name}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      branding: { ...prev.branding, company_name: e.target.value }
                    }))
                  }
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-200">Logo URL</Label>
                <Input
                  value={settings.branding.logo_url || ''}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      branding: { ...prev.branding, logo_url: e.target.value }
                    }))
                  }
                  className="bg-slate-900 border-slate-700 text-white"
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-200">Primary Brand Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={settings.branding.primary_color}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        branding: { ...prev.branding, primary_color: e.target.value }
                      }))
                    }
                    className="w-12 h-10 bg-slate-900 border-slate-700 p-1 cursor-pointer"
                  />
                  <Input
                    value={settings.branding.primary_color}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        branding: { ...prev.branding, primary_color: e.target.value }
                      }))
                    }
                    className="bg-slate-900 border-slate-700 text-white flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-200">Font Family</Label>
                <select
                  className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-white"
                  value={settings.branding.font_family || 'Inter'}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      branding: { ...prev.branding, font_family: e.target.value }
                    }))
                  }
                >
                  <option value="Inter">Inter (Default)</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Lato">Lato</option>
                </select>
              </div>
            </div>

            <Button
              onClick={() => handleSave('branding', 'portal_branding')}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700"
              type="button"
            >
              {savingKey === 'portal_branding' ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Branding
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SystemSettings;