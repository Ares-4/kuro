import { supabase } from './customSupabaseClient';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
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
  await supabase.from('push_subscriptions').upsert(
    { student_id: studentId, endpoint, p256dh: keys.p256dh, auth: keys.auth },
    { onConflict: 'endpoint' }
  );
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
  await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint).eq('student_id', studentId);
}

export async function isPushSubscribed() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false;
  const reg = await navigator.serviceWorker.getRegistration('/sw.js');
  if (!reg) return false;
  const sub = await reg.pushManager.getSubscription();
  return !!sub;
}
