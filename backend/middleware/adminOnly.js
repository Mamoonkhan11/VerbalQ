/**
 * Admin-only middleware
 * Requires authentication and checks if user has admin role
 */
const adminOnly = (req, res, next) => {
  try {
    // Check if user is authenticated (auth middleware should run before this)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    // Check if user has admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    next();
  } catch (error) {
    console.error('Admin-only middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authorization check.'
    });
  }
};

module.exports = adminOnly;