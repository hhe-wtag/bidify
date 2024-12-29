import BaseSocketHandler from './BaseHandler.js';
import BidController from '../controllers/BidController.js';

class BidHandler extends BaseSocketHandler {
  constructor(io) {
    super(io);
    this.bidController = BidController;
  }

  // Bid-specific event handlers
  handleBidPlacement = async (socket, bidData) => {
    console.log(bidData);
    this.emitToRoom(`item-${bidData.itemId}`, 'new-bid', {
      //   itemId: bidData.itemId,
      //   currentBid: bidData.currentBidAmount,
      //   bidderId: bidData.bidderId,
      //   timestamp: bidData.createdAt,
      hello: 'world',
    });
    // try {
    //   const result = await this.bidController.placeBid(bidData);

    //   this.emitToUser(socket.id, 'bid-placed', {
    //     success: true,
    //     bid: result,
    //   });

    //   this.emitToRoom(`auction-${bidData.itemId}`, 'new-bid', {
    //     itemId: bidData.itemId,
    //     currentBid: result.currentBidAmount,
    //     bidderId: result.bidderId,
    //     timestamp: result.createdAt,
    //   });
    // } catch (error) {
    //   this.emitToUser(socket.id, 'bid-error', {
    //     message: error.message,
    //     status: error.statusCode || 500,
    //   });
    // }
  };

  handleJoinAuction = (socket, itemId) => {
    socket.join(`auction-${itemId}`);
    console.log(`Client ${socket.id} joined auction room for item ${itemId}`);
  };

  handleLeaveAuction = (socket, itemId) => {
    socket.leave(`auction-${itemId}`);
    console.log(`Client ${socket.id} left auction room for item ${itemId}`);
  };
}

export default BidHandler;
