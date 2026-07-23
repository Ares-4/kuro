import React, { createContext, useContext, useEffect, useCallback, useMemo, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

const SystemSettingsContext = createContext(null);

// ---------- Helpers ----------
const isHex = (hex) => typeof hex === 'string' && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hex);

const hexToHSL = (hex) => {
  if (!isHex(hex)) return null;

  let r = 0, g = 0, b = 0;

  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else {
    r = parseInt(hex.slice(1, 3), 16);
    g = parseInt(hex.slice(3, 5), 16);
    b = parseInt(hex.slice(5, 7), 16);
  }

  r /= 255; g /= 255; b /= 255;

  const cmin = Math.min(r, g, b);
  const cmax = Math.max(r, g, b);
  const delta = cmax - cmin;

  let h = 0;
  let s = 0;
  let l = (cmax + cmin) / 2;

  if (delta !== 0) {
    if (cmax === r) h = ((g - b) / delta) % 6;
    else if (cmax === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;

    h = Math.round(h * 60);
    if (h < 0) h += 360;

    s = delta / (1 - Math.abs(2 * l - 1));
  }

  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);

  return `${h} ${s}% ${l}%`;
};

const DEFAULT_SETTINGS = {
  preferences: { currency: 'USD', timezone: 'UTC', language: 'en' },
  notifications: { email_alerts: true, weekly_digest: false, new_application_alert: true },
  branding: { company_name: 'Kuro Educational', primary_color: '#2563eb', logo_url: '' }
};

export const SystemSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const applyBranding = useCallback((branding) => {
    if (!branding) return;

    // Primary color -> Shadcn variables
    if (branding.primary_color && isHex(branding.primary_color)) {
      const hsl = hexToHSL(branding.primary_color);
      if (hsl) {
        document.documentElement.style.setProperty('--primary', hsl);
        document.documentElement.style.setProperty('--ring', hsl);
      }
    }

    // If you later store secondary_color in portal_branding, wire it here:
    // if (branding.secondary_color && isHex(branding.secondary_color)) {
    //   const hsl2 = hexToHSL(branding.secondary_color);
    //   if (hsl2) document.documentElement.style.setProperty('--secondary', hsl2);
    // }
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('system_settings').select('key,value');
      if (error) throw error;

      // Build from DEFAULTS every time to avoid stale state merges
      const next = {
        preferences: { ...DEFAULT_SETTINGS.preferences },
        notifications: { ...DEFAULT_SETTINGS.notifications },
        branding: { ...DEFAULT_SETTINGS.branding }
      };

      (data || []).forEach((item) => {
        if (item.key === 'system_preferences') {
          next.preferences = { ...next.preferences, ...(item.value || {}) };
        }
        if (item.key === 'admin_notifications') {
          next.notifications = { ...next.notifications, ...(item.value || {}) };
        }
        if (item.key === 'portal_branding') {
          next.branding = { ...next.branding, ...(item.value || {}) };
        }
      });

      setSettings(next);
      applyBranding(next.branding);
    } catch (err) {
      console.error('System settings fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [applyBranding]);

  useEffect(() => {
    let channel;

    // Initial fetch
    fetchSettings();

    // Realtime updates
    channel = supabase
      .channel('system_settings_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'system_settings' },
        () => {
          // Re-fetch on any change
          fetchSettings();
        }
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          console.warn('Realtime channel error: system_settings_changes');
        }
      });

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [fetchSettings]);

  const value = useMemo(
    () => ({ settings, loading, refreshSettings: fetchSettings }),
    [settings, loading, fetchSettings]
  );

  return <SystemSettingsContext.Provider value={value}>{children}</SystemSettingsContext.Provider>;
};

export const useSystemSettings = () => {
  const context = useContext(SystemSettingsContext);
  if (!context) {
    throw new Error('useSystemSettings must be used within a SystemSettingsProvider');
  }
  return context;
};