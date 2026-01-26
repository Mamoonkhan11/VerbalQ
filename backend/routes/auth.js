const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController');
const auth = require('../middleware/auth');
const { validateRegistration, validateLogin } = require('../middleware/validation');
const { authRateLimit } = require('../middleware/rateLimit');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', authRateLimit, validateRegistration, authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', authRateLimit, validateLogin, authController.login);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset token
 * @access  Public
 */
router.post('/forgot-password', authRateLimit, authController.forgotPassword);

/**
 * @route   POST /api/auth/reset-password/:token
 * @desc    Reset password using token
 * @access  Public
 */
router.post('/reset-password/:token', authRateLimit, authController.resetPassword);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private (requires authentication)
 */
router.get('/me', auth, authController.getProfile);

module.exports = router;