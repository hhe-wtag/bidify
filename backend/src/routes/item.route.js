import express from 'express';

import ItemController from '../controllers/ItemController.js';
import { isAuthenticated } from '../middleware/auth.js';
import { upload } from '../middleware/multer.js';

const router = express.Router();

router.get('/all', ItemController.getAll);
router.get('/:slug', ItemController.getBySlug);
router.post(
  '/create',
  isAuthenticated,
  upload.array('images', 5),
  ItemController.create
);
router.patch('/update/:id', isAuthenticated, ItemController.update);
router.delete('/delete/:id', isAuthenticated, ItemController.delete);

export const ItemRoutes = router;
