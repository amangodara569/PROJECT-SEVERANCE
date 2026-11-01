const mongoose = require('mongoose');

// User schema representing accounts in Linked Out
// Holds Outie profile details and the anonymous Innie persona handle
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required']
  },
  headline: {
    type: String,
    default: '',
    trim: true
  },
  bio: {
    type: String,
    default: '',
    trim: true
  },
  status: {
    type: String,
    enum: ['Employed', 'Severed', 'Reintegrated'],
    default: 'Employed'
  },
  innieHandle: {
    type: String,
    required: true,
    unique: true
  },
  joinedFloors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Floor'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);

