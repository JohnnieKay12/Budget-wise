const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
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
  message: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: [
      'info',
      'success',
      'warning',
      'alert',
      'insight',
      'reminder'
    ],
    default: 'info'
  },
  category: {
    type: String,
    enum: ['expense', 'budget', 'savings', 'reminder', 'insight', 'system'],
    default: 'system'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  actionLink: {
    type: String,
    default: null
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
