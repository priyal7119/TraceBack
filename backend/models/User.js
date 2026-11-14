/**
 * User Model & Schema
 * Represents campus members (students, faculty, staff) and administrators.
 */

class User {
  constructor({
    id,
    userId,
    name,
    email,
    passwordHash,
    role = 'user', // 'user' or 'admin'
    department = 'HAMC Campus Community',
    phone = '',
    avatar = '',
    bio = '',
    status = 'active', // 'active', 'suspended', 'flagged'
    resetPasswordToken = null,
    resetPasswordExpires = null,
    createdAt = new Date().toISOString(),
    updatedAt = new Date().toISOString()
  }) {
    this.id = id || userId;
    this.userId = userId || this.id;
    this.name = name;
    this.email = email.toLowerCase().trim();
    this.passwordHash = passwordHash;
    this.role = role === 'admin' ? 'admin' : 'user';
    this.department = department;
    this.phone = phone;
    this.avatar = avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80';
    this.bio = bio;
    this.status = status;
    this.resetPasswordToken = resetPasswordToken;
    this.resetPasswordExpires = resetPasswordExpires;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // Remove passwordHash before returning to client
  toPublicJSON() {
    const { passwordHash, resetPasswordToken, resetPasswordExpires, ...safe } = this;
    return safe;
  }
}

module.exports = User;
