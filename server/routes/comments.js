const express = require('express');
const jwt = require('jsonwebtoken');
const store = require('../db/store');
const { makeComment } = require('../models/Comment');
const auth = require('../middleware/auth');
const { checkContent } = require('../utils/checkPost');
const { validateComment } = require('../utils/validate');
const env = require('../config/env');

const router = express.Router();

// Sanitizes comment and protects Innie anonymity
const sanitizeCommentPublic = (comment) => {
  let innieHandle = comment.innieHandle;
  if (comment.isInnie && !innieHandle && comment.author) {
    const a = store.findById('users', comment.author);
    if (a) innieHandle = a.innieHandle;
  }

  const result = {
    _id: comment._id,
    post: comment.post,
    parent: comment.parent,
    body: comment.body,
    isInnie: Boolean(comment.isInnie),
    innieHandle: Boolean(comment.isInnie) ? (innieHandle || 'Innie-0000') : null,
    reportCount: comment.reportCount || 0,
    score: typeof comment.score === 'number' ? comment.score : 0,
    createdAt: comment.createdAt
  };

  if (!comment.isInnie && comment.author) {
    const authorUser = store.findById('users', comment.author);
    if (authorUser) {
      result.author = {
        _id: authorUser._id,
        username: authorUser.username,
        headline: authorUser.headline || '',
        status: authorUser.status || 'Employed'
      };
    }
  }

  return result;
};

const getUserIdFromHeader = (req) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const decoded = jwt.verify(authHeader.split(' ')[1], env.JWT_SECRET);
      return decoded.id;
    }
  } catch {}
  return null;
};

// GET /api/posts/:id/comments - List comments for a post
router.get('/posts/:id/comments', (req, res) => {
  try {
    const comments = store.getAll('comments')
      .filter((c) => c.post && c.post.toString() === req.params.id.toString() && !c.hidden);

    const currentUserId = getUserIdFromHeader(req);
    const commentIds = comments.map(c => c._id);
    const votesMap = store.getUserVotesMap(currentUserId, 'comment', commentIds);

    const sanitized = comments
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .map((c) => {
        const myVote = votesMap[c._id] || 0;
        const isOwner = currentUserId && !c.isInnie && c.author && c.author.toString() === currentUserId.toString();
        return {
          ...sanitizeCommentPublic(c),
          myVote,
          userVote: myVote,
          isOwner: Boolean(isOwner)
        };
      });

    res.json({ comments: sanitized });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error loading comments' });
  }
});

// POST /api/posts/:id/comments - Add comment and atomically increment post comment count
router.post('/posts/:id/comments', auth, (req, res) => {
  try {
    const { body, parentId, isInnie } = req.body;

    const validationErr = validateComment(body);
    if (validationErr) return res.status(400).json({ error: validationErr });

    const contentCheck = checkContent(body);
    if (contentCheck.blocked) {
      return res.status(400).json({
        error: contentCheck.reason,
        isBreakRoom: true
      });
    }

    const post = store.findById('posts', req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    let finalParentId = null;
    if (parentId) {
      const parentComment = store.findById('comments', parentId);
      if (parentComment) {
        finalParentId = parentComment.parent ? parentComment.parent : parentComment._id;
      }
    }

    const user = store.findById('users', req.user.id);
    const commentObj = makeComment({
      post: post._id,
      parent: finalParentId,
      body: body.trim(),
      author: req.user.id,
      isInnie: Boolean(isInnie),
      innieHandle: user ? user.innieHandle : ''
    });

    const comment = store.insert('comments', commentObj);
    store.inc('posts', post._id, 'commentCount', 1);

    const sanitized = sanitizeCommentPublic(comment);
    res.status(201).json({
      comment: {
        ...sanitized,
        myVote: 0,
        userVote: 0,
        isOwner: !isInnie
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error adding comment' });
  }
});

// POST /api/comments/:id/vote - Atomic comment vote with delta score calculation
router.post('/comments/:id/vote', auth, (req, res) => {
  try {
    const { value } = req.body;
    const comment = store.findById('comments', req.params.id);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    const result = store.castVote({
      userId: req.user.id.toString(),
      targetType: 'comment',
      targetId: req.params.id,
      value
    });

    res.json({
      score: result.score,
      myVote: result.userVote,
      userVote: result.userVote
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error voting on comment' });
  }
});

module.exports = router;
