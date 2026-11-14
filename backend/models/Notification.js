/**
 * Notification Model
 * In-app notifications for matches, claims, dispute updates, and reports.
 */

class Notification {
  constructor({
    id,
    notificationId,
    userId,
    type, // 'match', 'claim', 'dispute', 'report', 'system'
    title,
    message,
    link = '',
    read = false,
    createdAt = new Date().toISOString()
  }) {
    this.id = id || notificationId;
    this.notificationId = notificationId || this.id;
    this.userId = userId;
    this.type = type;
    this.title = title;
    this.message = message;
    this.link = link;
    this.read = Boolean(read);
    this.createdAt = createdAt;
  }
}

module.exports = Notification;
