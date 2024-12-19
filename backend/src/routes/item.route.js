import express from 'express';

import ItemController from '../controllers/ItemController.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

router.post('/create', isAuthenticated, ItemController.create);

export const ItemRoutes = router;
