const express = require('express');
const router = express.Router();

const {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
  getAllUsers,
  deleteUser,
} = require('../controllers/user.controller');

const { verifyJWT, requireAdmin } = require('../middleware/auth.middleware');
const { userValidators } = require('../middleware/validator.middleware');

/**
 * User Routes
 * Base path: /api/users
 */

// Public routes
router.post('/register', userValidators.register, registerUser);
router.post('/login', userValidators.login, loginUser);

// Protected routes (require authentication)
router.post('/logout', verifyJWT, logoutUser);
router.get('/profile', verifyJWT, getUserProfile);
router.put('/profile', verifyJWT, updateUserProfile);
router.put('/change-password', verifyJWT, changePassword);

// Admin routes
router.get('/', verifyJWT, requireAdmin, getAllUsers);
router.delete('/:id', verifyJWT, requireAdmin, deleteUser);

module.exports = router;
