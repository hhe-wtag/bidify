import { defineStore } from 'pinia'
import axiosInstance from '@/plugins/axios'
import { useErrorHandler } from '@/composables/useErrorHandler'
import type { UserProfile } from '@/interfaces/user'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    profile: null as UserProfile | null,
    error: null as string | null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
  },
  actions: {
    async login(email: string, password: string) {
      const { handleError } = useErrorHandler()

      try {
        const response = await axiosInstance.post('/auth/login', {
          email,
          password,
        })

        const token = response.data.data.token
        this.setUserProfile(response.data.data.user)

        if (token) {
          this.setToken(token)
        } else {
          throw new Error('Token or user profile missing')
        }

        return { success: true, message: 'Login successful' }
      } catch (error) {
        this.error = handleError(error) || 'Login failed'
        console.error('Login error:', this.error)
        return { success: false, message: this.error }
      }
    },

    async register(userData: {
      firstName: string
      lastName: string
      email: string
      contactNumber: string
      password: string
    }) {
      const { handleError } = useErrorHandler()

      try {
        await axiosInstance.post('/auth/register', userData)

        return { success: true, message: 'Registration successful' }
      } catch (error) {
        this.error = handleError(error) || 'Registration failed'
        console.error('Error registering user:', this.error)
        return { success: false, message: this.error }
      }
    },

    async fetchUserProfile() {
      const { handleError } = useErrorHandler()

      try {
        const response = await axiosInstance.get('/user/profile')
        this.setUserProfile(response.data.data.user)
        this.error = null
        return { success: true, message: 'Profile fetched successfully' }
      } catch (error) {
        this.profile = null
        this.error = handleError(error) || 'Failed to fetch profile'
        console.error('Error fetching user profile:', this.error)
        return { success: false, message: this.error }
      }
    },

    async updatePassword(currentPassword: string, newPassword: string) {
      const { handleError } = useErrorHandler()

      try {
        const response = await axiosInstance.put(
          '/user/profile/password-change',
          {
            currentPassword,
            newPassword,
          },
          {
            headers: {
              Authorization: `Bearer ${this.token}`,
            },
          },
        )

        return { success: true, message: 'Password updated successfully' }
      } catch (error) {
        this.error = handleError(error) || 'Failed to update password'
        console.error('Error updating password:', this.error)
        return { success: false, message: this.error }
      }
    },

    async updateUserInfo(updatedProfile: {
      firstName: string
      lastName: string
      contactNumber: string
      balance: number
      address: {
        street: string | null
        city: string | null
        state: string | null
        zipCode: string | null
        country: string | null
      }
    }) {
      const { handleError } = useErrorHandler()

      try {
        const response = await axiosInstance.put('/user/profile/update', updatedProfile, {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        })

        if (response.status === 200) {
          this.setUserProfile(response.data.data)
          console.log('Profile updated successfully:', response.data.message)
          return { success: true, message: 'Profile updated successfully' }
        } else {
          console.error('Failed to update profile:', response.data.message)
          return { success: false, message: response.data.message }
        }
      } catch (error) {
        this.error = handleError(error) || 'Failed to update profile'
        console.error('Error updating profile:', this.error)
        return { success: false, message: this.error }
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
