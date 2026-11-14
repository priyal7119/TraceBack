/**
 * In-App Notification Service
 */

const adapter = require('../data/adapter');
const Notification = require('../models/Notification');
const logger = require('../utils/logger');

class NotificationService {
  /**
   * Get all notifications for user
   */
  async getUserNotifications(userId) {
    return adapter.find('notifications', { userId }, { sortBy: 'createdAt', sortOrder: 'desc' });
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId) {
    return adapter.count('notifications', { userId, read: false });
  }

  /**
   * Mark single notification as read
   */
  async markAsRead(notificationId, userId) {
    const notif = await adapter.findById('notifications', { userId, notificationId });
    if (!notif) {
      throw new Error('Notification not found');
    }

    if (notif.userId !== userId) {
      throw new Error('Unauthorized');
    }

    return adapter.update('notifications', { userId, notificationId }, { read: true });
  }

  /**
   * Mark all notifications as read for user
   */
  async markAllAsRead(userId) {
    const list = await adapter.find('notifications', { userId, read: false });
    for (const item of list) {
      const notifId = item.notificationId || item.id;
      await adapter.update('notifications', { userId, notificationId: notifId }, { read: true });
    }
    return { count: list.length };
  }

  /**
   * Create notification
   */
  async createNotification({ userId, type, title, message, link }) {
    const notifId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const notif = new Notification({
      id: notifId,
      notificationId: notifId,
      userId,
      type,
      title,
      message,
      link,
      read: false,
      createdAt: new Date().toISOString()
    });
    return adapter.create('notifications', notif);
  }
}

module.exports = new NotificationService();
