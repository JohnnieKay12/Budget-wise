const mongoose = require('mongoose');

const financialInsightSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['spending_pattern', 'saving_tip', 'budget_alert', 'goal_progress', 'overspend_warning', 'trend'],
    default: 'spending_pattern'
  },
  category: {
    type: String,
    enum: ['expense', 'savings', 'budget', 'general'],
    default: 'general'
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  actionable: {
    type: Boolean,
    default: true
  },
  actionText: {
    type: String,
    default: null
  },
  relatedData: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  month: {
    type: Number,
    default: () => new Date().getMonth() + 1
  },
  year: {
    type: Number,
    default: () => new Date().getFullYear()
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('FinancialInsight', financialInsightSchema);
