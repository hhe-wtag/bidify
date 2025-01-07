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
  emitEvent('leave-item', itemId)
}

// Bid Actions
export const placeBid = (bidData: BidData) => {
  emitEvent('place-bid', bidData)
}

// Event Listeners
export const onNewBid = (callback: (data: any) => void) => {
  onEvent('new-bid', callback)
}

export const onBidSuccess = (callback: (data: any) => void) => {
  onEvent('bid-success', callback)
}

export const onBidError = (callback: (error: any) => void) => {
  onEvent('bid-error', callback)
}

// export const onUserJoined = (callback: (error: any) => void) => {
//   onEvent('user-joined', callback)
// }
