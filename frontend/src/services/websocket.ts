// import { ref, onMounted, onBeforeMount } from 'vue'
import { io, type Socket } from 'socket.io-client'

let socket: Socket | null = null

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
  })

  socket.on('user-connected', (data) => {
    console.info(`User connected: ${data.email}`)
  })

  socket.on('error', (error) => {
    console.error('WebSocket error:', error)
  })
}

export const disconnectSocket = () => {
  if (socket) {
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
  socket.on(event, callback)
}
