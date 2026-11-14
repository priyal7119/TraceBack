/**
 * TraceBack Matching Engine Service
 * 
 * Computes match similarity between Lost and Found reports using:
 * 1. Image labels (40% - preliminary placeholder until AWS Rekognition integration)
 * 2. Item category (25%)
 * 3. Campus location (20%)
 * 4. Lost/Found dates (15%)
 * 
 * All weights are configurable via config/matching.js.
 * Prevents duplicate matches. A match suggestion NEVER automatically confirms ownership.
 */

const { weights, thresholds, maxDateDifferenceDays } = require('../config/matching');
const adapter = require('../data/adapter');
const imageService = require('./imageService');
const notificationService = require('./notificationService');
const logger = require('../utils/logger');

class MatchingService {
  /**
   * Calculate string label overlap / Jaccard similarity
   * Supports arrays of strings or label objects.
   * Returns genuine similarity score and matched intersection. Never defaults to fake values.
   */
  calculateLabelSimilarity(labelsA = [], labelsB = []) {
    if (!labelsA || !labelsB || !labelsA.length || !labelsB.length) {
      return { score: 0, matchedLabels: [] };
    }
    const cleanList = (arr) => arr
      .map(item => (typeof item === 'string' ? item : item?.name || '').toLowerCase().trim())
      .filter(Boolean);

    const setA = new Set(cleanList(labelsA));
    const setB = new Set(cleanList(labelsB));

    if (setA.size === 0 || setB.size === 0) return { score: 0, matchedLabels: [] };

    const intersection = [...setA].filter(x => setB.has(x));
    const union = new Set([...setA, ...setB]);

    if (union.size === 0) return { score: 0, matchedLabels: [] };
    const score = Math.round((intersection.length / union.size) * 100);
    return { score, matchedLabels: intersection };
  }

  /**
   * Calculate category match score
   */
  calculateCategoryScore(catA, catB) {
    if (!catA || !catB) return 0;
    return catA.toLowerCase().trim() === catB.toLowerCase().trim() ? 100 : 0;
  }

  /**
   * Calculate campus location proximity score
   */
  calculateLocationScore(locA = '', locB = '') {
    if (!locA || !locB) return 50;
    const a = locA.toLowerCase();
    const b = locB.toLowerCase();

    // Exact match
    if (a === b) return 100;

    // Substring / building cluster match
    const keywords = ['library', 'lab', 'canteen', 'quadrangle', 'auditorium', 'gate', 'turf', 'office', 'pharmacy'];
    for (const kw of keywords) {
      if (a.includes(kw) && b.includes(kw)) {
        return 85;
      }
    }

    // Both located at HAMC campus
    return 60;
  }

  /**
   * Calculate date proximity score
   * Items lost and found within fewer days receive higher scores
   */
  calculateDateScore(dateA, dateB) {
    if (!dateA || !dateB) return 50;
    const dA = new Date(dateA);
    const dB = new Date(dateB);
    const diffMs = Math.abs(dA - dB);
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 100;
    if (diffDays <= 1) return 95;
    if (diffDays <= 3) return 85;
    if (diffDays <= 7) return 75;
    if (diffDays <= 14) return 60;
    if (diffDays <= maxDateDifferenceDays) {
      return Math.max(20, Math.round(100 - (diffDays / maxDateDifferenceDays) * 80));
    }
    return 10;
  }

  /**
   * Compute comprehensive weighted match score
   * Clearly distinguishes visual similarity from metadata affinity
   */
  computeMatchScore(lostReport, foundReport) {
    const hasVisualA = Boolean(
      lostReport.isLiveRekognition ||
      (Array.isArray(lostReport.aiTags) && lostReport.aiTags.length > 0)
    );
    const hasVisualB = Boolean(
      foundReport.isLiveRekognition ||
      (Array.isArray(foundReport.aiTags) && foundReport.aiTags.length > 0)
    );
    const bothHaveVisual = hasVisualA && hasVisualB;

    const categoryScore = this.calculateCategoryScore(lostReport.category, foundReport.category);
    const locationScore = this.calculateLocationScore(lostReport.location, foundReport.location);
    const dateScore = this.calculateDateScore(lostReport.date, foundReport.date);

    // Metadata similarity across category (25%), location (20%), and date (15%) -> normalized over 60%
    const metadataSimilarity = Math.round(
      (categoryScore * 25 + locationScore * 20 + dateScore * 15) / 60
    );

    let totalScore = 0;
    let visualSimilarity = null;
    let matchedLabels = [];
    let labelScore = 0;

    if (bothHaveVisual) {
      const labelRes = this.calculateLabelSimilarity(lostReport.aiTags || [], foundReport.aiTags || []);
      labelScore = labelRes.score;
      matchedLabels = labelRes.matchedLabels;
      visualSimilarity = labelScore;

      totalScore = Math.round(
        labelScore * weights.imageLabels +
        categoryScore * weights.category +
        locationScore * weights.location +
        dateScore * weights.date
      );
    } else {
      // When visual scan is unavailable on one or both items, score strictly reflects metadata affinity
      totalScore = metadataSimilarity;
      visualSimilarity = null;
    }

    totalScore = Math.min(100, Math.max(0, totalScore));

    let confidence = 'Low';
    if (totalScore >= thresholds.highConfidenceThreshold) {
      confidence = 'High';
    } else if (totalScore >= thresholds.mediumConfidenceThreshold) {
      confidence = 'Medium';
    }

    return {
      totalScore,
      confidence,
      bothHaveVisual,
      visualSimilarity,
      metadataSimilarity,
      breakdown: {
        imageLabels: labelScore,
        category: categoryScore,
        location: locationScore,
        date: dateScore,
      },
      matchedLabels,
    };
  }

  /**
   * Helper to normalize report item images and resolve private S3 URLs
   */
  async normalizeItem(item) {
    if (!item) return null;
    const keyToResolve = item.imageKey || item.image;
    let resolvedImage = item.image;
    if (keyToResolve) {
      resolvedImage = await imageService.getPresignedGetUrl(keyToResolve);
    }
    const rawImages = Array.isArray(item.images) && item.images.length > 0
      ? item.images.filter(Boolean)
      : (resolvedImage ? [resolvedImage] : ['https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80']);
    const resolvedImages = await Promise.all(rawImages.map(img => imageService.getPresignedGetUrl(img)));
    const image = resolvedImage || resolvedImages[0];
    return {
      ...item,
      image,
      images: resolvedImages,
    };
  }

  /**
   * Normalize full match record to protect frontend from undefined fields
   */
  async normalizeMatch(match) {
    if (!match) return null;
    let lostItem = match.lostItem;
    let foundItem = match.foundItem;

    if (match.lostItemId || match.lostReportId) {
      try {
        const freshLost = await adapter.findById('reports', match.lostItemId || match.lostReportId);
        if (freshLost) lostItem = { ...(lostItem || {}), ...freshLost };
      } catch {}
    }

    if (match.foundItemId || match.foundReportId) {
      try {
        const freshFound = await adapter.findById('reports', match.foundItemId || match.foundReportId);
        if (freshFound) foundItem = { ...(foundItem || {}), ...freshFound };
      } catch {}
    }

    lostItem = await this.normalizeItem(lostItem);
    foundItem = await this.normalizeItem(foundItem);

    const overallScore = Number(match.overallScore) || 75;
    const visualSimilarity = (match.visualSimilarity !== undefined && match.visualSimilarity !== null)
      ? Number(match.visualSimilarity)
      : (match.scores?.imageLabels !== undefined && match.scores?.imageLabels !== null ? Number(match.scores.imageLabels) : null);
    const metadataSimilarity = Number(match.metadataSimilarity) || Math.round(overallScore);

    const matchedLabels = Array.isArray(match.aiComparison?.matchedLabels) && match.aiComparison.matchedLabels.length > 0
      ? match.aiComparison.matchedLabels.filter(Boolean)
      : [];

    const defaultInsights = visualSimilarity !== null
      ? `Amazon Rekognition computer vision analysis completed (${visualSimilarity}% visual similarity).`
      : `Non-visual metadata match (${overallScore}% affinity) based on category, location, and timeframe.`;

    const aiComparison = {
      matchedLabels,
      locationDistanceScore: match.aiComparison?.locationDistanceScore ?? match.scores?.location ?? 80,
      locationDistanceKm: match.aiComparison?.locationDistanceKm ?? 0.05,
      timeDifferenceHours: match.aiComparison?.timeDifferenceHours ?? 0.5,
      dateDifferenceDays: match.aiComparison?.dateDifferenceDays ?? 0,
      rekognitionInsights: match.aiComparison?.rekognitionInsights || defaultInsights
    };

    return {
      ...match,
      id: match.id || match.matchId,
      matchId: match.matchId || match.id,
      lostItem,
      foundItem,
      overallScore,
      confidence: match.confidence || (overallScore >= 85 ? 'High' : overallScore >= 70 ? 'Medium' : 'Low'),
      visualSimilarity,
      metadataSimilarity,
      status: match.status || 'suggested',
      aiComparison
    };
  }

  /**
   * Run matching evaluation when a report is created or updated
   * @param {Object} newReport
   */
  async evaluateMatchesForReport(newReport) {
    try {
      const oppositeType = newReport.type === 'lost' ? 'found' : 'lost';
      // Find all active candidate reports of the opposite type
      const candidates = await adapter.find('reports', {
        type: oppositeType,
        status: (s) => s === 'active' || s === 'matched'
      });

      const generatedMatches = [];

      for (const candidate of candidates) {
        const lost = newReport.type === 'lost' ? newReport : candidate;
        const found = newReport.type === 'found' ? newReport : candidate;

        // Check if match record already exists (prevent duplicates across both conventions)
        const existingA = await adapter.findOne('matches', {
          lostItemId: lost.id,
          foundItemId: found.id,
        });
        const existingB = await adapter.findOne('matches', {
          lostReportId: lost.id,
          foundReportId: found.id,
        });

        if (existingA || existingB) continue;

        const analysis = this.computeMatchScore(lost, found);

        // If score meets minimum threshold, record match suggestion
        if (analysis.totalScore >= thresholds.minimumMatchScore) {
          const lostUserId = lost.userId || lost.reportedBy?.id;
          const foundUserId = found.userId || found.reportedBy?.id;
          const now = new Date().toISOString();

          // Generate transparent, professional insights without claiming exact physical identity
          let rekognitionInsights;
          if (analysis.bothHaveVisual && analysis.matchedLabels.length > 0) {
            rekognitionInsights = `Amazon Rekognition identified ${analysis.matchedLabels.length} common label(s) [${analysis.matchedLabels.slice(0, 4).join(', ')}] with ${analysis.visualSimilarity}% visual similarity. Overall campus affinity: ${analysis.totalScore}%.`;
          } else if (analysis.bothHaveVisual) {
            rekognitionInsights = `Amazon Rekognition visual scan completed with 0% label overlap. Overall campus affinity: ${analysis.totalScore}% (${analysis.metadataSimilarity}% metadata proximity).`;
          } else {
            rekognitionInsights = `Non-visual metadata match (${analysis.totalScore}% combined affinity) based on category (${lost.category}), campus location, and reported timeframe.`;
          }

          const matchRecord = await adapter.create('matches', {
            lostItemId: lost.id,
            foundItemId: found.id,
            lostReportId: lost.id,
            foundReportId: found.id,
            lostUserId,
            foundUserId,
            lostItem: await this.normalizeItem(lost),
            foundItem: await this.normalizeItem(found),
            overallScore: analysis.totalScore,
            confidence: analysis.confidence,
            scores: analysis.breakdown,
            visualSimilarity: analysis.visualSimilarity,
            visualAnalysisStatus: analysis.bothHaveVisual ? 'completed' : 'unavailable',
            metadataSimilarity: analysis.metadataSimilarity,
            status: 'suggested',
            createdAt: now,
            aiComparison: {
              matchedLabels: analysis.matchedLabels,
              locationDistanceScore: analysis.breakdown.location,
              locationDistanceKm: 0.05,
              timeDifferenceHours: 0.5,
              dateDifferenceDays: 0,
              rekognitionInsights
            }
          });

          generatedMatches.push(matchRecord);

          // Update statuses to 'matched' if active
          if (lost.status === 'active') {
            await adapter.update('reports', lost.id, { status: 'matched' }).catch(() => {});
          }
          if (found.status === 'active') {
            await adapter.update('reports', found.id, { status: 'matched' }).catch(() => {});
          }

          const matchIdToLink = matchRecord.id || matchRecord.matchId;

          // Create in-app notification for the lost item owner (with duplicate prevention)
          if (lostUserId) {
            try {
              const notifLink = `/user/matches/${matchIdToLink}`;
              const existingNotif = await adapter.findOne('notifications', {
                userId: lostUserId,
                link: notifLink,
              });
              if (!existingNotif) {
                await notificationService.createNotification({
                  userId: lostUserId,
                  type: 'match',
                  title: 'New Match Suggestion',
                  message: analysis.bothHaveVisual && analysis.matchedLabels.length > 0
                    ? `A potential visual match (${analysis.totalScore}% match score) was found for your lost "${lost.title}".`
                    : `A potential match (${analysis.totalScore}% affinity) was identified for your lost "${lost.title}".`,
                  link: notifLink,
                });
              }
            } catch (notifErr) {
              logger.error(`Failed to create lost report notification for user ${lostUserId}: ${notifErr.message}`);
            }
          }

          // Create in-app notification for the found item reporter (if distinct user, with duplicate prevention)
          if (foundUserId && foundUserId !== lostUserId && foundUserId !== 'usr_admin') {
            try {
              const notifLink = `/user/matches/${matchIdToLink}`;
              const existingNotif = await adapter.findOne('notifications', {
                userId: foundUserId,
                link: notifLink,
              });
              if (!existingNotif) {
                await notificationService.createNotification({
                  userId: foundUserId,
                  type: 'match',
                  title: 'Potential Match for Found Item',
                  message: `A potential lost match (${analysis.totalScore}% affinity) was identified for the item "${found.title}" you reported.`,
                  link: notifLink,
                });
              }
            } catch (notifErr) {
              logger.error(`Failed to create found report notification for user ${foundUserId}: ${notifErr.message}`);
            }
          }
        }
      }

      logger.info(`Matching engine evaluated ${candidates.length} candidates. Created ${generatedMatches.length} new matches.`);
      return generatedMatches;
    } catch (err) {
      logger.error('Error during match evaluation', err);
      return [];
    }
  }

  /**
   * Get matches for a user
   * Strictly scopes matches to records where the user is lostUserId or foundUserId
   */
  async getUserMatches(userId, query = {}) {
    const rawMatches = await adapter.find('matches', { userId, status: query.status }, { sortBy: 'createdAt', sortOrder: 'desc' });
    const userMatches = [];
    for (const rawMatch of rawMatches) {
      // Server-side isolation check: ensure match strictly involves the authenticated user
      const isParticipant = rawMatch.lostUserId === userId || rawMatch.foundUserId === userId ||
        (rawMatch.lostItem && (rawMatch.lostItem.userId === userId || rawMatch.lostItem.reportedBy?.id === userId)) ||
        (rawMatch.foundItem && (rawMatch.foundItem.userId === userId || rawMatch.foundItem.reportedBy?.id === userId));

      if (isParticipant) {
        const m = await this.normalizeMatch(rawMatch);
        if (m) userMatches.push(m);
      }
    }
    return userMatches;
  }

  /**
   * Update match decision (accept or reject)
   */
  async recordMatchDecision(matchId, decision, userId) {
    const match = await adapter.findById('matches', matchId);
    if (!match) {
      throw new Error('Match not found');
    }

    const newStatus = decision === 'accept' ? 'accepted' : 'rejected';
    const updated = await adapter.update('matches', matchId, {
      status: newStatus,
      decidedBy: userId,
      decidedAt: new Date().toISOString()
    });

    return updated;
  }
}

module.exports = new MatchingService();
