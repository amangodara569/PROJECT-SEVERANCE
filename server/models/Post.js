const mongoose = require('mongoose');

// Post schema representing stories, vents, questions, and hired announcements
const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Post title is required'],
    trim: true
  },
  body: {
    type: String,
    required: [true, 'Post body is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['vent', 'question', 'hired'],
    default: 'vent'
  },
  floor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Floor',
    default: null
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isInnie: {
    type: Boolean,
    default: false
  },
  innieHandle: {
    type: String,
    default: ''
  },
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  downvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  commentCount: {
    type: Number,
    default: 0
  },
  reportCount: {
    type: Number,
    default: 0
  },
  hidden: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Post', postSchema);

