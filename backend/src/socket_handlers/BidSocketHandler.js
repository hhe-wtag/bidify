import { schedule } from 'node-cron';

import BaseSocketHandler from './BaseSocketHandler.js';
import BidSocketRepository from '../repositories/BidSocketRepository.js';
import HTTP_STATUS from '../utils/httpStatus.js';
import { EVENTS } from '../utils/socketConstants.js';

class BidSocketHandler extends BaseSocketHandler {
  constructor(io, userSocketMap) {
    super(io, userSocketMap);
    this.bidSocketRepository = new BidSocketRepository();
    this.initializeAuctionEndCheck();
  }

  handleJoinItemRoom = (socket, itemId) => {
    socket.join(`item-${itemId}`);

    this.emitToRoom(`item-${itemId}`, EVENTS.USER_JOINED_ROOM, {
      event: EVENTS.USER_JOINED_ROOM,
      data: { user: socket.user, room: `item-${itemId}` },
      message: `User-${socket.id} connected to item room ${itemId}`,
    });
  };

  handleLeaveItemRoom = (socket, itemId) => {
    socket.leave(`item-${itemId}`);

    this.broadcastToRoom(socket, `item-${itemId}`, EVENTS.USER_LEFT_ROOM, {
      event: EVENTS.USER_LEFT_ROOM,
      data: { user: socket.user, room: `item-${itemId}` },
      message: `User-${socket.id} left the room ${itemId}`,
    });
  };

  handleBidPlacement = async (socket, bidData) => {
    const result = await this.bidSocketRepository.placeBid(bidData);

    if (result.statusCode === HTTP_STATUS.CREATED) {
      const {
        savedBid,
        bidPlacedSellerNotification,
        bidPlacedNotification,
        outbidNotifications,
      } = result.data;

      this.emitToRoom(`item-${bidData.itemId}`, EVENTS.NEW_BID_PLACED, {
        event: EVENTS.NEW_BID_PLACED,
        data: { bid: savedBid },
        message: `New bid of $${bidData.incrementBidAmount} placed by userId: ${bidData.bidderId}`,
      });

      if (
        this.userSocketMap.has(bidPlacedSellerNotification.userId.toString())
      ) {
        const socketId = this.userSocketMap.get(
          bidPlacedSellerNotification.userId.toString()
        );
        this.emitToUser(socketId, EVENTS.NOTIFICATION_NEW_BID_PLACE, {
          event: EVENTS.NOTIFICATION_NEW_BID_PLACE,
          data: { notification: bidPlacedSellerNotification },
          message: `Bid placed successfully by userId: ${bidData.bidderId} on itemId: ${bidData.itemId}`,
        });
      }

      this.emitToUser(socket.id, EVENTS.NOTIFICATION_NEW_BID_PLACE, {
        event: EVENTS.NOTIFICATION_NEW_BID_PLACE,
        data: { notification: bidPlacedNotification },
        message: `Bid placed successfully by userId: ${bidData.bidderId} on itemId: ${bidData.itemId}`,
      });

      if (outbidNotifications.length > 0) {
        outbidNotifications.forEach((notification) => {
          const userIdString = notification.userId.toString();
          if (!this.userSocketMap.has(userIdString)) {
            return;
          }

          const socketId = this.userSocketMap.get(userIdString);
          this.emitToUser(socketId, EVENTS.NOTIFICATION_OUT_BID_PLACE, {
            event: EVENTS.NOTIFICATION_OUT_BID_PLACE,
            data: { notification },
            message: `You have been outbid by userId: ${notification.userId} on itemId: ${notification.itemId}.`,
          });
        });
      }
    }
  };

  initializeAuctionEndCheck() {
    // 0 0 * * * Run at midnight (00:00) every day
    // */10 * * * * * * Every 10 seconds (For TEST)
    schedule('*/10 * * * * * *', async () => {
      await this.itemAuctionTimeEndSync();
    });
  }

  itemAuctionTimeEndSync = async () => {
    const result =
      await this.bidSocketRepository.itemAuctionTimeEndStatusUpdate();

    // console.log(result);
    if (result.statusCode === HTTP_STATUS.OK) {
      const { processedItems, notify } = result.data;
      const [{ winnerNotify }, { auctionEndNotify }] = notify;

      const userIdString = winnerNotify.userId.toString();
      if (this.userSocketMap.has(userIdString)) {
        const socketId = this.userSocketMap.get(userIdString);
        this.emitToUser(socketId, EVENTS.NOTIFICATION_WINNER, {
          event: EVENTS.NOTIFICATION_WINNER,
          data: { notification: winnerNotify },
          message: `You have won the auction`,
        });
      }

      if (auctionEndNotify.length > 0) {
        auctionEndNotify.forEach((notification) => {
          const userIdString = notification.userId.toString();
          if (!this.userSocketMap.has(userIdString)) {
            return;
          }

          const socketId = this.userSocketMap.get(userIdString);
          this.emitToUser(socketId, EVENTS.NOTIFICATION_AUCTION_END, {
            event: EVENTS.NOTIFICATION_AUCTION_END,
            data: { notification },
            message: `Auction end notification`,
          });
        });
      }
    }
    // Emit updates for each ended auction
    // result.processedItems.forEach((auction) => {
    //! TODO
    // this.emitToRoom(`item-${auction._id}`, EVENTS.AUCTION_ENDED, {
    //   event: EVENTS.AUCTION_ENDED,
    //   data: { auction },
    //   message: `Auction ended for item ${auction.title}`,
    // });
    // });
  };
}

export default BidSocketHandler;
