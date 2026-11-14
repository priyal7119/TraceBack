/**
 * Rate Limiting Middleware
 * Protects authentication endpoints against automated brute-force attacks.
 */

const rateLimit = require('express-rate-limit');

// Robust keyGenerator for both standard Express and AWS Lambda / API Gateway environments
const getClientIp = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip || '127.0.0.1';
};

// Strict limiter for authentication login/registration
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 requests per windowMs
  standardHeaders: true, // Return standard `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: getClientIp,
  validate: { ip: false, xForwardedForHeader: false },
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.',
  },
});

// General API limiter
const apiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 300, // Limit each IP to 300 requests per 5 minutes
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getClientIp,
  validate: { ip: false, xForwardedForHeader: false },
  message: {
    success: false,
    message: 'API rate limit exceeded. Please slow down your requests.',
  },
});

module.exports = {
  authLimiter,
  apiLimiter,
};
