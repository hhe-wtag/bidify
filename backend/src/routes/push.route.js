import express from 'express';
import webpush from 'web-push';

import { isAuthenticated } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';
import {
  saveSubscription,
  sendPushNotification,
} from '../utils/pushNotification.js';

const router = express.Router();

webpush.setVapidDetails(
  'mailto: afnan.mumu@welldev.io',
  'BDdTbQklov4-VHiMt6DUds3U6SuWSRi8dhzgYBFOrlkJbR3oFE48-3XDR2xkviruCUvsYEqgAa2VMp1AxYxyMlE',
  'Q6NbQq-17Npkl2bm4nYx5I_HjSWJc_3fJYKsLThFCFA'
);

router.post(
  '/subscribe',
  isAuthenticated,
  asyncHandler(async (req, res) => {
    try {
      const { userId, subscription } = req.body;

      if (!subscription || !userId) {
        console.error('Invalid subscription or user ID:', {
          subscription,
          userId,
        });
        return res
          .status(400)
          .json({ message: 'Invalid subscription or user ID' });
      }

      saveSubscription(userId, subscription);
      //   console.log(`Push subscription saved for user: ${userId}`);
      res.status(201).json({ message: 'Subscription saved successfully' });
    } catch (error) {
      console.error('Error saving subscription:', error);
      res.status(500).json({ message: 'Failed to save subscription' });
    }
  })
);

router.post(
  '/notify',
  asyncHandler(async (req, res) => {
    // console.log('Received notification request:', req.body);

    try {
      const { userId, message, title } = req.body;

      const payload = JSON.stringify({
        title: title || 'Notification Title',
        message: message || 'Notification Message',
        //url: '/', // Optional: Specify a URL to open when the notification is clicked
      });
      await sendPushNotification(userId, payload);
      res.status(200).json({ message: 'Notification sent successfully' });
    } catch (error) {
      console.error('Error sending notification:', error);
      res.status(500).json({ message: 'Failed to send notification' });
    }
  })
);

export const PushNotificationRoutes = router;
