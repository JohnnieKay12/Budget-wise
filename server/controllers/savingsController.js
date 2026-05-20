const SavingsGoal = require('../models/SavingsGoal');
const User = require('../models/User');

exports.getSavingsGoals = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { user: req.userId };
    if (status === 'active') query.isCompleted = false;
    if (status === 'completed') query.isCompleted = true;

    const goals = await SavingsGoal.find(query).sort({ createdAt: -1 });
    res.json({ success: true, goals });
  } catch (error) {
    console.error('GetSavingsGoals error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getSavingsGoalById = async (req, res) => {
  try {
    const goal = await SavingsGoal.findOne({ _id: req.params.id, user: req.userId });
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Savings goal not found' });
    }
    res.json({ success: true, goal });
  } catch (error) {
    console.error('GetSavingsGoalById error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createSavingsGoal = async (req, res) => {
  try {
    const { name, targetAmount, category, description, targetDate, icon, color, autoSave } = req.body;

    const goal = await SavingsGoal.create({
      user: req.userId,
      name,
      targetAmount,
      category,
      description,
      targetDate,
      icon: icon || 'Target',
      color: color || '#3b82f6',
      autoSave: autoSave || { enabled: false, amount: 0, frequency: 'monthly' },
      milestones: [
        { percentage: 25 },
        { percentage: 50 },
        { percentage: 75 },
        { percentage: 100 }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Savings goal created successfully',
      goal
    });
  } catch (error) {
    console.error('CreateSavingsGoal error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateSavingsGoal = async (req, res) => {
  try {
    const { name, targetAmount, category, description, targetDate, icon, color, autoSave } = req.body;

    const goal = await SavingsGoal.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { name, targetAmount, category, description, targetDate, icon, color, autoSave },
      { new: true, runValidators: true }
    );

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Savings goal not found' });
    }

    res.json({
      success: true,
      message: 'Savings goal updated successfully',
      goal
    });
  } catch (error) {
    console.error('UpdateSavingsGoal error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.addSavings = async (req, res) => {
  try {
    const { amount } = req.body;
    const goal = await SavingsGoal.findOne({ _id: req.params.id, user: req.userId });

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Savings goal not found' });
    }

    goal.currentAmount += amount;
    
    if (goal.currentAmount >= goal.targetAmount) {
      goal.isCompleted = true;
    }

    goal.milestones.forEach(milestone => {
      if (!milestone.achieved && goal.percentage >= milestone.percentage) {
        milestone.achieved = true;
        milestone.achievedAt = new Date();
      }
    });

    await goal.save();

    const user = await User.findById(req.userId);
    user.softLifeScore += Math.floor(amount / 100);
    await user.save();

    res.json({
      success: true,
      message: `Added ₦${amount.toLocaleString()} to your savings`,
      goal
    });
  } catch (error) {
    console.error('AddSavings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteSavingsGoal = async (req, res) => {
  try {
    const goal = await SavingsGoal.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Savings goal not found' });
    }
    res.json({ success: true, message: 'Savings goal deleted successfully' });
  } catch (error) {
    console.error('DeleteSavingsGoal error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getSavingsOverview = async (req, res) => {
  try {
    const goals = await SavingsGoal.find({ user: req.userId });
    
    const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
    const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
    const completedGoals = goals.filter(g => g.isCompleted).length;
    const activeGoals = goals.filter(g => !g.isCompleted).length;

    const byCategory = await SavingsGoal.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: '$category', totalTarget: { $sum: '$targetAmount' }, totalSaved: { $sum: '$currentAmount' }, count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      overview: {
        totalTarget,
        totalSaved,
        totalRemaining: totalTarget - totalSaved,
        overallPercentage: totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0,
        completedGoals,
        activeGoals,
        totalGoals: goals.length,
        byCategory
      }
    });
  } catch (error) {
    console.error('GetSavingsOverview error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
