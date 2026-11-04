const express = require('express');
const jwt = require('jsonwebtoken');
const store = require('../db/store');
const { makeLayoff } = require('../models/Layoff');
const auth = require('../middleware/auth');

const router = express.Router();

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

// Formats layoff object: returns confirmCount and confirmedByMe, never raw user IDs
const sanitizeLayoff = (layoff, currentUserId = null, floorMap = {}) => {
  const confirmedBy = layoff.confirmedBy || layoff.confirms || [];
  const confirmedByMe = currentUserId ? confirmedBy.some((id) => id.toString() === currentUserId.toString()) : false;

  return {
    _id: layoff._id,
    company: layoff.company,
    date: layoff.date,
    peopleAffected: layoff.peopleAffected || 0,
    sourceUrl: layoff.sourceUrl || '',
    note: layoff.note || '',
    confirmCount: confirmedBy.length,
    confirmedByMe,
    isConfirmed: confirmedByMe,
    floorSlug: floorMap[layoff.company.toLowerCase()] || null,
    createdAt: layoff.createdAt
  };
};

// GET /api/layoffs - List layoffs with optional company search and monthly sum
router.get('/', (req, res) => {
  try {
    const { company } = req.query;
    let layoffs = store.getAll('layoffs');

    if (company) {
      const lower = company.trim().toLowerCase();
      layoffs = layoffs.filter((l) => l.company.toLowerCase().includes(lower));
    }

    const currentUserId = getUserIdFromHeader(req);

    // Map company names to floor slugs
    const allFloors = store.getAll('floors');
    const floorMap = {};
    allFloors.forEach((f) => {
      floorMap[f.name.toLowerCase()] = f.slug;
    });

    // Calculate sum of people affected in the current calendar month
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const severedThisMonth = store.getAll('layoffs').reduce((sum, item) => {
      const d = new Date(item.date);
      if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
        return sum + (Number(item.peopleAffected) || 0);
      }
      return sum;
    }, 0);

    const formatted = layoffs
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map((l) => sanitizeLayoff(l, currentUserId, floorMap));

    res.json({ layoffs: formatted, severedThisMonth });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error fetching layoffs' });
  }
});

// POST /api/layoffs - Submit a new workforce reduction report
router.post('/', auth, (req, res) => {
  try {
    const { company, date, peopleAffected, sourceUrl, note } = req.body;

    if (!company || typeof company !== 'string' || !company.trim()) {
      return res.status(400).json({ error: 'Company name is required' });
    }

    const layoffObj = makeLayoff({
      company: company.trim(),
      date: date ? new Date(date).toISOString() : new Date().toISOString(),
      peopleAffected: Number(peopleAffected) || 0,
      sourceUrl: typeof sourceUrl === 'string' ? sourceUrl.trim() : '',
      note: typeof note === 'string' ? note.trim() : '',
      addedBy: req.user.id,
      confirmedBy: [req.user.id] // Submitter automatically confirms
    });

    const layoff = store.insert('layoffs', layoffObj);
    res.status(201).json({ layoff: sanitizeLayoff(layoff, req.user.id) });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error creating layoff report' });
  }
});

// POST /api/layoffs/:id/confirm - Confirm a report to increase trust level
router.post('/:id/confirm', auth, (req, res) => {
  try {
    const layoff = store.findById('layoffs', req.params.id);
    if (!layoff) return res.status(404).json({ error: 'Report not found' });

    const userId = req.user.id.toString();
    let confirmedBy = (layoff.confirmedBy || []).map((id) => id.toString());

    if (confirmedBy.includes(userId)) {
      return res.status(400).json({ error: 'You have already confirmed this report' });
    }

    confirmedBy.push(userId);
    store.update('layoffs', layoff._id, { confirmedBy });

    res.json({
      confirmCount: confirmedBy.length,
      confirmedByMe: true,
      isConfirmed: true
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error confirming layoff' });
  }
});

module.exports = router;
