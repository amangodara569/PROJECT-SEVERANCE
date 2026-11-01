const express = require('express');
const jwt = require('jsonwebtoken');
const Post = require('../models/Post');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { checkContent } = require('../utils/checkPost');

const router = express.Router();

// Helper to sanitize post object and hide real author if posted in Innie mode
const sanitizePost = (post, currentUserId = null) => {
  const obj = post.toObject ? post.toObject() : { ...post };
  const upCount = obj.upvotes?.length || 0;
  const downCount = obj.downvotes?.length || 0;
  obj.score = upCount - downCount;

  // Determine current user's vote state
  if (currentUserId) {
    const isUp = obj.upvotes?.some((id) => id.toString() === currentUserId.toString());
    const isDown = obj.downvotes?.some((id) => id.toString() === currentUserId.toString());
    obj.userVote = isUp ? 1 : isDown ? -1 : 0;
    obj.isOwner = obj.author?._id?.toString() === currentUserId.toString() || obj.author?.toString() === currentUserId.toString();
  } else {
    obj.userVote = 0;
    obj.isOwner = false;
  }

  // Strict Privacy: Never send real author ID or username for Innie posts
  if (obj.isInnie) {
    delete obj.author;
  }

  delete obj.upvotes;
  delete obj.downvotes;
  return obj;
};

// Optional auth helper to read token without blocking unauthenticated requests
const getUserIdFromHeader = (req) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
      return decoded.id;
    }
  } catch (e) {
    // Ignore invalid tokens on public reads
  }
  return null;
};

// GET /api/posts - Feed of posts with floor and sort filters
router.get('/', async (req, res) => {
  try {
    const { floor, sort } = req.query;
    const filter = { hidden: { $ne: true } };
    if (floor) filter.floor = floor;

    let posts = await Post.find(filter)
      .populate('floor', 'name slug')
      .populate('author', 'username headline status')
      .sort({ createdAt: -1 });

    const currentUserId = getUserIdFromHeader(req);
    let sanitized = posts.map((p) => sanitizePost(p, currentUserId));

    // Sort by Top score if requested
    if (sort === 'top') {
      sanitized.sort((a, b) => b.score - a.score);
    }

    res.json({ posts: sanitized });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error loading posts' });
  }
});

// POST /api/posts - Create a new post (Outie or Innie)
router.post('/', auth, async (req, res) => {
  try {
    const { title, body, type, floor, isInnie } = req.body;
    if (!title?.trim() || !body?.trim()) {
      return res.status(400).json({ error: 'Title and body are required' });
    }

    // Doxx check: Block phone numbers and email addresses
    const contentCheck = checkContent(title, body);
    if (contentCheck.blocked) {
      return res.status(400).json({
        error: contentCheck.reason,
        isBreakRoom: true
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const post = await Post.create({
      title: title.trim(),
      body: body.trim(),
      type: type || 'vent',
      floor: floor || null,
      author: req.user.id,
      isInnie: Boolean(isInnie),
      innieHandle: user.innieHandle
    });

    // When a user shares a hired post, automatically update their status to Reintegrated
    if (type === 'hired') {
      await User.findByIdAndUpdate(req.user.id, { status: 'Reintegrated' });
    }

    await post.populate('floor', 'name slug');
    await post.populate('author', 'username headline status');

    res.status(201).json({ post: sanitizePost(post, req.user.id) });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error creating post' });
  }
});

// GET /api/posts/:id - Single post details
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('floor', 'name slug')
      .populate('author', 'username headline status');

    if (!post || post.hidden) return res.status(404).json({ error: 'Post not found' });

    const currentUserId = getUserIdFromHeader(req);
    res.json({ post: sanitizePost(post, currentUserId) });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error loading post' });
  }
});

// POST /api/posts/:id/vote - Cast, switch, or remove upvote/downvote
router.post('/:id/vote', auth, async (req, res) => {
  try {
    const { value } = req.body; // 1 or -1
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const userId = req.user.id;
    const isUp = post.upvotes.some((id) => id.toString() === userId);
    const isDown = post.downvotes.some((id) => id.toString() === userId);

    if (value === 1) {
      if (isUp) {
        post.upvotes = post.upvotes.filter((id) => id.toString() !== userId);
      } else {
        post.upvotes.push(userId);
        post.downvotes = post.downvotes.filter((id) => id.toString() !== userId);
      }
    } else if (value === -1) {
      if (isDown) {
        post.downvotes = post.downvotes.filter((id) => id.toString() !== userId);
      } else {
        post.downvotes.push(userId);
        post.upvotes = post.upvotes.filter((id) => id.toString() !== userId);
      }
    }

    await post.save();
    const upCount = post.upvotes.length;
    const downCount = post.downvotes.length;
    const score = upCount - downCount;
    const userVote = post.upvotes.some((id) => id.toString() === userId) ? 1 : post.downvotes.some((id) => id.toString() === userId) ? -1 : 0;

    res.json({ score, userVote });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error voting on post' });
  }
});

// DELETE /api/posts/:id - Delete post (author only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete your own posts' });
    }

    await post.deleteOne();
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error deleting post' });
  }
});

module.exports = router;

