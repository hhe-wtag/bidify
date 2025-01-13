import { ca } from 'date-fns/locale'
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

// Event Listeners
export const onNewBidPlaced = (callback: (data: any) => void) => {
  onEvent('new-bid-placed', callback)
}

export const onPlaceBidResult = (callback: (data: any) => void) => {
  onEvent('placed-bid-result', callback)
}


export const onNotification = (callback: (data: any) => void) => {
  onEvent('user-notification-room', callback)
}

export const onBidError = (callback: (error: any) => void) => {
  onEvent('bid-error', callback)
}

