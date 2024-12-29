import BaseSocketHandler from './BaseHandler.js';
import BidRepository from '../repositories/BidRepository.js';

class BidHandler extends BaseSocketHandler {
  constructor(io) {
    super(io);
    this.bidRepository = new BidRepository();
  }

  // Bid-specific event handlers
  handleBidPlacement = async (socket, bidData) => {
    this.emitToRoom(`item-${bidData.itemId}`, 'new-bid', {
      message: 'Someone placed a bid',
    });
    try {
      const result = await this.bidRepository.placeBid(bidData);

      this.emitToUser(`item-${bidData.itemId}`, 'new-bid', {
        bid: result,
        message: 'New bid placed successfully',
      });

      socket.emit('bid-success', {
        bid: result,
        message: `new bid placed successfully by ${bidData.bidderId} against itemId: ${bidData.itemId}`,
      });
    } catch (error) {
      console.error('Bid error:', error);
      socket.emit('bid-error', {
        message: error.message,
      });
    }
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

    //socket.leave(`item-${itemId}`);
  };
}

export default BidHandler;
