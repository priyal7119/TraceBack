/**
 * Match Model
 * Represents an AI-generated match suggestion between a Lost Report and a Found Report.
 * Note: A match suggestion NEVER automatically confirms ownership.
 */

class Match {
  constructor({
    id,
    matchId,
    lostItemId,
    foundItemId,
    lostUserId,
    foundUserId,
    lostItem = null,
    foundItem = null,
    overallScore, // 0 - 100 percentage
    confidence = 'Medium', // 'High', 'Medium', 'Low'
    scores = {
      imageLabels: 0,
      category: 0,
      location: 0,
      date: 0
    },
    visualSimilarity = 0,
    metadataSimilarity = 0,
    status = 'suggested', // 'suggested', 'accepted', 'rejected', 'verified', 'disputed'
    aiComparison = {
      matchedLabels: [],
      locationDistanceScore: 0,
      dateDifferenceDays: 0,
      rekognitionInsights: ''
    },
    createdAt = new Date().toISOString(),
    updatedAt = new Date().toISOString(),
    decidedBy = null,
    decidedAt = null,
  }) {
    this.id = id || matchId;
    this.matchId = matchId || this.id;
    this.lostItemId = lostItemId;
    this.foundItemId = foundItemId;
    this.lostUserId = lostUserId || lostItem?.userId || lostItem?.reportedBy?.id;
    this.foundUserId = foundUserId || foundItem?.userId || foundItem?.reportedBy?.id;
    this.lostItem = lostItem;
    this.foundItem = foundItem;
    this.overallScore = overallScore;
    this.confidence = confidence;
    this.scores = scores;
    this.visualSimilarity = visualSimilarity;
    this.metadataSimilarity = metadataSimilarity;
    this.status = status;
    this.aiComparison = aiComparison;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.decidedBy = decidedBy;
    this.decidedAt = decidedAt;
  }
}

module.exports = Match;
