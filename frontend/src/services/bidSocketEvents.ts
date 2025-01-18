import type { BidData } from '@/interfaces/Bid'
import { onEvent, emitEvent } from './websocket'

export const joinItemRoom = (itemId: string) => {
  emitEvent('join-item-room', itemId)
}

export const leaveItemRoom = (itemId: string) => {
  emitEvent('leave-item-room', itemId)
}

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
