const History = require('../models/History');
const asyncHandler = require('../middleware/asyncHandler');

class HistoryController {
  /**
   * Get user's AI action history
   * GET /api/history/my
   */
  getMyHistory = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 50) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pagination parameters'
      });
    }

    // Get total count for pagination
    const total = await History.countDocuments({ userId: req.user._id });

    // Get history records sorted by latest first
    const history = await History.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      message: 'History retrieved successfully',
      data: {
        history,
        pagination: {
          currentPage: page,
          totalPages,
          totalRecords: total,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });
  });

  /**
   * Delete a single history entry
   * DELETE /api/history/:id
   */
  deleteEntry = asyncHandler(async (req, res) => {
    const historyEntry = await History.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!historyEntry) {
      return res.status(404).json({
        success: false,
        message: 'History entry not found'
      });
    }

    await historyEntry.deleteOne();

    res.json({
      success: true,
      message: 'History entry deleted successfully'
    });
  });

  /**
   * Clear all user history
   * DELETE /api/history/clear
   */
  clearMyHistory = asyncHandler(async (req, res) => {
    await History.deleteMany({ userId: req.user._id });

    res.json({
      success: true,
      message: 'All history cleared successfully'
    });
  });
}

module.exports = new HistoryController();