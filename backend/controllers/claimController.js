/**
 * Claims Controller
 */

const claimService = require('../services/claimService');

const submitClaim = async (req, res, next) => {
  try {
    const claim = await claimService.submitClaim(req.body, req.user);
    res.status(201).json({
      success: true,
      message: 'Claim submitted successfully. Awaiting campus administration verification.',
      claim,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getMyClaims = async (req, res, next) => {
  try {
    const claims = await claimService.getUserClaims(req.user.id);
    res.status(200).json({
      success: true,
      count: claims.length,
      claims,
    });
  } catch (error) {
    next(error);
  }
};

const getAllClaims = async (req, res, next) => {
  try {
    const claims = await claimService.getAllClaims(req.query);
    res.status(200).json({
      success: true,
      count: claims.length,
      claims,
    });
  } catch (error) {
    next(error);
  }
};

const reviewClaim = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;
    const updated = await claimService.reviewClaim(req.params.id, { status, adminNotes }, req.user);
    res.status(200).json({
      success: true,
      message: `Claim status updated to ${status}.`,
      claim: updated,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getClaimById = async (req, res, next) => {
  try {
    const claim = await claimService.getClaimById(req.params.id);
    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found',
      });
    }

    if (req.user.role !== 'admin' && claim.claimantId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not authorized to access this claim.',
      });
    }

    res.status(200).json({
      success: true,
      claim,
    });
  } catch (error) {
    next(error);
  }
};

const getClaims = async (req, res, next) => {
  try {
    let claims;
    if (req.user.role === 'admin') {
      claims = await claimService.getAllClaims(req.query);
    } else {
      claims = await claimService.getUserClaims(req.user.id);
    }
    res.status(200).json({
      success: true,
      count: claims.length,
      claims,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitClaim,
  getMyClaims,
  getAllClaims,
  getClaims,
  getClaimById,
  reviewClaim,
};
