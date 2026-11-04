process.env.NODE_ENV = 'test';
const app = require('../server');
const store = require('../db/store');

// Runs end-to-end privacy checks across all public endpoints
async function runCheck() {
  let server;
  let hasFailures = false;

  const fail = (msg, detail) => {
    hasFailures = true;
    console.error(`[FAIL] ${msg}`);
    if (detail) console.error(`       Detail: ${detail}`);
  };

  const pass = (msg) => {
    console.log(`[PASS] ${msg}`);
  };

  try {
    // Start temporary test server
    server = await new Promise((resolve) => {
      const s = app.listen(0, () => resolve(s));
    });
    const { port } = server.address();
    const baseUrl = `http://localhost:${port}`;

    // 1. Sign in as User 1 (priya_test)
    const loginRes1 = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'priya@lumon.com', password: 'Test@1234' })
    });
    const auth1 = await loginRes1.json();
    if (!auth1.token) throw new Error('User 1 login failed: ' + JSON.stringify(auth1));
    const user1 = auth1.user;
    const token1 = auth1.token;

    // 2. Sign in as User 2 (rahul_test)
    const loginRes2 = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'rahul@lumon.com', password: 'Test@1234' })
    });
    const auth2 = await loginRes2.json();
    if (!auth2.token) throw new Error('User 2 login failed: ' + JSON.stringify(auth2));
    const token2 = auth2.token;

    const floor = store.getAll('floors')[0];

    // 3. User 1 creates an Innie post
    const postRes = await fetch(`${baseUrl}/api/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token1}`
      },
      body: JSON.stringify({
        title: 'Privacy Verification Test Post',
        body: 'This is an innie post testing privacy boundaries.',
        type: 'vent',
        floor: floor ? floor._id : null,
        isInnie: true
      })
    });
    const createdPostData = await postRes.json();
    const createdPost = createdPostData.post;
    if (!createdPost?._id) throw new Error('Failed to create innie post: ' + JSON.stringify(createdPostData));

    // 4. User 1 creates an Innie comment
    const commentRes = await fetch(`${baseUrl}/api/posts/${createdPost._id}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token1}`
      },
      body: JSON.stringify({
        body: 'This is an innie comment testing anonymity boundaries.',
        isInnie: true
      })
    });
    const createdCommentData = await commentRes.json();
    const createdComment = createdCommentData.comment;
    if (!createdComment?._id) throw new Error('Failed to create innie comment: ' + JSON.stringify(createdCommentData));

    // Helper verifying that privacy rules hold
    const checkSafety = (endpoint, rawText, data, checkInnieItem = false) => {
      if (rawText.includes('passwordHash')) {
        fail(`${endpoint} leaked passwordHash!`);
        return;
      }
      if (/"upvotes"\s*:\s*\[/.test(rawText) || /"downvotes"\s*:\s*\[/.test(rawText)) {
        fail(`${endpoint} exposed raw upvotes/downvotes array!`);
        return;
      }

      if (checkInnieItem) {
        let innieItem = null;
        if (data.post && data.post.isInnie) innieItem = data.post;
        if (data.posts) innieItem = data.posts.find(p => p._id === createdPost._id);
        if (data.comments) innieItem = data.comments.find(c => c._id === createdComment._id);

        if (innieItem) {
          const itemJson = JSON.stringify(innieItem);
          if (itemJson.includes(user1._id) || itemJson.includes(user1.username) || itemJson.includes(user1.email)) {
            fail(`${endpoint} leaked User 1 identity in Innie item: ${itemJson}`);
            return;
          }
          if (innieItem.author) {
            fail(`${endpoint} included author object on Innie item: ${JSON.stringify(innieItem.author)}`);
            return;
          }
        }
      }

      pass(endpoint);
    };

    const headers2 = { Authorization: `Bearer ${token2}` };

    // Test all required endpoints as User 2
    const r1 = await fetch(`${baseUrl}/api/posts`, { headers: headers2 });
    const t1 = await r1.text();
    checkSafety('GET /api/posts', t1, JSON.parse(t1), true);

    const r2 = await fetch(`${baseUrl}/api/posts/${createdPost._id}`, { headers: headers2 });
    const t2 = await r2.text();
    checkSafety('GET /api/posts/:id', t2, JSON.parse(t2), true);

    const r3 = await fetch(`${baseUrl}/api/posts/${createdPost._id}/comments`, { headers: headers2 });
    const t3 = await r3.text();
    checkSafety('GET /api/posts/:id/comments', t3, JSON.parse(t3), true);

    const r4 = await fetch(`${baseUrl}/api/floors/${floor.slug}`, { headers: headers2 });
    const t4 = await r4.text();
    checkSafety('GET /api/floors/:slug', t4, JSON.parse(t4), false);

    const r5 = await fetch(`${baseUrl}/api/users/${user1.username}`, { headers: headers2 });
    const t5 = await r5.text();
    if (t5.includes(user1.email)) {
      fail('GET /api/users/:username leaked user email!');
    } else {
      checkSafety('GET /api/users/:username', t5, JSON.parse(t5), false);
    }

    const r6 = await fetch(`${baseUrl}/api/layoffs`, { headers: headers2 });
    const t6 = await r6.text();
    checkSafety('GET /api/layoffs', t6, JSON.parse(t6), false);

    const r7 = await fetch(`${baseUrl}/api/jobs`, { headers: headers2 });
    const t7 = await r7.text();
    checkSafety('GET /api/jobs', t7, JSON.parse(t7), false);

    // Cleanup test records
    store.remove('comments', createdComment._id);
    store.remove('posts', createdPost._id);
  } catch (err) {
    fail('Execution error', err.message);
  } finally {
    if (server) server.close();
  }

  if (hasFailures) {
    console.error('\nPrivacy check FAILED');
    process.exit(1);
  } else {
    console.log('\nAll privacy checks PASSED');
    process.exit(0);
  }
}

runCheck();

