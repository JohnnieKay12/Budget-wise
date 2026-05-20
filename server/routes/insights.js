const express = require('express');
const router = express.Router();
const insightController = require('../controllers/insightController');
const { auth } = require('../middleware/auth');

router.get('/', auth, insightController.getInsights);
router.post('/generate', auth, insightController.generateInsights);
router.patch('/:id/read', auth, insightController.markInsightAsRead);

module.exports = router;
