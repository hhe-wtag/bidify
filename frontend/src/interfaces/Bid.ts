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

export interface BidHistory {
  bidderName: string
  bidAmount: number
  timeOfTheBid: string
  incrementAmount: number
}

export interface BidData {
  itemId: string
  bidderId: string
  incrementBidAmount: number
}
