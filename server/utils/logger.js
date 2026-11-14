const pino = require('pino');
const pinoHttp = require('pino-http');
const crypto = require('crypto');
const env = require('../config/env');

// Configure structured logger with pretty print in development and JSON in production
const logger = pino({
  level: env.NODE_ENV === 'test' ? 'silent' : (process.env.LOG_LEVEL || 'info'),
  transport: env.NODE_ENV === 'production' ? undefined : {
    target: 'pino/file',
    options: { destination: 1 }
  },
  redact: {
    // Redact sensitive credentials and tokens from logs
    paths: ['req.headers.authorization', 'req.headers.cookie', 'password', 'token', 'authorKey'],
    remove: true
  }
});

// Middleware attaches unique request ID and logs request latency warnings
const httpLogger = pinoHttp({
  logger,
  genReqId: (req) => {
    // Use incoming header or generate a cryptographically random request ID
    const reqId = req.headers['x-request-id'] || crypto.randomUUID();
    req.id = reqId;
    return reqId;
  },
  customSuccessMessage: (req, res) => {
    // Flag slow requests that exceed 500ms threshold
    const responseTime = Date.now() - req._startTime;
    if (responseTime > 500) {
      logger.warn({ reqId: req.id, responseTime, url: req.url }, 'Slow request threshold exceeded (> 500ms)');
    }
    return `${req.method} ${req.url} completed with status ${res.statusCode}`;
  },
  customAttributeKeys: {
    reqId: 'requestId'
  }
});

module.exports = {
  logger,
  httpLogger
};
