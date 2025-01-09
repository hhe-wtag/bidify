export interface Item {
  _id: string
  title: string
  description: string
  startingBid: number
  minimumBidIncrement: number
  endTime: string
  slug: string
  sellerId: string
  latestBid?: number
  status?: string
  createdAt?: string
  updatedAt?: string
}

export interface Bid {
  _id: string
  itemId: string
  bidderId: string
  incrementBidAmount: number
  lastBidAmount: number
  lastestBidAmount: string
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
  currentItemLatest10Bids: Bid[]
  loading: boolean
  error: string | null
}
