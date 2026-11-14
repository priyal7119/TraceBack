/**
 * Dispute Model
 * Represents a contested ownership dispute over an item.
 */

class Dispute {
  constructor({
    id,
    disputeId,
    itemId,
    itemTitle,
    claimant1 = null,
    claimant2 = null,
    reason,
    evidence = '',
    status = 'open', // 'open', 'investigating', 'resolved', 'closed'
    arbitrationDecision = '',
    assignedAdmin = null,
    submittedBy = '',
    submittedAt = new Date().toISOString(),
    createdAt = null,
    resolvedAt = null,
    lastUpdated = new Date().toISOString()
  }) {
    this.id = id || disputeId;
    this.disputeId = disputeId || this.id;
    this.itemId = itemId;
    this.itemTitle = itemTitle;
    this.claimant1 = claimant1;
    this.claimant2 = claimant2;
    this.reason = reason;
    this.evidence = evidence;
    this.status = status;
    this.arbitrationDecision = arbitrationDecision;
    this.assignedAdmin = assignedAdmin;
    this.submittedBy = submittedBy;
    this.submittedAt = submittedAt;
    this.createdAt = createdAt || submittedAt;
    this.resolvedAt = resolvedAt;
    this.lastUpdated = lastUpdated;
  }
}

module.exports = Dispute;
