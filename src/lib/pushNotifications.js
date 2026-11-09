import { supabase } from './customSupabaseClient';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

// Register/remove subscriptions through RLS-safe RPCs; fall back to the legacy table
// write only if the RPCs are not deployed yet (PGRST202 = function not found).
async function registerSubscription(endpoint, keys, asAdmin, studentId) {
  const { error } = await supabase.rpc('register_push_subscription', {
    p_endpoint: endpoint, p_p256dh: keys.p256dh, p_auth: keys.auth, p_as_admin: asAdmin,
  });
  if (!error) return true;
  if (error.code !== 'PGRST202') { console.warn('Push registration failed:', error.message); return false; }
  const row = asAdmin ? { is_admin: true } : { student_id: studentId };
  const legacy = await supabase.from('push_subscriptions').upsert({ ...row, endpoint, p256dh: keys.p256dh, auth: keys.auth }, { onConflict: 'endpoint' });
  return !legacy.error;
}

async function removeSubscription(endpoint) {
  const { error } = await supabase.rpc('remove_push_subscription', { p_endpoint: endpoint });
  if (error?.code === 'PGRST202') await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint);
}

export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null;
  return navigator.serviceWorker.register('/sw.js');
}

export async function subscribeToPush(studentId) {
  if (!VAPID_PUBLIC_KEY) {
    console.warn('VITE_VAPID_PUBLIC_KEY not set — push notifications disabled');
    return null;
  }
  const reg = await registerServiceWorker();
  if (!reg) return null;

  const existing = await reg.pushManager.getSubscription();
  if (existing) return existing;

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return null;

  const subscription = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  });

  const { endpoint, keys } = subscription.toJSON();
  // studentId is resolved server-side from the signed-in user
  if (!(await registerSubscription(endpoint, keys, false, studentId))) return null;
  return subscription;
}

export async function unsubscribeFromPush(studentId) {
  if (!('serviceWorker' in navigator)) return;
  const reg = await navigator.serviceWorker.getRegistration('/sw.js');
  if (!reg) return;
  const sub = await reg.pushManager.getSubscription();
  if (!sub) return;
  const { endpoint } = sub.toJSON();
  await sub.unsubscribe();
  await removeSubscription(endpoint);
}

export async function isPushSubscribed() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false;
  const reg = await navigator.serviceWorker.getRegistration('/sw.js');
  if (!reg) return false;
  const sub = await reg.pushManager.getSubscription();
  return !!sub;
}

export async function subscribeAdminToPush() {
  if (!VAPID_PUBLIC_KEY) {
    console.warn('VITE_VAPID_PUBLIC_KEY not set — push notifications disabled');
    return null;
  }
  const reg = await registerServiceWorker();
  if (!reg) return null;

  let subscription = await reg.pushManager.getSubscription();
  if (!subscription) {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;
    subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
  }

  const { endpoint, keys } = subscription.toJSON();
  if (!(await registerSubscription(endpoint, keys, true))) return null;
  return subscription;
}

export async function unsubscribeAdminFromPush() {
  if (!('serviceWorker' in navigator)) return;
  const reg = await navigator.serviceWorker.getRegistration('/sw.js');
  if (!reg) return;
  const sub = await reg.pushManager.getSubscription();
  if (!sub) return;
  const { endpoint } = sub.toJSON();
  await sub.unsubscribe();
  await removeSubscription(endpoint);
}

/**
 * Fires a push notification to every subscribed admin device.
 * Safe to call from public, unauthenticated pages (contact form, apply page, etc).
 */
export async function notifyAdminOfLead(title, body, url) {
  try {
    await supabase.functions.invoke('send-push', { body: { title, body, url } });
  } catch (err) {
    console.warn('notifyAdminOfLead failed:', err);
  }
}

/**
 * Fires a push notification to a specific student's subscribed devices
 * (e.g. application status change, new notice). No-op if they never
 * subscribed or have no devices registered.
 */
export async function notifyStudent(studentId, title, body, url) {
  try {
    await supabase.functions.invoke('send-push', { body: { title, body, url, studentId } });
  } catch (err) {
    console.warn('notifyStudent failed:', err);
  }
}
