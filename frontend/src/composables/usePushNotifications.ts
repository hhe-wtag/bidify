const checkPermission = () => {
  if (!('serviceWorker' in navigator)) {
    throw new Error('No support for service worker')
  }
  if (!('Notification' in window)) {
    throw new Error('No support for Notification API')
  }
}
const requestNotificationPermission = async () => {
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') {
    throw new Error('Notification permission not granted')
  }
}

const registerSW = async () => {
   try {
     const registration = await navigator.serviceWorker.register('/sw.js')
     return registration
   } catch (error) {
     console.error('Failed to register service worker:', error)
     throw error
   }
}

export async function setupPushNotifications() {
  try {
    checkPermission()
    await requestNotificationPermission()
    await registerSW()
    console.log('Current notification permission:')
  } catch (error) {
    console.error('Permission error:', error)
  }
}
export async function testServerNotification() {
  try {
    const response = await fetch('/api/push/test-notification', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
    const data = await response.json()
    console.log('Test notification response:', data)
  } catch (error) {
    console.error('Error testing notification:', error)
  }
}
