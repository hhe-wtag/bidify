import BaseSocketHandler from './BaseSocketHandler.js';
import BidSocketRepository from '../repositories/BidSocketRepository.js';
import HTTP_STATUS from '../utils/httpStatus.js';
import { EVENTS } from '../utils/socketConstants.js';

class BidSocketHandler extends BaseSocketHandler {
  constructor(io, userSocketMap) {
    super(io, userSocketMap);
    this.bidSocketRepository = new BidSocketRepository();
  }

  handleJoinItemRoom = (socket, itemId) => {
    socket.join(`item-${itemId}`);

    this.emitToRoom(`item-${itemId}`, EVENTS.USER_JOINED_ROOM, {
      event: EVENTS.USER_JOINED_ROOM,
      data: { user: socket.user, room: `item-${itemId}` },
      message: `User-${socket.id} connected to item room ${itemId}`,
    });
  };

  handleLeaveItemRoom = (socket, itemId) => {
    socket.leave(`item-${itemId}`);

    this.broadcastToRoom(socket, `item-${itemId}`, EVENTS.USER_LEFT_ROOM, {
      event: EVENTS.USER_LEFT_ROOM,
      data: { user: socket.user, room: `item-${itemId}` },
      message: `User-${socket.id} left the room ${itemId}`,
    });
  };

  handleBidPlacement = async (socket, bidData) => {
    const result = await this.bidSocketRepository.placeBid(bidData);

    if (result.statusCode === HTTP_STATUS.CREATED) {
      const { savedBid, bidPlacedNotification, outbidNotifications } =
        result.data;

      this.emitToRoom(`item-${bidData.itemId}`, EVENTS.NEW_BID_PLACED, {
        event: EVENTS.NEW_BID_PLACED,
        data: { bid: savedBid },
        message: `New bid of $${bidData.incrementBidAmount} placed by userId: ${bidData.bidderId}`,
      });

      this.emitToUser(socket.id, EVENTS.NOTIFICATION_NEW_BID_PLACE, {
        event: EVENTS.NOTIFICATION_NEW_BID_PLACE,
        data: { notification: bidPlacedNotification },
        message: `Bid placed successfully by userId: ${bidData.bidderId} on itemId: ${bidData.itemId}`,
      });

      if (outbidNotifications.length > 0) {
        outbidNotifications.forEach((notification) => {
          const userIdString = notification.userId.toString();
          if (!this.userSocketMap.has(userIdString)) {
            return;
          }

          const socketId = this.userSocketMap.get(userIdString);
          this.emitToUser(socketId, EVENTS.NOTIFICATION_OUT_BID_PLACE, {
            event: EVENTS.NOTIFICATION_OUT_BID_PLACE,
            data: { notification },
            message: `You have been outbid by userId: ${notification.userId} on itemId: ${notification.itemId}.`,
          });
        });
      }
    }
  };
}

export default BidSocketHandler;
