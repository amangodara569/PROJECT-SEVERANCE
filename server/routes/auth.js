const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const store = require('../db/store');
const { makeUser } = require('../models/User');
const auth = require('../middleware/auth');
const { generateUniqueInnieHandle } = require('../utils/innie');
const { validateUsername, validatePassword } = require('../utils/validate');

const router = express.Router();

// Helper function to create a 7-day JWT token
const createToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

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
    isAdmin: Boolean(user.isAdmin || user.username === 'aman_test'),
    createdAt: user.createdAt
  };
};

// POST /api/auth/register - Register a new account
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, headline, bio } = req.body;

    const userErr = validateUsername(username);
    if (userErr) return res.status(400).json({ error: userErr });

    if (typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'Please provide a valid email' });
    }

    const passErr = validatePassword(password);
    if (passErr) return res.status(400).json({ error: passErr });

    const cleanUsername = username.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (store.findOne('users', (u) => u.username.toLowerCase() === cleanUsername.toLowerCase())) {
      return res.status(400).json({ error: 'Username is already taken' });
    }
    if (store.findOne('users', (u) => u.email === cleanEmail)) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    // Hash password with salt >= 10
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const innieHandle = generateUniqueInnieHandle();

    const userObj = makeUser({
      username: cleanUsername,
      email: cleanEmail,
      passwordHash,
      headline: typeof headline === 'string' ? headline.trim() : '',
      bio: typeof bio === 'string' ? bio.trim() : '',
      innieHandle
    });

    const user = store.insert('users', userObj);
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

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = store.findOne('users', (u) => u.email === cleanEmail);
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

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

// GET /api/auth/me - Get currently logged-in user profile (the only place returning user's own innieHandle)
router.get('/me', auth, (req, res) => {
  try {
    const user = store.findById('users', req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user: sanitizeUser(user) });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Server error fetching user profile' });
  }
});

module.exports = router;
