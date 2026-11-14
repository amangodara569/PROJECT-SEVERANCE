const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Required environment variables for server operation
const requiredVars = ['JWT_SECRET', 'CLIENT_URL'];

// Validates that required environment variables are set before starting
function validateEnv() {
  const missing = [];
  for (const name of requiredVars) {
    if (!process.env[name]) {
      missing.push(name);
    }
  }

  if (missing.length > 0) {
    console.error(`FATAL: Missing required environment variables: ${missing.join(', ')}`);
    console.error('Please configure them in server/.env before starting the server.');
    process.exit(1);
  }
}

validateEnv();

module.exports = {
  PORT: process.env.PORT || 5000,
  JWT_SECRET: process.env.JWT_SECRET,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  MONGO_URI: process.env.MONGODB_URI || process.env.MONGO_URI || null,
  REDIS_URL: process.env.REDIS_URL || null,
  NODE_ENV: process.env.NODE_ENV || 'development',
  INSTANCE_ID: process.env.INSTANCE_ID || `instance-${Math.random().toString(36).substring(2, 9)}`
};
