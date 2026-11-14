const { LRUCache } = require('lru-cache');
const Redis = require('ioredis');
const env = require('../config/env');
const { logger } = require('../utils/logger');
const { createBreaker } = require('../utils/breaker');

// In-memory fallback cache using lru-cache
const memoryCache = new LRUCache({
  max: 1000,
  ttl: 60 * 1000 // default 60 seconds
});

// Single-flight map to deduplicate concurrent cache misses
const inflightPromises = new Map();

// Floor version map for instantaneous cache invalidation
const floorVersions = new Map();

// Initialize Redis client if REDIS_URL is provided, with exponential backoff
let redisClient = null;
let redisGetBreaker = null;
let redisSetBreaker = null;

if (env.REDIS_URL) {
  try {
    redisClient = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      enableReadyCheck: true,
      retryStrategy(times) {
        const delay = Math.min(times * 100, 3000);
        return delay;
      }
    });

    redisClient.on('error', (err) => {
      logger.warn({ err: err.message }, 'Redis connection warning - operating in fail-soft mode');
    });

    // Wrap Redis operations in circuit breakers
    redisGetBreaker = createBreaker((key) => redisClient.get(key), 'redis:get');
    redisSetBreaker = createBreaker((key, val, ttl) => redisClient.set(key, val, 'EX', ttl), 'redis:set');
  } catch (err) {
    logger.warn({ err: err.message }, 'Failed to initialize Redis client, falling back to memory');
  }
}

// Retrieves item from Redis (via circuit breaker) or memory cache
async function get(key) {
  if (redisClient && redisGetBreaker && !redisGetBreaker.opened) {
    try {
      const raw = await redisGetBreaker.fire(key);
      if (raw) return JSON.parse(raw);
    } catch {
      // Breaker open or timeout: fall back to memory
    }
  }
  return memoryCache.get(key) || null;
}

// Stores item in Redis and local memory cache with TTL in seconds
// Note: Vote score changes are allowed to be up to 20 seconds old for feed caching throughput
async function set(key, value, ttlSeconds = 60) {
  memoryCache.set(key, value, { ttl: ttlSeconds * 1000 });

  if (redisClient && redisSetBreaker && !redisSetBreaker.opened) {
    try {
      await redisSetBreaker.fire(key, JSON.stringify(value), ttlSeconds);
    } catch {
      // Fail soft if Redis is down
    }
  }
}

// Deletes key from memory and Redis
async function del(key) {
  memoryCache.delete(key);
  if (redisClient) {
    try {
      await redisClient.del(key);
    } catch {
      // Fail soft
    }
  }
}

// Single-flight caching wrapper: fetches once on concurrent cache misses
async function wrap(key, ttlSeconds, fetchFn) {
  const cached = await get(key);
  if (cached !== null && cached !== undefined) {
    return cached;
  }

  // Deduplicate concurrent database reads for identical key
  if (inflightPromises.has(key)) {
    return inflightPromises.get(key);
  }

  const promise = (async () => {
    try {
      const data = await fetchFn();
      if (data !== null && data !== undefined) {
        await set(key, data, ttlSeconds);
      }
      return data;
    } finally {
      inflightPromises.delete(key);
    }
  })();

  inflightPromises.set(key, promise);
  return promise;
}

// Increments the version counter for a floor to invalidate its cached feeds
function bumpFloorVersion(floorKey = 'all') {
  const current = floorVersions.get(floorKey) || 0;
  floorVersions.set(floorKey, current + 1);
  return current + 1;
}

function getFloorVersion(floorKey = 'all') {
  return floorVersions.get(floorKey) || 0;
}

// Health check status for readiness endpoint
function getCacheStatus() {
  return {
    provider: redisClient && redisClient.status === 'ready' ? 'redis' : 'memory',
    memorySize: memoryCache.size,
    redisConnected: redisClient ? redisClient.status === 'ready' : false
  };
}

module.exports = {
  get,
  set,
  del,
  wrap,
  bumpFloorVersion,
  getFloorVersion,
  getCacheStatus,
  redisClient
};
