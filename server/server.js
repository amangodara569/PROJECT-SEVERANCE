const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Verify critical security configuration
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is missing. Server cannot start.');
  process.exit(1);
}

// Ensure in-memory database is initialized
const store = require('./db/store');

const app = express();

// Security middleware: helmet headers
app.use(helmet());

// CORS configuration restricting access to configured CLIENT_URL
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({
  origin: allowedOrigin,
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '100kb' }));

// Global rate limiting: 100 requests per 15 minutes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  skip: () => process.env.NODE_ENV === 'test',
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api', generalLimiter);

// Strict rate limiting on login & register: 10 requests per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skip: () => process.env.NODE_ENV === 'test',
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts, please try again later.' }
});

const authRoutes = require('./routes/auth');
const floorRoutes = require('./routes/floors');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const reportRoutes = require('./routes/reports');
const layoffRoutes = require('./routes/layoffs');
const jobRoutes = require('./routes/jobs');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');

// Mount routes with rate limits applied
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/floors', floorRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/layoffs', layoffRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/users', userRoutes);
app.use('/api', commentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Linked Out API is running'
  });
});

// Start Express server if run directly
const PORT = process.env.PORT || 5000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
