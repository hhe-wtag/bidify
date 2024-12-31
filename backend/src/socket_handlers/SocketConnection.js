import BidSocketHandler from './BidSocketHandler.js';

class SocketConnection {
  constructor(io) {
    if (!io) throw new Error('Socket.io instance required');
    this.io = io;
    this.BidSocketHandler = new BidSocketHandler(io);
    this.initialize();
  }

  initialize() {
    this.io.on('connection', (socket) => {
      console.info(`Client connected: ${socket.id}`);

      socket.on('join-item', (itemId) => {
        this.BidSocketHandler.handleJoinItemRoom(socket, itemId);
      });

      socket.on('place-bid', (data) => {
        this.BidSocketHandler.handleBidPlacement(socket, data);
      });

      socket.on('leave-item', (itemId) => {
        this.BidSocketHandler.handleLeaveItemRoom(socket, itemId);
      });

      socket.on('disconnect', () => {
        console.info(`Client disconnected: ${socket.id}`);
      });
    });
  }
}

export default SocketConnection;
