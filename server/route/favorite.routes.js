import { Router } from 'express';
import {
  addToFavoritesController,
  removeFromFavoritesController,
  getFavoritesController
} from '../controllers/favorite.controller.js';
import auth from '../middleware/auth.js';

const favoriteRouter = Router();

// 👉 Add a product to favorites
favoriteRouter.post('/favorites/:productId', auth, addToFavoritesController);

// 👉 Remove a product from favorites
favoriteRouter.delete('/favorites/:productId', auth, removeFromFavoritesController);

// 👉 Get all favorite products
favoriteRouter.get('/favorites', auth, getFavoritesController);

export default favoriteRouter;
