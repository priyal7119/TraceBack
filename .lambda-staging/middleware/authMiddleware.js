/**
 * Authentication Middleware
 * Validates JWT token from HTTP-only Cookie or Authorization Bearer header.
 * Attaches verified user object to req.user.
 */

const { verifyToken, COOKIE_NAME } = require('../utils/jwtHelper');
const adapter = require('../data/adapter');
const logger = require('../utils/logger');

const authenticate = async (req, res, next) => {
  try {
    let token = null;

    // 1. Check HTTP-only cookie first (preferred secure method)
    if (req.cookies && req.cookies[COOKIE_NAME]) {
      token = req.cookies[COOKIE_NAME];
    }

    // 2. Fallback to Authorization Header Bearer token
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please sign in to access this resource.',
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      logger.warn('Invalid or expired JWT token', { error: err.message });
      return res.status(401).json({
        success: false,
        message: 'Your session has expired or is invalid. Please sign in again.',
      });
    }

    // Verify user still exists in database
    const user = await adapter.findById('users', decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account not found or has been deactivated.',
      });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact the HAMC administration.',
      });
    }

    // Attach verified user (excluding passwordHash)
    const { passwordHash, resetPasswordToken, resetPasswordExpires, ...safeUser } = user;
    req.user = safeUser;
    next();
  } catch (error) {
    logger.error('Authentication middleware error', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication service encountered an unexpected error.',
    });
  }
};

/**
 * Optional authentication: attaches user if token present, but does not block guests
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token = null;
    if (req.cookies && req.cookies[COOKIE_NAME]) {
      token = req.cookies[COOKIE_NAME];
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = verifyToken(token);
        const user = await adapter.findById('users', decoded.id);
        if (user && user.status !== 'suspended') {
          const { passwordHash, ...safeUser } = user;
          req.user = safeUser;
        }
      } catch {
        // Ignore token errors for optional auth
      }
    }
    next();
  } catch (error) {
    next();
  }
};

module.exports = {
  authenticate,
  optionalAuth,
};
