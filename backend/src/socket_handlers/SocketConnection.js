import { instrument } from '@socket.io/admin-ui';
import jwt from 'jsonwebtoken';

import BidSocketHandler from './BidSocketHandler.js';
import { User } from '../models/user.model.js';
import { Item } from '../models/item.model.js';
import ApiResponse from '../utils/ApiResponse.js';
import HTTP_STATUS from '../utils/httpStatus.js';
import { Bid } from '../models/bid.model.js';

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
    // const userSocketMap = new Map();

    // const newBidPlace = async (bidData) => {
    //   try {
    //     const { itemId, bidderId, incrementBidAmount } = bidData;

    //     const item = await Item.findById(itemId);
    //     if (!item) {
    //       return new ApiResponse(HTTP_STATUS.NOT_FOUND, null, 'Item not found');
    //     }

    //     if (item.sellerId.toString() === bidderId) {
    //       return new ApiResponse(
    //         HTTP_STATUS.BAD_REQUEST,
    //         null,
    //         'Seller cannot bid on own item'
    //       );
    //     }

    //     if (item.minimumBidIncrement > incrementBidAmount) {
    //       return new ApiResponse(
    //         HTTP_STATUS.BAD_REQUEST,
    //         null,
    //         `Increment bid amount must be at least ${item.minimumBidIncrement}`
    //       );
    //     }

    //     const lastBid = await Bid.findOne({ itemId }).sort({ createdAt: -1 });
    //     const lastBidAmount = lastBid
    //       ? lastBid.latestBidAmount
    //       : item.startingBid;
    //     const latestBidAmount = lastBidAmount + incrementBidAmount;

    //     const session = await mongoose.startSession();
    //     session.startTransaction();

    //     try {
    //       const bid = new Bid({
    //         itemId,
    //         bidderId,
    //         incrementBidAmount,
    //         lastBidAmount,
    //         latestBidAmount,
    //       });

    //       const savedBid = await bid.save({ session });

    //       const updatedItem = await Item.findByIdAndUpdate(
    //         itemId,
    //         { lastBidId: savedBid._id, latestBid: latestBidAmount },
    //         { new: true, session }
    //       );

    //       if (!updatedItem) {
    //         throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Item not found');
    //       }

    //       const bidPlacedNotification = new Notification({
    //         userId: bidderId,
    //         type: 'BID_PLACED',
    //         message: `You have placed a bid of $${latestBidAmount} on ${item.title}`,
    //         preview: 'Bid Placed',
    //       });
    //       await bidPlacedNotification.save({ session });

    //       const previousBidders = await Bid.find({ itemId })
    //         .distinct('bidderId')
    //         .where('_id')
    //         .ne(bidderId);

    //       const outbidNotifications = previousBidders
    //         .filter((userId) => userId.toString() !== bidderId.toString())
    //         .map((userId) => ({
    //           userId,
    //           type: 'OUTBID',
    //           message: `You have been outbid on ${item.title}. Current bid is $${latestBidAmount}.`,
    //           preview: 'Outbid',
    //         }));

    //       if (outbidNotifications.length > 0) {
    //         await Notification.insertMany(outbidNotifications, { session });
    //       }

    //       await session.commitTransaction();

    //       // this.io.to(bidderId).emit('new-notification', {
    //       //   data: bidPlacedNotification,
    //       //   message: bidPlacedNotification.message,
    //       // });

    //       // outbidNotifications.forEach((notification) => {
    //       //   this.io.to(notification.userId).emit('new-notification', {
    //       //     data: notification,
    //       //     message: notification.message,
    //       //   });
    //       // });

    //       return new ApiResponse(
    //         HTTP_STATUS.CREATED,
    //         savedBid,
    //         'Bid placed successfully'
    //       );
    //     } catch (error) {
    //       await session.abortTransaction();
    //       return new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
    //     } finally {
    //       session.endSession();
    //     }
    //   } catch (error) {
    //     if (error instanceof ApiError) {
    //       return new ApiResponse(error.statusCode, null, error.message);
    //     }
    //     return new ApiResponse(
    //       HTTP_STATUS.INTERNAL_SERVER_ERROR,
    //       null,
    //       'Failed to place bid'
    //     );
    //   }
    // };

    this.io.on('connection', (socket) => {
      // const userId = socket.handshake.query.userId;
      // if (userId) {
      //   userSocketMap.set(userId, socket.id);
      //   console.log(`User Id: ${userId} Socket ID: ${socket.id}`);
      // }
      console.info(`✅ Authenticated user connected: ${socket.user.email}`);
      this.io.emit('user-connected', { email: socket.user.email });

      socket.on('join-item-room', (itemId) => {
        this.BidSocketHandler.handleJoinItemRoom(socket, itemId);
      });

      socket.on('join-notification-room', () => {
        this.BidSocketHandler.handleJoinNotificationRoom(socket);
      });

      // socket.on('bid-notification', newBidPlace);

      socket.on('leave-item-room', (itemId) => {
        this.BidSocketHandler.handleLeaveItemRoom(socket, itemId);
      });

      socket.on('place-bid', (data) => {
        this.BidSocketHandler.handleBidPlacement(socket, data);
      });

      socket.on('disconnect', () => {
        console.info(`❌ User disconnected: ${socket.user.email}`);
        // for (const [userId, socketId] of userSocketMap.entries()) {
        //   if (socketId === socket.id) {
        //     userSocketMap.delete(userId);
        //     break;
        //   }
        // }
      });
    });
  }
}

export default SocketConnection;
