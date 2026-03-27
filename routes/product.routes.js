const express = require('express');
const router = express.Router();

const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getConcerns,
  getFeaturedProducts,
} = require('../controllers/product.controller');

const { verifyJWT, requireAdmin } = require('../middleware/auth.middleware');
const {
  productValidators,
  queryValidators,
} = require('../middleware/validator.middleware');

/**
 * Product Routes
 * Base path: /api/products
 */

// Public routes
router.get('/', queryValidators.productList, getProducts);
router.get('/concerns', getConcerns);
router.get('/featured', getFeaturedProducts);
router.get('/category/:category', getProductsByCategory);
router.get('/:id', productValidators.getById, getProductById);

// Protected admin routes
router.post('/', verifyJWT, requireAdmin, productValidators.create, createProduct);
router.put('/:id', verifyJWT, requireAdmin, productValidators.update, updateProduct);
router.delete('/:id', verifyJWT, requireAdmin, deleteProduct);

module.exports = router;
