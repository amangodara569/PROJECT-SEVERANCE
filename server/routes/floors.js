const express = require('express');
const Floor = require('../models/Floor');
const User = require('../models/User');
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

// GET /api/floors - List all company floors (with optional search filter)
router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    const filter = q ? { name: { $regex: q.trim(), $options: 'i' } } : {};
    const floors = await Floor.find(filter).sort({ createdAt: -1 });

    res.json({ floors });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error fetching floors' });
  }
});

// POST /api/floors - Create a new company floor
router.post('/', auth, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Company name is required' });
    }

    const slug = makeSlug(name);

    // Check if floor with same name or slug exists
    const existing = await Floor.findOne({
      $or: [
        { name: { $regex: `^${name.trim()}$`, $options: 'i' } },
        { slug }
      ]
    });

    if (existing) {
      return res.status(400).json({ error: 'A floor for this company already exists' });
    }

    // Create floor with creator automatically joined as first member
    const floor = await Floor.create({
      name: name.trim(),
      slug,
      description: description ? description.trim() : '',
      members: [req.user.id],
      createdBy: req.user.id
    });

    // Add floor to creator's joinedFloors
    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { joinedFloors: floor._id }
    });

    res.status(201).json({ floor });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error creating floor' });
  }
});

// GET /api/floors/:slug - Get a single floor by slug
router.get('/:slug', async (req, res) => {
  try {
    const floor = await Floor.findOne({ slug: req.params.slug.toLowerCase() });
    if (!floor) {
      return res.status(404).json({ error: 'This floor does not exist' });
    }

    res.json({ floor });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error fetching floor' });
  }
});

// POST /api/floors/:slug/join - Join or leave a company floor
router.post('/:slug/join', auth, async (req, res) => {
  try {
    const floor = await Floor.findOne({ slug: req.params.slug.toLowerCase() });
    if (!floor) {
      return res.status(404).json({ error: 'This floor does not exist' });
    }

    const userId = req.user.id;
    const isMember = floor.members.some((m) => m.toString() === userId);

    if (isMember) {
      // Leave floor
      floor.members = floor.members.filter((m) => m.toString() !== userId);
      await floor.save();
      await User.findByIdAndUpdate(userId, { $pull: { joinedFloors: floor._id } });
      return res.json({ joined: false, memberCount: floor.members.length });
    } else {
      // Join floor
      floor.members.push(userId);
      await floor.save();
      await User.findByIdAndUpdate(userId, { $addToSet: { joinedFloors: floor._id } });
      return res.json({ joined: true, memberCount: floor.members.length });
    }
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error toggling floor membership' });
  }
});

module.exports = router;

