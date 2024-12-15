import express from 'express';

import UserController from '../controllers/UserController.js';

const router = express.Router();

router.post('/create', UserController.create);
router.post('/login', UserController.login);

export const UserRoutes = router;
