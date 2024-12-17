import express from 'express';

import UserController from '../controllers/UserController.js';

const router = express.Router();

router.get('/', UserController.getAll);
router.post('/create', UserController.create);
router.get('/find-by-email', UserController.findByEmail);

export const UserRoutes = router;
