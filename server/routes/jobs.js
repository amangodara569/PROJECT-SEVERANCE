const express = require('express');
const store = require('../db/store');
const { makeJob } = require('../models/Job');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/jobs - List open opportunities, newest first
router.get('/', (req, res) => {
  try {
    const jobs = store.getAll('jobs')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map((job) => {
        let posterUsername = 'user';
        if (job.postedBy) {
          const user = store.findById('users', job.postedBy);
          if (user) posterUsername = user.username;
        }
        return {
          _id: job._id,
          title: job.title,
          company: job.company,
          location: job.location,
          link: job.link,
          postedBy: { username: posterUsername },
          createdAt: job.createdAt
        };
      });

    res.json({ jobs });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error loading jobs' });
  }
});

// POST /api/jobs - Share a new job opportunity
router.post('/', auth, (req, res) => {
  try {
    const { title, company, location, link } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'Job title is required' });
    }
    if (!company || typeof company !== 'string' || !company.trim()) {
      return res.status(400).json({ error: 'Company name is required' });
    }
    if (!link || typeof link !== 'string' || !link.trim()) {
      return res.status(400).json({ error: 'Application link is required' });
    }

    const jobObj = makeJob({
      title: title.trim(),
      company: company.trim(),
      location: typeof location === 'string' && location.trim() ? location.trim() : 'Remote',
      link: link.trim(),
      postedBy: req.user.id
    });

    const job = store.insert('jobs', jobObj);
    const user = store.findById('users', req.user.id);

    res.status(201).json({
      job: {
        ...job,
        postedBy: { username: user ? user.username : 'user' }
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error posting job' });
  }
});

module.exports = router;
