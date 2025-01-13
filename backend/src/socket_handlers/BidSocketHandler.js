import BaseSocketHandler from './BaseSocketHandler.js';
import BidSocketRepository from '../repositories/BidSocketRepository.js';
import HTTP_STATUS from '../utils/httpStatus.js';

class BidSocketHandler extends BaseSocketHandler {
  constructor(io) {
    super(io);
    this.bidSocketRepository = new BidSocketRepository();
  }

  handleJoinItemRoom = (socket, itemId) => {
    socket.join(`item-${itemId}`);

    this.emitToRoom(`item-${itemId}`, 'user-joined-item-room', {
      event: 'user-joined-item-room',
      data: { user: socket.user },
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

    this.broadcastToRoom(socket, `item-${itemId}`, 'user-left-item-room', {
      event: 'user-left-item-room',
      data: { user: socket.user },
      message: `User-${socket.id} left the room ${itemId}`,
    });
  };

  handleBidPlacement = async (socket, bidData) => {
    const result = await this.bidSocketRepository.placeBid(bidData);

    if (result.statusCode === HTTP_STATUS.CREATED) {
      this.emitToRoom(`item-${bidData.itemId}`, 'new-bid-placed', {
        event: 'new-bid-placed',
        data: { bid: result },
        message: `New bid of $${bidData.incrementBidAmount} placed by userId: ${bidData.bidderId}`,
      });

      this.emitToUser(socket.id, 'place-bid-notification', {
        event: 'place-bid-notification',
        data: { bid: result },
        message: `Attempt of 'place-bid-notification' by userId: ${bidData.bidderId} against itemId: ${bidData.itemId}`,
      });
    }

    this.emitToUser(socket.id, 'place-bid-result', {
      event: 'place-bid-result',
      data: { bid: result },
      message: `Attempt of 'place-bid' by userId: ${bidData.bidderId} against itemId: ${bidData.itemId}`,
    });
  };
}

export default BidSocketHandler;
