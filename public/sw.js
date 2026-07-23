self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  const title = data.title || 'Kuro Educational';
  const options = {
    body: data.body || 'You have a new message.',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: { url: data.url || '/dashboard/hub' },
    vibrate: [100, 50, 100],
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/dashboard/hub';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(url) && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
