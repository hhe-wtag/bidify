import jwt from 'jsonwebtoken';

import BidSocketHandler from './BidSocketHandler.js';
import { User } from '../models/user.model.js';

class SocketConnection {
  constructor(io) {
    this.io = io;
    this.BidSocketHandler = new BidSocketHandler(io);
    this.setupAuthMiddleware();
    this.setupEventHandlers();
  }

  setupAuthMiddleware() {
    this.io.use(async (socket, next) => {
      try {
        const authHeader =
          socket.handshake.auth.token || socket.handshake.headers.authorization;

        if (!authHeader) {
          throw new Error('No token provided');
        }

        const token = authHeader.replace('Bearer ', '');

        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

        const user = await User.findById(decoded.id);

        if (!user) {
          throw new Error('User not found');
        }

        socket.user = user;
        next();
      } catch (error) {
        console.error('Socket authentication error:', error.message);
        next(new Error('Authentication failed'));
      }
    });
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.info(`Authenticated user connected: ${socket.user.email}`);

      socket.on('join-item', (itemId) => {
        this.BidSocketHandler.handleJoinItemRoom(socket, itemId);
      });

      socket.on('leave-item', (itemId) => {
        this.BidSocketHandler.handleLeaveItemRoom(socket, itemId);
      });

      socket.on('disconnect', () => {
        console.info(`User disconnected: ${socket.user.email}`);
      });
    });
  }
}

export default SocketConnection;
