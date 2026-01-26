const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/FeedbackController');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

/**
 * @route   POST /api/feedback
 * @desc    Submit feedback
 * @access  Public
 */
router.post('/', feedbackController.submitFeedback);

/**
 * @route   GET /api/feedback
 * @desc    Get all feedback
 * @access  Private (Admin only)
 */
router.get('/', auth, adminOnly, feedbackController.getAllFeedback);

module.exports = router;
