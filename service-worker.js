/* Root-scoped service worker for Baraka Enterprise Hub device notifications. */
self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (_) {}
  const title = String(data.title || 'Baraka Enterprise Hub');
  const options = {
    body: String(data.body || 'A task or production order was assigned to you.'),
    icon: '/push-icon.svg',
    badge: '/push-icon.svg',
    tag: String(data.tag || 'baraka-assignment'),
    renotify: true,
    requireInteraction: true,
    vibrate: [250, 100, 250],
    data: { url: String(data.url || '/') },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || '/', self.location.origin);
  const safeUrl = target.origin === self.location.origin ? target.href : self.location.origin + '/';
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of windows) {
      if ('navigate' in client) await client.navigate(safeUrl);
      return client.focus();
    }
    return self.clients.openWindow(safeUrl);
  })());
});
