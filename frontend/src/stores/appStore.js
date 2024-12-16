import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    title: 'Home',
  }),
  actions: {
    setTitle(newTitle) {
      this.title = newTitle
    },
  },
})
