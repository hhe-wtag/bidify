import { ca } from 'date-fns/locale'
import { onEvent, emitEvent } from './websocket'

interface BidData {
  itemId: string
  bidderId: string
  incrementBidAmount: number
}

// Join/Leave Room
export const joinItemRoom = (itemId: string) => {
  emitEvent('join-item-room', itemId)
}

export const leaveItemRoom = (itemId: string) => {
  emitEvent('leave-item-room', itemId)
}

// Bid Actions
export const placeBid = (bidData: BidData) => {
  emitEvent('place-bid', bidData)
}

// Event Listeners
export const onNewBidPlaced = (callback: (data: any) => void) => {
  onEvent('new-bid-placed', callback)
}

export const onPlaceBidResult = (callback: (data: any) => void) => {
  onEvent('placed-bid-result', callback)
}
