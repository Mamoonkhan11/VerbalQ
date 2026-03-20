const GuestUsage = require('../models/GuestUsage');

/**
 * Guest Authentication Middleware
 * 
 * Allows unauthenticated users to access certain endpoints with usage limits.
 * Tracks guest usage and enforces the 3-use limit.
 * 
 * Usage:
 * - Add after auth middleware: router.post('/grammar', auth, guestAuth, controller)
 * - Or use alone for public endpoints: router.post('/grammar', guestAuth, controller)
 */
const guestAuth = async (req, res, next) => {
  try {
    // If user is authenticated, skip guest tracking
    if (req.user) {
      return next();
    }

    // Get guest identifier (prefer fingerprint from header, fallback to IP)
    const identifier = req.headers['x-device-fingerprint'] || req.ip || 'unknown';
    
    if (!identifier || identifier === 'unknown') {
      return res.status(400).json({
        success: false,
        message: 'Unable to identify device. Please enable cookies or sign in.'
      });
    }

    // Find existing guest record
    let guest = await GuestUsage.findOne({ identifier });
    
    // Create new guest record if doesn't exist
    if (!guest) {
      guest = await GuestUsage.create({
        identifier,
        usageCount: 0,
        usageHistory: []
      });
    }

    // Check if guest has reached the limit
    if (guest.usageCount >= 5) {
      return res.status(403).json({
        success: false,
        message: 'GUEST_LIMIT_REACHED',
        data: {
          usageCount: guest.usageCount,
          limit: 5,
          requiresAuth: true,
          hint: 'Please create an account or sign in to continue using our services'
        }
      });
    }

    // Attach guest info to request for controller to use
    req.guest = {
      identifier: guest.identifier,
      usageCount: guest.usageCount,
      guestId: guest._id.toString(),
      hasReachedLimit: guest.hasReachedLimit()
    };

    next();
  } catch (error) {
    console.error('Guest authentication error:', error);
    
    // Don't block access if there's a database error - fail open
    // This ensures service availability even if tracking fails
    console.warn('Guest auth failed open - allowing access without tracking');
    req.guest = {
      identifier: 'error-fallback',
      usageCount: 0,
      guestId: null,
      hasReachedLimit: false
    };
    
    next();
  }
};

/**
 * Helper function to increment guest usage after successful service use
 * Call this in your controller after successfully completing the service
 */
const incrementGuestUsage = async (req, serviceType) => {
  try {
    if (req.guest && req.guest.guestId) {
      await GuestUsage.findByIdAndUpdate(req.guest.guestId, {
        $inc: { usageCount: 1 },
        $push: {
          usageHistory: {
            serviceType,
            timestamp: new Date()
          }
        }
      });
    }
  } catch (error) {
    console.error('Failed to increment guest usage:', error);
    // Don't throw - failure is acceptable
  }
};

module.exports = {
  guestAuth,
  incrementGuestUsage
};
