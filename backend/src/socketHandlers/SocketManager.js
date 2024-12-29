import BidHandler from './BidHandler.js';

class SocketManager {
  constructor(io) {
    if (!io) throw new Error('Socket.io instance required');
    this.io = io;
    this.bidHandler = new BidHandler(io);
    this.initialize();
  }

  initialize() {
    this.io.on('connection', (socket) => {
      console.info(`Client connected: ${socket.id}`);

      // Join room for bid updates
      socket.on('join-item', (itemId) => {
        socket.join(`item-${itemId}`);
        console.info(`Socket ${socket.id} joined room: item-${itemId}`);
      });

      // Handle bid placement
      socket.on('place-bid', async (data) => {
        console.info('place-bid', data);
        try {
          await this.bidHandler.handleBidPlacement(socket, data);
        } catch (error) {
          socket.emit('bid-error', { message: error.message });
        }
      });

      socket.on('disconnect', () => {
        console.info(`Client disconnected: ${socket.id}`);
      });
    });
  }
}

export default SocketManager;
