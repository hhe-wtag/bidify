import express from 'express';

import { isAuthenticated } from '../middleware/auth.js';
import PushNotificationService from '../services/PushNotificationService.js';
import asyncHandler from '../utils/asyncHandler.js';
import HTTP_STATUS from '../utils/httpStatus.js';

const router = express.Router();

router.post(
  '/subscribe',
  isAuthenticated,
  asyncHandler(async (req, res) => {
    await PushNotificationService.addSubscription(req.user._id, req.body);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      message: 'Subscription saved!',
    });
  })
);

router.post(
  '/send-notification',
  isAuthenticated,
  asyncHandler(async (req, res) => {
    await PushNotificationService.sendNotification(req.user._id, req.body);

    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      message: 'Notification sent!',
    });
  })
);

export const pushNotificationRoutes = router;
