const express = require('express');
const store = require('../db/store');
const cache = require('../cache/cache');

const router = express.Router();

// GET /api/stats/overview - High-level metrics for dashboard rails and charts
router.get('/overview', async (req, res) => {
  try {
    const data = await cache.wrap('stats:overview', 30, async () => {
      const layoffs = store.getAll('layoffs') || [];
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();

      let severedThisMonth = 0;
      const companyMap = {};
      const dayBuckets = Array(30).fill(0);

      // 30 days time boundaries
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const oneDayMs = 24 * 60 * 60 * 1000;

      for (const item of layoffs) {
        const people = parseInt(item.people, 10) || 0;
        const d = new Date(item.date || item.createdAt);

        // Check if within current calendar month
        if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
          severedThisMonth += people;
        }

        // Aggregate top companies
        const comp = (item.company || 'Unknown').trim();
        companyMap[comp] = (companyMap[comp] || 0) + people;

        // Bucket into last 30 days
        const itemDayTime = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
        const diffDays = Math.floor((startOfToday - itemDayTime) / oneDayMs);
        if (diffDays >= 0 && diffDays < 30) {
          const index = 29 - diffDays; // 29 is today, 0 is 29 days ago
          dayBuckets[index] += people;
        }
      }

      // Format top 5 companies
      const topCompanies = Object.entries(companyMap)
        .map(([company, count]) => ({ company, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return {
        severedThisMonth,
        severedByDay: dayBuckets,
        topCompanies
      };
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to load overview stats' });
  }
});

module.exports = router;