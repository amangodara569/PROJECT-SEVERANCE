const express = require('express');
const jwt = require('jsonwebtoken');
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { checkContent } = require('../utils/checkPost');

const router = express.Router();

// Helper to sanitize comment object and hide author if Innie mode
const sanitizeComment = (comment, currentUserId = null) => {
  const obj = comment.toObject ? comment.toObject() : { ...comment };
  const upCount = obj.upvotes?.length || 0;
  const downCount = obj.downvotes?.length || 0;
  obj.score = upCount - downCount;

  if (currentUserId) {
    const isUp = obj.upvotes?.some((id) => id.toString() === currentUserId.toString());
    const isDown = obj.downvotes?.some((id) => id.toString() === currentUserId.toString());
    obj.userVote = isUp ? 1 : isDown ? -1 : 0;
    obj.isOwner = obj.author?._id?.toString() === currentUserId.toString() || obj.author?.toString() === currentUserId.toString();
  } else {
    obj.userVote = 0;
    obj.isOwner = false;
  }

  // Strict Privacy: Never send author details for Innie comments
  if (obj.isInnie) {
    delete obj.author;
  }

  delete obj.upvotes;
  delete obj.downvotes;
  return obj;
};

// Optional token extractor
const getUserIdFromHeader = (req) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
      return decoded.id;
    }
  } catch (e) {}
  return null;
};

// GET /api/posts/:id/comments - List comments for a specific post
router.get('/posts/:id/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.id, hidden: { $ne: true } })
      .populate('author', 'username status headline')
      .sort({ createdAt: 1 });

    const currentUserId = getUserIdFromHeader(req);
    const sanitized = comments.map((c) => sanitizeComment(c, currentUserId));

    res.json({ comments: sanitized });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error loading comments' });
  }
});

// POST /api/posts/:id/comments - Add a top-level comment or 1-level reply
router.post('/posts/:id/comments', auth, async (req, res) => {
  try {
    const { body, parentId, isInnie } = req.body;
    if (!body?.trim()) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    // Doxx check: Block phone numbers and emails
    const contentCheck = checkContent(body);
    if (contentCheck.blocked) {
      return res.status(400).json({
        error: contentCheck.reason,
        isBreakRoom: true
      });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    let finalParentId = null;
    // Enforce 1 level of replies: attach reply to the root parent comment
    if (parentId) {
      const parentComment = await Comment.findById(parentId);
      if (parentComment) {
        finalParentId = parentComment.parent ? parentComment.parent : parentComment._id;
      }
    }

    const user = await User.findById(req.user.id);
    const comment = await Comment.create({
      post: post._id,
      parent: finalParentId,
      body: body.trim(),
      author: req.user.id,
      isInnie: Boolean(isInnie),
      innieHandle: user.innieHandle
    });

    // Increment post's comment count
    post.commentCount = (post.commentCount || 0) + 1;
    await post.save();

    await comment.populate('author', 'username status headline');

    res.status(201).json({ comment: sanitizeComment(comment, req.user.id) });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error adding comment' });
  }
});

// POST /api/comments/:id/vote - Upvote or downvote a comment
router.post('/comments/:id/vote', auth, async (req, res) => {
  try {
    const { value } = req.body; // 1 or -1
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    const userId = req.user.id;
    const isUp = comment.upvotes.some((id) => id.toString() === userId);
    const isDown = comment.downvotes.some((id) => id.toString() === userId);

    if (value === 1) {
      if (isUp) {
        comment.upvotes = comment.upvotes.filter((id) => id.toString() !== userId);
      } else {
        comment.upvotes.push(userId);
        comment.downvotes = comment.downvotes.filter((id) => id.toString() !== userId);
      }
    } else if (value === -1) {
      if (isDown) {
        comment.downvotes = comment.downvotes.filter((id) => id.toString() !== userId);
      } else {
        comment.downvotes.push(userId);
        comment.upvotes = comment.upvotes.filter((id) => id.toString() !== userId);
      }
    }

    await comment.save();
    const upCount = comment.upvotes.length;
    const downCount = comment.downvotes.length;
    const score = upCount - downCount;
    const userVote = comment.upvotes.some((id) => id.toString() === userId) ? 1 : comment.downvotes.some((id) => id.toString() === userId) ? -1 : 0;

    res.json({ score, userVote });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error voting on comment' });
  }
});

module.exports = router;

