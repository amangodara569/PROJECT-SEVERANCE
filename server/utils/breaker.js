const CircuitBreaker = require('opossum');
const { logger } = require('./logger');

// Circuit breaker default configuration: timeout 300ms, open on 50% failures after 10 calls, reset after 10s
const breakerOptions = {
  timeout: 300,
  errorThresholdPercentage: 50,
  resetTimeout: 10000,
  volumeThreshold: 10
};

// Tracks active circuit breakers for inspection in /api/ready
const activeBreakers = new Map();

// Creates a resilient circuit breaker around any async action with logging
function createBreaker(actionFn, name = 'default', options = {}) {
  const breaker = new CircuitBreaker(actionFn, { ...breakerOptions, ...options });

  breaker.on('open', () => logger.warn({ breaker: name }, `Circuit breaker [${name}] OPENED - service failing soft`));
  breaker.on('halfOpen', () => logger.info({ breaker: name }, `Circuit breaker [${name}] HALF-OPEN - testing canary call`));
  breaker.on('close', () => logger.info({ breaker: name }, `Circuit breaker [${name}] CLOSED - service recovered`));
  breaker.on('fallback', (result) => logger.debug({ breaker: name }, `Circuit breaker [${name}] executed fallback`));

  activeBreakers.set(name, breaker);
  return breaker;
}

// Returns the live status of all registered breakers for readiness checks
function getBreakersStatus() {
  const status = {};
  for (const [name, breaker] of activeBreakers.entries()) {
    status[name] = {
      opened: breaker.opened,
      halfOpen: breaker.halfOpen,
      closed: breaker.closed,
      stats: breaker.stats
    };
  }
  return status;
}

module.exports = {
  createBreaker,
  getBreakersStatus
};
