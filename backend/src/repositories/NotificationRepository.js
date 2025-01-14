import BaseRepository from './BaseRepository.js';
import { Notification } from '../models/notification.model.js';
import { User } from '../models/user.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import HTTP_STATUS from '../utils/httpStatus.js';

class NotificationRepository extends BaseRepository {
  constructor() {
    super(Notification);
  }

  async createNotification(userId, itemId, type, message, preview) {
    if (!userId) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'User ID is required');
    }

    const userExists = await User.findById(userId);
    if (!userExists) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
    }

    const notification = new Notification({
      userId,
      itemId,
      type,
      message,
      preview,
    });

    await notification.save();
    return notification;
  }

  async getNotificationsForUser(userId) {
    if (!userId) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'User ID is required');
    }

    const notifications = await this.model
      .find({ userId })
      .sort({ createdAt: -1 })
      .select('-userId');
    return notifications;
  }

  async markAllAsRead(userId) {
    try {
      const result = await Notification.updateMany(
        { userId: userId.userId, read: false },
        { $set: { read: true } }
      );

      return new ApiResponse(
        HTTP_STATUS.OK,
        result,
        'All Notifications marked as read successfully'
      );
    } catch (error) {
      return new ApiResponse(HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
    }
  }
}

export default NotificationRepository;
