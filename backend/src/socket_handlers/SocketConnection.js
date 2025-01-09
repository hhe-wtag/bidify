import { instrument } from '@socket.io/admin-ui';
import jwt from 'jsonwebtoken';

import BidSocketHandler from './BidSocketHandler.js';
import { User } from '../models/user.model.js';

class SocketConnection {
  constructor(io) {
    this.io = io;
    this.BidSocketHandler = new BidSocketHandler(io);
    this.setupAdminUI();
    this.setupAuthMiddleware();
    this.setupEventHandlers();
  }

  setupAdminUI() {
    instrument(this.io, {
      auth: false,
      mode:
        process.env.NODE_ENV === 'production' ? 'production' : 'development',
      serverId: 'bidify-server',
    });
    const adminNamespace = this.io.of('/admin');

    adminNamespace.use(async (socket, next) => {
      const isAdmin = true;

      if (!isAdmin) {
        return next(new Error('Admin access required'));
      }
      next();
    });

    adminNamespace.on('connection', (socket) => {
      console.info('Admin connected:', socket.id);

      socket.on('get-active-users', () => {
        const sockets = this.io.sockets.sockets;
        const activeUsers = Array.from(sockets).map(([id, socket]) => ({
          id,
          email: socket.user?.email,
          rooms: Array.from(socket.rooms),
        }));
        socket.emit('active-users', activeUsers);
      });
    });
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
      console.info(`✅ Authenticated user connected: ${socket.user.email}`);
      this.io.emit('user-connected', { email: socket.user.email });

      socket.on('join-item-room', (itemId) => {
        this.BidSocketHandler.handleJoinItemRoom(socket, itemId);
      });

      socket.on('leave-item-room', (itemId) => {
        this.BidSocketHandler.handleLeaveItemRoom(socket, itemId);
      });

      socket.on('place-bid', (data) => {
        this.BidSocketHandler.handleBidPlacement(socket, data);
      });

      socket.on('disconnect', () => {
        console.info(`❌ User disconnected: ${socket.user.email}`);
      });
    });
  }
}

export default SocketConnection;
