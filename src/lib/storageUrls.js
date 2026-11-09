import { supabase } from '@/lib/customSupabaseClient';

const PUBLIC_MARKER = '/storage/v1/object/public/';

/**
 * Split a stored Supabase public-object URL into { bucket, path }.
 * Returns null for URLs that are not Supabase storage URLs.
 */
export const parseStorageUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  const idx = url.indexOf(PUBLIC_MARKER);
  if (idx === -1) return null;
  const rest = url.slice(idx + PUBLIC_MARKER.length).split('?')[0];
  const slash = rest.indexOf('/');
  if (slash === -1) return null;
  return { bucket: rest.slice(0, slash), path: decodeURIComponent(rest.slice(slash + 1)) };
};

/**
 * Open a file from a private bucket via a short-lived signed URL.
 * The tab is opened synchronously (before the await) so pop-up blockers allow it.
 */
export const openPrivateFile = async (bucket, path, expiresIn = 300) => {
  // 'noopener' would make window.open return null, so detach the opener manually instead
  const win = window.open('', '_blank');
  if (win) win.opener = null;
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
  if (error || !data?.signedUrl) {
    if (win) win.close();
    throw error || new Error('Could not create a download link');
  }
  if (win) win.location.href = data.signedUrl;
  else window.location.assign(data.signedUrl);
};

/** Open a stored (formerly public) storage URL, signing it when it points to a private bucket. */
export const openStoredUrl = async (url) => {
  const parsed = parseStorageUrl(url);
  if (!parsed) { window.open(url, '_blank', 'noopener,noreferrer'); return; }
  await openPrivateFile(parsed.bucket, parsed.path);
};
