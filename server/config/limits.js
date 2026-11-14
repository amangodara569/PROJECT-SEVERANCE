const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const env = require('./env');

// Standard error response for rate limited requests with retry header
const rateLimitHandler = (req, res) => {
  res.status(429).json({
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please wait before attempting this action again.',
      requestId: req.id || req.headers['x-request-id'] || null
    }
  });
};

// Generates rate limit key prioritizing authenticated user id over client IP
const userOrIpKey = (req) => {
  if (req.user && req.user._id) return `user:${req.user._id}`;
  if (req.user && req.user.id) return `user:${req.user.id}`;
  return req.ip;
};

// Factory configuring express-rate-limit with optional Redis backing
function createLimiter({ windowMs, max, keyGenerator = userOrIpKey, redisClient = null }) {
  const options = {
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator,
    handler: rateLimitHandler,
    skip: () => process.env.NODE_ENV === 'test',
    validate: { xForwardedForHeader: false, default: false }
  };

  if (redisClient && env.REDIS_URL) {
    try {
      options.store = new RedisStore({
        sendCommand: (...args) => redisClient.call(...args)
      });
    } catch {
      // Fallback silently to memory store if Redis fails
    }
  }

  return rateLimit(options);
}

const limitsConfig = {
  global: { windowMs: 15 * 60 * 1000, max: 300 },
  auth: { windowMs: 15 * 60 * 1000, max: 10 },
  posts: { windowMs: 60 * 60 * 1000, max: 20 },
  comments: { windowMs: 60 * 60 * 1000, max: 60 },
  votes: { windowMs: 60 * 60 * 1000, max: 300 },
  reports: { windowMs: 24 * 60 * 60 * 1000, max: 30 },
  layoffs: { windowMs: 24 * 60 * 60 * 1000, max: 10 },
  confirms: { windowMs: 24 * 60 * 60 * 1000, max: 60 },
  jobs: { windowMs: 24 * 60 * 60 * 1000, max: 5 }
};

module.exports = {
  createLimiter,
  limitsConfig,
  rateLimitHandler,
  userOrIpKey
};
