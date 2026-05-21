const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const SavingsGoal = require('../models/SavingsGoal');
const Reminder = require('../models/Reminder');
const Notification = require('../models/Notification');
const FinancialInsight = require('../models/FinancialInsight');
const User = require('../models/User');

exports.getDashboard = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.getTime() - now.getDay() * 24 * 60 * 60 * 1000);

    const monthlyExpenses = await Expense.find({
      user: req.userId,
      date: { $gte: startOfMonth }
    });

    const weeklyExpenses = await Expense.find({
      user: req.userId,
      date: { $gte: startOfWeek }
    });

    const totalMonthlySpent = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalWeeklySpent = weeklyExpenses.reduce((sum, e) => sum + e.amount, 0);

    const budgets = await Budget.find({ user: req.userId, isActive: true });
    const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
    let totalBudgetSpent = 0;

    for (const budget of budgets) {
      const spent = monthlyExpenses
        .filter(exp => {
          if (budget.category === 'All Categories') return true;
          return exp.category === budget.category;
        })
        .reduce((sum, exp) => sum + Number(exp.amount), 0);

      totalBudgetSpent += spent;
    }

    const savingsGoals = await SavingsGoal.find({ user: req.userId, isCompleted: false });
    const totalSavingsTarget = savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);
    const totalSavingsCurrent = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);

    const categoryBreakdown = await Expense.aggregate([
      { $match: { user: req.user._id, date: { $gte: startOfMonth } } },
      { $group: { _id: '$category', amount: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { amount: -1 } },
      { $limit: 6 }
    ]);

    const dailyTrend = await Expense.aggregate([
      { $match: { user: req.user._id, date: { $gte: startOfMonth } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, amount: { $sum: '$amount' } } },
      { $sort: { _id: 1 } },
      { $limit: 30 }
    ]);

    const recentTransactions = await Expense.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .limit(5);

    const upcomingReminders = await Reminder.find({
      user: req.userId,
      isCompleted: false,
      dueDate: { $gte: now }
    }).sort({ dueDate: 1 }).limit(5);

    const unreadNotifications = await Notification.countDocuments({
      user: req.userId,
      isRead: false
    });

    const recentInsights = await FinancialInsight.find({
      user: req.userId,
      isRead: false
    }).sort({ createdAt: -1 }).limit(3);

    const user = await User.findById(req.userId);

    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const lastMonthExpenses = await Expense.find({
      user: req.userId,
      date: { $gte: startOfLastMonth, $lte: endOfLastMonth }
    });
    const lastMonthTotal = lastMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

    res.json({
      success: true,
      dashboard: {
        summary: {
          totalMonthlySpent,
          totalWeeklySpent,
          totalBudget,
          totalBudgetSpent,
          budgetRemaining: totalBudget - totalBudgetSpent,
          totalSavingsTarget,
          totalSavingsCurrent,
          savingsProgress: totalSavingsTarget > 0 ? Math.round((totalSavingsCurrent / totalSavingsTarget) * 100) : 0,
          transactionCount: monthlyExpenses.length,
          monthOverMonthChange: lastMonthTotal > 0 ? ((totalMonthlySpent - lastMonthTotal) / lastMonthTotal * 100).toFixed(1) : 0
        },
        categoryBreakdown,
        dailyTrend,
        recentTransactions,
        upcomingReminders,
        unreadNotifications,
        recentInsights,
        softLifeScore: user.softLifeScore,
        streakDays: user.streakDays,
        activeBudgets: budgets.length,
        activeGoals: savingsGoals.length
      }
    });
  } catch (error) {
    console.error('GetDashboard error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getSoftLifeScore = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const expenses = await Expense.find({ user: req.userId, date: { $gte: startOfMonth } });
    const budgets = await Budget.find({ user: req.userId, isActive: true });
    const goals = await SavingsGoal.find({ user: req.userId });

    let score = 0;
    const breakdown = {
      budgeting: 0,
      savings: 0,
      consistency: 0,
      goals: 0,
      tracking: 0
    };

    if (budgets.length > 0) {
      const avgBudgetUsed = budgets.reduce((sum, b) => sum + b.percentageUsed, 0) / budgets.length;
      breakdown.budgeting = Math.min(25, Math.round((100 - avgBudgetUsed) / 4));
      score += breakdown.budgeting;
    }

    const totalSavings = goals.reduce((sum, g) => sum + g.currentAmount, 0);
    const totalTargets = goals.reduce((sum, g) => sum + g.targetAmount, 0);
    if (totalTargets > 0) {
      breakdown.savings = Math.min(25, Math.round((totalSavings / totalTargets) * 25));
      score += breakdown.savings;
    }

    breakdown.consistency = Math.min(20, user.streakDays * 2);
    score += breakdown.consistency;

    const completedGoals = goals.filter(g => g.isCompleted).length;
    breakdown.goals = Math.min(15, completedGoals * 5);
    score += breakdown.goals;

    breakdown.tracking = Math.min(15, Math.round(expenses.length / 2));
    score += breakdown.tracking;

    user.softLifeScore = score;
    await user.save();

    res.json({
      success: true,
      score,
      maxScore: 100,
      breakdown,
      streakDays: user.streakDays,
      level: score >= 80 ? 'Expert' : score >= 60 ? 'Advanced' : score >= 40 ? 'Intermediate' : score >= 20 ? 'Beginner' : 'Newbie'
    });
  } catch (error) {
    console.error('GetSoftLifeScore error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
