import { onEvent, emitEvent } from './websocket'

interface BidData {
  itemId: string
  bidderId: string
  incrementBidAmount: number
}

export const joinItemRoom = (itemId: string) => {
  emitEvent('join-item-room', itemId)
}

export const leaveItemRoom = (itemId: string) => {
  emitEvent('leave-item-room', itemId)
}

export const placeBid = (bidData: BidData) => {
  emitEvent('place-bid', bidData)
}

export const onNewBid = (callback: (data: any) => void) => {
  onEvent('new-bid-placed', callback)
}

export const onBidSuccess = (callback: (data: any) => void) => {
  onEvent('bid-success', callback)
}


export const onNotification = (callback: (data: any) => void) => {
  onEvent('user-notification-room', callback)
}

export const onBidError = (callback: (error: any) => void) => {
  onEvent('bid-error', callback)
}

