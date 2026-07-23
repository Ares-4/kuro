import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import {
  getActiveSiteIdentity,
  getBulkSiteSettings,
  getBulkSystemSettings,
  invalidateSettingsCache
} from '@/lib/settingsStore';

const PublicSiteSettingsContext = createContext(null);

export const usePublicSiteSettings = () => {
  const context = useContext(PublicSiteSettingsContext);
  if (!context) {
    throw new Error('usePublicSiteSettings must be used within PublicSiteSettingsProvider');
  }
  return context;
};

export const PublicSiteSettingsProvider = ({ children }) => {
  const [identity, setIdentity] = useState(null);
  const [siteSettings, setSiteSettings] = useState({
    main_navigation: null,
    footer_settings: null,
    promo_banners: null,
    theme_settings: null,
    credibility_metrics: null,
    promos: null, // Ensure these are initialized
    ad_placements: null
  });
  const [systemSettings, setSystemSettings] = useState({
    portal_branding: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const SITE_SETTINGS_KEYS = [
    'main_navigation',
    'footer_settings',
    'promo_banners',
    'theme_settings',
    'credibility_metrics',
    'promos',
    'ad_placements'
  ];

  const SYSTEM_SETTINGS_KEYS = ['portal_branding'];

  const loadPublicSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const startTime = performance.now();
      console.log('[PublicSiteSettings] Loading settings...', SITE_SETTINGS_KEYS);

      // Fetch all data in parallel
      const [identityData, siteData, systemData] = await Promise.all([
        getActiveSiteIdentity(),
        getBulkSiteSettings(SITE_SETTINGS_KEYS),
        getBulkSystemSettings(SYSTEM_SETTINGS_KEYS)
      ]);

      console.log(`[PublicSiteSettings] Settings loaded in ${(performance.now() - startTime).toFixed(2)}ms`);
      console.log('[PublicSiteSettings] Site Data:', siteData);

      if (!siteData) {
         console.warn('[PublicSiteSettings] No site settings returned!');
      }

      setIdentity(identityData);
      setSiteSettings(siteData || {});
      setSystemSettings(systemData || {});
    } catch (err) {
      console.error('[PublicSiteSettings] Error loading public settings:', err);
      setError(err.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshPublicSettings = useCallback(async () => {
    console.log('[PublicSiteSettings] Forcing refresh...');
    invalidateSettingsCache('all');
    await loadPublicSettings();
  }, [loadPublicSettings]);

  useEffect(() => {
    loadPublicSettings();
  }, [loadPublicSettings]);

  // Subscribe to realtime changes
  useEffect(() => {
    console.log('[PublicSiteSettings] Initializing realtime subscription...');
    const channel = supabase
      .channel('public-settings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'site_settings'
        },
        (payload) => {
          console.log('[PublicSiteSettings] Realtime update for site_settings:', payload);
          
          // Invalidate specific key if available
          if (payload.new?.key && SITE_SETTINGS_KEYS.includes(payload.new.key)) {
            console.log(`[PublicSiteSettings] Invalidating cache for key: ${payload.new.key}`);
            invalidateSettingsCache('site_settings', payload.new.key);
            
            // Update state immediately with new value
            setSiteSettings(prev => ({
              ...prev,
              [payload.new.key]: payload.new.value
            }));
          } else {
            // If key not in our list or delete event, refresh all
            console.log('[PublicSiteSettings] Full refresh triggered by realtime event');
            invalidateSettingsCache('site_settings');
            loadPublicSettings();
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'system_settings'
        },
        (payload) => {
          console.log('[PublicSiteSettings] Realtime update for system_settings:', payload);
          
          if (payload.new?.key && SYSTEM_SETTINGS_KEYS.includes(payload.new.key)) {
            invalidateSettingsCache('system_settings', payload.new.key);
            
            setSystemSettings(prev => ({
              ...prev,
              [payload.new.key]: payload.new.value
            }));
          } else {
            invalidateSettingsCache('system_settings');
            loadPublicSettings();
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'site_identity'
        },
        (payload) => {
          console.log('[PublicSiteSettings] Realtime update for site_identity:', payload);
          invalidateSettingsCache('site_identity');
          
          // If the changed row is active, update immediately
          if (payload.new?.is_active) {
            setIdentity(payload.new);
          } else {
            // Otherwise refresh to get the new active row
            loadPublicSettings();
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[PublicSiteSettings] Subscribed to realtime updates');
        }
        if (status === 'CHANNEL_ERROR') {
          console.error('[PublicSiteSettings] Error subscribing to channel');
        }
        if (status === 'TIMED_OUT') {
           console.error('[PublicSiteSettings] Subscription timed out');
        }
      });

    return () => {
      console.log('[PublicSiteSettings] Cleaning up subscription');
      supabase.removeChannel(channel);
    };
  }, [loadPublicSettings]);

  const value = {
    identity,
    siteSettings,
    systemSettings,
    loading,
    error,
    refreshPublicSettings
  };

  return (
    <PublicSiteSettingsContext.Provider value={value}>
      {children}
    </PublicSiteSettingsContext.Provider>
  );
};