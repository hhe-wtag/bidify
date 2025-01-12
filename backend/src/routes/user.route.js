import express from 'express';

import NotificationController from '../controllers/NotificationController.js';
import UserController from '../controllers/UserController.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

router.get('/profile', isAuthenticated, UserController.getCurrentUser);
router.put('/profile/update', isAuthenticated, UserController.updateUser);
router.put(
  '/profile/password-change',
  isAuthenticated,
  UserController.changePassword
);
router.get(
  '/notification',
  isAuthenticated,
  NotificationController.getNotifications
);

export const UserRoutes = router;
