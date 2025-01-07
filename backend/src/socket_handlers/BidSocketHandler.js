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

    this.emitToRoom(`item-${itemId}`, 'user-joined', {
      user: socket.user,
      message: `User-${socket.id} connected to item room ${itemId}`,
    });
  };

  handleLeaveItemRoom = (socket, itemId) => {
    this.broadcastToRoom(socket, `item-${itemId}`, 'user-left', {
      message: `User-${socket.id} left the room ${itemId}`,
    });
  };

  handleBidPlacement = async (socket, bidData) => {
    const result = await this.bidSocketRepository.placeBid(bidData);

    if (result.statusCode === HTTP_STATUS.CREATED) {
      this.broadcastToRoom(socket, `item-${bidData.itemId}`, 'new-bid', {
        message: `New bid of $${bidData.incrementBidAmount} placed by userId: ${bidData.bidderId}`,
      });
    }

    this.emitToUser(socket.id, 'place-bid-result', {
      'place-bid-result': result,
      message: `Attempt of 'place-bid' by userId: ${bidData.bidderId} against itemId: ${bidData.itemId}`,
    });
  };
}

export default BidSocketHandler;
