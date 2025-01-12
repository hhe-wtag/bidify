import { useErrorHandler } from '@/composables/useErrorHandler'
import { defineStore } from 'pinia'
import axiosInstance from '@/plugins/axios'
import type { BidHistory } from '@/interfaces/Bid'

const API_PATHS = {
  LATEST_10: (itemId: string | null) => `/bid/latest-10-bids?itemId=${itemId}`,
} as const

export const useBidStore = defineStore('bid', {
  state: () => ({
    lates10Bids: [] as BidHistory[],
    loading: false,
    error: null as string | null,
  }),
  getters: {},
  actions: {
    // Generic API call handler
    async handleApiCall<Item>(apiCall: () => Promise<Item>, errorMessage: string) {
      const { handleError } = useErrorHandler()
      this.loading = true
      this.error = null

      try {
        const result = await apiCall()
        return {
          success: true,
          message: 'Operation completed successfully',
          data: result,
        }
      } catch (err) {
        const errorMsg = handleError(err) || errorMessage
        this.error = errorMsg
        console.error(`API Error: ${errorMessage}`, err)
        return { success: false, message: errorMsg }
      } finally {
        this.loading = false
      }
    },

    async fetchLatest10Bids(ItemId: string) {
      return this.handleApiCall(async () => {
        const { data } = await axiosInstance.get(API_PATHS.LATEST_10(ItemId))
        this.lates10Bids = data.data
        return data.data
      }, 'Failed to fetch items')
    },
  },
})
