const User = require('../models/User');
const History = require('../models/History');
const asyncHandler = require('../middleware/asyncHandler');

class AdminController {
  /**
   * Get admin statistics
   * GET /api/admin/stats
   */
  getStats = asyncHandler(async (req, res) => {
    // Get total users count
    const totalUsers = await User.countDocuments();

    // Get total requests count (history records)
    const totalRequests = await History.countDocuments();

    // Get active users (users who have made requests in the last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeUsers = await History.distinct('userId', {
      createdAt: { $gte: thirtyDaysAgo }
    }).then(userIds => userIds.length);

    // Get requests by type
    const requestsByType = await History.aggregate([
      {
        $group: {
          _id: '$actionType',
          count: { $sum: 1 }
        }
      }
    ]);

    // Format requests by type
    const typeStats = {};
    requestsByType.forEach(item => {
      typeStats[item._id] = item.count;
    });

    res.json({
      success: true,
      message: 'Statistics retrieved successfully',
      data: {
        totalUsers,
        activeUsers,
        totalRequests,
        requestsByType: typeStats
      }
    });
  });

  /**
   * Get all users
   * GET /api/admin/users
   */
  getUsers = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pagination parameters'
      });
    }

    // Get total count for pagination
    const total = await User.countDocuments();

    // Get users sorted by creation date (newest first)
    const users = await User.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-password -__v');

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      message: 'Users retrieved successfully',
      data: {
        users,
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
   * Block/unblock user
   * PUT /api/admin/block/:userId
   */
  blockUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from blocking themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot block yourself'
      });
    }

    // Toggle block status
    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`,
      data: {
        userId: user._id,
        isBlocked: user.isBlocked
      }
    });
  });
}

module.exports = new AdminController();