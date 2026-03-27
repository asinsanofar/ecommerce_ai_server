const express = require('express');
const router = express.Router();

const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartSummary,
} = require('../controllers/cart.controller');

const { verifyJWT } = require('../middleware/auth.middleware');
const { cartValidators } = require('../middleware/validator.middleware');

/**
 * Cart Routes
 * Base path: /api/cart
 * All routes require authentication
 */

// Apply authentication middleware to all routes
router.use(verifyJWT);

// Cart operations
router.get('/', getCart);
router.get('/summary', getCartSummary);
router.delete('/', clearCart);

// Cart item operations
router.post('/items', cartValidators.addItem, addToCart);
router.put('/items/:productId', cartValidators.updateItem, updateCartItem);
router.delete('/items/:productId', cartValidators.removeItem, removeFromCart);

module.exports = router;
