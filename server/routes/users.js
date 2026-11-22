const express = require('express');
const store = require('../db/store');
const auth = require('../middleware/auth');
const { validateUsername } = require('../utils/validate');

const router = express.Router();

// GET /api/users/:username - Public Outie profile with non-anonymous posts
router.get('/:username', (req, res) => {
  try {
    const targetUsername = req.params.username.trim().toLowerCase();
    const user = store.findOne('users', (u) => u.username.toLowerCase() === targetUsername);

    if (!user) return res.status(404).json({ error: 'User profile not found' });

    // Strict Privacy: Never return email, passwordHash, or innieHandle.
    // Stats count Outie content only so Innie activity can never be linked to the profile.
    const outiePosts = store.getAll('posts').filter((p) => p.author && p.author.toString() === user._id.toString() && !p.isInnie && !p.hidden);
    const outieComments = store.getAll('comments').filter((c) => c.author && c.author.toString() === user._id.toString() && !c.isInnie && !c.hidden);
    const postCount = outiePosts.length;
    const commentCount = outieComments.length;
    const floorCount = Array.isArray(user.joinedFloors) ? user.joinedFloors.length : 0;
    const totalScore = outiePosts.reduce((acc, p) => acc + (typeof p.score === 'number' ? p.score : 0), 0) +
                       outieComments.reduce((acc, c) => acc + (typeof c.score === 'number' ? c.score : 0), 0);

    const publicUser = {
      _id: user._id,
      name: user.name || '',
      username: user.username,
      avatar: user.avatar || '',
      headline: user.headline || '',
      status: user.status || 'Employed',
      bio: user.bio || '',
      postCount,
      commentCount,
      floorCount,
      score: totalScore,
      createdAt: user.createdAt
    };

    // Public post list: NEVER includes Innie posts per Part C rule
    const posts = store.getAll('posts')
      .filter((p) => p.author && p.author.toString() === user._id.toString() && !p.isInnie && !p.hidden)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map((p) => {
        let floorData = null;
        if (p.floor) {
          const f = store.findById('floors', p.floor);
          if (f) floorData = { _id: f._id, name: f.name, slug: f.slug };
        }
        return {
          _id: p._id,
          title: p.title,
          body: p.body,
          type: p.type,
          floor: floorData,
          isInnie: false,
          commentCount: p.commentCount || 0,
          reportCount: p.reportCount || 0,
          score: typeof p.score === 'number' ? p.score : 0,
          author: {
            _id: user._id,
            name: user.name || '',
            username: user.username,
            avatar: user.avatar || '',
            headline: user.headline || '',
            status: user.status || 'Employed'
          },
          createdAt: p.createdAt
        };
      });

    res.json({ user: publicUser, posts });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error fetching profile' });
  }
});

// PUT /api/users/profile - Update own Outie profile details (username, avatar, headline, bio, status)
router.put('/profile', auth, (req, res) => {
  try {
    const { name, username, avatar, headline, bio, status } = req.body;
    const allowedStatuses = ['Employed', 'Severed', 'Reintegrated'];

    const updates = {};

    if (typeof name === 'string') updates.name = name.trim();
    if (typeof username === 'string' && username.trim()) {
      const cleanUser = username.trim();
      const userErr = validateUsername(cleanUser);
      if (userErr) return res.status(400).json({ error: userErr });

      const existing = store.findOne('users', (u) => u.username.toLowerCase() === cleanUser.toLowerCase() && u._id !== req.user.id);
      if (existing) {
        return res.status(400).json({ error: 'Username is already taken' });
      }
      updates.username = cleanUser;
    }

    if (typeof avatar === 'string') updates.avatar = avatar.trim();
    if (typeof headline === 'string') updates.headline = headline.trim();
    if (typeof bio === 'string') updates.bio = bio.trim();
    if (status && allowedStatuses.includes(status)) updates.status = status;

    const updated = store.update('users', req.user.id, updates);
    if (!updated) return res.status(404).json({ error: 'User not found' });

    res.json({
      user: {
        _id: updated._id,
        name: updated.name || '',
        username: updated.username,
        avatar: updated.avatar || '',
        email: updated.email,
        headline: updated.headline,
        bio: updated.bio,
        status: updated.status,
        innieHandle: updated.innieHandle,
        joinedFloors: updated.joinedFloors,
        createdAt: updated.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error updating profile' });
  }
});

module.exports = router;

