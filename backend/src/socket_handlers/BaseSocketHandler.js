class BaseSocketHandler {
  constructor(io, userSocketMap) {
    this.io = io;
    this.userSocketMap = userSocketMap;
  }

  /**
   * Emits an event to a specific user identified by their socket ID.
   * @param {string} socketId - The ID of the user's socket.
   * @param {string} event - The name of the event to emit.
   * @param {any} data - The data to send with the event.
   */
  emitToUser(socketId, event, data) {
    this.io.to(socketId).emit(event, data);
  }

  /**
   * Emits an event to all clients in a specific room.
   * @param {string} room - The room to emit the event to.
   * @param {string} event - The event name.
   * @param {any} data - The data to send with the event.
   */
  emitToRoom(room, event, data) {
    this.io.to(room).emit(event, data);
  }

  /**
   * Broadcasts an event to all users in a specific room except the sender.
   * @param {object} socket - The socket object of the sender.
   * @param {string} room - The name of the room to broadcast to.
   * @param {string} event - The name of the event to broadcast.
   * @param {any} data - The data to send with the event.
   */
  broadcastToRoom(socket, room, event, data) {
    socket.broadcast.to(room).emit(event, data);
  }
}

export default BaseSocketHandler;
