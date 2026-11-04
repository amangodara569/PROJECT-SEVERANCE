const express = require('express');
const store = require('../db/store');
const { makeReport } = require('../models/Report');
const auth = require('../middleware/auth');

const router = express.Router();

// POST /api/reports - Report a post or comment with auto-hide at 5 reports
router.post('/', auth, (req, res) => {
  try {
    const { targetType, targetId, reason } = req.body;

    if (!targetType || !targetId) {
      return res.status(400).json({ error: 'targetType and targetId are required' });
    }

    if (!['post', 'comment'].includes(targetType)) {
      return res.status(400).json({ error: 'Invalid targetType' });
    }

    const tid = targetId.toString();
    const uid = req.user.id.toString();

    // Check if user already reported this item
    const existing = store.findOne('reports', (r) => r.targetId.toString() === tid && r.reporter.toString() === uid);
    if (existing) {
      return res.status(400).json({ error: 'You have already reported this item' });
    }

    const reportObj = makeReport({
      targetType,
      targetId: tid,
      reporter: uid,
      reason: typeof reason === 'string' && reason.trim() ? reason.trim() : 'Community guidelines violation'
    });

    store.insert('reports', reportObj);

    // Increment target reportCount and auto-hide if threshold of 5 is met
    const collectionName = targetType === 'post' ? 'posts' : 'comments';
    const target = store.findById(collectionName, tid);
    if (target) {
      const count = (target.reportCount || 0) + 1;
      const changes = { reportCount: count };
      if (count >= 5) {
        changes.hidden = true;
      }
      store.update(collectionName, tid, changes);
    }

    res.status(201).json({
      success: true,
      message: 'Report recorded. Please enjoy all facts equally.'
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error creating report' });
  }
});

module.exports = router;
