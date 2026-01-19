const express = require('express');
const router = express.Router();
const adminController = require('../controllers/AdminController');
const adminSettingsController = require('../controllers/AdminSettingsController');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

/**
 * Admin statistics routes
 * @route   GET /api/admin/stats
 * @desc    Get admin dashboard statistics
 * @access  Private (admin only)
 */
router.get('/stats', auth, adminOnly, adminController.getStats);

/**
 * User management routes
 * @route   GET /api/admin/users
 * @desc    Get all users with pagination
 * @access  Private (admin only)
 * @query   page - Page number (default: 1)
 * @query   limit - Items per page (default: 20)
 */
router.get('/users', auth, adminOnly, adminController.getUsers);

/**
 * @route   PUT /api/admin/block/:userId
 * @desc    Block/unblock a user
 * @access  Private (admin only)
 */
router.put('/block/:userId', auth, adminOnly, adminController.blockUser);

/**
 * Application settings routes
 * @route   GET /api/admin/settings
 * @desc    Get application settings
 * @access  Private (admin only)
 */
router.get('/settings', auth, adminOnly, adminSettingsController.getSettings);

/**
 * @route   PUT /api/admin/settings
 * @desc    Update application settings
 * @access  Private (admin only)
 */
router.put('/settings', auth, adminOnly, adminSettingsController.updateSettings);

module.exports = router;