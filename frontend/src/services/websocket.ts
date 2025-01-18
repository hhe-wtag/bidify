import { toast } from '@/components/ui/toast'
import { emitToastForWSConnect, emitToastForWSDisconnet } from '@/utils/commonToasts'
import { io, type Socket } from 'socket.io-client'

let socket: Socket | null = null
const activeListeners = new Map<string, ((...args: any[]) => void)[]>()

export const connectSocket = (token: string, userId: string, setWSStatus: any) => {
  if (socket && socket.connected) return

  socket = io('http://localhost:8080', {
    auth: { token: `Bearer ${token}`,userId: `${userId}` },
    transports: ['websocket'],
  })

  socket.on('connect', () => {
    emitToastForWSConnect()
    console.info('✅ WebSocket connection established')
  })

  socket.on('disconnect', () => {
    emitToastForWSDisconnet()
    cleanupAllListeners()
    setWSStatus(false)
  })

  socket.on('user-connected', (data) => {
    setWSStatus(true)
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
  if (!socket?.connected) {
    emitToastForWSDisconnet()
    return
  }

  socket.emit(event, payload)
}

export const onEvent = (event: string, callback: (...args: any[]) => void) => {
  if (!socket?.connected) {
    emitToastForWSDisconnet()
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
  if (!socket?.connected) {
    emitToastForWSDisconnet()
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
