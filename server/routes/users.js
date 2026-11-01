const express = require('express');
const User = require('../models/User');
const Post = require('../models/Post');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/users/:username - Public Outie profile with non-anonymous posts
router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username.trim() })
      .select('-passwordHash -innieHandle'); // Strict privacy: do not link Outie to Innie handle

    if (!user) return res.status(404).json({ error: 'User profile not found' });

    // Fetch user's non-anonymous posts only
    const posts = await Post.find({
      author: user._id,
      isInnie: false,
      hidden: { $ne: true }
    })
      .populate('floor', 'name slug')
      .populate('author', 'username headline status')
      .sort({ createdAt: -1 });

    const formattedPosts = posts.map((p) => {
      const obj = p.toObject();
      obj.score = (obj.upvotes?.length || 0) - (obj.downvotes?.length || 0);
      return obj;
    });

    res.json({ user, posts: formattedPosts });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error fetching profile' });
  }
});

// PUT /api/users/profile - Update own Outie profile details
router.put('/profile', auth, async (req, res) => {
  try {
    const { headline, bio, status } = req.body;
    const allowedStatuses = ['Employed', 'Severed', 'Reintegrated'];

    const updates = {};
    if (headline !== undefined) updates.headline = headline.trim();
    if (bio !== undefined) updates.bio = bio.trim();
    if (status && allowedStatuses.includes(status)) updates.status = status;

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true })
      .select('-passwordHash');

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error updating profile' });
  }
});

module.exports = router;

