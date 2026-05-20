const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const challengeController = require('../controllers/challengeController');
const { auth } = require('../middleware/auth');

router.get('/', auth, challengeController.getChallenges);
router.get('/:id', auth, challengeController.getChallengeById);

router.post('/', auth, [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('targetAmount').isFloat({ min: 0 }).withMessage('Valid target amount is required'),
  body('durationDays').isInt({ min: 1, max: 365 }).withMessage('Duration must be 1-365 days'),
  body('startDate').notEmpty().withMessage('Start date is required'),
  body('endDate').notEmpty().withMessage('End date is required')
], challengeController.createChallenge);

router.post('/:id/join', auth, challengeController.joinChallenge);
router.post('/:id/progress', auth, [
  body('amount').isFloat({ min: 0 }).withMessage('Valid amount is required')
], challengeController.updateProgress);
router.delete('/:id', auth, challengeController.deleteChallenge);

module.exports = router;
