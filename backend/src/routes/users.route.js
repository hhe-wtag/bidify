import express from 'express';

import usersController from '../controllers/users.controller.js';

const router = express.Router();

router.post('/create', usersController.createUser);

router.post('/login', usersController.loginUser);

export const UserRoutes = router;
