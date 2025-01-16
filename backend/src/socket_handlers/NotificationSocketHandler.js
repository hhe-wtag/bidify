import BaseSocketHandler from './BaseSocketHandler.js';
import NotificationRepository from '../repositories/NotificationRepository.js';
import HTTP_STATUS from '../utils/httpStatus.js';
import { EVENTS } from '../utils/socketConstants.js';

class NotificationSocketHandler extends BaseSocketHandler {
  static handleAuctionNotifications(winnerNotify, auctionEndNotify) {
    throw new Error('Method not implemented.');
  }
  constructor(io, userSocketMap) {
    super(io, userSocketMap);
    this.notificationRepository = new NotificationRepository();
    this.userSocketMap = userSocketMap;
  }

  async handleMarkAllAsRead(socket, userId) {
    const result = await this.notificationRepository.markAllAsRead(userId);
    if (result.statusCode === HTTP_STATUS.CREATED) {
      this.emitToUser(socket.user._id, 'marked-all-read', {
        message: 'Notification marked all as read',
      });
    }
  }

  // async handleAuctionNotifications(winnerNotify, auctionEndNotify) {
  //   const userIdString = winnerNotify.userId.toString();
  //   console.log(userIdString);

  //   console.log(
  //     'UserSocketMap in handleAuctionNotifications:',
  //     this.userSocketMap
  //   );
  //   if (this.userSocketMap.has(userIdString)) {
  //     console.log('done');
  //   }
  // if (!this.userSocketMap) {
  //   console.error('userSocketMap is undefined');
  //   // return;
  // }
  // if (this.userSocketMap.has(userIdString)) {
  //   const socketId = this.userSocketMap.get(userIdString);
  //   this.emitToUser(socketId, EVENTS.NOTIFICATION_WINNER, {
  //     event: EVENTS.NOTIFICATION_WINNER,
  //     data: { notification: winnerNotify },
  //     message: `You have won the auction`,
  //   });
  //   console.log('winner');
  // }

  // if (auctionEndNotify.length > 0) {
  //   auctionEndNotify.forEach((notification) => {
  //     const userIdString = notification.userId.toString();
  //     if (!this.userSocketMap.has(userIdString)) {
  //       return;
  //     }

  //     const socketId = this.userSocketMap.get(userIdString);
  //     this.emitToUser(socketId, EVENTS.NOTIFICATION_AUCTION_END, {
  //       event: EVENTS.NOTIFICATION_AUCTION_END,
  //       data: { notification },
  //       message: `Auction end notification`,
  //     });
  //   });
  // }
  // }
}

export default NotificationSocketHandler;
