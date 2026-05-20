const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const expenseController = require('../controllers/expenseController');
const { auth } = require('../middleware/auth');

router.get('/', auth, expenseController.getExpenses);
router.get('/stats', auth, expenseController.getExpenseStats);
router.get('/:id', auth, expenseController.getExpenseById);

router.post('/', auth, [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Valid amount is required'),
  body('category').trim().notEmpty().withMessage('Category is required')
], expenseController.createExpense);

router.put('/:id', auth, expenseController.updateExpense);
router.delete('/:id', auth, expenseController.deleteExpense);

module.exports = router;
