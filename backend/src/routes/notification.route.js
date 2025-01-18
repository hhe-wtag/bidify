import express from 'express';

import NotificationController from '../controllers/NotificationController.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

router.get('/', isAuthenticated, NotificationController.getNotifications);
router.put(
  '/:notificationId/mark-read',
  isAuthenticated,
  NotificationController.markAsRead
);

export const NotificationRoutes = router;
