const jwt = require('jsonwebtoken');

async function testRateLimits() {
  const baseURL = 'http://localhost:5000/api';
  console.log('Testing rate limits (Step 18)...');

  // 1. Test Auth Rate Limit (limit is 10 requests)
  console.log('Triggering login rate limit (10 limit)...');
  let auth429Triggered = false;
  for (let i = 0; i < 15; i++) {
    const res = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'fake@example.com', password: 'wrong' })
    });
    if (res.status === 429) {
      auth429Triggered = true;
      const data = await res.json();
      console.log(`Auth rate limit triggered at attempt ${i + 1}: status ${res.status}, code: ${data.error?.code}`);
      break;
    }
  }

  // 2. Obtain valid token for authenticated rate limits
  const token = jwt.sign(
    { id: 'b54b49e7-64a2-4c06-9bbe-12f7bdca0c2b' },
    'supersecret_severance_lumon_key_12345'
  );

  // 3. Test Post Rate Limit (limit is 20 requests)
  console.log('Triggering post rate limit (20 limit)...');
  let post429Triggered = false;
  for (let i = 0; i < 25; i++) {
    const res = await fetch(`${baseURL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: `Spam Post #${i}`,
        body: 'Testing rate limit threshold for post creation.',
        type: 'vent'
      })
    });
    if (res.status === 429) {
      post429Triggered = true;
      const data = await res.json();
      console.log(`Post rate limit triggered at attempt ${i + 1}: status ${res.status}, code: ${data.error?.code}`);
      break;
    }
  }

  console.log('\n--- Rate Limit Results ---');
  console.log('Auth limiter 429:', auth429Triggered ? 'PASS' : 'FAIL');
  console.log('Post limiter 429:', post429Triggered ? 'PASS' : 'FAIL');
}

testRateLimits().catch(console.error);
