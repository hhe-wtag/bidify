import { defineStore } from 'pinia'
import axios from 'axios'

export const useNotificationStore = defineStore('notifications', {
  state: () => ({
    notifications: [] as Array<any>,
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
      this.loading = true
      this.error = null
      try {
        const response = await axios.get('http://localhost:8080/api/notification/', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        })
        this.notifications = response.data.data
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Failed to fetch notifications.'
      } finally {
        this.loading = false
      }
    },
    markAllAsRead() {
      this.notifications = this.notifications.map((notification) => ({
        ...notification,
        read: true,
      }))
    },
    addNotification(notification: any) {
      this.notifications.unshift(notification)
    },
  },
})
