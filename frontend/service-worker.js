self.addEventListener('install', (event) => {
  console.log('Service Worker installed')
})

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated')
})

self.addEventListener('push', (event) => {
  console.log('Push message received', event.data?.text())

  const options = {
    body: 'This is a test notification',
    icon: '/icon.png',
    badge: '/badge.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1',
    },
  }

  event.waitUntil(self.registration.showNotification('Test Notification', options))
})
