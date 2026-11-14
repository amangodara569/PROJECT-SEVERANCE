const express = require('express');
const auth = require('../middleware/auth');
const store = require('../db/store');

const router = express.Router();

// GET /api/me/saved - Retrieve all saved posts for authenticated user
router.get('/saved', auth, (req, res) => {
  try {
    const user = store.findById('users', req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const savedIds = Array.isArray(user.savedPosts) ? user.savedPosts : [];
    const posts = [];

    for (const id of savedIds) {
      const p = store.findById('posts', id);
      if (p && !p.hidden) {
        let floorData = null;
        if (p.floor) {
          const f = store.findById('floors', p.floor);
          if (f) floorData = { _id: f._id, name: f.name, slug: f.slug };
        }

        const isAnon = Boolean(p.isInnie);
        let authorData = null;
        if (!isAnon && p.author) {
          const u = store.findById('users', p.author);
          if (u) {
            authorData = {
              _id: u._id,
              username: u.username,
              headline: u.headline || '',
              status: u.status || 'Employed'
            };
          }
        }

        posts.push({
          _id: p._id,
          title: p.title,
          body: p.body,
          type: p.type,
          floor: floorData,
          isInnie: isAnon,
          innieHandle: isAnon ? (p.innieHandle || 'Innie-0000') : null,
          author: authorData,
          score: typeof p.score === 'number' ? p.score : 0,
          commentCount: p.commentCount || 0,
          pinned: Boolean(p.pinned),
          isSaved: true,
          createdAt: p.createdAt
        });
      }
    }

    res.json({ posts });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to fetch saved posts' });
  }
});

module.exports = router;