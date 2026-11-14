const express = require('express');
const store = require('../db/store');

const router = express.Router();

// GET /api/search?q= - Search posts and floors with strict innie privacy protection
router.get('/', (req, res) => {
  try {
    const q = (req.query.q || '').trim().toLowerCase();
    if (q.length < 2) {
      return res.json({ floors: [], posts: [] });
    }

    // Search floors (max 5)
    const allFloors = store.getAll('floors') || [];
    const matchedFloors = allFloors
      .filter((f) => f.name.toLowerCase().includes(q) || (f.description && f.description.toLowerCase().includes(q)))
      .slice(0, 5)
      .map((f) => ({
        _id: f._id,
        name: f.name,
        slug: f.slug,
        description: f.description || '',
        memberCount: Array.isArray(f.members) ? f.members.length : 0
      }));

    // Search posts (max 5) - Strictly never match by innie author and sanitize innie output
    const allPosts = store.getAll('posts') || [];
    const matchedPosts = allPosts
      .filter((p) => {
        if (p.hidden) return false;
        const inTitle = p.title && p.title.toLowerCase().includes(q);
        const inBody = p.body && p.body.toLowerCase().includes(q);
        return inTitle || inBody;
      })
      .slice(0, 5)
      .map((p) => {
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

        return {
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
          createdAt: p.createdAt
        };
      });

    res.json({ floors: matchedFloors, posts: matchedPosts });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Search failed' });
  }
});

module.exports = router;