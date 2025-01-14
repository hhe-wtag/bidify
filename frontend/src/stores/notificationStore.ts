import { defineStore } from 'pinia'
import axios from 'axios'
import { emitMarkAllRead } from '@/services/notificationSocketEvents'
import type { Notifications } from '@/interfaces/notification'
import { useErrorHandler } from '@/composables/useErrorHandler'

export const useNotificationStore = defineStore('notifications', {
  state: () => ({
    notifications: [] as Array<Notifications>,
    loading: false,
    error: null as string | null,
  }),
  getters: {
    unreadNotifications(state) {
      return state.notifications.filter((n) => !n.read)
    },
    auctionNotifications(state) {
      return state.notifications.filter((n) =>
        ['AUCTION_REMINDER', 'BID_PLACED', 'AUCTION_WON', 'OUTBID'].includes(n.type),
      )
    },
    systemNotifications(state) {
      return state.notifications.filter((n) => n.type === 'REGISTRATION')
    },
  },
  actions: {
    async fetchNotifications() {
      const { handleError } = useErrorHandler()
      this.loading = true
      this.error = null
      try {
        const response = await axios.get('http://localhost:8080/api/notification/', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        })
        this.notifications = response.data.data
      } catch (error) {
        this.error = handleError(error)
      } finally {
        this.loading = false
      }
    },
    markAllAsRead(userId: string) {
      this.notifications = this.notifications.map((notification) => ({
        ...notification,
        read: true,
      }))
      emitMarkAllRead(userId)
    },
    addNotification(notification: Notifications) {
      this.notifications.unshift(notification)
    },
  },
})
