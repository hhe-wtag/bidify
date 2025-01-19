export async function registerPushNotification() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('Push notifications are not supported')
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js')
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey:
        'BDdTbQklov4-VHiMt6DUds3U6SuWSRi8dhzgYBFOrlkJbR3oFE48-3XDR2xkviruCUvsYEqgAa2VMp1AxYxyMlE',
    })

    return subscription
  } catch (error) {
    console.error('Push notification registration failed:', error)
    throw error
  }
}

export async function subscribeToPushNotifications(registration) {
  try {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey:
        'BDdTbQklov4-VHiMt6DUds3U6SuWSRi8dhzgYBFOrlkJbR3oFE48-3XDR2xkviruCUvsYEqgAa2VMp1AxYxyMlE',
    })

    // Send subscription to backend
    const token = localStorage.getItem('jwt')
    await fetch('http://localhost:3000/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(subscription),
    })

    return subscription
  } catch (error) {
    console.error('Push subscription failed:', error)
    throw error
  }
}
