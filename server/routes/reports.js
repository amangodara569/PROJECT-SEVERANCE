const express = require('express');
const Report = require('../models/Report');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const auth = require('../middleware/auth');

const router = express.Router();

// POST /api/reports - Report a post or comment with auto-hide at 5 reports
router.post('/', auth, async (req, res) => {
  try {
    const { targetType, targetId, reason } = req.body;

    if (!targetType || !targetId) {
      return res.status(400).json({ error: 'targetType and targetId are required' });
    }

    if (!['post', 'comment'].includes(targetType)) {
      return res.status(400).json({ error: 'Invalid targetType' });
    }

    // Check if user has already reported this item
    const existing = await Report.findOne({ targetId, reporter: req.user.id });
    if (existing) {
      return res.status(400).json({ error: 'You have already reported this item' });
    }

    // Save report
    await Report.create({
      targetType,
      targetId,
      reporter: req.user.id,
      reason: reason || 'Community guidelines violation'
    });

    // Increment target report count and auto-hide if threshold of 5 is met
    const Model = targetType === 'post' ? Post : Comment;
    const target = await Model.findById(targetId);

    if (target) {
      target.reportCount = (target.reportCount || 0) + 1;
      if (target.reportCount >= 5) {
        target.hidden = true;
      }
      await target.save();
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

