const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const env = require('./config/env');
const store = require('./db/store');
const { logger, httpLogger } = require('./utils/logger');
const { createLimiter, limitsConfig } = require('./config/limits');
const { getCacheStatus, redisClient } = require('./cache/cache');
const { getBreakersStatus } = require('./utils/breaker');

const app = express();

app.set('trust proxy', 1);

// HTTP structured logging and request ID tracking
app.use(httpLogger);

// Gzip response compression
app.use(compression());

// Security headers
app.use(helmet());

// CORS configuration restricting access to configured CLIENT_URL
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true
}));

// Body parsing with 10kb limit to prevent payload abuse
app.use(express.json({ limit: '10kb' }));

// 15 second request timeout middleware
app.use((req, res, next) => {
  req.setTimeout(15000, () => {
    const err = new Error('Request timed out');
    err.status = 408;
    next(err);
  });
  next();
});

// Tiered rate limiters backed by Redis or memory fallback
const globalLimiter = createLimiter({ ...limitsConfig.global, redisClient });
const authLimiter = createLimiter({ ...limitsConfig.auth, keyGenerator: (req) => req.ip, redisClient });
const postLimiter = createLimiter({ ...limitsConfig.posts, redisClient });
const commentLimiter = createLimiter({ ...limitsConfig.comments, redisClient });
const voteLimiter = createLimiter({ ...limitsConfig.votes, redisClient });
const reportLimiter = createLimiter({ ...limitsConfig.reports, redisClient });

app.use('/api', globalLimiter);

// Health & readiness checks
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Linked Out API is running' });
});

app.get('/api/ready', (req, res) => {
  const isReady = true;
  res.status(isReady ? 200 : 503).json({
    status: isReady ? 'ready' : 'unready',
    instanceId: env.INSTANCE_ID,
    database: store.isAtlasConnected() ? 'mongodb-atlas' : 'local-json-fallback',
    cache: getCacheStatus(),
    breakers: getBreakersStatus()
  });
});

// Mount routes with rate limits applied
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth', require('./routes/auth'));

app.use('/api/floors', require('./routes/floors'));

app.post('/api/posts', postLimiter);
app.post('/api/posts/:id/vote', voteLimiter);
app.use('/api/posts', require('./routes/posts'));

app.post('/api/posts/:id/comments', commentLimiter);
app.post('/api/comments/:id/vote', voteLimiter);
app.use('/api', require('./routes/comments'));

app.post('/api/reports', reportLimiter);
app.use('/api/reports', require('./routes/reports'));
app.use('/api/admin', require('./routes/admin'));

app.use('/api/layoffs', require('./routes/layoffs'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/users', require('./routes/users'));

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Cannot ${req.method} ${req.path}`,
      requestId: req.id || null
    }
  });
});

// Centralized error handler returning structured JSON
app.use((err, req, res, _next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  logger.error({ reqId: req.id, status, err: err.message }, 'Request encountered error');

  res.status(status).json({
    error: {
      code: err.code || 'SERVER_ERROR',
      message: env.NODE_ENV === 'production' && status === 500 ? 'Internal Server Error' : message,
      requestId: req.id || null
    }
  });
});

// Process-level unhandled rejection handlers
process.on('unhandledRejection', (reason) => {
  logger.error({ reason: String(reason) }, 'Unhandled Promise Rejection caught');
});

process.on('uncaughtException', (err) => {
  logger.fatal({ err: err.message, stack: err.stack }, 'Uncaught Exception encountered');
  process.exit(1);
});

let server = null;
if (require.main === module) {
  server = app.listen(env.PORT, () => {
    logger.info({ port: env.PORT, env: env.NODE_ENV }, `Server running on port ${env.PORT}`);
  });

  // Graceful shutdown handling for container termination
  const shutdown = (signal) => {
    logger.info({ signal }, 'Termination signal received. Shutting down gracefully...');
    server.close(() => {
      logger.info('Closed active HTTP connections. Exiting process.');
      process.exit(0);
    });

    // Force exit after 10s if connections refuse to terminate
    setTimeout(() => {
      logger.error('Forced shutdown due to lingering connections.');
      process.exit(1);
    }, 10000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

module.exports = app;
