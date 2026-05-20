const mongoose = require('mongoose');

const savingsGoalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Goal name is required'],
    trim: true
  },
  targetAmount: {
    type: Number,
    required: [true, 'Target amount is required'],
    min: [0, 'Target amount cannot be negative']
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: [0, 'Current amount cannot be negative']
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Emergency Fund',
      'Travel',
      'Education',
      'Gadgets',
      'Wedding',
      'Business',
      'Car',
      'House',
      'Investment',
      'Others'
    ]
  },
  description: {
    type: String,
    trim: true
  },
  targetDate: {
    type: Date,
    required: true
  },
  icon: {
    type: String,
    default: 'Target'
  },
  color: {
    type: String,
    default: '#3b82f6'
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  autoSave: {
    enabled: {
      type: Boolean,
      default: false
    },
    amount: {
      type: Number,
      default: 0
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'monthly'
    }
  },
  milestones: [{
    percentage: {
      type: Number,
      required: true
    },
    achieved: {
      type: Boolean,
      default: false
    },
    achievedAt: Date
  }]
}, {
  timestamps: true
});

savingsGoalSchema.virtual('percentage').get(function() {
  if (this.targetAmount === 0) return 0;
  return Math.min(100, Math.round((this.currentAmount / this.targetAmount) * 100));
});

savingsGoalSchema.virtual('remainingAmount').get(function() {
  return Math.max(0, this.targetAmount - this.currentAmount);
});

savingsGoalSchema.virtual('daysLeft').get(function() {
  const now = new Date();
  const target = new Date(this.targetDate);
  const diff = target - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

savingsGoalSchema.set('toJSON', { virtuals: true });
savingsGoalSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('SavingsGoal', savingsGoalSchema);
