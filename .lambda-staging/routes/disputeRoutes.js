const express = require('express');
const router = express.Router();
const disputeController = require('../controllers/disputeController');
const { authenticate } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');
const { validateDispute } = require('../middleware/validationMiddleware');

router.use(authenticate);

// Dispute routes with role-based data isolation
router.post('/', validateDispute, disputeController.submitDispute);
router.get('/', disputeController.getDisputes);
router.get('/:id', disputeController.getDisputeById);

// Admin arbitration route
router.post('/:id/resolve', requireAdmin, disputeController.resolveDispute);

module.exports = router;
