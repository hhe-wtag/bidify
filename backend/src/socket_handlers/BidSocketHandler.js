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

  handleJoinNotificationRoom = (socket) => {
    socket.join(`notification`);

    this.emitToRoom(`notification`, 'user-notification-room', {
      event: 'user-notification-room',
      data: { user: socket.user },
      message: `User-${socket.id} connected to notification room`,
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
      const { savedBid, bidPlacedNotification, outBidNotify } = result.data;

      this.emitToRoom(`item-${bidData.itemId}`, EVENTS.NEW_BID_PLACED, {
        event: EVENTS.NEW_BID_PLACED,
        data: { bid: savedBid },
        message: `New bid of $${bidData.incrementBidAmount} placed by userId: ${bidData.bidderId}`,
      });

      console.log(`Bid Notify: ${bidPlacedNotification}`);
      this.emitToUser(socket.id, 'place-bid-notification', {
        event: 'place-bid-notification',
        data: { notification: bidPlacedNotification },
        message: `Bid placed successfully by userId: ${bidData.bidderId} on itemId: ${bidData.itemId}`,
      });

      if (outBidNotify.length > 0) {
        outBidNotify.forEach((notification) => {
          const userIdString = notification.userId.toString();
          console.log(userIdString);
          if (!this.userSocketMap.has(userIdString)) {
            console.log(
              `User ${notification.userId} not connected, skipping emit`
            );
            return;
          }
          const socketId = this.userSocketMap.get(userIdString);
          console.log(`Outbid Notify: ${notification}`);
          this.emitToUser(socketId, 'outbid-notification', {
            event: 'outbid-notification',
            data: { notification },
            message: `You have been outbid on itemId: ${notification.itemId}.`,
          });
        });
      }
    }
  };
}

export default BidSocketHandler;
