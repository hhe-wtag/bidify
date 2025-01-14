export  interface Notifications {
  _id: string
  userId: string
  itemId?: string
  type: 'REGISTRATION' | 'AUCTION_REMINDER' | 'BID_PLACED' | 'AUCTION_WON' | 'OUTBID'
  message: string
  preview: string
  read: boolean
  createdAt: string
  updatedAt?: string
}
