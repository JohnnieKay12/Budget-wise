const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const reminderController = require('../controllers/reminderController');
const { auth } = require('../middleware/auth');

router.get('/', auth, reminderController.getReminders);
router.get('/upcoming', auth, reminderController.getUpcomingReminders);
router.get('/:id', auth, reminderController.getReminderById);

router.post('/', auth, [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('dueDate').notEmpty().withMessage('Due date is required')
], reminderController.createReminder);

router.put('/:id', auth, reminderController.updateReminder);
router.patch('/:id/toggle', auth, reminderController.toggleReminder);
router.delete('/:id', auth, reminderController.deleteReminder);

module.exports = router;
