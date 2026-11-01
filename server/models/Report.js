const mongoose = require('mongoose');

// Report schema for community-flagged posts and comments
const reportSchema = new mongoose.Schema({
  targetType: {
    type: String,
    enum: ['post', 'comment'],
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    default: 'Community violation'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure a user can only report a specific post or comment once
reportSchema.index({ targetId: 1, reporter: 1 }, { unique: true });

module.exports = mongoose.model('Report', reportSchema);

