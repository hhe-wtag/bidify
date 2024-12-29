class BaseSocketHandler {
  constructor(io) {
    this.io = io;
  }

  emitToUser(socketId, event, data) {
    this.io.to(socketId).emit(event, data);
  }

  emitToRoom(room, event, data) {
    this.io.to(room).emit(event, data);
  }

  broadcastToRoom(socket, room, event, data) {
    socket.broadcast.to(room).emit(event, data);
  }
}

export default BaseSocketHandler;
