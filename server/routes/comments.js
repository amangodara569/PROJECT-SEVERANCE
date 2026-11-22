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
    replyToUser: comment.replyToUser || null,
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
    const { body, parentId, parent, isInnie } = req.body;
    const targetParentId = parentId || parent;

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
    let replyToUser = null;
    if (targetParentId) {
      const parentComment = store.findById('comments', targetParentId);
      if (parentComment) {
        finalParentId = parentComment.parent ? parentComment.parent : parentComment._id;
        if (!parentComment.isInnie && parentComment.author) {
          const pUser = store.findById('users', parentComment.author);
          if (pUser) replyToUser = pUser.username;
        } else if (parentComment.isInnie) {
          replyToUser = parentComment.innieHandle;
        }
      }
    }

    const user = store.findById('users', req.user.id);
    const commentObj = makeComment({
      post: post._id,
      parent: finalParentId,
      replyToUser,
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

// Handler function for editing comment (strict role-based ownership)
const editCommentHandler = (req, res) => {
  try {
    const comment = store.findById('comments', req.params.id);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    const currentUserId = (req.user.id || req.user._id || '').toString();
    const dbUser = store.findById('users', currentUserId);
    const authorId = comment.author && typeof comment.author === 'object'
      ? (comment.author._id || comment.author.id || '').toString()
      : (comment.author ? comment.author.toString() : '');

    const isOwner = (authorId && authorId === currentUserId) ||
      (comment.isInnie && dbUser?.innieHandle && comment.innieHandle === dbUser.innieHandle) ||
      (comment.author?.username && dbUser?.username && comment.author.username === dbUser.username);

    if (!isOwner) {
      return res.status(403).json({ error: 'You are not authorized to edit this comment. Only the author can perform this action.' });
    }

    const { body } = req.body;
    if (!body || !body.trim()) {
      return res.status(400).json({ error: 'Comment body cannot be empty' });
    }

    const contentCheck = checkContent(body);
    if (contentCheck.blocked) {
      return res.status(400).json({ error: contentCheck.reason, isBreakRoom: true });
    }

    const updated = store.update('comments', req.params.id, {
      body: body.trim(),
      updatedAt: new Date().toISOString()
    });

    res.json({ success: true, comment: sanitizeCommentPublic(updated) });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error updating comment' });
  }
};

// Handler function for permanent comment deletion (strict role-based ownership)
const deleteCommentHandler = (req, res) => {
  try {
    const comment = store.findById('comments', req.params.id);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    const currentUserId = (req.user.id || req.user._id || '').toString();
    const dbUser = store.findById('users', currentUserId);
    const authorId = comment.author && typeof comment.author === 'object'
      ? (comment.author._id || comment.author.id || '').toString()
      : (comment.author ? comment.author.toString() : '');

    const isOwner = (authorId && authorId === currentUserId) ||
      (comment.isInnie && dbUser?.innieHandle && comment.innieHandle === dbUser.innieHandle) ||
      (comment.author?.username && dbUser?.username && comment.author.username === dbUser.username);

    if (!isOwner) {
      return res.status(403).json({ error: 'You are not authorized to delete this comment. Only the author can perform this action.' });
    }

    // Decrement parent post comment count
    if (comment.post) {
      store.inc('posts', comment.post, 'commentCount', -1);
    }

    // Recursively delete child replies if any and decrement count
    const allComments = store.getAll('comments');
    const childReplies = allComments.filter((c) => c.parent && c.parent.toString() === comment._id.toString());
    for (const child of childReplies) {
      store.remove('comments', child._id);
      if (comment.post) {
        store.inc('posts', comment.post, 'commentCount', -1);
      }
    }

    // Delete the comment itself from store and sync deletion to Atlas
    store.remove('comments', comment._id);

    res.json({ success: true, message: 'Comment permanently deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error deleting comment' });
  }
};

// PUT /api/comments/:id and PUT /api/posts/:postId/comments/:id
router.put('/comments/:id', auth, editCommentHandler);
router.put('/posts/:postId/comments/:id', auth, editCommentHandler);

// DELETE /api/comments/:id and DELETE /api/posts/:postId/comments/:id
router.delete('/comments/:id', auth, deleteCommentHandler);
router.delete('/posts/:postId/comments/:id', auth, deleteCommentHandler);

module.exports = router;
