const Budget = require('../models/Budget');
const Expense = require('../models/Expense');

const calculateBudgetSpent = async (budget, userId) => {
  const start = new Date(budget.startDate);
  start.setUTCHours(0, 0, 0, 0);

  const end = new Date(budget.endDate);
  end.setUTCHours(23, 59, 59, 999);

  console.log('BUDGET START:', start);
  console.log('BUDGET END:', end);

  const query = {
    user: userId,
    date: {
      $gte: start,
      $lte: end
    }
  };

  if (budget.category !== 'All Categories') {
    query.category = budget.category;
  }

  console.log('QUERY:', query);

  const expenses = await Expense.find(query);

  console.log('MATCHED EXPENSES:', expenses);

  const spent = expenses.reduce(
    (sum, exp) => sum + Number(exp.amount),
    0
  );

  console.log('TOTAL SPENT:', spent);

  return spent;
};

exports.getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({
      user: req.userId,
      isActive: true
    }).sort({ createdAt: -1 });

    const updatedBudgets = await Promise.all(
      budgets.map(async (budget) => {
        const spent = await calculateBudgetSpent(
          budget,
          req.userId
        );

        const percentageUsed =
          budget.amount > 0
            ? Math.round((spent / budget.amount) * 100)
            : 0;

        return {
          ...budget.toObject(),
          spent,
          remaining: Math.max(
            0,
            budget.amount - spent
          ),
          percentageUsed,
          alertSent:
            percentageUsed >= budget.alertThreshold
        };
      })
    );

    res.json({
      success: true,
      budgets: updatedBudgets
    });

  } catch (error) {
    console.error('GetBudgets error:', error);

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.getBudgetById = async (req, res) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    const spent = await calculateBudgetSpent(
      budget,
      req.userId
    );

    const percentageUsed =
      budget.amount > 0
        ? Math.round((spent / budget.amount) * 100)
        : 0;

    const updatedBudget = {
      ...budget.toObject(),
      spent,
      remaining: Math.max(
        0,
        budget.amount - spent
      ),
      percentageUsed,
      alertSent:
        percentageUsed >= budget.alertThreshold
    };

    res.json({
      success: true,
      budget: updatedBudget
    });

  } catch (error) {
    console.error('GetBudgetById error:', error);

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.createBudget = async (req, res) => {
  try {
    const {
      name,
      amount,
      category,
      period,
      startDate,
      endDate,
      alertThreshold
    } = req.body;

    const budget = await Budget.create({
      user: req.userId,
      name,
      amount,
      category,
      period: period || 'monthly',
      startDate: startDate || new Date(),
      endDate:
        endDate ||
        new Date(
          new Date().setMonth(
            new Date().getMonth() + 1
          )
        ),
      alertThreshold: alertThreshold || 80
    });

    res.status(201).json({
      success: true,
      message: 'Budget created successfully',
      budget
    });

  } catch (error) {
    console.error('CreateBudget error:', error);

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.updateBudget = async (req, res) => {
  try {
    const budget = await Budget.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.userId
      },
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    res.json({
      success: true,
      message: 'Budget updated successfully',
      budget
    });

  } catch (error) {
    console.error('UpdateBudget error:', error);

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    res.json({
      success: true,
      message: 'Budget deleted successfully'
    });

  } catch (error) {
    console.error('DeleteBudget error:', error);

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.getBudgetOverview = async (req, res) => {
  try {
    const budgets = await Budget.find({
      user: req.userId,
      isActive: true
    });

    const updatedBudgets = await Promise.all(
      budgets.map(async (budget) => {
        const spent = await calculateBudgetSpent(
          budget,
          req.userId
        );

        const percentageUsed =
          budget.amount > 0
            ? Math.round((spent / budget.amount) * 100)
            : 0;

        return {
          ...budget.toObject(),
          spent,
          remaining: Math.max(
            0,
            budget.amount - spent
          ),
          percentageUsed,
          alertSent:
            percentageUsed >= budget.alertThreshold
        };
      })
    );

    const totalBudget = updatedBudgets.reduce(
      (sum, b) => sum + Number(b.amount || 0),
      0
    );

    const totalSpent = updatedBudgets.reduce(
      (sum, b) => sum + Number(b.spent || 0),
      0
    );

    const totalRemaining =
      totalBudget - totalSpent;

    const overallPercentage =
      totalBudget > 0
        ? Math.round(
            (totalSpent / totalBudget) * 100
          )
        : 0;

    res.json({
      success: true,
      overview: {
        totalBudget,
        totalSpent,
        totalRemaining,
        overallPercentage,
        budgetCount: updatedBudgets.length,
        byCategory: updatedBudgets
      }
    });

  } catch (error) {
    console.error(
      'GetBudgetOverview error:',
      error
    );

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};