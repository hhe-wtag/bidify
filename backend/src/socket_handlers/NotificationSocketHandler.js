import BaseSocketHandler from './BaseSocketHandler.js';
import BidSocketRepository from '../repositories/BidSocketRepository.js';
import NotificationRepository from '../repositories/NotificationRepository.js';
import HTTP_STATUS from '../utils/httpStatus.js';

class NotificationSocketHandler extends BaseSocketHandler {
  constructor(io) {
    super(io);
    this.notificationRepository = new NotificationRepository();
    this.bidRepository = new BidSocketRepository();
  }

  async handleBidNotification(socket, bidData) {
    try {
      const bidResponse = await this.bidRepository.placeBid(bidData);

      if (bidResponse.statusCode !== 201) {
        socket.emit('bid-error', {
          message: bidResponse.message,
        });
        return;
      }

      const { itemId, bidderId, latestBidAmount } = bidResponse.data;

      this.io.to(`item:${itemId}`).emit('bid-updated', {
        itemId,
        latestBid: latestBidAmount,
        bidder: socket.user.email,
      });

      // Create and emit notification for the bidder
      const bidderNotification =
        await this.notificationRepository.createNotification(
          bidderId,
          'BID_PLACED',
          `Your bid of $${latestBidAmount} was placed successfully`,
          'Bid Placed'
        );

      this.emitToUser(bidderId, 'new-notification', {
        data: bidderNotification,
        message: bidderNotification.message,
      });

      // Notify previous bidders
      const previousBidders = await this.bidRepository.model
        .find({ itemId })
        .distinct('bidderId')
        .where('_id')
        .ne(bidderId);

      for (const previousBidderId of previousBidders) {
        const outbidNotification =
          await this.notificationRepository.createNotification(
            previousBidderId,
            'OUTBID',
            `You have been outbid. Current bid is $${latestBidAmount}`,
            'Outbid Alert'
          );

        this.emitToUser(previousBidderId, 'new-notification', {
          data: outbidNotification,
          message: outbidNotification.message,
        });
      }
    } catch (error) {
      console.error('Error handling bid notification:', error);
      socket.emit('bid-error', {
        message: error.message || 'Failed to process bid',
      });
    }
  }

  async handleGetUserNotifications(socket, userId) {
    try {
      const notifications =
        await this.notificationRepository.getNotificationsForUser(userId);

      this.emitToUser(userId, 'user-notifications', {
        data: notifications,
        message: 'Notifications fetched successfully',
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      this.emitToUser(userId, 'notification-error', {
        message: 'Failed to fetch notifications',
      });
    }
  }

  async handleMarkAsRead(socket, notificationId) {
    try {
      const updatedNotification =
        await this.notificationRepository.markAsRead(notificationId);

      this.emitToUser(socket.user._id, 'notification-updated', {
        data: updatedNotification,
        message: 'Notification marked as read',
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      socket.emit('notification-error', {
        message: 'Failed to mark notification as read',
      });
    }
  }
}

export default BidSocketHandler;
