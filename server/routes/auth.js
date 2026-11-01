const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { generateUniqueInnieHandle } = require('../utils/innie');

const router = express.Router();

// Helper function to create a 7-day JWT token
const createToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// Helper function to return user object without sensitive fields
const sanitizeUser = (user) => {
  return {
    _id: user._id,
    username: user.username,
    email: user.email,
    headline: user.headline,
    bio: user.bio,
    status: user.status,
    innieHandle: user.innieHandle,
    joinedFloors: user.joinedFloors,
    createdAt: user.createdAt
  };
};

// POST /api/auth/register - Register a new account
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, headline, bio } = req.body;

    // Check required fields
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Please provide username, email, and password' });
    }

    // Check if username is already taken
    const existingUsername = await User.findOne({ username: username.trim() });
    if (existingUsername) {
      return res.status(400).json({ error: 'Username is already taken' });
    }

    // Check if email is already registered
    const existingEmail = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Generate unique Innie handle for anonymous posting
    const innieHandle = await generateUniqueInnieHandle();

    // Create and save the new user
    const user = await User.create({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      headline: headline ? headline.trim() : '',
      bio: bio ? bio.trim() : '',
      innieHandle
    });

    const token = createToken(user._id);

    res.status(201).json({
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Server error during registration' });
  }
});

// POST /api/auth/login - Log in with existing email and password
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    // Find user by lowercase email
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Verify password against stored hash
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = createToken(user._id);

    res.json({
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Server error during login' });
  }
});

// GET /api/auth/me - Get currently logged-in user profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Server error fetching user profile' });
  }
});

module.exports = router;

