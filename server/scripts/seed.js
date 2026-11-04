const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// Computes ISO timestamp from relative age fields
const calculateDate = (item) => {
  const now = Date.now();
  if (item.ageMinutes) return new Date(now - item.ageMinutes * 60 * 1000).toISOString();
  if (item.ageHours) return new Date(now - item.ageHours * 3600 * 1000).toISOString();
  if (item.ageDays) return new Date(now - item.ageDays * 86400 * 1000).toISOString();
  return new Date().toISOString();
};

// Generates an array of fake voter UUIDs
const makeFakeVoters = (count = 0) => {
  const voters = [];
  for (let i = 0; i < count; i++) {
    voters.push(crypto.randomUUID());
  }
  return voters;
};

// Main seed execution function
const runSeed = () => {
  if (process.env.NODE_ENV === 'production') {
    console.error('Cannot run seed script in production environment.');
    process.exit(1);
  }

  const seedPath = path.join(__dirname, '..', 'data', 'seed.json');
  const dbPath = path.join(__dirname, '..', 'data', 'db.json');

  if (!fs.existsSync(seedPath)) {
    console.error('Seed file not found at:', seedPath);
    return;
  }

  const raw = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

  // Pre-generate UUIDs for users, floors, posts and comments
  const userMap = {};
  const floorMap = {};
  const postMap = {};
  const commentMap = {};

  (raw.users || []).forEach(u => { userMap[u.key] = crypto.randomUUID(); });
  (raw.floors || []).forEach(f => { floorMap[f.key] = crypto.randomUUID(); });
  (raw.posts || []).forEach(p => { postMap[p.key] = crypto.randomUUID(); });
  (raw.comments || []).forEach(c => { commentMap[c.key] = crypto.randomUUID(); });

  const defaultPasswordHash = bcrypt.hashSync('Test@1234', 10);

  // Build users collection
  const users = (raw.users || []).map(u => ({
    _id: userMap[u.key],
    username: u.username,
    email: u.email,
    passwordHash: defaultPasswordHash,
    headline: u.headline || '',
    bio: u.bio || '',
    status: u.status || 'Employed',
    innieHandle: u.innieHandle,
    joinedFloors: (raw.floors || [])
      .filter(f => (f.members || []).includes(u.key))
      .map(f => floorMap[f.key]),
    isAdmin: Boolean(u.isAdmin || u.key === 'aman'),
    createdAt: new Date(Date.now() - 30 * 86400 * 1000).toISOString()
  }));

  // Build floors collection
  const floors = (raw.floors || []).map(f => ({
    _id: floorMap[f.key],
    name: f.name,
    slug: f.slug,
    description: f.description || '',
    createdBy: userMap[f.createdBy] || null,
    members: (f.members || []).map(k => userMap[k]).filter(Boolean),
    createdAt: new Date(Date.now() - 45 * 86400 * 1000).toISOString()
  }));

  // Build posts collection
  const posts = (raw.posts || []).map(p => {
    const namedUp = (p.upvotes || []).map(k => userMap[k]).filter(Boolean);
    const extraUp = makeFakeVoters(p.extraUp || 0);
    const extraDown = makeFakeVoters(p.extraDown || 0);
    const authorUser = (raw.users || []).find(u => u.key === p.author);
    return {
      _id: postMap[p.key],
      title: p.title,
      body: p.body,
      type: p.type || 'vent',
      floor: floorMap[p.floor] || null,
      author: userMap[p.author] || null,
      isInnie: !!p.isInnie,
      innieHandle: p.isInnie ? (authorUser?.innieHandle || 'Innie-0000') : null,
      createdAt: calculateDate(p),
      upvotes: [...namedUp, ...extraUp],
      downvotes: extraDown,
      reportCount: p.reportCount || 0,
      hidden: !!p.hidden,
      reports: (p.reports || []).map(k => userMap[k]).filter(Boolean)
    };
  });

  // Build comments collection
  const comments = (raw.comments || []).map(c => {
    const namedUp = (c.upvotes || []).map(k => userMap[k]).filter(Boolean);
    const extraUp = makeFakeVoters(c.extraUp || 0);
    const extraDown = makeFakeVoters(c.extraDown || 0);
    const authorUser = (raw.users || []).find(u => u.key === c.author);
    return {
      _id: commentMap[c.key],
      post: postMap[c.post] || null,
      parent: c.parent ? (commentMap[c.parent] || null) : null,
      author: userMap[c.author] || null,
      body: c.body,
      isInnie: !!c.isInnie,
      innieHandle: c.isInnie ? (authorUser?.innieHandle || 'Innie-0000') : null,
      createdAt: calculateDate(c),
      upvotes: [...namedUp, ...extraUp],
      downvotes: extraDown
    };
  });

  // Build layoffs collection
  const layoffs = (raw.layoffs || []).map(l => ({
    _id: crypto.randomUUID(),
    company: l.company,
    date: l.date,
    peopleAffected: l.peopleAffected || 0,
    sourceUrl: l.sourceUrl || '',
    note: l.note || '',
    addedBy: userMap[l.addedBy] || null,
    confirmedBy: (l.confirms || l.confirmedBy || []).map(k => userMap[k]).filter(Boolean),
    createdAt: l.date || new Date().toISOString()
  }));

  // Build jobs collection
  const jobs = (raw.jobs || []).map(j => ({
    _id: crypto.randomUUID(),
    title: j.title,
    company: j.company,
    location: j.location,
    link: j.link,
    postedBy: userMap[j.postedBy] || null,
    createdAt: new Date().toISOString()
  }));

  // Generate report records for reported items
  const reports = [];
  posts.forEach(p => {
    if (p.reportCount > 0) {
      for (let i = 0; i < p.reportCount; i++) {
        reports.push({
          _id: crypto.randomUUID(),
          targetType: 'post',
          targetId: p._id,
          reporter: crypto.randomUUID(),
          reason: i % 2 === 0 ? 'Contains sensitive information' : 'Community guidelines violation',
          createdAt: new Date().toISOString()
        });
      }
    }
  });

  const dbData = { users, floors, posts, comments, layoffs, jobs, reports };
  fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2), 'utf8');
};

if (require.main === module) {
  runSeed();
  console.log('Test data reset');
}

module.exports = { runSeed };
