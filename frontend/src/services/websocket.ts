import { io, type Socket } from 'socket.io-client'

let socket: Socket | null = null
const activeListeners = new Map<string, ((...args: any[]) => void)[]>()

export const connectSocket = (token: string) => {
  if (socket && socket.connected) return

  socket = io('http://localhost:8080', {
    auth: { token: `Bearer ${token}` },
    transports: ['websocket'],
  })

  socket.on('connect', () => {
    console.info('✅ WebSocket connection established')
  })

  socket.on('disconnect', () => {
    console.info('❌ WebSocket connection disconnected')
    cleanupAllListeners()
  })

  socket.on('user-connected', (data) => {
    console.info(`User connected: ${data.email}`)
  })

  socket.on('error', (error) => {
    console.error('WebSocket error:', error)
  })
}

const cleanupAllListeners = () => {
  if (!socket) return

  activeListeners.forEach((callbacks, event) => {
    callbacks.forEach((callback) => {
      socket?.off(event, callback)
    })
  })
  activeListeners.clear()
}

export const disconnectSocket = () => {
  if (socket) {
    cleanupAllListeners()
    socket.disconnect()
    socket = null
  }
}

export const emitEvent = <T = unknown>(event: string, payload: T) => {
  if (socket) {
    socket.emit(event, payload)
  } else {
    console.warn('WebSocket is not connected.')
  }
}

export const onEvent = (event: string, callback: (...args: any[]) => void) => {
  if (!socket) {
    console.warn('WebSocket is not connected.')
    return
  }

  // Add to active listeners
  if (!activeListeners.has(event)) {
    activeListeners.set(event, [])
  }
  const callbacks = activeListeners.get(event)

  // Remove existing instance of this callback if it exists
  const existingIndex = callbacks?.findIndex((cb) => cb.toString() === callback.toString())
  if (existingIndex !== undefined && existingIndex !== -1) {
    socket.off(event, callbacks[existingIndex])
    callbacks.splice(existingIndex, 1)
  }

  // Add new callback
  callbacks?.push(callback)
  socket.on(event, callback)
}

export const offEvent = (event: string, callback?: (...args: any[]) => void) => {
  if (!socket) {
    console.warn('WebSocket is not connected.')
    return
  }

  if (callback) {
    // Remove specific callback
    socket.off(event, callback)
    const callbacks = activeListeners.get(event)
    if (callbacks) {
      const index = callbacks.findIndex((cb) => cb.toString() === callback.toString())
      if (index !== -1) {
        callbacks.splice(index, 1)
      }
      if (callbacks.length === 0) {
        activeListeners.delete(event)
      }
    }
  } else {
    // Remove all callbacks for this event
    socket.off(event)
    activeListeners.delete(event)
  }
}
