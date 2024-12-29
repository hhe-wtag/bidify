import BidHandler from './BidHandler.js';

class SocketConnection {
  constructor(io) {
    if (!io) throw new Error('Socket.io instance required');
    this.io = io;
    this.bidHandler = new BidHandler(io);
    this.initialize();
  }

  initialize() {
    this.io.on('connection', (socket) => {
      console.info(`Client connected: ${socket.id}`);

      // When a user enters item route in client will enter items room in socket
      socket.on('join-item', (itemId) => {
        this.bidHandler.handleJoinItemRoom(socket, itemId);
      });

      socket.on('place-bid', (data) => {
        this.bidHandler.handleBidPlacement(socket, data);
      });

      socket.on('leave-item', (itemId) => {
        this.bidHandler.handleLeaveItemRoom(socket, itemId);
      });

      socket.on('disconnect', () => {
        console.info(`Client disconnected: ${socket.id}`);
      });
    });
  }
}

export default SocketConnection;
