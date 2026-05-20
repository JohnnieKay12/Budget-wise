const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Budget name is required'],
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Budget amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  spent: {
    type: Number,
    default: 0
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
      'Others',
      'All Categories'
    ]
  },
  period: {
    type: String,
    enum: ['weekly', 'monthly', 'yearly'],
    default: 'monthly'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  alertThreshold: {
    type: Number,
    default: 80,
    min: [0, 'Threshold cannot be negative'],
    max: [100, 'Threshold cannot exceed 100']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  alertSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

budgetSchema.virtual('percentageUsed').get(function() {
  if (this.amount === 0) return 0;
  return Math.round((this.spent / this.amount) * 100);
});

budgetSchema.virtual('remaining').get(function() {
  return Math.max(0, this.amount - this.spent);
});

budgetSchema.set('toJSON', { virtuals: true });
budgetSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Budget', budgetSchema);
