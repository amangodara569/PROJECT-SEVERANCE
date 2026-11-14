const express = require('express');
const store = require('../db/store');
const { makeReport } = require('../models/Report');
const auth = require('../middleware/auth');
const cache = require('../cache/cache');

const router = express.Router();

// POST /api/reports - Report item and conditionally auto-hide at 5 reports
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

    // Atomically increment report count and auto-hide if threshold is met
    const collectionName = targetType === 'post' ? 'posts' : 'comments';
    const updated = store.inc(collectionName, tid, 'reportCount', 1);

    if (updated && updated.reportCount >= 5 && !updated.hidden) {
      store.update(collectionName, tid, { hidden: true });
      if (targetType === 'post') {
        cache.del(`post:${tid}`);
        cache.bumpFloorVersion(updated.floor || 'all');
        cache.bumpFloorVersion('all');
      }
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
