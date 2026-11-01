const express = require('express');
const Job = require('../models/Job');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/jobs - List open opportunities, newest first
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate('postedBy', 'username')
      .sort({ createdAt: -1 });

    res.json({ jobs });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error loading jobs' });
  }
});

// POST /api/jobs - Share a new job opportunity
router.post('/', auth, async (req, res) => {
  try {
    const { title, company, location, link } = req.body;

    if (!title?.trim() || !company?.trim() || !link?.trim()) {
      return res.status(400).json({ error: 'Title, company, and application link are required' });
    }

    const job = await Job.create({
      title: title.trim(),
      company: company.trim(),
      location: location?.trim() || 'Remote',
      link: link.trim(),
      postedBy: req.user.id
    });

    res.status(201).json({ job });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error posting job' });
  }
});

module.exports = router;

