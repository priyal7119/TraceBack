const jwt = require('jsonwebtoken');

const getJwtSecret = () => {
  return process.env.JWT_SECRET || 'traceback_ves_hamc_default_secret_key_change_in_production';
};

const getExpiresIn = () => {
  return process.env.JWT_EXPIRES_IN || '7d';
};

/**
 * Generate JWT token for user
 * @param {Object} user 
 * @returns {string}
 */
const generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role, // 'user' or 'admin'
    name: user.name,
    department: user.department,
  };

  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: getExpiresIn(),
  });
};

/**
 * Verify JWT token
 * @param {string} token 
 * @returns {Object} decoded payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, getJwtSecret());
};

/**
 * Cookie options for JWT
 * 
 * In cross-origin deployments (e.g. React frontend on localhost:3000 and backend on AWS API Gateway):
 * - Production / Cloud mode requires SameSite=None and Secure=true for browsers to accept
 *   and transmit credentials across different origins.
 * - Local development mode preserves SameSite=Lax and Secure=false for non-HTTPS localhost HTTP.
 */
const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production' || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);
  const sameSiteSetting = process.env.COOKIE_SAME_SITE || (isProduction ? 'none' : 'lax');
  const normalizedSameSite = sameSiteSetting.toLowerCase();
  const secureSetting = process.env.COOKIE_SECURE !== undefined
    ? process.env.COOKIE_SECURE === 'true'
    : (normalizedSameSite === 'none' ? true : isProduction);

  return {
    httpOnly: true,
    secure: secureSetting,
    sameSite: normalizedSameSite,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    path: '/',
  };
};

module.exports = {
  generateToken,
  verifyToken,
  getCookieOptions,
  COOKIE_NAME: process.env.COOKIE_NAME || 'traceback_token',
};
