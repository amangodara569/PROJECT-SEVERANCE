const express = require('express');
const jwt = require('jsonwebtoken');
const store = require('../db/store');
const { makePost } = require('../models/Post');
const auth = require('../middleware/auth');
const { checkContent } = require('../utils/checkPost');
const { validatePost } = require('../utils/validate');

const router = express.Router();

// Helper to format post with populated floor/author and strict privacy rules
const sanitizePost = (post, currentUserId = null) => {
  const upCount = post.upvotes?.length || 0;
  const downCount = post.downvotes?.length || 0;
  const score = upCount - downCount;

  let myVote = 0;
  let isOwner = false;
  if (currentUserId) {
    const uid = currentUserId.toString();
    const isUp = (post.upvotes || []).some((id) => id.toString() === uid);
    const isDown = (post.downvotes || []).some((id) => id.toString() === uid);
    myVote = isUp ? 1 : isDown ? -1 : 0;
    isOwner = post.author && post.author.toString() === uid;
  }

  // Populate floor details
  let floorData = null;
  if (post.floor) {
    const f = store.findById('floors', post.floor);
    if (f) floorData = { _id: f._id, name: f.name, slug: f.slug };
  }

  let innieHandle = post.innieHandle;
  if (post.isInnie && !innieHandle && post.author) {
    const a = store.findById('users', post.author);
    if (a) innieHandle = a.innieHandle;
  }

  const result = {
    _id: post._id,
    title: post.title,
    body: post.body,
    type: post.type,
    floor: floorData,
    isInnie: Boolean(post.isInnie),
    innieHandle: Boolean(post.isInnie) ? (innieHandle || 'Innie-0000') : null,
    commentCount: post.commentCount || 0,
    reportCount: post.reportCount || 0,
    score,
    myVote,
    userVote: myVote,
    isOwner,
    createdAt: post.createdAt
  };

  // Strict Privacy: Never return author (id, username, email) for Innie posts
  if (!post.isInnie && post.author) {
    const authorUser = store.findById('users', post.author);
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

// GET /api/posts - Feed of posts with optional floor and sorting
router.get('/', (req, res) => {
  try {
    const { floor, sort } = req.query;
    let posts = store.getAll('posts').filter((p) => !p.hidden);

    if (floor) {
      // Filter by floor ID or slug
      const matchedFloor = store.findOne('floors', (f) => f._id === floor || f.slug === floor);
      const floorId = matchedFloor ? matchedFloor._id : floor;
      posts = posts.filter((p) => p.floor && p.floor.toString() === floorId.toString());
    }

    const currentUserId = getUserIdFromHeader(req);
    let sanitized = posts.map((p) => sanitizePost(p, currentUserId));

    if (sort === 'top') {
      sanitized.sort((a, b) => b.score - a.score);
    } else {
      sanitized.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    res.json({ posts: sanitized });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error loading posts' });
  }
});

// POST /api/posts - Create a new post (Outie or Innie)
router.post('/', auth, (req, res) => {
  try {
    const { title, body, type, floor, isInnie } = req.body;

    const validationErr = validatePost(title, body);
    if (validationErr) return res.status(400).json({ error: validationErr });

    // Doxx check: Block phone numbers and emails
    const contentCheck = checkContent(title, body);
    if (contentCheck.blocked) {
      return res.status(400).json({
        error: contentCheck.reason,
        isBreakRoom: true
      });
    }

    const user = store.findById('users', req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const postObj = makePost({
      title: title.trim(),
      body: body.trim(),
      type: type || 'vent',
      floor: floor || null,
      author: req.user.id,
      isInnie: Boolean(isInnie),
      innieHandle: user.innieHandle
    });

    const post = store.insert('posts', postObj);

    if (type === 'hired') {
      store.update('users', req.user.id, { status: 'Reintegrated' });
    }

    res.status(201).json({ post: sanitizePost(post, req.user.id) });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error creating post' });
  }
});

// GET /api/posts/:id - Single post view
router.get('/:id', (req, res) => {
  try {
    const post = store.findById('posts', req.params.id);
    if (!post || post.hidden) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const currentUserId = getUserIdFromHeader(req);
    res.json({ post: sanitizePost(post, currentUserId) });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error loading post' });
  }
});

// POST /api/posts/:id/vote - Upvote or downvote post
router.post('/:id/vote', auth, (req, res) => {
  try {
    const { value } = req.body; // 1 or -1
    const post = store.findById('posts', req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const userId = req.user.id.toString();
    let upvotes = (post.upvotes || []).map((id) => id.toString());
    let downvotes = (post.downvotes || []).map((id) => id.toString());

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

    store.update('posts', post._id, { upvotes, downvotes });
    const score = upvotes.length - downvotes.length;
    const myVote = upvotes.includes(userId) ? 1 : downvotes.includes(userId) ? -1 : 0;

    res.json({ score, myVote, userVote: myVote });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error voting on post' });
  }
});

// DELETE /api/posts/:id - Delete own post
router.delete('/:id', auth, (req, res) => {
  try {
    const post = store.findById('posts', req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    if (post.author.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: 'You can only delete your own posts' });
    }

    store.remove('posts', req.params.id);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error deleting post' });
  }
});

module.exports = router;
