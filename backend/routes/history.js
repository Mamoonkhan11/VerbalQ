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

module.exports = router;