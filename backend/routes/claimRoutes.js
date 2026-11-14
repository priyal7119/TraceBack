const express = require('express');
const router = express.Router();
const claimController = require('../controllers/claimController');
const { authenticate } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');
const { validateClaim } = require('../middleware/validationMiddleware');

router.use(authenticate);

// Claim routes with role-based data isolation
router.post('/', validateClaim, claimController.submitClaim);
router.get('/', claimController.getClaims);
router.get('/my-claims', claimController.getMyClaims);
router.get('/:id', claimController.getClaimById);

// Admin review route
router.patch('/:id', requireAdmin, claimController.reviewClaim);

module.exports = router;
