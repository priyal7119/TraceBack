/**
 * Matches Controller
 */

const matchingService = require('../services/matchingService');
const adapter = require('../data/adapter');

const getMatches = async (req, res, next) => {
  try {
    let matches;
    if (req.user.role === 'admin') {
      const rawMatches = await adapter.find('matches', {}, { sortBy: 'createdAt', sortOrder: 'desc' });
      matches = [];
      for (const raw of rawMatches) {
        const norm = await matchingService.normalizeMatch(raw);
        if (norm) matches.push(norm);
      }
    } else {
      matches = await matchingService.getUserMatches(req.user.id, req.query);
    }

    res.status(200).json({
      success: true,
      count: matches.length,
      matches,
    });
  } catch (error) {
    next(error);
  }
};

const getMatchById = async (req, res, next) => {
  try {
    const rawMatch = await adapter.findById('matches', req.params.id);
    if (!rawMatch) {
      return res.status(404).json({
        success: false,
        message: 'Match suggestion not found',
      });
    }

    const match = await matchingService.normalizeMatch(rawMatch);

    // Authorization check: User must be admin OR owner of lost or found item
    if (req.user.role !== 'admin') {
      const userId = req.user.id;
      const isOwner = match.lostUserId === userId ||
                      match.foundUserId === userId ||
                      (match.lostItem && (match.lostItem.userId === userId || match.lostItem.reportedBy?.id === userId)) ||
                      (match.foundItem && (match.foundItem.userId === userId || match.foundItem.reportedBy?.id === userId));

      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You are not authorized to access this match.',
        });
      }
    }

    res.status(200).json({
      success: true,
      match,
    });
  } catch (error) {
    next(error);
  }
};

const handleMatchDecision = async (req, res, next) => {
  try {
    const { decision } = req.body;
    if (!decision || !['accept', 'reject'].includes(decision)) {
      return res.status(400).json({
        success: false,
        message: 'Decision must be either "accept" or "reject".',
      });
    }

    const rawMatch = await adapter.findById('matches', req.params.id);
    if (!rawMatch) {
      return res.status(404).json({
        success: false,
        message: 'Match suggestion not found',
      });
    }

    // Authorization check: User must be admin OR owner of lost or found item
    if (req.user.role !== 'admin') {
      const userId = req.user.id;
      const isOwner = rawMatch.lostUserId === userId ||
                      rawMatch.foundUserId === userId ||
                      (rawMatch.lostItem && (rawMatch.lostItem.userId === userId || rawMatch.lostItem.reportedBy?.id === userId)) ||
                      (rawMatch.foundItem && (rawMatch.foundItem.userId === userId || rawMatch.foundItem.reportedBy?.id === userId));

      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You are not authorized to update this match decision.',
        });
      }
    }

    const updated = await matchingService.recordMatchDecision(req.params.id, decision, req.user.id);
    const normalized = await matchingService.normalizeMatch(updated);
    res.status(200).json({
      success: true,
      message: `Match suggestion ${decision === 'accept' ? 'accepted' : 'declined'}. Note: A match decision does not confirm ownership until custodial review.`,
      match: normalized,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const updateMatchStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required.',
      });
    }

    const rawMatch = await adapter.findById('matches', req.params.id);
    if (!rawMatch) {
      return res.status(404).json({ success: false, message: 'Match not found' });
    }

    // Authorization check
    if (req.user.role !== 'admin') {
      const userId = req.user.id;
      const isOwner = (rawMatch.lostItem && (rawMatch.lostItem.userId === userId || rawMatch.lostItem.reportedBy?.id === userId)) ||
                      (rawMatch.foundItem && (rawMatch.foundItem.userId === userId || rawMatch.foundItem.reportedBy?.id === userId)) ||
                      (rawMatch.lostItemId && typeof rawMatch.lostItemId === 'string' && rawMatch.lostItemId.includes(userId)) ||
                      (rawMatch.foundItemId && typeof rawMatch.foundItemId === 'string' && rawMatch.foundItemId.includes(userId));

      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You are not authorized to update this match status.',
        });
      }
    }

    const updated = await adapter.update('matches', req.params.id, { status });
    const normalized = await matchingService.normalizeMatch(updated);
    res.status(200).json({
      success: true,
      match: normalized,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMatches,
  getMatchById,
  handleMatchDecision,
  updateMatchStatus,
};
