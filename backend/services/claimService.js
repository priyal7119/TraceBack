/**
 * Ownership Claims Service
 */

const adapter = require('../data/adapter');
const Claim = require('../models/Claim');
const notificationService = require('./notificationService');
const logger = require('../utils/logger');

class ClaimService {
  /**
   * Submit an item ownership claim
   */
  async submitClaim(claimData, user) {
    const item = await adapter.findById('reports', claimData.itemId);
    if (!item) {
      throw new Error('Item not found to submit claim against.');
    }

    if (item.type !== 'found') {
      throw new Error('Ownership claims can only be filed against found item reports.');
    }

    const now = new Date().toISOString();
    const claim = new Claim({
      id: `clm_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      itemId: item.id,
      itemTitle: item.title,
      claimantId: user.id,
      claimantName: user.name,
      claimantEmail: user.email,
      claimantPhone: user.phone || claimData.phone || '',
      proofDetails: claimData.proofDetails,
      verificationAnswers: claimData.verificationAnswers || {},
      status: 'pending',
      adminNotes: 'Awaiting custodial inspection and administrative review.',
      submittedAt: now,
      createdAt: now,
    });

    const saved = await adapter.create('claims', claim);

    // Update item status to 'under_review'
    await adapter.update('reports', item.id, { status: 'under_review' });

    // Notify user of claim receipt
    await notificationService.createNotification({
      userId: user.id,
      type: 'claim',
      title: 'Ownership Claim Submitted',
      message: `Your ownership claim for "${item.title}" has been registered and queued for custodial verification.`,
      link: '/user/reports'
    });

    logger.info(`Claim ${saved.id} submitted for item ${item.id} by user ${user.id}`);
    return saved;
  }

  /**
   * Get claim by ID
   */
  async getClaimById(claimId) {
    return adapter.findById('claims', claimId);
  }

  /**
   * Get claims filed by the logged-in user
   */
  async getUserClaims(userId) {
    return adapter.find('claims', { claimantId: userId }, { sortBy: 'submittedAt', sortOrder: 'desc' });
  }

  /**
   * Get all claims (Admin only)
   */
  async getAllClaims(filters = {}) {
    const query = {};
    if (filters.status && filters.status !== 'all') {
      query.status = filters.status;
    }
    return adapter.find('claims', query, { sortBy: 'submittedAt', sortOrder: 'desc' });
  }

  /**
   * Admin review of a claim (Approve or Reject)
   */
  async reviewClaim(claimId, { status, adminNotes }, adminUser) {
    if (!['approved', 'rejected', 'under_review'].includes(status)) {
      throw new Error('Invalid claim status. Must be approved, rejected, or under_review.');
    }

    const claim = await adapter.findById('claims', claimId);
    if (!claim) {
      throw new Error('Claim not found');
    }

    const updatedClaim = await adapter.update('claims', claimId, {
      status,
      adminNotes: adminNotes || claim.adminNotes,
      reviewedBy: adminUser.name,
      reviewedAt: new Date().toISOString()
    });

    // If approved, update item status to 'claimed' or 'resolved'
    if (status === 'approved') {
      await adapter.update('reports', claim.itemId, { status: 'claimed' });
    } else if (status === 'rejected') {
      // Revert item back to 'active'
      await adapter.update('reports', claim.itemId, { status: 'active' });
    }

    // Notify claimant of the decision
    await notificationService.createNotification({
      userId: claim.claimantId,
      type: 'claim',
      title: `Ownership Claim ${status === 'approved' ? 'Approved' : 'Updated'}`,
      message: status === 'approved'
        ? `Your claim for "${claim.itemTitle}" has been APPROVED. Please visit the custodial desk to collect your item.`
        : `Your claim for "${claim.itemTitle}" status was updated to: ${status}. Notes: ${adminNotes || 'None'}`,
      link: '/user/reports'
    });

    logger.info(`Claim ${claimId} reviewed by admin ${adminUser.id} -> Status: ${status}`);
    return updatedClaim;
  }
}

module.exports = new ClaimService();
