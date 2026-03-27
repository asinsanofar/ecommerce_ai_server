const { body, param, query, validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

/**
 * Validation Middleware
 * Centralizes all request validation rules using express-validator
 */

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    throw new ApiError(400, 'Validation failed', errorMessages);
  }
  next();
};

// User validation rules
const userValidators = {
  register: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters'),
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Please enter a valid email')
      .normalizeEmail(),
    body('password')
      .trim()
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    handleValidationErrors,
  ],

  login: [
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Please enter a valid email'),
    body('password').trim().notEmpty().withMessage('Password is required'),
    handleValidationErrors,
  ],
};

// Product validation rules
const productValidators = {
  create: [
    body('name').trim().notEmpty().withMessage('Product name is required'),
    body('brand').trim().notEmpty().withMessage('Brand is required'),
    body('category')
      .isIn(['Skin', 'Hair', 'Makeup'])
      .withMessage('Category must be Skin, Hair, or Makeup'),
    body('concern').notEmpty().withMessage('Concern is required'),
    body('price')
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number'),
    body('image').trim().notEmpty().withMessage('Image URL is required'),
    handleValidationErrors,
  ],

  update: [
    param('id').isMongoId().withMessage('Invalid product ID'),
    body('price')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number'),
    body('discount')
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage('Discount must be between 0 and 100'),
    handleValidationErrors,
  ],

  getById: [
    param('id').isMongoId().withMessage('Invalid product ID'),
    handleValidationErrors,
  ],
};

// Cart validation rules
const cartValidators = {
  addItem: [
    body('productId').isMongoId().withMessage('Invalid product ID'),
    body('quantity')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Quantity must be at least 1'),
    handleValidationErrors,
  ],

  updateItem: [
    param('productId').isMongoId().withMessage('Invalid product ID'),
    body('quantity')
      .isInt({ min: 0 })
      .withMessage('Quantity must be 0 or greater'),
    handleValidationErrors,
  ],

  removeItem: [
    param('productId').isMongoId().withMessage('Invalid product ID'),
    handleValidationErrors,
  ],
};

// Query validation for product listing
const queryValidators = {
  productList: [
    query('category')
      .optional()
      .isIn(['Skin', 'Hair', 'Makeup', 'all'])
      .withMessage('Invalid category'),
    query('concern').optional().trim(),
    query('search').optional().trim(),
    query('minPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Min price must be positive'),
    query('maxPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Max price must be positive'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be at least 1'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    handleValidationErrors,
  ],
};

module.exports = {
  userValidators,
  productValidators,
  cartValidators,
  queryValidators,
  handleValidationErrors,
};
