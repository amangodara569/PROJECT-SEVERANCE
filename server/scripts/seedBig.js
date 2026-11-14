const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '../data/db.json');

// Generates big dataset for realistic load testing: 50 floors, 5000 posts, 20000 comments, 200 layoffs
function runBigSeed() {
  console.log('Generating seed:big dataset...');
  const startTime = Date.now();

  const defaultPasswordHash = bcrypt.hashSync('Test@1234', 10);

  // 1. Generate 50 floors
  const floors = [];
  for (let i = 1; i <= 50; i++) {
    floors.push({
      _id: crypto.randomUUID(),
      name: `Floor Company ${i}`,
      slug: `company-${i}`,
      description: `Discussions and reflections for employees of Company ${i}`,
      createdBy: 'b54b49e7-64a2-4c06-9bbe-12f7bdca0c2b',
      createdAt: new Date(Date.now() - (50 - i) * 86400000).toISOString()
    });
  }

  // 2. Base users
  const users = [
    {
      _id: 'b54b49e7-64a2-4c06-9bbe-12f7bdca0c2b',
      username: 'aman_test',
      email: 'aman@lumon.com',
      passwordHash: defaultPasswordHash,
      headline: 'Lead System Architect at TechNova',
      bio: 'Building distributed platforms. Pragmatic engineer.',
      status: 'Employed',
      innieHandle: 'Innie-1001',
      joinedFloors: [floors[0]._id, floors[1]._id],
      isAdmin: true,
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString()
    },
    {
      _id: 'aedb1ca8-aa46-4aab-972a-461590bb7e42',
      username: 'priya_test',
      email: 'priya@lumon.com',
      passwordHash: defaultPasswordHash,
      headline: 'Ex-MegaCorp Senior Frontend Engineer',
      status: 'Severed',
      innieHandle: 'Innie-2002',
      joinedFloors: [floors[0]._id],
      isAdmin: false,
      createdAt: new Date(Date.now() - 25 * 86400000).toISOString()
    },
    {
      _id: '88157f86-5db6-4dbe-8763-9ca9c3e92cb1',
      username: 'rahul_test',
      email: 'rahul@lumon.com',
      passwordHash: defaultPasswordHash,
      headline: 'Full Stack Engineer',
      status: 'Employed',
      innieHandle: 'Innie-3003',
      joinedFloors: [floors[0]._id],
      isAdmin: false,
      createdAt: new Date(Date.now() - 22 * 86400000).toISOString()
    }
  ];

  // Additional 20 simulated users for author diversity
  for (let i = 3; i <= 20; i++) {
    users.push({
      _id: crypto.randomUUID(),
      username: `user_${i}`,
      email: `user_${i}@lumon.com`,
      passwordHash: defaultPasswordHash,
      headline: `Engineer ${i}`,
      bio: 'Survivor of corporate restructuring.',
      status: i % 2 === 0 ? 'Severed' : 'Employed',
      innieHandle: `Innie-${1000 + i}`,
      joinedFloors: [floors[i % floors.length]._id],
      isAdmin: false,
      createdAt: new Date(Date.now() - 20 * 86400000).toISOString()
    });
  }

  // 3. Generate 5,000 posts
  const posts = [];
  const postTypes = ['vent', 'solidarity', 'advice', 'hired'];
  const titles = [
    'Unexpected severance notification during morning sync',
    'How do you handle the sudden silence after being cut?',
    'Remember your worth is never defined by a badge',
    'Got an offer today after 3 months in the dark',
    'Corporate platitudes mean nothing when numbers slip',
    'Tips for navigating health insurance transitions'
  ];

  for (let i = 1; i <= 5000; i++) {
    const isOutie = i % 2 === 0;
    const authorUser = users[i % users.length];
    const floor = floors[i % floors.length];
    const postDate = new Date(Date.now() - (5000 - i) * 60000).toISOString();
    const score = (i * 7) % 150 - 20; // diverse score distribution

    posts.push({
      _id: crypto.randomUUID(),
      title: `${titles[i % titles.length]} #${i}`,
      body: `Reflecting on the transitions and corporate realities. Documenting experience for transmission #${i}.`,
      type: postTypes[i % postTypes.length],
      floor: floor._id,
      author: isOutie ? authorUser._id : null,
      isInnie: !isOutie,
      innieHandle: !isOutie ? authorUser.innieHandle : null,
      commentCount: 4, // 4 comments per post average = 20,000 comments
      reportCount: i % 1000 === 0 ? 5 : 0,
      hidden: i % 1000 === 0,
      score,
      createdAt: postDate
    });
  }

  // 4. Generate 20,000 comments
  const comments = [];
  let commentIndex = 1;
  for (let p = 0; p < posts.length; p++) {
    const post = posts[p];
    for (let c = 1; c <= 4; c++) {
      const commentUser = users[(commentIndex) % users.length];
      const isCommentInnie = c % 2 === 0;
      comments.push({
        _id: crypto.randomUUID(),
        post: post._id,
        parentComment: null,
        body: `Supportive transmission for post #${p + 1}, sequence #${c}`,
        author: !isCommentInnie ? commentUser._id : null,
        isInnie: isCommentInnie,
        innieHandle: isCommentInnie ? commentUser.innieHandle : null,
        score: c * 3,
        reportCount: 0,
        hidden: false,
        createdAt: new Date(new Date(post.createdAt).getTime() + c * 60000).toISOString()
      });
      commentIndex++;
    }
  }

  // 5. Generate 200 layoffs
  const layoffs = [];
  for (let i = 1; i <= 200; i++) {
    layoffs.push({
      _id: crypto.randomUUID(),
      company: `Enterprise Corp ${i % 30}`,
      affectedCount: 50 + (i * 13) % 800,
      department: i % 3 === 0 ? 'Engineering' : 'Operations',
      sourceUrl: `https://news.lumon.com/report-${i}`,
      confirmedBy: [users[0]._id],
      createdAt: new Date(Date.now() - (200 - i) * 3600000).toISOString()
    });
  }

  // 6. Generate jobs & reports
  const jobs = [];
  for (let i = 1; i <= 20; i++) {
    jobs.push({
      _id: crypto.randomUUID(),
      title: `Senior Distributed Systems Engineer #${i}`,
      company: `Forward Tech ${i}`,
      location: 'Remote / Bengaluru',
      link: 'https://careers.example.com',
      postedBy: users[0]._id,
      createdAt: new Date(Date.now() - i * 86400000).toISOString()
    });
  }

  const reports = [
    {
      _id: crypto.randomUUID(),
      reporter: users[1]._id,
      targetType: 'post',
      targetId: posts[999]._id,
      reason: 'Automated policy check',
      createdAt: new Date().toISOString()
    }
  ];

  // 7. Seed votes for active user
  const votes = [];
  for (let i = 0; i < 50; i++) {
    votes.push({
      _id: crypto.randomUUID(),
      user: users[0]._id,
      targetType: 'post',
      targetId: posts[i]._id,
      value: 1,
      createdAt: new Date().toISOString()
    });
  }

  const finalDb = {
    users,
    floors,
    posts,
    comments,
    layoffs,
    jobs,
    reports,
    votes
  };

  fs.writeFileSync(dbPath, JSON.stringify(finalDb, null, 2), 'utf8');
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`seed:big generated in ${elapsed}s:`);
  console.log(`- ${floors.length} floors`);
  console.log(`- ${users.length} users`);
  console.log(`- ${posts.length} posts`);
  console.log(`- ${comments.length} comments`);
  console.log(`- ${layoffs.length} layoffs`);
  console.log(`- ${votes.length} sample votes`);
}

if (require.main === module) {
  runBigSeed();
}

module.exports = { runBigSeed };
