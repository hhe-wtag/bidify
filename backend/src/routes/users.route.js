import express from 'express';

import usersController from '../controllers/users.controller.js';

const router = express.Router();

router.post('/create', usersController.createUser);

export const UserRoutes = router;
