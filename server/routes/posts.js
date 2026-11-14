const express = require('express');
const jwt = require('jsonwebtoken');
const store = require('../db/store');
const { makePost } = require('../models/Post');
const auth = require('../middleware/auth');
const { checkContent } = require('../utils/checkPost');
const { validatePost } = require('../utils/validate');
const cache = require('../cache/cache');
const env = require('../config/env');

const router = express.Router();

// Encodes next pagination cursor from item
const encodeCursor = (item, sort) => {
  if (!item) return null;
  const payload = sort === 'top'
    ? { score: item.score, id: item._id }
    : { createdAt: item.createdAt, id: item._id };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
};

// Decodes cursor from base64 string
const decodeCursor = (cursorStr) => {
  if (!cursorStr) return null;
  try {
    return JSON.parse(Buffer.from(cursorStr, 'base64').toString('utf8'));
  } catch {
    return null;
  }
};

// Sanitizes post for public delivery, strictly removing author identity on Innie posts
const sanitizePostPublic = (post) => {
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
    score: typeof post.score === 'number' ? post.score : 0,
    pinned: Boolean(post.pinned),
    createdAt: post.createdAt
  };

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

// Extracts user ID from authorization bearer header without failing unauthenticated requests
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

// GET /api/posts - Feed with cursor pagination and shared public caching
router.get('/', async (req, res) => {
  try {
    const { floor, cursor } = req.query;
    const sort = req.query.sort === 'top' ? 'top' : 'new';
    const timeFilter = (req.query.time || req.query.t || 'all').toLowerCase();
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 50);

    let floorId = 'all';
    if (floor) {
      const matchedFloor = store.findOne('floors', (f) => f._id === floor || f.slug === floor);
      floorId = matchedFloor ? matchedFloor._id : floor;
    }

    const floorVer = cache.getFloorVersion(floorId);
    const cacheKey = `feed:${floorId}:${sort}:${timeFilter}:${floorVer}:${cursor || 'start'}:${limit}`;

    // Note: Cached public feed allows score changes up to 20 seconds old for high throughput
    const pageData = await cache.wrap(cacheKey, 20, async () => {
      let posts = store.getAll('posts').filter((p) => !p.hidden);

      if (floorId !== 'all') {
        posts = posts.filter((p) => p.floor && p.floor.toString() === floorId.toString());
      }

      if (timeFilter !== 'all') {
        const now = Date.now();
        const windowMs = timeFilter === 'today' || timeFilter === 'day'
          ? 24 * 60 * 60 * 1000
          : timeFilter === 'week'
            ? 7 * 24 * 60 * 60 * 1000
            : 30 * 24 * 60 * 60 * 1000;
        posts = posts.filter((p) => (now - new Date(p.createdAt).getTime()) <= windowMs);
      }

      if (sort === 'top') {
        posts.sort((a, b) => (b.score || 0) - (a.score || 0) || b._id.localeCompare(a._id));
      } else {
        // Pinned posts come first in the All tab
        posts.sort((a, b) => {
          if (floorId === 'all' && Boolean(b.pinned) !== Boolean(a.pinned)) {
            return b.pinned ? 1 : -1;
          }
          return new Date(b.createdAt) - new Date(a.createdAt) || b._id.localeCompare(a._id);
        });
      }

      const decoded = decodeCursor(cursor);
      if (decoded) {
        if (sort === 'top') {
          posts = posts.filter((p) => {
            const pScore = p.score || 0;
            if (pScore < decoded.score) return true;
            if (pScore === decoded.score) return p._id.localeCompare(decoded.id) > 0;
            return false;
          });
        } else {
          const targetTime = new Date(decoded.createdAt).getTime();
          posts = posts.filter((p) => {
            const pTime = new Date(p.createdAt).getTime();
            if (pTime < targetTime) return true;
            if (pTime === targetTime) return p._id.localeCompare(decoded.id) > 0;
            return false;
          });
        }
      }

      const slice = posts.slice(0, limit);
      const nextItem = posts[limit] ? slice[slice.length - 1] : null;
      const nextCursor = nextItem ? encodeCursor(nextItem, sort) : null;

      const items = slice.map(sanitizePostPublic);
      return { items, nextCursor };
    });

    const currentUserId = getUserIdFromHeader(req);
    const postIds = pageData.items.map((p) => p._id);
    const votesMap = store.getUserVotesMap(currentUserId, 'post', postIds);

    let savedIds = [];
    if (currentUserId) {
      const u = store.findById('users', currentUserId);
      if (u && Array.isArray(u.savedPosts)) savedIds = u.savedPosts;
    }

    const enrichedItems = pageData.items.map((post) => {
      const myVote = votesMap[post._id] || 0;
      const isOwner = currentUserId && !post.isInnie && post.author && post.author._id === currentUserId;
      return {
        ...post,
        myVote,
        userVote: myVote,
        isOwner: Boolean(isOwner),
        isSaved: savedIds.includes(post._id)
      };
    });

    res.json({
      posts: enrichedItems,
      items: enrichedItems,
      nextCursor: pageData.nextCursor
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error loading posts' });
  }
});

// POST /api/posts - Create post with anti-doxxing check
router.post('/', auth, (req, res) => {
  try {
    const { title, body, type, floor, isInnie } = req.body;

    const validationErr = validatePost(title, body);
    if (validationErr) return res.status(400).json({ error: validationErr });

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

    cache.bumpFloorVersion(floor || 'all');
    cache.bumpFloorVersion('all');

    const sanitized = sanitizePostPublic(post);
    res.status(201).json({ post: { ...sanitized, myVote: 0, userVote: 0, isOwner: !isInnie } });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error creating post' });
  }
});

// GET /api/posts/trending - Top 3 posts of the last 24 hours (privacy strictly preserved)
router.get('/trending', async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 3, 1), 10);
    const now = Date.now();
    const windowMs = 24 * 60 * 60 * 1000;
    const posts = store.getAll('posts')
      .filter((p) => !p.hidden && (now - new Date(p.createdAt).getTime()) <= windowMs)
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, limit)
      .map(sanitizePostPublic);

    res.json({ posts });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to fetch trending posts' });
  }
});

// POST /api/posts/:id/save - Toggle bookmark save on a post
router.post('/:id/save', auth, (req, res) => {
  try {
    const user = store.findById('users', req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const postId = req.params.id;
    const saved = Array.isArray(user.savedPosts) ? [...user.savedPosts] : [];
    const index = saved.indexOf(postId);
    let isSaved = false;

    if (index > -1) {
      saved.splice(index, 1);
      isSaved = false;
    } else {
      saved.push(postId);
      isSaved = true;
    }

    store.update('users', req.user.id, { savedPosts: saved });
    res.json({ isSaved, savedCount: saved.length });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to toggle save' });
  }
});

// GET /api/posts/:id - Single post view with cache
router.get('/:id', async (req, res) => {
  try {
    const cachedPost = await cache.wrap(`post:${req.params.id}`, 20, async () => {
      const p = store.findById('posts', req.params.id);
      if (!p || p.hidden) return null;
      return sanitizePostPublic(p);
    });

    if (!cachedPost) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const currentUserId = getUserIdFromHeader(req);
    const votesMap = store.getUserVotesMap(currentUserId, 'post', [cachedPost._id]);
    const myVote = votesMap[cachedPost._id] || 0;
    const isOwner = currentUserId && !cachedPost.isInnie && cachedPost.author && cachedPost.author._id === currentUserId;

    res.json({
      post: {
        ...cachedPost,
        myVote,
        userVote: myVote,
        isOwner: Boolean(isOwner)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error loading post' });
  }
});

// POST /api/posts/:id/vote - Atomic vote with delta score update
router.post('/:id/vote', auth, (req, res) => {
  try {
    const { value } = req.body;
    const post = store.findById('posts', req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const result = store.castVote({
      userId: req.user.id.toString(),
      targetType: 'post',
      targetId: req.params.id,
      value
    });

    res.json({
      score: result.score,
      myVote: result.userVote,
      userVote: result.userVote
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error voting on post' });
  }
});

// DELETE /api/posts/:id - Delete own post and invalidate cache
router.delete('/:id', auth, (req, res) => {
  try {
    const post = store.findById('posts', req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    if (post.author && post.author.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: 'You can only delete your own posts' });
    }

    store.remove('posts', req.params.id);
    cache.del(`post:${req.params.id}`);
    cache.bumpFloorVersion(post.floor || 'all');
    cache.bumpFloorVersion('all');

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error deleting post' });
  }
});

module.exports = router;
