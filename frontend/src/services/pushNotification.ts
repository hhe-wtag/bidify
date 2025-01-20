export const setupPushNotifications = async (userId, token) => {
  try {
    if (!('serviceWorker' in navigator)) {
      throw new Error('No support for service worker')
    }
    if (!('Notification' in window)) {
      throw new Error('No support for Notification API')
    }

    const requestPermission = async () => {
      let permission = Notification.permission

      if (permission === 'denied') {
        console.log(
          'Please enable notifications in your browser settings:\n\n' +
            "1. Click the lock/info icon in your browser's address bar\n" +
            '2. Find "Notifications" in the permissions list\n' +
            '3. Change the setting to "Allow"\n' +
            '4. Refresh the page and try again',
        )
        return false
      }

      if (permission !== 'granted') {
        permission = await Notification.requestPermission()
      }

      return permission === 'granted'
    }

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        })
        await navigator.serviceWorker.ready
        console.log('Service Worker registered successfully:', registration)
        return registration
      } catch (error) {
        console.error('Service Worker registration failed:', error)
        throw new Error('Failed to register service worker')
      }
    }

    const subscribeToPush = async (registration) => {
      try {
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey:
            'BDdTbQklov4-VHiMt6DUds3U6SuWSRi8dhzgYBFOrlkJbR3oFE48-3XDR2xkviruCUvsYEqgAa2VMp1AxYxyMlE',
        })

        console.log('Push subscription successful:', subscription)

        await registerPushNotification(subscription,userId,token)

        new Notification('Push Notifications Enabled', {
          body: 'You will now receive notifications for bids and auction updates',
          icon: '/icon.png',
        })

        return subscription
      } catch (error) {
        console.error('Push subscription failed:', error)
        throw new Error('Failed to subscribe to push notifications')
      }
    }

    const registerPushNotification = async (subscription, userId, token) => {
      if (!userId || !token) {
        console.error('User ID or Token is missing')
        return
      }

      try {
        const response = await fetch('http://localhost:8080/api/push/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId: userId,
            subscription: subscription,
          }),
        })

        const data = await response.json()
        if (response.ok) {
          console.log('Subscription successfully saved:', data)
        } else {
          console.error('Error saving subscription:', data)
        }
      } catch (error) {
        console.error('Failed to send subscription to backend:', error)
      }
    }

    const hasPermission = await requestPermission()
    if (!hasPermission) {
      return null
    }

    const registration = await registerSW()
    const subscription = await subscribeToPush(registration)

    return subscription
  } catch (error) {
    console.error('Error setting up push notifications:', error)
  }
}
