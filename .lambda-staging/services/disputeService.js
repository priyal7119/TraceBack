/**
 * Ownership Disputes Service
 */

const adapter = require('../data/adapter');
const Dispute = require('../models/Dispute');
const notificationService = require('./notificationService');
const logger = require('../utils/logger');

class DisputeService {
  /**
   * Submit an ownership dispute
   */
  async submitDispute(disputeData, user) {
    const item = await adapter.findById('reports', disputeData.itemId);
    if (!item) {
      throw new Error('Item not found');
    }

    const now = new Date().toISOString();
    const dispute = new Dispute({
      id: `dsp_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      itemId: item.id,
      itemTitle: item.title,
      claimant1: { id: user.id, name: user.name, email: user.email },
      claimant2: disputeData.contestingClaimant || null,
      reason: disputeData.reason,
      evidence: disputeData.evidence || '',
      status: 'open',
      submittedBy: user.id,
      submittedAt: now,
      createdAt: now,
    });

    const saved = await adapter.create('disputes', dispute);

    // Notify user
    await notificationService.createNotification({
      userId: user.id,
      type: 'dispute',
      title: 'Dispute Case Opened',
      message: `Your dispute concerning "${item.title}" has been registered for administrative arbitration.`,
      link: '/user/reports'
    });

    logger.info(`Dispute ${saved.id} opened for item ${item.id} by user ${user.id}`);
    return saved;
  }

  /**
   * Get dispute by ID
   */
  async getDisputeById(disputeId) {
    return adapter.findById('disputes', disputeId);
  }

  /**
   * Get all disputes (Admin only)
   */
  async getAllDisputes(filters = {}) {
    const query = {};
    if (filters.status && filters.status !== 'all') {
      query.status = filters.status;
    }
    return adapter.find('disputes', query, { sortBy: 'submittedAt', sortOrder: 'desc' });
  }

  /**
   * Get disputes involving a specific user (isolated user-specific query)
   */
  async getUserDisputes(userId, filters = {}) {
    const isUserInvolved = (val, item) => {
      return (
        item.submittedBy === userId ||
        (item.claimant1 && item.claimant1.id === userId) ||
        (item.claimant2 && (item.claimant2.id === userId || item.claimant2 === userId)) ||
        item.userId === userId ||
        item.claimantId === userId
      );
    };

    const query = {
      participantUserId: userId,
      submittedBy: isUserInvolved,
    };

    if (filters.status && filters.status !== 'all') {
      query.status = filters.status;
    }

    return adapter.find('disputes', query, { sortBy: 'submittedAt', sortOrder: 'desc' });
  }

  /**
   * Admin resolution of a dispute
   */
  async resolveDispute(disputeId, { decision, status = 'resolved' }, adminUser) {
    const dispute = await adapter.findById('disputes', disputeId);
    if (!dispute) {
      throw new Error('Dispute not found');
    }

    const updated = await adapter.update('disputes', disputeId, {
      status,
      arbitrationDecision: decision,
      assignedAdmin: adminUser.name,
      resolvedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    });

    // Notify claimants
    if (dispute.claimant1 && dispute.claimant1.id) {
      await notificationService.createNotification({
        userId: dispute.claimant1.id,
        type: 'dispute',
        title: 'Dispute Decision Issued',
        message: `An arbitration decision has been issued regarding "${dispute.itemTitle}": ${decision}`,
        link: '/user/reports'
      });
    }

    logger.info(`Dispute ${disputeId} resolved by admin ${adminUser.id}`);
    return updated;
  }
}

module.exports = new DisputeService();
