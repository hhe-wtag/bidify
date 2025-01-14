import BaseSocketHandler from './BaseSocketHandler.js';
import NotificationRepository from '../repositories/NotificationRepository.js';
import HTTP_STATUS from '../utils/httpStatus.js';

class NotificationSocketHandler extends BaseSocketHandler {
  constructor(io) {
    super(io);
    this.notificationRepository = new NotificationRepository();
  }

  async handleMarkAllAsRead(socket, userId) {
    const result = await this.notificationRepository.markAllAsRead(userId);
    if (result.statusCode === HTTP_STATUS.CREATED) {
      this.emitToUser(socket.user._id, 'marked-all-read', {
        message: 'Notification marked all as read',
      });
    }
  }
}

export default NotificationSocketHandler;
