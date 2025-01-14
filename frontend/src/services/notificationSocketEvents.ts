import { onEvent, emitEvent } from './websocket'

export const onBidNotification = (callback: (data: any) => void) => {
  onEvent('place-bid-notification', callback)
}

export const onOutBidNotification = (callback: (data: any) => void) => {
  onEvent('outbid-notification', callback)
}

export const emitMarkAllRead = (userId: any) => {
  emitEvent('mark-all-read', { userId: userId })
}