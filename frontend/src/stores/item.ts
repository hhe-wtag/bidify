import { defineStore } from 'pinia'
import type { Item, CreateItemData, UpdateItemData, ItemStoreState } from '@/interfaces/item'
import axiosInstance from '@/plugins/axios'
import { useErrorHandler } from '@/composables/useErrorHandler'
import { useBidStore } from './bid'
import { late } from 'zod'
import { joinItemRoom, leaveItemRoom } from '@/services/bidSocketEvents'

// API endpoints
const API_PATHS = {
  ALL: '/item/all',
  SINGLE: (slug: string) => `/item/${slug}`,
  CREATE: '/item/create',
  UPDATE: (id: string) => `/item/update/${id}`,
  DELETE: (id: string) => `/item/delete/${id}`,
} as const

export const useItemStore = defineStore('item', {
  state: (): ItemStoreState => ({
    items: [],
    currentItem: null,
    loading: false,
    error: null,
  }),

  getters: {
    getItemBySlug: (state) => {
      return (slug: string): Item | undefined => state.items.find((item) => item.slug === slug)
    },

    activeItems: (state): Item[] => {
      const now = new Date()
      return state.items.filter((item) => item.status !== 'closed' && new Date(item.endTime) > now)
    },

    hasError: (state): boolean => state.error !== null,
  },

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

    async fetchAllItems() {
      return this.handleApiCall(async () => {
        const { data } = await axiosInstance.get(API_PATHS.ALL)
        this.items = data.data
        return data.data
      }, 'Failed to fetch items')
    },

    async fetchItemBySlug(slug: string) {
      return this.handleApiCall(async () => {
        const { data } = await axiosInstance.get(API_PATHS.SINGLE(slug))
        const item = data.data
        this.currentItem = item

        const index = this.items.findIndex((i) => i.slug === slug)
        if (index !== -1) {
          this.items[index] = item
        }

        joinItemRoom(item._id)

        return item
      }, 'Failed to fetch item')
    },

    async createItem(itemData: CreateItemData) {
      return this.handleApiCall(async () => {
        const { data } = await axiosInstance.post(API_PATHS.CREATE, itemData)
        const newItem = data.data
        this.items.push(newItem)
        return newItem
      }, 'Failed to create item')
    },

    async updateItem(id: string, updateData: UpdateItemData) {
      return this.handleApiCall(async () => {
        const { data } = await axiosInstance.patch(API_PATHS.UPDATE(id), updateData)
        const updatedItem = data.data

        const index = this.items.findIndex((item) => item._id === id)
        if (index !== -1) {
          this.items[index] = updatedItem
        }

        if (this.currentItem?._id === id) {
          this.currentItem = updatedItem
        }

        return updatedItem
      }, 'Failed to update item')
    },

    async deleteItem(id: string) {
      return this.handleApiCall(async () => {
        await axiosInstance.delete(API_PATHS.DELETE(id))

        this.items = this.items.filter((item) => item._id !== id)

        if (this.currentItem?._id === id) {
          this.clearCurrentItem()
        }
      }, 'Failed to delete item')
    },

    fetchWinnerOfTheItem() {},

    updateBidData(latestBid) {
      if (this.currentItem)
        this.currentItem = { ...this.currentItem, latestBid: latestBid?.bidAmount }
    },

    // Utility actions
    clearCurrentItem() {
      leaveItemRoom(this.currentItem?._id)
      this.currentItem = null
    },

    clearError() {
      this.error = null
    },
  },
})
