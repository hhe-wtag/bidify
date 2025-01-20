self.addEventListener('install', (event) => {
  console.log('Service Worker installing.')
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated.')
  event.waitUntil(clients.claim())
})

self.addEventListener('push', (event) => {
  console.log('Push message received:', event.data?.text())

  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.message || 'New notification',
      icon: '/icon.png',
      badge: '/badge.png',
      data: {
        url: data.url,
      },
      vibrate: [200, 100, 200],
    }

    event.waitUntil(self.registration.showNotification(data.title || 'Notification', options))
  }
})

self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event)
  event.notification.close()

  if (event.notification.data?.url) {
    event.waitUntil(clients.openWindow(event.notification.data.url))
  }
})
