self.addEventListener('push', function(event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/logo.png',
      badge: '/favicon.svg',
      vibrate: [200, 100, 200, 100, 200, 100, 200],
      requireInteraction: true, // Notification stays until user clicks it
      data: {
        dateOfArrival: Date.now(),
        primaryKey: '2'
      }
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // First try to focus an existing window/tab
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes('/live-queue') && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Look for patient portal anyway
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes('/') && 'focus' in client) {
          return client.focus();
        }
      }
      // If no window is found or open, open a new one
      if (clients.openWindow) {
        return clients.openWindow('/live-queue');
      }
    })
  );
});
