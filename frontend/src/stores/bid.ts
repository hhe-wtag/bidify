import { joinItemRoom } from './../services/bidSocketEvents'
import { defineStore } from 'pinia'

export const useBidStore = defineStore('bid', {
  state: () => ({
    bids: [],
    connectedUsers: [],
    loading: false,
    error: null,
  }),
  getters: {},
  actions: {
    addConnectedUsers(email: string) {
      this.connectedUsers.push(email)
    },
  },
})
