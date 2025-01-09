import BaseRepository from './BaseRepository.js';
import { Notification } from '../models/notification.model.js';
import { User } from '../models/user.model.js';
import ApiError from '../utils/ApiError.js';
import HTTP_STATUS from '../utils/httpStatus.js';

class NotificationRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async createNotification(userId, type, message, preview) {
    const userExists = await User.findById(userId);
    if (!userExists) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
    }

    const notification = new Notification({
      userId,
      type,
      message,
      preview,
    });

    await notification.save();
    return notification;
  }

  async getNotificationsForUser(userId) {
    const notifications = await this.model
      .find({ userId })
      .sort({ createdAt: -1 });
    return notifications;
  }

  async markAsRead(notificationId) {
    const notification = await this.model.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );

    if (!notification) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Notification not found');
    }

    return notification;
  }
}

export default NotificationRepository;
