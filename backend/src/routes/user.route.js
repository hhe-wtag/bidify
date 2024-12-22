import express from 'express';

import UserController from '../controllers/UserController.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

router.get('/profile', isAuthenticated, UserController.getCurrentUser);
router.put('/profile/update', isAuthenticated, UserController.updateUser);

export const UserRoutes = router;
