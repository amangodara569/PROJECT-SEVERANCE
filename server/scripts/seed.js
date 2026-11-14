const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// Computes ISO timestamp from days ago
const daysAgo = (d, extraHours = 0) => {
  return new Date(Date.now() - (d * 86400 * 1000) - (extraHours * 3600 * 1000)).toISOString();
};

const runSeed = () => {
  if (process.env.NODE_ENV === 'production') {
    console.error('Cannot run seed script in production environment.');
    process.exit(1);
  }

  const dbPath = path.join(__dirname, '..', 'data', 'db.json');
  const defaultPasswordHash = bcrypt.hashSync('Test@1234', 10);

  // 1. Users
  const userDefs = [
    { key: 'aman', username: 'aman_test', email: 'aman@lumon.com', headline: 'Lead Architect @ TechNova', bio: 'Building high throughput systems.', status: 'Employed', innie: 'Innie-1001', isAdmin: true },
    { key: 'priya', username: 'priya_test', email: 'priya@lumon.com', headline: 'Ex-MegaCorp Senior Frontend Engineer', bio: 'Severed after 4 years. Recovering.', status: 'Severed', innie: 'Innie-2002' },
    { key: 'rahul', username: 'rahul_test', email: 'rahul@lumon.com', headline: 'Fullstack Dev searching for opportunities', bio: 'Severed during Q3 cuts.', status: 'Severed', innie: 'Innie-3003' },
    { key: 'meera', username: 'meera_test', email: 'meera@lumon.com', headline: 'Staff Engineer @ ByteForge', bio: 'Survived restructuring. Reintegrated.', status: 'Reintegrated', innie: 'Innie-4004' },
    { key: 'sam', username: 'sam_test', email: 'sam@lumon.com', headline: 'Engineering Director @ StartupZero', bio: 'Hiring talented severed engineers.', status: 'Employed', innie: 'Innie-5005' },
    { key: 'elena', username: 'elena_test', email: 'elena@lumon.com', headline: 'Risk Analyst @ Apex Capital', bio: 'Navigating financial headwinds.', status: 'Employed', innie: 'Innie-6006' }
  ];

  const userMap = {};
  const users = userDefs.map((u) => {
    const id = crypto.randomUUID();
    userMap[u.key] = id;
    return {
      _id: id,
      username: u.username,
      email: u.email,
      passwordHash: defaultPasswordHash,
      headline: u.headline,
      bio: u.bio,
      status: u.status,
      innieHandle: u.innie,
      joinedFloors: [],
      savedPosts: [],
      isAdmin: Boolean(u.isAdmin),
      createdAt: daysAgo(40)
    };
  });

  // 2. Floors (12 floors with categories: Tech, Finance, Retail, Startup, Manufacturing, Other)
  const floorDefs = [
    { name: 'TechNova', slug: 'technova', category: 'Tech', desc: 'Core platform engineers and alumni.' },
    { name: 'MegaCorp', slug: 'megacorp', category: 'Tech', desc: 'Global enterprise scale, legacy tech, corporate reorganizations.' },
    { name: 'ByteForge', slug: 'byteforge', category: 'Tech', desc: 'Distributed infrastructure and devtools collective.' },
    { name: 'Apex Capital', slug: 'apex-capital', category: 'Finance', desc: 'Trading, risk algorithms, and investment analysts.' },
    { name: 'Horizon Bank', slug: 'horizon-bank', category: 'Finance', desc: 'Commercial banking tech and branch rationalization.' },
    { name: 'OmniRetail', slug: 'omniretail', category: 'Retail', desc: 'E-commerce logistics, fulfillment, and store systems.' },
    { name: 'Lumon Goods', slug: 'lumon-goods', category: 'Retail', desc: 'Department of corporate merchandise and severed amenities.' },
    { name: 'StartupZero', slug: 'startupzero', category: 'Startup', desc: 'Seed to Series B founders and high-burn engineers.' },
    { name: 'PulseAI', slug: 'pulseai', category: 'Startup', desc: 'Generative intelligence ventures and automated pipelines.' },
    { name: 'Titan Foundry', slug: 'titan-foundry', category: 'Manufacturing', desc: 'Heavy industrial automation and supply chain lines.' },
    { name: 'AeroDyn Industries', slug: 'aerodyn', category: 'Manufacturing', desc: 'Aerospace structural design and defense logistics.' },
    { name: 'General Sector', slug: 'general-sector', category: 'Other', desc: 'Open floor for cross-industry discussions and reintegration.' }
  ];

  const floorMap = {};
  const floors = floorDefs.map((f, i) => {
    const id = crypto.randomUUID();
    floorMap[f.slug] = id;
    const members = users.slice(0, 3 + (i % 3)).map(u => u._id);
    return {
      _id: id,
      name: f.name,
      slug: f.slug,
      category: f.category,
      description: f.desc,
      createdBy: users[0]._id,
      members,
      createdAt: daysAgo(60 - i * 2)
    };
  });

  // Assign joined floors to users
  users.forEach((u) => {
    u.joinedFloors = floors.filter(f => f.members.includes(u._id)).map(f => f._id);
  });

  // 3. Posts (~60 posts, 1 pinned welcome post, various types)
  const postTemplates = [
    { title: 'Welcome to Linked Out // Read the Guidelines & Onboarding', body: 'This is an unvarnished space to speak honestly about workforce reductions, corporate culture, and corporate severance. Please enjoy all facts equally.\n\nOutie mode represents your public identity. Innie mode is pseudonymous and never reveals your handle or identity.', type: 'question', floor: null, authorKey: 'aman', isInnie: false, pinned: true, days: 30, score: 98 },
    { title: 'MegaCorp severed our entire team with a 5-minute automated video', body: 'No one got to say goodbye. Just an automated Zoom webinar where attendee chat was disabled. 4 years of 60-hour workweeks reduced to an error screen.', type: 'vent', floor: 'megacorp', authorKey: 'priya', isInnie: true, days: 1, score: 42 },
    { title: 'TechNova announces restructuring after record quarterly margins', body: 'The paradox of modern corporate life: margins are up 18%, but headcount must be trimmed 12% to satisfy activist fund guidance. Who else is affected?', type: 'vent', floor: 'technova', authorKey: 'aman', isInnie: false, days: 2, score: 38 },
    { title: 'How long did severance direct deposit take for you?', body: 'HR promised 14 business days, but my severance packet states net-30 from release signature. What has been the standard timeline across the floor?', type: 'question', floor: 'general-sector', authorKey: 'rahul', isInnie: true, days: 3, score: 24 },
    { title: 'Reintegrated at ByteForge after 5 grueling months!', body: 'After 180 applications and 14 interview loops, I signed an offer for Staff Engineer at ByteForge. Don’t lose hope. The waffle party is real.', type: 'hired', floor: 'byteforge', authorKey: 'meera', isInnie: false, days: 4, score: 65 },
    { title: 'Apex Capital cutting junior algorithmic trading desks', body: 'Heard from internal memos that desk headcount in NYC is being halved by end of month. Any confirmations from compliance?', type: 'vent', floor: 'apex-capital', authorKey: 'elena', isInnie: true, days: 5, score: 19 },
    { title: 'StartupZero is expanding engineering - hiring across all levels', body: 'We secured our Series A and are opening 8 remote engineering roles. We prioritize severed talent who know how to ship without red tape.', type: 'hired', floor: 'startupzero', authorKey: 'sam', isInnie: false, days: 6, score: 31 },
    { title: 'What is the tax rate on severance pay vs standard income?', body: 'Does Lumon withhold at supplemental wage rate (~22% federal) or at regular marginal rate? Need to budget healthcare COBRA costs accordingly.', type: 'question', floor: 'general-sector', authorKey: 'rahul', isInnie: false, days: 7, score: 15 },
    { title: 'OmniRetail supply chain engineers hit with sudden departures', body: 'Warehousing software migration cancelled midway. Over 150 engineers affected across three development centers.', type: 'vent', floor: 'omniretail', authorKey: 'priya', isInnie: true, days: 8, score: 27 },
    { title: 'Titan Foundry cutting 300 automated manufacturing lines', body: 'Supply chain slowdowns hit the Midwest plants hard. Operators severed with 2 weeks notice.', type: 'vent', floor: 'titan-foundry', authorKey: 'aman', isInnie: false, days: 9, score: 22 }
  ];

  const posts = [];
  const votes = [];

  // Generate 60 posts
  for (let i = 0; i < 60; i++) {
    const tpl = postTemplates[i % postTemplates.length];
    const floorSlug = tpl.floor || floorDefs[i % floorDefs.length].slug;
    const authorUser = users[i % users.length];
    const isWelcome = i === 0;

    const postId = crypto.randomUUID();
    const isAnon = isWelcome ? false : (i % 2 === 1 || tpl.isInnie);
    const postDays = isWelcome ? 30 : (Math.floor(i / 2));
    const postScore = isWelcome ? 98 : Math.max(0, 50 - (i % 45));

    posts.push({
      _id: postId,
      title: isWelcome ? tpl.title : `${tpl.title} #${i + 1}`,
      body: tpl.body,
      type: tpl.type,
      floor: isWelcome ? null : floorMap[floorSlug],
      author: authorUser._id,
      isInnie: isAnon,
      innieHandle: isAnon ? authorUser.innieHandle : null,
      pinned: isWelcome,
      score: postScore,
      commentCount: 0,
      reportCount: 0,
      hidden: false,
      createdAt: daysAgo(postDays, (i % 12))
    });

    // Create a vote record for author
    votes.push({
      _id: crypto.randomUUID(),
      userId: authorUser._id,
      targetType: 'post',
      targetId: postId,
      value: 1,
      createdAt: daysAgo(postDays)
    });
  }

  // 4. Comments (~120 comments)
  const commentTexts = [
    'Experienced the exact same ritual last month. Stay strong.',
    'Did they offer outplacement support or was it strictly the statutory minimum?',
    'Direct deposit arrived on day 22 for me. Check with payroll liaison.',
    'Congratulations on the reintegration! Huge win for the community.',
    'The severance package had an unusually aggressive non-disparagement clause.',
    'Make sure to verify your unused PTO payout calculation.',
    'The corporate severance machine spares no one. Onward.',
    'Appreciate you sharing this telemetry. Very helpful for those still inside.'
  ];

  const comments = [];
  for (let i = 0; i < 120; i++) {
    const targetPost = posts[i % posts.length];
    targetPost.commentCount = (targetPost.commentCount || 0) + 1;
    const authorUser = users[(i + 1) % users.length];
    const isAnon = i % 3 === 0;
    const isReply = i % 4 === 0 && comments.length > 0;
    const parentComment = isReply ? comments[comments.length - 1]._id : null;

    const commentId = crypto.randomUUID();
    const commentScore = Math.max(0, 15 - (i % 12));

    comments.push({
      _id: commentId,
      post: targetPost._id,
      parent: parentComment,
      author: authorUser._id,
      body: commentTexts[i % commentTexts.length],
      isInnie: isAnon,
      innieHandle: isAnon ? authorUser.innieHandle : null,
      score: commentScore,
      createdAt: daysAgo(Math.floor(i / 5), (i % 8))
    });

    votes.push({
      _id: crypto.randomUUID(),
      userId: authorUser._id,
      targetType: 'comment',
      targetId: commentId,
      value: 1,
      createdAt: daysAgo(Math.floor(i / 5))
    });
  }

  // 5. Layoffs (25 layoffs spread over 6 months)
  const layoffCompanies = [
    { name: 'TechNova', count: 420 },
    { name: 'MegaCorp', count: 1850 },
    { name: 'ByteForge', count: 140 },
    { name: 'Apex Capital', count: 320 },
    { name: 'Horizon Bank', count: 650 },
    { name: 'OmniRetail', count: 1200 },
    { name: 'Lumon Industries', count: 890 },
    { name: 'StartupZero', count: 45 },
    { name: 'PulseAI', count: 75 },
    { name: 'Titan Foundry', count: 410 },
    { name: 'AeroDyn', count: 280 },
    { name: 'CloudScale Inc', count: 530 }
  ];

  const layoffs = [];
  for (let i = 0; i < 25; i++) {
    const comp = layoffCompanies[i % layoffCompanies.length];
    const monthOffset = (i % 6);
    const dayOffset = monthOffset * 28 + (i * 3);
    const people = comp.count + ((i * 17) % 150);

    layoffs.push({
      _id: crypto.randomUUID(),
      company: comp.name,
      people,
      date: daysAgo(dayOffset),
      sourceUrl: 'https://news.bloomberg.com/workforce-reductions',
      note: `Corporate operational restructuring and capacity alignment. Batch #${i + 1}.`,
      addedBy: users[i % users.length]._id,
      confirmedBy: users.slice(0, 2 + (i % 4)).map(u => u._id),
      createdAt: daysAgo(dayOffset)
    });
  }

  // 6. Jobs (15 jobs)
  const jobTemplates = [
    { title: 'Senior Infrastructure Engineer', company: 'ByteForge', location: 'Remote / NYC', link: 'https://byteforge.io/careers/infra' },
    { title: 'Staff Frontend Architect', company: 'StartupZero', location: 'San Francisco, CA', link: 'https://startupzero.ai/careers/fe' },
    { title: 'Site Reliability Specialist', company: 'TechNova', location: 'Austin, TX', link: 'https://technova.net/jobs/sre' },
    { title: 'Distributed Systems Engineer', company: 'PulseAI', location: 'Remote / London', link: 'https://pulseai.tech/jobs/systems' },
    { title: 'Lead Security Analyst', company: 'Apex Capital', location: 'New York, NY', link: 'https://apexcapital.com/careers/sec' },
    { title: 'Backend Services Lead', company: 'Horizon Bank', location: 'Charlotte, NC', link: 'https://horizonbank.com/jobs/lead' },
    { title: 'Fullstack Platform Engineer', company: 'StartupZero', location: 'Remote', link: 'https://startupzero.ai/careers/fullstack' },
    { title: 'DevOps & Kubernetes Engineer', company: 'ByteForge', location: 'Remote / Seattle', link: 'https://byteforge.io/careers/k8s' }
  ];

  const jobs = [];
  for (let i = 0; i < 15; i++) {
    const j = jobTemplates[i % jobTemplates.length];
    jobs.push({
      _id: crypto.randomUUID(),
      title: `${j.title} [Opening ${i + 1}]`,
      company: j.company,
      location: j.location,
      link: j.link,
      postedBy: users[i % users.length]._id,
      createdAt: daysAgo(i * 2)
    });
  }

  const reports = [];

  const dbData = { users, floors, posts, comments, layoffs, jobs, votes, reports };
  fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2), 'utf8');
  console.log(`Seeded: ${users.length} users, ${floors.length} floors, ${posts.length} posts, ${comments.length} comments, ${layoffs.length} layoffs, ${jobs.length} jobs, ${votes.length} votes.`);
};

if (require.main === module) {
  runSeed();
}

module.exports = { runSeed };