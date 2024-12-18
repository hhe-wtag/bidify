import { defineStore } from 'pinia'
import axios from 'axios'
import { useErrorHandler } from '@/composables/useErrorHandler'

interface UserProfile {
  firstName: string
  lastName: string
  email: string
  contactNumber: string
  balance: number
  registrationDate: string
}

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    profile: null as UserProfile | null,
    error: null as string | null,
  }),
  actions: {
    async fetchUserProfile() {
      const { handleError } = useErrorHandler()

      try {
        const token = localStorage.getItem('token')
        if (!token) throw new Error('Token not found')

        const response = await axios.get('http://localhost:8080/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        })

        this.profile = response.data.data as UserProfile
        this.error = null
      } catch (error) {
        this.profile = null
        this.error = handleError(error) || 'Failed to fetch profile'
        console.error('Error fetching user profile:', this.error)
        throw error
      }
    },
    setToken(token: string) {
      this.token = token
      localStorage.setItem('token', token)
    },
    setUserProfile(profile: UserProfile) {
      this.profile = profile
    },
    logout() {
      this.token = null
      this.profile = null
      localStorage.removeItem('token')
    },
  },
})
