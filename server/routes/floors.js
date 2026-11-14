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
const sanitizeFloorPublic = (floor) => {
  const members = floor.members || [];
  return {
    _id: floor._id,
    name: floor.name,
    slug: floor.slug,
    description: floor.description || '',
    memberCount: members.length,
    memberIds: members, // used internally to compute isMember after cache
    createdAt: floor.createdAt
  };
};

// GET /api/floors - List floors with 60s cache
router.get('/', async (req, res) => {
  try {
    const { q } = req.query;

    const baseFloors = await cache.wrap('floors:list', 60, async () => {
      const all = store.getAll('floors');
      return all
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map(sanitizeFloorPublic);
    });

    let filtered = baseFloors;
    if (q) {
      const lower = q.trim().toLowerCase();
      filtered = baseFloors.filter((f) => f.name.toLowerCase().includes(lower));
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
