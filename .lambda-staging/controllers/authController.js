/**
 * Authentication Controller
 */

const authService = require('../services/authService');
const { getCookieOptions, COOKIE_NAME } = require('../utils/jwtHelper');

/**
 * Register
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, department, phone, bio } = req.body;
    const result = await authService.register({ name, email, password, department, phone, bio });

    // Set HTTP-only cookie
    res.cookie(COOKIE_NAME, result.token, getCookieOptions());

    res.status(201).json({
      success: true,
      message: 'Registration successful. Welcome to TraceBack HAMC!',
      user: result.user,
      token: result.token,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);

    // Set HTTP-only cookie
    res.cookie(COOKIE_NAME, result.token, getCookieOptions());

    res.status(200).json({
      success: true,
      message: 'Sign in successful.',
      user: result.user,
      token: result.token,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Logout
 */
const logout = async (req, res) => {
  const cookieOptions = getCookieOptions();
  res.clearCookie(COOKIE_NAME, {
    httpOnly: cookieOptions.httpOnly,
    secure: cookieOptions.secure,
    sameSite: cookieOptions.sameSite,
    path: cookieOptions.path,
  });

  res.status(200).json({
    success: true,
    message: 'Signed out successfully.',
  });
};

/**
 * Current user session check
 */
const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};

/**
 * Forgot password
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }
    const result = await authService.forgotPassword(email);
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Reset token and new password are required.' });
    }
    const result = await authService.resetPassword(token, newPassword);
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
};
