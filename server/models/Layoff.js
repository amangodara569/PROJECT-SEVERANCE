const mongoose = require('mongoose');

// Layoff schema representing community-tracked corporate workforce reductions
const layoffSchema = new mongoose.Schema({
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  peopleAffected: {
    type: Number,
    default: 0
  },
  sourceUrl: {
    type: String,
    default: '',
    trim: true
  },
  note: {
    type: String,
    default: '',
    trim: true
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  confirmedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Layoff', layoffSchema);

