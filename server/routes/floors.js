const express = require('express');
const jwt = require('jsonwebtoken');
const store = require('../db/store');
const { makeFloor } = require('../models/Floor');
const auth = require('../middleware/auth');
const cache = require('../cache/cache');
const env = require('../config/env');

const router = express.Router();

const makeSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
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

// Formats floor object for privacy: returns memberCount, never member IDs
const sanitizeFloorPublic = (floor, postsTodayMap = {}) => {
  const members = floor.members || [];
  return {
    _id: floor._id,
    name: floor.name,
    slug: floor.slug,
    description: floor.description || '',
    category: floor.category || 'Tech',
    postsToday: postsTodayMap[floor._id] || 0,
    memberCount: members.length,
    memberIds: members, // used internally to compute isMember after cache
    createdAt: floor.createdAt
  };
};

// GET /api/floors - List floors with sorting, category filtering, and postsToday
router.get('/', async (req, res) => {
  try {
    const { q, category, sort, limit } = req.query;

    const baseFloors = await cache.wrap('floors:list:v2', 30, async () => {
      const all = store.getAll('floors') || [];
      const allPosts = store.getAll('posts') || [];
      const now = Date.now();
      const oneDayMs = 24 * 60 * 60 * 1000;

      // Calculate postsToday per floor
      const postsTodayMap = {};
      for (const p of allPosts) {
        if (!p.hidden && p.floor && (now - new Date(p.createdAt).getTime()) <= oneDayMs) {
          const fid = p.floor.toString();
          postsTodayMap[fid] = (postsTodayMap[fid] || 0) + 1;
        }
      }

      return all.map((f) => sanitizeFloorPublic(f, postsTodayMap));
    });

    let filtered = [...baseFloors];

    if (category && category.trim()) {
      const catLower = category.trim().toLowerCase();
      filtered = filtered.filter((f) => f.category && f.category.toLowerCase() === catLower);
    }

    if (q && q.trim()) {
      const lower = q.trim().toLowerCase();
      filtered = filtered.filter((f) => f.name.toLowerCase().includes(lower) || (f.description && f.description.toLowerCase().includes(lower)));
    }

    if (sort === 'active') {
      filtered.sort((a, b) => (b.postsToday || 0) - (a.postsToday || 0) || (b.memberCount || 0) - (a.memberCount || 0));
    } else if (sort === 'members') {
      filtered.sort((a, b) => (b.memberCount || 0) - (a.memberCount || 0));
    } else {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    if (limit) {
      const max = parseInt(limit, 10);
      if (!isNaN(max) && max > 0) {
        filtered = filtered.slice(0, max);
      }
    }

    const currentUserId = getUserIdFromHeader(req);
    const sanitized = filtered.map((f) => {
      const isMember = currentUserId && Array.isArray(f.memberIds)
        ? f.memberIds.some((m) => m.toString() === currentUserId.toString())
        : false;
      const { memberIds, ...rest } = f;
      return { ...rest, isMember };
    });

    res.json({ floors: sanitized });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error fetching floors' });
  }
});

// POST /api/floors - Create a new company floor and bust floors cache
router.post('/', auth, (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Company name is required' });
    }

    const slug = makeSlug(name);
    const cleanName = name.trim();

    const existing = store.findOne('floors', (f) => f.name.toLowerCase() === cleanName.toLowerCase() || f.slug === slug);
    if (existing) {
      return res.status(400).json({ error: 'A floor for this company already exists' });
    }

    const floorObj = makeFloor({
      name: cleanName,
      slug,
      description: typeof description === 'string' ? description.trim() : '',
      members: [req.user.id],
      createdBy: req.user.id
    });

    const floor = store.insert('floors', floorObj);

    const user = store.findById('users', req.user.id);
    if (user) {
      const joined = user.joinedFloors || [];
      if (!joined.includes(floor._id)) {
        store.update('users', req.user.id, { joinedFloors: [...joined, floor._id] });
      }
    }

    cache.del('floors:list');

    res.status(201).json({
      floor: {
        _id: floor._id,
        name: floor.name,
        slug: floor.slug,
        description: floor.description || '',
        memberCount: 1,
        isMember: true,
        createdAt: floor.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error creating floor' });
  }
});

// GET /api/floors/:slug - Get single floor
router.get('/:slug', (req, res) => {
  try {
    const floor = store.findOne('floors', (f) => f.slug === req.params.slug.toLowerCase());
    if (!floor) {
      return res.status(404).json({ error: 'This floor does not exist' });
    }

    const currentUserId = getUserIdFromHeader(req);
    const members = floor.members || [];
    const isMember = currentUserId ? members.some((m) => m.toString() === currentUserId.toString()) : false;

    res.json({
      floor: {
        _id: floor._id,
        name: floor.name,
        slug: floor.slug,
        description: floor.description || '',
        memberCount: members.length,
        isMember,
        createdAt: floor.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error fetching floor' });
  }
});

// POST /api/floors/:slug/join - Join or leave floor and bust floors cache
router.post('/:slug/join', auth, (req, res) => {
  try {
    const floor = store.findOne('floors', (f) => f.slug === req.params.slug.toLowerCase());
    if (!floor) {
      return res.status(404).json({ error: 'This floor does not exist' });
    }

    const userId = req.user.id;
    let members = floor.members || [];
    const isMember = members.some((m) => m.toString() === userId.toString());
    const user = store.findById('users', userId);
    let joinedFloors = user?.joinedFloors || [];

    if (isMember) {
      members = members.filter((m) => m.toString() !== userId.toString());
      joinedFloors = joinedFloors.filter((id) => id.toString() !== floor._id.toString());
      store.update('floors', floor._id, { members });
      if (user) store.update('users', userId, { joinedFloors });
      cache.del('floors:list');
      return res.json({ joined: false, memberCount: members.length });
    } else {
      members.push(userId);
      if (!joinedFloors.includes(floor._id)) joinedFloors.push(floor._id);
      store.update('floors', floor._id, { members });
      if (user) store.update('users', userId, { joinedFloors });
      cache.del('floors:list');
      return res.json({ joined: true, memberCount: members.length });
    }
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error toggling floor membership' });
  }
});

module.exports = router;
