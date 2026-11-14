/**
 * Claim Model
 * Represents a formal item ownership claim submitted by a user for a found item.
 */

class Claim {
  constructor({
    id,
    claimId,
    itemId,
    itemTitle,
    claimantId,
    claimantName,
    claimantEmail,
    claimantPhone,
    proofDetails,
    verificationAnswers = {},
    status = 'pending', // 'pending', 'under_review', 'approved', 'rejected'
    adminNotes = '',
    reviewedBy = null,
    submittedAt = new Date().toISOString(),
    createdAt = null,
    reviewedAt = null,
    updatedAt = new Date().toISOString()
  }) {
    this.id = id || claimId;
    this.claimId = claimId || this.id;
    this.itemId = itemId;
    this.itemTitle = itemTitle;
    this.claimantId = claimantId;
    this.claimantName = claimantName;
    this.claimantEmail = claimantEmail;
    this.claimantPhone = claimantPhone;
    this.proofDetails = proofDetails;
    this.verificationAnswers = verificationAnswers;
    this.status = status;
    this.adminNotes = adminNotes;
    this.reviewedBy = reviewedBy;
    this.submittedAt = submittedAt;
    this.createdAt = createdAt || submittedAt;
    this.reviewedAt = reviewedAt;
    this.updatedAt = updatedAt;
  }
}

module.exports = Claim;
