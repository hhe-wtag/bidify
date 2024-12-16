import express from 'express';

import UserController from '../controllers/UserController.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.get('/me', isAuthenticated, UserController.getCurrentUser);

export const UserRoutes = router;
