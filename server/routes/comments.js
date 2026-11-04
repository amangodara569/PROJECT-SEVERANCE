const express = require('express');
const jwt = require('jsonwebtoken');
const store = require('../db/store');
const { makeComment } = require('../models/Comment');
const auth = require('../middleware/auth');
const { checkContent } = require('../utils/checkPost');
const { validateComment } = require('../utils/validate');

const router = express.Router();

// Helper to format comment object with strict privacy rules
const sanitizeComment = (comment, currentUserId = null) => {
  const upCount = comment.upvotes?.length || 0;
  const downCount = comment.downvotes?.length || 0;
  const score = upCount - downCount;

  let myVote = 0;
  let isOwner = false;
  if (currentUserId) {
    const uid = currentUserId.toString();
    const isUp = (comment.upvotes || []).some((id) => id.toString() === uid);
    const isDown = (comment.downvotes || []).some((id) => id.toString() === uid);
    myVote = isUp ? 1 : isDown ? -1 : 0;
    isOwner = comment.author && comment.author.toString() === uid;
  }

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
    score,
    myVote,
    userVote: myVote,
    isOwner,
    createdAt: comment.createdAt
  };

  // Strict Privacy: Never return author (id, username, email) on Innie comments
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

// GET /api/posts/:id/comments - List comments for a post
router.get('/posts/:id/comments', (req, res) => {
  try {
    const comments = store.getAll('comments')
      .filter((c) => c.post && c.post.toString() === req.params.id.toString() && !c.hidden);

    const currentUserId = getUserIdFromHeader(req);
    const sanitized = comments
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .map((c) => sanitizeComment(c, currentUserId));

    res.json({ comments: sanitized });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error loading comments' });
  }
});

// POST /api/posts/:id/comments - Add comment (top-level or 1-level reply)
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

    // Increment post's comment count
    const commentCount = (post.commentCount || 0) + 1;
    store.update('posts', post._id, { commentCount });

    res.status(201).json({ comment: sanitizeComment(comment, req.user.id) });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error adding comment' });
  }
});

// POST /api/comments/:id/vote - Upvote or downvote comment
router.post('/comments/:id/vote', auth, (req, res) => {
  try {
    const { value } = req.body; // 1 or -1
    const comment = store.findById('comments', req.params.id);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    const userId = req.user.id.toString();
    let upvotes = (comment.upvotes || []).map((id) => id.toString());
    let downvotes = (comment.downvotes || []).map((id) => id.toString());

    if (value === 1) {
      if (upvotes.includes(userId)) {
        upvotes = upvotes.filter((id) => id !== userId);
      } else {
        upvotes.push(userId);
        downvotes = downvotes.filter((id) => id !== userId);
      }
    } else if (value === -1) {
      if (downvotes.includes(userId)) {
        downvotes = downvotes.filter((id) => id !== userId);
      } else {
        downvotes.push(userId);
        upvotes = upvotes.filter((id) => id !== userId);
      }
    }

    store.update('comments', comment._id, { upvotes, downvotes });
    const score = upvotes.length - downvotes.length;
    const myVote = upvotes.includes(userId) ? 1 : downvotes.includes(userId) ? -1 : 0;

    res.json({ score, myVote, userVote: myVote });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error voting on comment' });
  }
});

module.exports = router;
