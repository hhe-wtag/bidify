// self.addEventListener('install', (event) => {
//   console.log('Service Worker installed')
// })

// self.addEventListener('activate', (event) => {
//   console.log('Service Worker activated')
// })

// self.addEventListener('push', (event) => {
//   const data = event.data.json()
//   const options = {
//     body: data.body,
//     icon: '/icon.png',
//     badge: '/badge.png',
//     vibrate: [100, 50, 100],
//     data: {
//       url: data.url,
//     },
//     actions: [
//       {
//         action: 'open',
//         title: 'View',
//       },
//       {
//         action: 'close',
//         title: 'Close',
//       },
//     ],
//   }

//   event.waitUntil(self.registration.showNotification('Test Notification', options))
// })

// self.addEventListener('notificationclick', (event) => {
//   event.notification.close()

//   if (event.action === 'open') {
//     event.waitUntil(clients.openWindow(event.notification.data.url))
//   }
// })

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')

  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray
}

const saveSubscription = async (userId,subscription) => {
  const response = await fetch('http://localhost:8080/api/push/save-subscription', {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify({ userId, ...subscription }),
  })
  return response.json()
}

self.addEventListener('activate', async (e) => {
  const subscription = await self.registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(
      'BDThbjZw_ttSZjCW_uClXO5SR-V8W_sK2wAXBnQ37t11DUmvQhwJOUpURzYOCi4yfK4ZchFzo0ZNBanrjj5AFnM',
    ),
  })
  const response = await saveSubscription(subscription)
  console.log(response)
})

self.addEventListener('push', (e) => {
  self.registration.showNotification('Wohoo!!', { body: e.data.text() })
})
