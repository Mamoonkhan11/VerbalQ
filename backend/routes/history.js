const express = require('express');
const router = express.Router();
const historyController = require('../controllers/HistoryController');
const auth = require('../middleware/auth');

/**
 * @route   GET /api/history/my
 * @desc    Get user's AI action history
 * @access  Private (requires authentication)
 * @query   page - Page number (default: 1)
 * @query   limit - Items per page (default: 10)
 */
router.get('/my', auth, historyController.getMyHistory);

/**
 * @route   DELETE /api/history/clear
 * @desc    Clear all user history
 * @access  Private
 */
router.delete('/clear', auth, historyController.clearMyHistory);

/**
 * @route   DELETE /api/history/:id
 * @desc    Delete a specific history entry
 * @access  Private
 */
router.delete('/:id', auth, historyController.deleteEntry);

module.exports = router;