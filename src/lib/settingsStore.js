import { supabase } from '@/lib/customSupabaseClient';

// In-memory cache structure
const cache = {
  site_settings: new Map(),
  system_settings: new Map(),
  site_identity: null,
  timestamps: {
    site_settings: new Map(),
    system_settings: new Map(),
    site_identity: null
  }
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const isCacheValid = (scope, key = null) => {
  const now = Date.now();

  if (scope === 'site_identity') {
    const timestamp = cache.timestamps.site_identity;
    return !!timestamp && now - timestamp < CACHE_DURATION;
  }

  if (key) {
    const timestamp = cache.timestamps[scope]?.get(key);
    return !!timestamp && now - timestamp < CACHE_DURATION;
  }

  return false;
};

const setCache = (scope, value, key = null) => {
  const now = Date.now();

  if (scope === 'site_identity') {
    cache.site_identity = value;
    cache.timestamps.site_identity = now;
    return;
  }

  if (key) {
    cache[scope].set(key, value);
    cache.timestamps[scope].set(key, now);
  }
};

// -------- READERS --------

export const getSiteSetting = async (key) => {
  try {
    if (isCacheValid('site_settings', key)) return cache.site_settings.get(key);

    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', key)
      .maybeSingle();

    if (error) {
      console.error(`Error fetching site_settings[${key}]:`, error);
      return null;
    }

    const value = data?.value ?? null;
    setCache('site_settings', value, key);
    return value;
  } catch (err) {
    console.error(`Exception in getSiteSetting(${key}):`, err);
    return null;
  }
};

export const getSystemSetting = async (key) => {
  try {
    if (isCacheValid('system_settings', key)) return cache.system_settings.get(key);

    const { data, error } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', key)
      .maybeSingle();

    if (error) {
      console.error(`Error fetching system_settings[${key}]:`, error);
      return null;
    }

    const value = data?.value ?? null;
    setCache('system_settings', value, key);
    return value;
  } catch (err) {
    console.error(`Exception in getSystemSetting(${key}):`, err);
    return null;
  }
};

export const getActiveSiteIdentity = async () => {
  try {
    if (isCacheValid('site_identity')) return cache.site_identity;

    let { data, error } = await supabase
      .from('site_identity')
      .select('*')
      .eq('is_active', true)
      .maybeSingle();

    if (error || !data) {
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('site_identity')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (fallbackError) {
        console.error('Error fetching site_identity:', fallbackError);
        return null;
      }
      data = fallbackData;
    }

    setCache('site_identity', data);
    return data;
  } catch (err) {
    console.error('Exception in getActiveSiteIdentity:', err);
    return null;
  }
};

// -------- BULK READERS --------

export const getBulkSiteSettings = async (keys) => {
  try {
    const result = {};
    const keysToFetch = [];

    for (const key of keys) {
      if (isCacheValid('site_settings', key)) result[key] = cache.site_settings.get(key);
      else keysToFetch.push(key);
    }

    if (keysToFetch.length) {
      const { data, error } = await supabase
        .from('site_settings')
        .select('key,value')
        .in('key', keysToFetch);

      if (error) console.error('Error fetching bulk site_settings:', error);
      else {
        for (const row of data || []) {
          result[row.key] = row.value;
          setCache('site_settings', row.value, row.key);
        }
      }

      for (const key of keysToFetch) {
        if (!(key in result)) {
          result[key] = null;
          setCache('site_settings', null, key);
        }
      }
    }

    return result;
  } catch (err) {
    console.error('Exception in getBulkSiteSettings:', err);
    return {};
  }
};

export const getBulkSystemSettings = async (keys) => {
  try {
    const result = {};
    const keysToFetch = [];

    for (const key of keys) {
      if (isCacheValid('system_settings', key)) result[key] = cache.system_settings.get(key);
      else keysToFetch.push(key);
    }

    if (keysToFetch.length) {
      const { data, error } = await supabase
        .from('system_settings')
        .select('key,value')
        .in('key', keysToFetch);

      if (error) console.error('Error fetching bulk system_settings:', error);
      else {
        for (const row of data || []) {
          result[row.key] = row.value;
          setCache('system_settings', row.value, row.key);
        }
      }

      for (const key of keysToFetch) {
        if (!(key in result)) {
          result[key] = null;
          setCache('system_settings', null, key);
        }
      }
    }

    return result;
  } catch (err) {
    console.error('Exception in getBulkSystemSettings:', err);
    return {};
  }
};

// -------- WRITERS (UPSERT) --------

export const setSiteSetting = async (key, value) => {
  try {
    const { error } = await supabase
      .from('site_settings')
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });

    if (error) {
      console.error(`Error saving site_settings[${key}]:`, error);
      return false;
    }

    setCache('site_settings', value, key);
    return true;
  } catch (err) {
    console.error(`Exception in setSiteSetting(${key}):`, err);
    return false;
  }
};

export const setSystemSetting = async (key, value, updated_by = null) => {
  try {
    const payload = { key, value, updated_at: new Date().toISOString() };
    if (updated_by) payload.updated_by = updated_by;

    const { error } = await supabase
      .from('system_settings')
      .upsert(payload, { onConflict: 'key' });

    if (error) {
      console.error(`Error saving system_settings[${key}]:`, error);
      return false;
    }

    setCache('system_settings', value, key);
    return true;
  } catch (err) {
    console.error(`Exception in setSystemSetting(${key}):`, err);
    return false;
  }
};

// -------- CACHE INVALIDATION --------

export const invalidateSettingsCache = (scope = 'all', key = null) => {
  if (scope === 'all') {
    cache.site_settings.clear();
    cache.system_settings.clear();
    cache.site_identity = null;
    cache.timestamps.site_settings.clear();
    cache.timestamps.system_settings.clear();
    cache.timestamps.site_identity = null;
    return;
  }

  if (scope === 'site_identity') {
    cache.site_identity = null;
    cache.timestamps.site_identity = null;
    return;
  }

  if (key) {
    cache[scope]?.delete(key);
    cache.timestamps[scope]?.delete(key);
  } else {
    cache[scope]?.clear();
    cache.timestamps[scope]?.clear();
  }
};

// -------- PROMO BANNERS HELPERS --------

export const getPromoBanners = async () => {
  const data = await getSiteSetting('promo_banners');
  
  // CRITICAL FIX: Ensure we always return an Object, never null/undefined/array
  // If data is an array (legacy format), we convert it to an object map
  if (Array.isArray(data)) {
    console.warn('getPromoBanners: Detected legacy Array format. Converting to Object map.');
    return data.reduce((acc, banner) => {
      if (banner && banner.id) {
        acc[banner.id] = banner;
      }
      return acc;
    }, {});
  }

  // If valid object, return it
  if (data && typeof data === 'object') {
    return data;
  }

  // Fallback default
  return {};
};

export const savePromoBanners = async (banners) => {
  // CRITICAL FIX: Ensure we only save Objects.
  if (!banners || typeof banners !== 'object' || Array.isArray(banners)) {
    console.error('savePromoBanners: Invalid input type. Expected Object map, got:', Array.isArray(banners) ? 'Array' : typeof banners);
    return false;
  }
  return await setSiteSetting('promo_banners', banners);
};

export const invalidatePromoBannersCache = () => {
  invalidateSettingsCache('site_settings', 'promo_banners');
};

// -------- BACKWARD-COMPAT EXPORTS --------
export const updateSiteSettings = async (key, value) => setSiteSetting(key, value);
export const updateSystemSettings = async (key, value, updated_by = null) =>
  setSystemSetting(key, value, updated_by);