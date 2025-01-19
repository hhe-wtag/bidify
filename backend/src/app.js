import cors from 'cors';
import express from 'express';

import passport from './middleware/auth.js';
import globalErrorHandler from './middleware/globalErrorHandler.js';
import { AuthRoutes } from './routes/auth.route.js';
import { BidRoutes } from './routes/bid.route.js';
import { ItemRoutes } from './routes/item.route.js';
import { NotificationRoutes } from './routes/notification.route.js';
import { UserRoutes } from './routes/user.route.js';
import { PushNotificationRoutes } from './routes/push.route.js';

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());

app.use('/uploads', express.static('uploads'));

app.use('/api/auth', AuthRoutes);
app.use('/api/user', UserRoutes);
app.use('/api/item', ItemRoutes);
app.use('/api/bid', BidRoutes);
app.use('/api/notification', NotificationRoutes);
app.use('/api/push', PushNotificationRoutes);

app.use(globalErrorHandler);

export default app;
