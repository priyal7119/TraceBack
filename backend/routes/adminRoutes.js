const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');

// All routes require authentication and admin role
router.use(authenticate, requireAdmin);

router.get('/overview', adminController.getOverview);
router.get('/metrics', adminController.getOverview); // Alias for frontend compatibility
router.get('/users', adminController.getUsers);
router.patch('/users/:id', adminController.updateUser);
router.get('/reports', adminController.getReports);
router.patch('/reports/:id/status', adminController.updateReportStatus);
router.get('/matches', adminController.getMatches);
router.get('/archived-reports', adminController.getArchivedReports);

module.exports = router;
