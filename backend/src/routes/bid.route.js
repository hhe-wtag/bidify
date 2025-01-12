import express from 'express';

import BidController from '../controllers/BidController.js';
import NotificationController from '../controllers/NotificationController.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

router.get('/latest-10-bids', isAuthenticated, BidController.getLatest10Bids);
router.post('/place-bid', BidController.placeBid);

export const BidRoutes = router;
