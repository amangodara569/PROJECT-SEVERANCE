const express = require('express');
const store = require('../db/store');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/admin');

const router = express.Router();

// Apply auth and adminOnly middleware to all admin routes
router.use(auth);
router.use(adminOnly);

// GET /api/admin/reports - Fetch all reported and auto-hidden transmissions
router.get('/reports', (req, res) => {
  try {
    const allReports = store.getAll('reports') || [];

    // Find all reported or hidden posts
    const reportedPosts = store.getAll('posts')
      .filter((p) => (p.reportCount && p.reportCount > 0) || p.hidden)
      .map((p) => {
        let authorDisplay = p.innieHandle || 'Innie-0000';
        if (!p.isInnie && p.author) {
          const u = store.findById('users', p.author);
          if (u) authorDisplay = `@${u.username}`;
        }

        let floorName = 'General';
        if (p.floor) {
          const f = store.findById('floors', p.floor);
          if (f) floorName = f.name;
        }

        const itemReports = allReports.filter((r) => r.targetId === p._id);
        const reasons = itemReports.map((r) => r.reason).filter(Boolean);

        return {
          _id: p._id,
          targetType: 'post',
          title: p.title,
          body: p.body,
          type: p.type,
          floorName,
          authorDisplay,
          isInnie: Boolean(p.isInnie),
          reportCount: p.reportCount || itemReports.length,
          hidden: Boolean(p.hidden),
          reasons: reasons.length > 0 ? reasons : ['Flagged by community'],
          createdAt: p.createdAt
        };
      });

    // Find all reported or hidden comments
    const reportedComments = store.getAll('comments')
      .filter((c) => (c.reportCount && c.reportCount > 0) || c.hidden)
      .map((c) => {
        let authorDisplay = c.innieHandle || 'Innie-0000';
        if (!c.isInnie && c.author) {
          const u = store.findById('users', c.author);
          if (u) authorDisplay = `@${u.username}`;
        }

        let parentPostTitle = 'Associated Post';
        if (c.post) {
          const p = store.findById('posts', c.post);
          if (p) parentPostTitle = p.title;
        }

        const itemReports = allReports.filter((r) => r.targetId === c._id);
        const reasons = itemReports.map((r) => r.reason).filter(Boolean);

        return {
          _id: c._id,
          targetType: 'comment',
          title: `Comment on: "${parentPostTitle}"`,
          body: c.body,
          authorDisplay,
          isInnie: Boolean(c.isInnie),
          reportCount: c.reportCount || itemReports.length,
          hidden: Boolean(c.hidden),
          reasons: reasons.length > 0 ? reasons : ['Flagged by community'],
          createdAt: c.createdAt
        };
      });

    const queue = [...reportedPosts, ...reportedComments].sort(
      (a, b) => (b.reportCount || 0) - (a.reportCount || 0)
    );

    res.json({ queue, count: queue.length });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Error loading review queue' });
  }
});

// POST /api/admin/reports/:targetType/:targetId/dismiss - Dismiss reports and unhide item
router.post('/reports/:targetType/:targetId/dismiss', (req, res) => {
  try {
    const { targetType, targetId } = req.params;
    const collection = targetType === 'post' ? 'posts' : 'comments';

    const item = store.findById(collection, targetId);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Reset report count and restore visibility
    store.update(collection, targetId, { reportCount: 0, hidden: false });

    // Clean up report records associated with this item
    const reports = store.getAll('reports') || [];
    reports.forEach((r) => {
      if (r.targetId === targetId) {
        store.remove('reports', r._id);
      }
    });

    res.json({ message: 'Reports dismissed, transmission restored to public feed', targetId });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Error dismissing reports' });
  }
});

// POST /api/admin/reports/:targetType/:targetId/remove - Permanently delete flagged item
router.post('/reports/:targetType/:targetId/remove', (req, res) => {
  try {
    const { targetType, targetId } = req.params;
    const collection = targetType === 'post' ? 'posts' : 'comments';

    const item = store.findById(collection, targetId);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // If removing post, also remove its associated comments
    if (targetType === 'post') {
      const comments = store.getAll('comments') || [];
      comments.forEach((c) => {
        if (c.post && c.post.toString() === targetId.toString()) {
          store.remove('comments', c._id);
        }
      });
    }

    // Delete target item from store
    store.remove(collection, targetId);

    // Delete associated reports
    const reports = store.getAll('reports') || [];
    reports.forEach((r) => {
      if (r.targetId === targetId) {
        store.remove('reports', r._id);
      }
    });

    res.json({ message: 'Transmission permanently severed from system', targetId });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Error deleting transmission' });
  }
});

module.exports = router;

