import express from 'express';

import BidController from '../controllers/BidController.js';

const router = express.Router();

router.post('/place-bid', BidController.placeBid);

export const BidRoutes = router;
