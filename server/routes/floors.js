const express = require('express');
const jwt = require('jsonwebtoken');
const store = require('../db/store');
const { makeFloor } = require('../models/Floor');
const auth = require('../middleware/auth');

const router = express.Router();

// Helper to generate a URL-safe slug from company name
const makeSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
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

// Formats floor object for privacy: returns memberCount and isMember, never member IDs
const sanitizeFloor = (floor, currentUserId = null) => {
  const members = floor.members || [];
  const isMember = currentUserId ? members.some((m) => m.toString() === currentUserId.toString()) : false;
  return {
    _id: floor._id,
    name: floor.name,
    slug: floor.slug,
    description: floor.description || '',
    memberCount: members.length,
    isMember,
    createdAt: floor.createdAt
  };
};

// GET /api/floors - List all company floors (with optional search filter)
router.get('/', (req, res) => {
  try {
    const { q } = req.query;
    let floors = store.getAll('floors');
    if (q) {
      const lower = q.trim().toLowerCase();
      floors = floors.filter((f) => f.name.toLowerCase().includes(lower));
    }

    const currentUserId = getUserIdFromHeader(req);
    const sanitized = floors
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map((f) => sanitizeFloor(f, currentUserId));

    res.json({ floors: sanitized });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error fetching floors' });
  }
});

// POST /api/floors - Create a new company floor
router.post('/', auth, (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Company name is required' });
    }

    const slug = makeSlug(name);
    const cleanName = name.trim();

    // Check if floor exists
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

    // Update creator's joinedFloors
    const user = store.findById('users', req.user.id);
    if (user) {
      const joined = user.joinedFloors || [];
      if (!joined.includes(floor._id)) {
        store.update('users', req.user.id, { joinedFloors: [...joined, floor._id] });
      }
    }

    res.status(201).json({ floor: sanitizeFloor(floor, req.user.id) });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error creating floor' });
  }
});

// GET /api/floors/:slug - Get a single floor by slug
router.get('/:slug', (req, res) => {
  try {
    const floor = store.findOne('floors', (f) => f.slug === req.params.slug.toLowerCase());
    if (!floor) {
      return res.status(404).json({ error: 'This floor does not exist' });
    }

    const currentUserId = getUserIdFromHeader(req);
    res.json({ floor: sanitizeFloor(floor, currentUserId) });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error fetching floor' });
  }
});

// POST /api/floors/:slug/join - Join or leave a company floor
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
      return res.json({ joined: false, memberCount: members.length });
    } else {
      members.push(userId);
      if (!joinedFloors.includes(floor._id)) joinedFloors.push(floor._id);
      store.update('floors', floor._id, { members });
      if (user) store.update('users', userId, { joinedFloors });
      return res.json({ joined: true, memberCount: members.length });
    }
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error toggling floor membership' });
  }
});

module.exports = router;
