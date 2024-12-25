export interface Item {
  _id: string
  title: string
  description: string
  startingBid: number
  minimumBidIncrement: number
  endTime: string
  slug: string
  sellerId: string
  currentBid?: number
  status?: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateItemData {
  title: string
  description: string
  startingBid: number
  minimumBidIncrement: number
  endTime: string
}

export interface UpdateItemData {
  title?: string
  description?: string
  startingBid?: number
  minimumBidIncrement?: number
  endTime?: string
}

export interface ItemStoreState {
  items: Item[]
  currentItem: Item | null
  loading: boolean
  error: string | null
}
