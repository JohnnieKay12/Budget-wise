const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const savingsController = require('../controllers/savingsController');
const { auth } = require('../middleware/auth');

router.get('/', auth, savingsController.getSavingsGoals);
router.get('/overview', auth, savingsController.getSavingsOverview);
router.get('/:id', auth, savingsController.getSavingsGoalById);

router.post('/', auth, [
  body('name').trim().notEmpty().withMessage('Goal name is required'),
  body('targetAmount').isFloat({ min: 0 }).withMessage('Valid target amount is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('targetDate').notEmpty().withMessage('Target date is required')
], savingsController.createSavingsGoal);

router.put('/:id', auth, savingsController.updateSavingsGoal);
router.post('/:id/add', auth, [
  body('amount').isFloat({ min: 0 }).withMessage('Valid amount is required')
], savingsController.addSavings);
router.delete('/:id', auth, savingsController.deleteSavingsGoal);

module.exports = router;
