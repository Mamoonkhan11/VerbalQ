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

/**
 * Rate limiter for Auth routes (login/register)
 * Limits to 5 attempts per 15 minutes per IP
 */
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip
});

module.exports = {
  aiRateLimit,
  authRateLimit
};