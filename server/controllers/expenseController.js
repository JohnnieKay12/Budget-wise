const Expense = require('../models/Expense');
const Budget = require('../models/Budget');

exports.getExpenses = async (req, res) => {
  try {
    const { 
      category, 
      startDate, 
      endDate, 
      search, 
      page = 1, 
      limit = 20,
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;

    const query = { user: req.userId };

    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const expenses = await Expense.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Expense.countDocuments(query);

    res.json({
      success: true,
      expenses,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('GetExpenses error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.userId });
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }
    res.json({ success: true, expense });
  } catch (error) {
    console.error('GetExpenseById error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createExpense = async (req, res) => {
  try {
    const { title, amount, category, paymentMethod, description, date, isRecurring, recurringFrequency, tags, location } = req.body;

    const expense = await Expense.create({
      user: req.userId,
      title,
      amount,
      category,
      paymentMethod: paymentMethod || 'Cash',
      description,
      date: date || new Date(),
      isRecurring: isRecurring || false,
      recurringFrequency,
      tags: tags || [],
      location
    });

    const budgets = await Budget.find({ 
      user: req.userId, 
      isActive: true,
      $or: [
        { category: category },
        { category: 'All Categories' }
      ]
    });

    for (const budget of budgets) {
      budget.spent += amount;
      if (budget.percentageUsed >= budget.alertThreshold && !budget.alertSent) {
        budget.alertSent = true;
      }
      await budget.save();
    }

    res.status(201).json({
      success: true,
      message: 'Expense added successfully',
      expense
    });
  } catch (error) {
    console.error('CreateExpense error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateExpense = async (req, res) => {
  try {
    const { title, amount, category, paymentMethod, description, date, tags, location } = req.body;

    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { title, amount, category, paymentMethod, description, date, tags, location },
      { new: true, runValidators: true }
    );

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    res.json({
      success: true,
      message: 'Expense updated successfully',
      expense
    });
  } catch (error) {
    console.error('UpdateExpense error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.userId });
    
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    const budgets = await Budget.find({ 
      user: req.userId, 
      isActive: true,
      $or: [
        { category: expense.category },
        { category: 'All Categories' }
      ]
    });

    for (const budget of budgets) {
      budget.spent = Math.max(0, budget.spent - expense.amount);
      if (budget.percentageUsed < budget.alertThreshold) {
        budget.alertSent = false;
      }
      await budget.save();
    }

    res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('DeleteExpense error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getExpenseStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const currentMonthExpenses = await Expense.find({
      user: req.userId,
      date: { $gte: startOfMonth }
    });

    const lastMonthExpenses = await Expense.find({
      user: req.userId,
      date: { $gte: startOfLastMonth, $lte: endOfLastMonth }
    });

    const currentMonthTotal = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const lastMonthTotal = lastMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

    const categoryBreakdown = await Expense.aggregate([
      { $match: { user: req.user._id, date: { $gte: startOfMonth } } },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ]);

    const dailySpending = await Expense.aggregate([
      { $match: { user: req.user._id, date: { $gte: startOfMonth } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, total: { $sum: '$amount' } } },
      { $sort: { _id: 1 } }
    ]);

    const paymentMethodBreakdown = await Expense.aggregate([
      { $match: { user: req.user._id, date: { $gte: startOfMonth } } },
      { $group: { _id: '$paymentMethod', total: { $sum: '$amount' } } }
    ]);

    res.json({
      success: true,
      stats: {
        currentMonthTotal,
        lastMonthTotal,
        monthOverMonthChange: lastMonthTotal > 0 ? ((currentMonthTotal - lastMonthTotal) / lastMonthTotal * 100).toFixed(1) : 0,
        transactionCount: currentMonthExpenses.length,
        averageTransaction: currentMonthExpenses.length > 0 ? (currentMonthTotal / currentMonthExpenses.length).toFixed(2) : 0,
        categoryBreakdown,
        dailySpending,
        paymentMethodBreakdown
      }
    });
  } catch (error) {
    console.error('GetExpenseStats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
