const FinancialInsight = require('../models/FinancialInsight');
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const SavingsGoal = require('../models/SavingsGoal');
const User = require('../models/User');

exports.getInsights = async (req, res) => {
  try {
    const { type, read } = req.query;

    const query = { user: req.userId };

    if (type) query.type = type;
    if (read !== undefined) query.isRead = read === 'true';

    const insights = await FinancialInsight
      .find(query)
      .sort({ createdAt: -1 })
      .limit(30);

    res.json({
      success: true,
      insights
    });

  } catch (error) {
    console.error('GetInsights error:', error);

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.markInsightAsRead = async (req, res) => {
  try {
    const insight = await FinancialInsight.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.userId
      },
      {
        isRead: true
      },
      {
        new: true
      }
    );

    if (!insight) {
      return res.status(404).json({
        success: false,
        message: 'Insight not found'
      });
    }

    res.json({
      success: true,
      insight
    });

  } catch (error) {
    console.error('MarkInsightAsRead error:', error);

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.generateInsights = async (req, res) => {
  try {
    const now = new Date();

    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    const userId = req.userId;
    const user = req.user;

    const expenses = await Expense.find({
      user: userId,
      date: { $gte: startOfMonth }
    });

    const budgets = await Budget.find({
      user: userId,
      isActive: true
    });

    const goals = await SavingsGoal.find({
      user: userId,
      isCompleted: false
    });

    const insights = [];

    const formatMoney = (amount) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: user?.currency || 'NGN',
        minimumFractionDigits: 0
      }).format(amount || 0);
    };

    // TOP SPENDING CATEGORY
    if (expenses.length > 0) {
      const categoryTotals = {};

      expenses.forEach(expense => {
        categoryTotals[expense.category] =
          (categoryTotals[expense.category] || 0) + expense.amount;
      });

      const topCategory = Object
        .entries(categoryTotals)
        .sort((a, b) => b[1] - a[1])[0];

      if (topCategory) {
        const totalSpent = expenses.reduce(
          (sum, expense) => sum + expense.amount,
          0
        );

        const percentage = (
          (topCategory[1] / totalSpent) * 100
        ).toFixed(1);

        insights.push({
          user: userId,
          title: `Top Spending: ${topCategory[0]}`,
          description: `You've spent ${formatMoney(topCategory[1])} on ${topCategory[0]} this month, making up ${percentage}% of your total spending.`,
          type: 'spending_pattern',
          category: 'expense',
          severity:
            percentage > 40
              ? 'high'
              : percentage > 25
              ? 'medium'
              : 'low'
        });
      }
    }

    // BUDGET ALERTS
    budgets.forEach(budget => {
      if (budget.percentageUsed >= budget.alertThreshold) {
        insights.push({
          user: userId,
          title: `Budget Alert: ${budget.name}`,
          description: `You've used ${budget.percentageUsed}% of your ${budget.name} budget. Only ${formatMoney(budget.remaining)} remaining.`,
          type: 'budget_alert',
          category: 'budget',
          severity:
            budget.percentageUsed >= 95
              ? 'high'
              : 'medium'
        });
      }
    });

    // GOAL PROGRESS
    goals.forEach(goal => {
      if (goal.percentage >= 75 && !goal.isCompleted) {
        insights.push({
          user: userId,
          title: `Goal Almost There: ${goal.name}`,
          description: `You're ${goal.percentage}% of the way to your ${goal.name} goal! Only ${formatMoney(goal.remainingAmount)} more to go.`,
          type: 'goal_progress',
          category: 'savings',
          severity: 'low'
        });
      }
    });

    // GENERAL TREND
    if (expenses.length > 5) {
      insights.push({
        user: userId,
        title: 'Spending Insight Available',
        description: `You've recorded ${expenses.length} transactions this month. Review your spending patterns to identify savings opportunities.`,
        type: 'trend',
        category: 'general',
        severity: 'low'
      });
    }

    // Delete old insights first
    await FinancialInsight.deleteMany({ user: userId });

    if (insights.length > 0) {
      await FinancialInsight.insertMany(insights);
    }

    res.json({
      success: true,
      message: `${insights.length} insights generated`,
      insights
    });

  } catch (error) {
    console.error('GenerateInsights error:', error);

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};