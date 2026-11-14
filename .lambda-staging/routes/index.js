const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const reportRoutes = require('./reportRoutes');
const matchRoutes = require('./matchRoutes');
const notificationRoutes = require('./notificationRoutes');
const claimRoutes = require('./claimRoutes');
const disputeRoutes = require('./disputeRoutes');
const adminRoutes = require('./adminRoutes');
const imageRoutes = require('./imageRoutes');

// Primary REST Endpoints
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/reports', reportRoutes);
router.use('/matches', matchRoutes);
router.use('/notifications', notificationRoutes);
router.use('/claims', claimRoutes);
router.use('/disputes', disputeRoutes);
router.use('/admin', adminRoutes);
router.use('/images', imageRoutes);

// Frontend compatibility aliases:
// Map /api/items to /api/reports
router.use('/items', reportRoutes);

// Map /api/rekognition/detect-labels to image analyze
const imageController = require('../controllers/imageController');
router.post('/rekognition/detect-labels', imageController.analyzeImage);

module.exports = router;
