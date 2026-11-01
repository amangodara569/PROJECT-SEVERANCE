const express = require('express');
const Layoff = require('../models/Layoff');
const Floor = require('../models/Floor');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/layoffs - List layoffs with optional company search and monthly totals
router.get('/', async (req, res) => {
  try {
    const { company } = req.query;
    const filter = company ? { company: { $regex: company.trim(), $options: 'i' } } : {};

    const layoffs = await Layoff.find(filter)
      .populate('addedBy', 'username')
      .sort({ date: -1, createdAt: -1 });

    // Calculate sum of people affected in the current calendar month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const monthlyLayoffs = await Layoff.find({
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    const severedThisMonth = monthlyLayoffs.reduce((sum, item) => sum + (item.peopleAffected || 0), 0);

    // Look up existing company floors to link
    const allFloors = await Floor.find({}, 'name slug');
    const floorMap = {};
    allFloors.forEach((f) => {
      floorMap[f.name.toLowerCase()] = f.slug;
    });

    const formatted = layoffs.map((l) => {
      const obj = l.toObject();
      obj.confirmCount = obj.confirmedBy?.length || 0;
      obj.floorSlug = floorMap[obj.company.toLowerCase()] || null;
      return obj;
    });

    res.json({ layoffs: formatted, severedThisMonth });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error fetching layoffs' });
  }
});

// POST /api/layoffs - Report a corporate workforce reduction
router.post('/', auth, async (req, res) => {
  try {
    const { company, date, peopleAffected, sourceUrl, note } = req.body;

    if (!company?.trim()) {
      return res.status(400).json({ error: 'Company name is required' });
    }

    const layoff = await Layoff.create({
      company: company.trim(),
      date: date ? new Date(date) : new Date(),
      peopleAffected: Number(peopleAffected) || 0,
      sourceUrl: sourceUrl?.trim() || '',
      note: note?.trim() || '',
      addedBy: req.user.id,
      confirmedBy: [req.user.id] // Submitter automatically confirms
    });

    res.status(201).json({ layoff });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error creating layoff report' });
  }
});

// POST /api/layoffs/:id/confirm - Confirm a layoff report to raise trust level
router.post('/:id/confirm', auth, async (req, res) => {
  try {
    const layoff = await Layoff.findById(req.params.id);
    if (!layoff) return res.status(404).json({ error: 'Report not found' });

    const userId = req.user.id;
    const alreadyConfirmed = layoff.confirmedBy.some((id) => id.toString() === userId);

    if (alreadyConfirmed) {
      return res.status(400).json({ error: 'You have already confirmed this report' });
    }

    layoff.confirmedBy.push(userId);
    await layoff.save();

    res.json({
      confirmCount: layoff.confirmedBy.length,
      isConfirmed: true
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error confirming layoff' });
  }
});

module.exports = router;

