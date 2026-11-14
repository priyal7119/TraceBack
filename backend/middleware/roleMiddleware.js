/**
 * Role-Based Access Control (RBAC) Middleware
 * Never trusts frontend-supplied roles or client headers.
 * Relies strictly on server-verified req.user.role.
 */

const logger = require('../utils/logger');

/**
 * Require administrator role
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required before verifying administrative permissions.',
    });
  }

  if (req.user.role !== 'admin') {
    logger.warn('Unauthorized administrative access attempt blocked', {
      userId: req.user.id,
      email: req.user.email,
      path: req.originalUrl,
    });
    return res.status(403).json({
      success: false,
      message: 'Forbidden: This resource is restricted to authorized HAMC campus administrators.',
    });
  }

  next();
};

/**
 * Require one of specified roles
 * @param {Array<string>} roles 
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Requires one of [${roles.join(', ')}] permissions.`,
      });
    }

    next();
  };
};

module.exports = {
  requireAdmin,
  requireRole,
};
