const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  currentAmount: {
    type: Number,
    default: 0
  },
  completedDays: [{
    type: Date
  }],
  streak: {
    type: Number,
    default: 0
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
});

const savingsChallengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Challenge title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['daily_saving', 'no_spend', 'category_cut', 'streak', 'group'],
    default: 'daily_saving'
  },
  targetAmount: {
    type: Number,
    required: true
  },
  durationDays: {
    type: Number,
    required: true,
    min: 1,
    max: 365
  },
  rewardPoints: {
    type: Number,
    default: 100
  },
  category: {
    type: String,
    default: 'general'
  },
  rules: [{
    type: String
  }],
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  participants: [participantSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  icon: {
    type: String,
    default: 'Trophy'
  },
  color: {
    type: String,
    default: '#f59e0b'
  }
}, {
  timestamps: true
});

savingsChallengeSchema.virtual('participantCount').get(function() {
  return this.participants.length;
});

savingsChallengeSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  const end = new Date(this.endDate);
  const diff = end - now;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
});

savingsChallengeSchema.set('toJSON', { virtuals: true });
savingsChallengeSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('SavingsChallenge', savingsChallengeSchema);
