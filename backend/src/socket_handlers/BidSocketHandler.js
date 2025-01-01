import BaseSocketHandler from './BaseSocketHandler.js';
import BidSocketRepository from '../repositories/BidSocketRepository.js';
import HTTP_STATUS from '../utils/httpStatus.js';

class BidSocketHandler extends BaseSocketHandler {
  constructor(io) {
    super(io);
    this.bidSocketRepository = new BidSocketRepository();
  }

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

  handleJoinItemRoom = (socket, itemId) => {
    socket.join(`item-${itemId}`);

    this.broadcastToRoom(socket, `item-${itemId}`, 'user-joined', {
      message: `User-${socket.id} connected to item room ${itemId}`,
    });
  };

  handleLeaveItemRoom = (socket, itemId) => {
    this.broadcastToRoom(socket, `item-${itemId}`, 'user-left', {
      message: `User-${socket.id} left the room ${itemId}`,
    });
  };
}

export default BidSocketHandler;
