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
