/**
 * Authentication & User Service
 */

const crypto = require('crypto');
const adapter = require('../data/adapter');
const User = require('../models/User');
const { hashPassword, comparePassword } = require('../utils/hashHelper');
const { generateToken } = require('../utils/jwtHelper');
const logger = require('../utils/logger');

class AuthService {
  /**
   * Register a new user
   */
  async register({ name, email, password, department, phone, bio }) {
    const existing = await adapter.findOne('users', { email: email.toLowerCase().trim() });
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const passwordHash = await hashPassword(password);

    const newUser = new User({
      id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: 'user', // Always register as normal user, never allow admin escalation
      department: department || 'HAMC Campus Community',
      phone: phone || '',
      bio: bio || 'Member of Vivekanand Education Society HAMC campus.',
      status: 'active'
    });

    const saved = await adapter.create('users', newUser);
    const token = generateToken(saved);

    logger.info(`New user registered: ${saved.email} (${saved.id})`);
    return {
      user: saved.toPublicJSON ? saved.toPublicJSON() : saved,
      token,
    };
  }

  /**
   * Login user with email & password
   */
  async login(email, password) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await adapter.findOne('users', { email: normalizedEmail });

    if (!user) {
      throw new Error('Invalid email or password.');
    }

    if (user.status === 'suspended') {
      throw new Error('Your account has been suspended. Please contact campus security administration.');
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid email or password.');
    }

    const token = generateToken(user);
    const { passwordHash, resetPasswordToken, resetPasswordExpires, ...safeUser } = user;

    logger.info(`User logged in: ${user.email} (${user.role})`);
    return {
      user: safeUser,
      token,
    };
  }

  /**
   * Initiate forgot password workflow
   * Development workflow: generates a secure reset token without claiming live email delivery.
   */
  async forgotPassword(email) {
    const user = await adapter.findOne('users', { email: email.toLowerCase().trim() });
    if (!user) {
      // Do not disclose whether email exists
      return {
        message: 'If an account exists with this email address, a password reset link has been prepared.',
      };
    }

    // Generate random 32-byte token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    await adapter.update('users', user.id, {
      resetPasswordToken: hashedToken,
      resetPasswordExpires: expires
    });

    const isProduction = process.env.NODE_ENV === 'production';
    logger.info(`Password reset requested for ${user.email}.`);

    return {
      message: 'If an account exists with this email address, a password reset link has been prepared.',
      // devToken is strictly stripped in production environments
      ...(!isProduction && { devToken: rawToken }),
    };
  }

  /**
   * Reset password using token
   */
  async resetPassword(token, newPassword) {
    if (!token || !newPassword) {
      throw new Error('Reset token and new password are required.');
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const now = new Date().toISOString();

    const user = await adapter.findOne('users', {
      resetPasswordToken: hashedToken,
      resetPasswordExpires: (exp) => exp && exp > now
    });

    if (!user) {
      throw new Error('Password reset token is invalid or has expired.');
    }

    const passwordHash = await hashPassword(newPassword);

    await adapter.update('users', user.id, {
      passwordHash,
      resetPasswordToken: null,
      resetPasswordExpires: null,
      updatedAt: new Date().toISOString()
    });

    logger.info(`Password successfully reset for user ${user.email}`);
    return { message: 'Password has been reset successfully. You may now sign in with your new password.' };
  }

  /**
   * Change password for logged-in user
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await adapter.findById('users', userId);
    if (!user) {
      throw new Error('User not found.');
    }

    const isMatch = await comparePassword(currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new Error('Current password is incorrect.');
    }

    const passwordHash = await hashPassword(newPassword);
    await adapter.update('users', userId, { passwordHash });

    logger.info(`Password changed for user ${user.email}`);
    return { message: 'Password updated successfully.' };
  }

  /**
   * Update profile
   */
  async updateProfile(userId, updateData) {
    // Only allow updating safe fields
    const allowed = ['name', 'department', 'phone', 'bio', 'avatar'];
    const filtered = {};

    for (const key of allowed) {
      if (updateData[key] !== undefined) {
        filtered[key] = updateData[key];
      }
    }

    const updated = await adapter.update('users', userId, filtered);
    if (!updated) {
      throw new Error('User not found.');
    }

    const { passwordHash, resetPasswordToken, resetPasswordExpires, ...safeUser } = updated;
    return safeUser;
  }
}

module.exports = new AuthService();
