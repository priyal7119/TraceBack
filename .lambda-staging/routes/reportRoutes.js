const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticate, optionalAuth } = require('../middleware/authMiddleware');
const { validateReport } = require('../middleware/validationMiddleware');

// Public listing routes
router.get('/stats', reportController.getPublicStats);
router.get('/lost', getLostReportsHandler);
router.get('/found', getFoundReportsHandler);

// Protected routes
router.post('/lost', authenticate, validateReport('lost'), reportController.createLostReport);
router.post('/found', authenticate, validateReport('found'), reportController.createFoundReport);
router.get('/my-reports', authenticate, reportController.getMyReports);

// Single report routes
router.get('/:id', optionalAuth, reportController.getReportById);
router.put('/:id', authenticate, reportController.updateReport);
router.delete('/:id', authenticate, reportController.deleteReport);

function getLostReportsHandler(req, res, next) {
  return reportController.getLostReports(req, res, next);
}

function getFoundReportsHandler(req, res, next) {
  return reportController.getFoundReports(req, res, next);
}

module.exports = router;
