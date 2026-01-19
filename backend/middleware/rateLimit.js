const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for AI routes
 * Limits to 20 requests per minute per user
 */
const aiRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // Limit each user to 20 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests. You can make up to 20 AI requests per minute. Please try again later.',
    retryAfter: '60 seconds'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Use user ID from JWT token for rate limiting
  keyGenerator: (req) => {
    return req.user ? req.user._id.toString() : req.ip;
  },
  // Skip rate limiting if user is admin
  skip: (req) => {
    return req.user && req.user.role === 'admin';
  }
});

module.exports = {
  aiRateLimit
};