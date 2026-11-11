// Utility functions for handling image fallbacks and country-specific assets

export const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=70&auto=format&fit=crop';

// SINGLE SOURCE OF TRUTH - Proven Unsplash URLs that are guaranteed to load
// Updated with high-quality destination images
const COUNTRY_IMAGES = {
  'Canada': 'https://images.unsplash.com/photo-1673528799737-a33ecdd07788?w=800&q=70&auto=format&fit=crop', // Ottawa Parliament Hill
  'UK': 'https://images.unsplash.com/photo-1694934985423-9fe08c27bb56?w=800&q=70&auto=format&fit=crop', // London dusk cityscape
  'Austria': 'https://images.unsplash.com/photo-1691425791089-fc00f4994b6b?w=800&q=70&auto=format&fit=crop', // Salzburg alpine city
  'Australia': 'https://images.unsplash.com/photo-1695296757535-90a3b225a53c?w=800&q=70&auto=format&fit=crop', // Sydney Opera House
  'USA': 'https://images.unsplash.com/photo-1696874152733-9023012cb6b1?w=800&q=70&auto=format&fit=crop', // Chicago skyline
  'Poland': 'https://images.unsplash.com/photo-1685687839153-213cfb9348f0?w=800&q=70&auto=format&fit=crop', // Warsaw cityscape
  'Hungary': 'https://images.unsplash.com/photo-1691425791089-fc00f4994b6b?w=800&q=70&auto=format&fit=crop', // Salzburg as fallback per request
  
  // Previous mappings kept for compatibility
  'Germany': 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&q=70&auto=format&fit=crop',
  'Lithuania': 'https://images.unsplash.com/photo-1654122675531-978945505186?w=800&q=70&auto=format&fit=crop', // Vilnius aerial cityscape
  'Latvia': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=70&auto=format&fit=crop',
  'Malta': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=70&auto=format&fit=crop',
  'Cyprus': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=70&auto=format&fit=crop',
};

const COUNTRY_COLORS = {
  'Poland': 'bg-gradient-to-br from-blue-600 to-yellow-500',
  'Germany': 'bg-gradient-to-br from-slate-900 to-red-600',
  'Lithuania': 'bg-gradient-to-br from-yellow-400 to-red-600',
  'Latvia': 'bg-gradient-to-br from-red-700 to-rose-200',
  'Hungary': 'bg-gradient-to-br from-red-600 to-green-600',
  'Malta': 'bg-gradient-to-br from-blue-500 to-rose-100',
  'Cyprus': 'bg-gradient-to-br from-orange-400 to-green-600',
  'USA': 'bg-gradient-to-br from-blue-700 to-red-600',
  'Canada': 'bg-gradient-to-br from-red-600 to-white',
  'Australia': 'bg-gradient-to-br from-blue-800 to-red-500',
  'UK': 'bg-gradient-to-br from-blue-900 to-red-700',
  'Austria': 'bg-gradient-to-br from-red-600 to-white',
};

const COUNTRY_EMOJIS = {
  'Poland': '🇵🇱',
  'Germany': '🇩🇪',
  'Lithuania': '🇱🇹',
  'Latvia': '🇱🇻',
  'Hungary': '🇭🇺',
  'Malta': '🇲🇹',
  'Cyprus': '🇨🇾',
  'USA': '🇺🇸',
  'Canada': '🇨🇦',
  'Australia': '🇦🇺',
  'UK': '🇬🇧',
  'Austria': '🇦🇹',
};

/**
 * Returns the reliable proven image for a country.
 * If no specific image exists, returns the default reliable image.
 */
export const getCountryImageUrl = (countryName) => {
  if (!countryName) return DEFAULT_FALLBACK_IMAGE;
  
  // Try direct match
  if (COUNTRY_IMAGES[countryName]) {
    return COUNTRY_IMAGES[countryName];
  }

  // Try case-insensitive match
  const key = Object.keys(COUNTRY_IMAGES).find(
    k => k.toLowerCase() === countryName.toLowerCase()
  );
  
  return key ? COUNTRY_IMAGES[key] : DEFAULT_FALLBACK_IMAGE;
};

// Maintained for backward compatibility
export const getCountryFallbackImage = getCountryImageUrl;

/**
 * Returns a unique gradient string for a given country
 */
export const getCountryGradient = (countryName) => {
  return COUNTRY_COLORS[countryName] || 'bg-gradient-to-br from-blue-900 to-slate-800';
};

/**
 * Returns the flag emoji for a given country
 */
export const getCountryEmoji = (countryName) => {
  return COUNTRY_EMOJIS[countryName] || '🌍';
};
/**
 * Returns a right-sized version of an image URL. Unsplash originals can be
 * several MB (a blog hero was 3 MB), so request the display width, modern
 * formats (auto=format gives WebP/AVIF) and moderate quality. Other hosts are
 * returned unchanged.
 * @param {string} url
 * @param {number} width - target display width in CSS pixels
 */
export const sizedImage = (url, width = 1200) => {
  if (!url || typeof url !== 'string') return url;
  try {
    const u = new URL(url);
    if (u.hostname !== 'images.unsplash.com') return url;
    u.searchParams.set('w', String(width));
    u.searchParams.set('q', '70');
    u.searchParams.set('auto', 'format');
    u.searchParams.set('fit', 'crop');
    return u.toString();
  } catch {
    return url;
  }
};
