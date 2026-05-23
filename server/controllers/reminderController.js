const Reminder = require('../models/Reminder');

exports.getReminders = async (req, res) => {
  try {
    const { status, type } = req.query;
    const query = { user: req.userId };
    
    if (status === 'pending') query.isCompleted = false;
    if (status === 'completed') query.isCompleted = true;
    if (type) query.type = type;

    const reminders = await Reminder.find(query).sort({ dueDate: 1 });
    res.json({ success: true, reminders });
  } catch (error) {
    console.error('GetReminders error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getReminderById = async (req, res) => {
  try {
    const reminder = await Reminder.findOne({ _id: req.params.id, user: req.userId });
    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }
    res.json({ success: true, reminder });
  } catch (error) {
    console.error('GetReminderById error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createReminder = async (req, res) => {
  try {
    const { title, description, type, dueDate, isRecurring, recurringFrequency, amount, category, priority } = req.body;

    console.log('Incoming Reminder Date:', dueDate);

    const reminder = await Reminder.create({
      user: req.userId,
      title,
      description,
      type: type || 'general',
      dueDate,
      isRecurring: isRecurring || false,
      recurringFrequency: recurringFrequency || 'monthly',
      amount: amount || 0,
      category: category || 'General',
      priority: priority || 'medium'
    });

    console.log('Saved Reminder Date:', reminder.dueDate);

    res.status(201).json({
      success: true,
      message: 'Reminder created successfully',
      reminder
    });
  } catch (error) {
    console.error('CreateReminder error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateReminder = async (req, res) => {
  try {
    const { title, description, type, dueDate, isRecurring, recurringFrequency, amount, category, priority, isCompleted } = req.body;

    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { title, description, type, dueDate, isRecurring, recurringFrequency, amount, category, priority, isCompleted },
      { new: true, runValidators: true }
    );

    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }

    res.json({
      success: true,
      message: 'Reminder updated successfully',
      reminder
    });
  } catch (error) {
    console.error('UpdateReminder error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.toggleReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOne({ _id: req.params.id, user: req.userId });
    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }

    reminder.isCompleted = !reminder.isCompleted;
    await reminder.save();

    res.json({
      success: true,
      message: reminder.isCompleted ? 'Reminder marked as completed' : 'Reminder marked as pending',
      reminder
    });
  } catch (error) {
    console.error('ToggleReminder error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }
    res.json({ success: true, message: 'Reminder deleted successfully' });
  } catch (error) {
    console.error('DeleteReminder error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getUpcomingReminders = async (req, res) => {
  try {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const reminders = await Reminder.find({
      user: req.userId,
      isCompleted: false,
      dueDate: { $gte: now, $lte: nextWeek }
    }).sort({ dueDate: 1 }).limit(10);

    res.json({ success: true, reminders });
  } catch (error) {
    console.error('GetUpcomingReminders error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
