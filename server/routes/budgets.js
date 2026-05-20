const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const budgetController = require('../controllers/budgetController');
const { auth } = require('../middleware/auth');

router.get('/', auth, budgetController.getBudgets);
router.get('/overview', auth, budgetController.getBudgetOverview);
router.get('/:id', auth, budgetController.getBudgetById);

router.post('/', auth, [
  body('name').trim().notEmpty().withMessage('Budget name is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Valid amount is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('startDate').notEmpty().withMessage('Start date is required'),
  body('endDate').notEmpty().withMessage('End date is required')
], budgetController.createBudget);

router.put('/:id', auth, budgetController.updateBudget);
router.delete('/:id', auth, budgetController.deleteBudget);

module.exports = router;
