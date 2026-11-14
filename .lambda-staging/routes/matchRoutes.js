const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/', matchController.getMatches);
router.get('/:id', matchController.getMatchById);
router.post('/:id/decision', matchController.handleMatchDecision);
router.patch('/:id/status', matchController.updateMatchStatus);

module.exports = router;
