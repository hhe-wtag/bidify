class PushClient {
  constructor() {
    this.publicVapidKey = 'YOUR_PUBLIC_VAPID_KEY' // Get this from your server
  }

  async register() {
    try {
      // Register service worker
      const registration = await navigator.serviceWorker.register('/service-worker.js')
      console.log('Service Worker registered:', registration)

      // Check notification permission
      const permission = await this.requestNotificationPermission()
      if (permission !== 'granted') {
        throw new Error('Notification permission denied')
      }

      // Subscribe to push notifications
      const subscription = await this.subscribeToPush(registration)

      // Send subscription to server
      await this.sendSubscriptionToServer(subscription)

      return true
    } catch (error) {
      console.error('Failed to register push notifications:', error)
      return false
    }
  }

  async requestNotificationPermission() {
    return await Notification.requestPermission()
  }

  async subscribeToPush(registration) {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: this.urlBase64ToUint8Array(this.publicVapidKey),
    })
    return subscription
  }

  async sendSubscriptionToServer(subscription) {
    const response = await fetch('/api/push/subscribe', {
      method: 'POST',
      body: JSON.stringify(subscription),
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return response.json()
  }

  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }
}

// Initialize push client
const pushClient = new PushClient()
pushClient.register()
