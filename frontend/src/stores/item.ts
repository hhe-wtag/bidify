import { defineStore } from 'pinia'
import type {
  Item,
  CreateItemData,
  UpdateItemData,
  ItemStoreState,
  StoreResponse,
} from '@/interfaces/item'
import axiosInstance from '@/plugins/axios'
import { useErrorHandler } from '@/composables/useErrorHandler'

// API Response types
interface ApiResponse<T> {
  data: T
}

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
    async handleApiCall<T>(
      apiCall: () => Promise<T>,
      errorMessage: string,
    ): Promise<StoreResponse<T>> {
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

    async fetchAllItems(): Promise<StoreResponse<Item[]>> {
      return this.handleApiCall(async () => {
        const { data } = await axiosInstance.get<ApiResponse<Item[]>>(API_PATHS.ALL)
        this.items = data.data
        return data.data
      }, 'Failed to fetch items')
    },

    async fetchItemBySlug(slug: string): Promise<StoreResponse<Item>> {
      return this.handleApiCall(async () => {
        const { data } = await axiosInstance.get<ApiResponse<Item>>(API_PATHS.SINGLE(slug))
        const item = data.data
        this.currentItem = item

        const index = this.items.findIndex((i) => i.slug === slug)
        if (index !== -1) {
          this.items[index] = item
        }

        return item
      }, 'Failed to fetch item')
    },

    async createItem(itemData: CreateItemData): Promise<StoreResponse<Item>> {
      return this.handleApiCall(async () => {
        const { data } = await axiosInstance.post<ApiResponse<Item>>(API_PATHS.CREATE, itemData)
        const newItem = data.data
        this.items.push(newItem)
        return newItem
      }, 'Failed to create item')
    },

    async updateItem(id: string, updateData: UpdateItemData): Promise<StoreResponse<Item>> {
      return this.handleApiCall(async () => {
        const { data } = await axiosInstance.patch<ApiResponse<Item>>(
          API_PATHS.UPDATE(id),
          updateData,
        )
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

    async deleteItem(id: string): Promise<StoreResponse<void>> {
      return this.handleApiCall(async () => {
        await axiosInstance.delete(API_PATHS.DELETE(id))

        this.items = this.items.filter((item) => item._id !== id)

        if (this.currentItem?._id === id) {
          this.currentItem = null
        }
      }, 'Failed to delete item')
    },

    // Utility actions
    clearCurrentItem() {
      this.currentItem = null
    },

    clearError() {
      this.error = null
    },
  },
})
