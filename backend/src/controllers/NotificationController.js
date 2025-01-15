import NotificationRepository from '../repositories/NotificationRepository.js';
import asyncHandler from '../utils/asyncHandler.js';
import HTTP_STATUS from '../utils/httpStatus.js';

class NotificationController {
  constructor() {
    this.notificationRepository = new NotificationRepository();
  }

  createNotification = asyncHandler(async (req, res) => {
    const { userId, type, message, preview } = req.body;

    const notification = await this.notificationRepository.createNotification(
      userId,
      type,
      message,
      preview
    );

    res.status(HTTP_STATUS.CREATED).json({
      status: 'success',
      data: notification,
    });
  });

  getNotifications = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const notifications =
      await this.notificationRepository.getNotificationsForUser(userId);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: notifications,
    });
  });

  markAsRead = asyncHandler(async (req, res) => {
    const { notificationId } = req.params;

    const updatedNotification =
      await this.notificationRepository.markAllAsRead(notificationId);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      data: updatedNotification,
    });
  });
}

export default new NotificationController();
