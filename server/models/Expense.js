const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Transport',
      'Bolt/Uber',
      'Food & Jollof',
      'Generator Fuel',
      'POS Charges',
      'Airtime',
      'Data Subscription',
      'Family Support',
      'Church Offering',
      'Rent',
      'NEPA Bills',
      'Groceries',
      'Entertainment',
      'Healthcare',
      'Education',
      'Shopping',
      'Bills',
      'Others'
    ]
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Card', 'Transfer', 'USSD', 'POS'],
    default: 'Cash'
  },
  description: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringFrequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly', null],
    default: null
  },
  tags: [{
    type: String,
    trim: true
  }],
  location: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

expenseSchema.index({ user: 1, date: -1 });
expenseSchema.index({ user: 1, category: 1 });

module.exports = mongoose.model('Expense', expenseSchema);
