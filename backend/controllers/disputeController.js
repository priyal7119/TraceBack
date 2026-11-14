/**
 * Disputes Controller
 */

const disputeService = require('../services/disputeService');

const submitDispute = async (req, res, next) => {
  try {
    const dispute = await disputeService.submitDispute(req.body, req.user);
    res.status(201).json({
      success: true,
      message: 'Dispute submitted. An administrator will review both claimant testimonies.',
      dispute,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllDisputes = async (req, res, next) => {
  try {
    const disputes = await disputeService.getAllDisputes(req.query);
    res.status(200).json({
      success: true,
      count: disputes.length,
      disputes,
    });
  } catch (error) {
    next(error);
  }
};

const getDisputeById = async (req, res, next) => {
  try {
    const dispute = await disputeService.getDisputeById(req.params.id);
    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: 'Dispute not found',
      });
    }

    const userId = req.user.id;
    const isParticipant = dispute.submittedBy === userId ||
      (dispute.claimant1 && (dispute.claimant1.id === userId || dispute.claimant1.userId === userId)) ||
      (dispute.claimant2 && (dispute.claimant2.id === userId || dispute.claimant2.userId === userId));

    if (req.user.role !== 'admin' && !isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not authorized to view this dispute.',
      });
    }

    res.status(200).json({
      success: true,
      dispute,
    });
  } catch (error) {
    next(error);
  }
};

const resolveDispute = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Dispute arbitration is restricted to administrators.',
      });
    }

    const { decision, status } = req.body;
    if (!decision) {
      return res.status(400).json({
        success: false,
        message: 'Arbitration decision is required to resolve dispute.',
      });
    }

    const updated = await disputeService.resolveDispute(req.params.id, { decision, status }, req.user);
    res.status(200).json({
      success: true,
      message: 'Dispute arbitration decision recorded.',
      dispute: updated,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getDisputes = async (req, res, next) => {
  try {
    let disputes;
    if (req.user.role === 'admin') {
      disputes = await disputeService.getAllDisputes(req.query);
    } else {
      // User-specific query: only retrieves disputes in which the user is an involved party
      disputes = await disputeService.getUserDisputes(req.user.id, req.query);
    }
    res.status(200).json({
      success: true,
      count: disputes.length,
      disputes,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitDispute,
  getAllDisputes,
  getDisputes,
  getDisputeById,
  resolveDispute,
};
