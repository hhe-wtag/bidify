export const ROOMS = {
  ITEM: 'item',
  ADMIN: 'admin',
  NOTIFICATION: 'notification',
};

export const NAMESPACES = {
  MAIN: '/',
  ADMIN: '/admin',
  NOTIFICATION: '/notification',
};

export const EVENTS = {
  // Connection Events
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  ERROR: 'error',

  // Bid Events
  JOIN_ITEM_ROOM: 'join-item-room',
  LEAVE_ITEM_ROOM: 'leave-item-room',
  PLACE_BID: 'place-bid',
  PLACE_BID_RESULT: 'place-bid-result',
  NEW_BID_PLACED: 'new-bid-placed',
  AUCTION_ENDED: 'auction-ended',

  // Room Events
  USER_JOINED_ROOM: 'user-joined-room',
  USER_LEFT_ROOM: 'user-left-room',

  // User Events
  USER_CONNECTED: 'user-connected',
  USER_DISCONNECTED: 'user-disconnected',

  // Notification Events
  NOTIFICATION_MARK_ALL_READ: 'mark-all-read',
  NOTIFICATION_MARK_AS_READ: 'mark-as-read',
  NOTIFICATION_NEW_BID_PLACE: 'place-bid-notification',
  NOTIFICATION_OUT_BID_PLACE: 'outbid-notification',
  NOTIFICATION_WINNER: 'auction-winner',
  NOTIFICATION_AUCTION_END: 'auction-end',
  NOTIFICATION_AUCTION_CANCELED: 'auction-canceled',

  // Admin Events
  GET_ACTIVE_USERS: 'get-active-users',
  ACTIVE_USERS_LIST: 'active-users-list',
  GET_ROOM_USERS: 'get-room-users',
  ROOM_USERS_LIST: 'room-users-list',
};

export const RESPONSE_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
};
