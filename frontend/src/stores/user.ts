import { defineStore } from 'pinia'
import axios from 'axios'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    profile: null,
    error: null,
  }),
  actions: {
    async fetchUserProfile() {
      try {
        const token = localStorage.getItem('token')
        if (!token) throw new Error('Token not found')

        const response = await axios.get('http://localhost:8080/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        })

        this.profile = response.data.data // Set profile if successful
        this.error = null // Clear any existing errors
      } catch (error) {
        this.profile = null // Reset profile if the request fails
        this.error = error.response?.data?.message || 'Failed to fetch profile'
        console.error('Error fetching user profile:', this.error)
        throw error // Optional: re-throw for component handling
      }
    },
    setToken(token: string) {
      this.token = token
      localStorage.setItem('token', token)
    },
    setUserProfile(profile: object) {
      this.profile = profile
    },
    logout() {
      this.token = null
      this.profile = null
      localStorage.removeItem('token')
    },
  },
})
