const Budget = require('../models/Budget');

exports.getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.userId, isActive: true }).sort({ createdAt: -1 });
    res.json({ success: true, budgets });
  } catch (error) {
    console.error('GetBudgets error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getBudgetById = async (req, res) => {
  try {
    const budget = await Budget.findOne({ _id: req.params.id, user: req.userId });
    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }
    res.json({ success: true, budget });
  } catch (error) {
    console.error('GetBudgetById error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createBudget = async (req, res) => {
  try {
    const { name, amount, category, period, startDate, endDate, alertThreshold } = req.body;

    const budget = await Budget.create({
      user: req.userId,
      name,
      amount,
      category,
      period: period || 'monthly',
      startDate: startDate || new Date(),
      endDate: endDate || new Date(new Date().setMonth(new Date().getMonth() + 1)),
      alertThreshold: alertThreshold || 80
    });

    res.status(201).json({
      success: true,
      message: 'Budget created successfully',
      budget
    });
  } catch (error) {
    console.error('CreateBudget error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateBudget = async (req, res) => {
  try {
    const { name, amount, category, period, startDate, endDate, alertThreshold, isActive } = req.body;

    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { name, amount, category, period, startDate, endDate, alertThreshold, isActive },
      { new: true, runValidators: true }
    );

    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }

    res.json({
      success: true,
      message: 'Budget updated successfully',
      budget
    });
  } catch (error) {
    console.error('UpdateBudget error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }
    res.json({ success: true, message: 'Budget deleted successfully' });
  } catch (error) {
    console.error('DeleteBudget error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getBudgetOverview = async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.userId, isActive: true });
    
    const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
    const totalRemaining = totalBudget - totalSpent;
    const overallPercentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

    const byCategory = budgets.map(b => ({
      name: b.name,
      category: b.category,
      amount: b.amount,
      spent: b.spent,
      remaining: b.remaining,
      percentage: b.percentageUsed,
      alertThreshold: b.alertThreshold,
      alertSent: b.alertSent
    }));

    res.json({
      success: true,
      overview: {
        totalBudget,
        totalSpent,
        totalRemaining,
        overallPercentage,
        budgetCount: budgets.length,
        byCategory
      }
    });
  } catch (error) {
    console.error('GetBudgetOverview error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
