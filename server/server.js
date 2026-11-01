const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB database
connectDB();

const app = express();

// Enable Cross-Origin Resource Sharing and JSON request parsing
app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth');
const floorRoutes = require('./routes/floors');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const reportRoutes = require('./routes/reports');
const layoffRoutes = require('./routes/layoffs');
const jobRoutes = require('./routes/jobs');
const userRoutes = require('./routes/users');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/floors', floorRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/layoffs', layoffRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/users', userRoutes);
app.use('/api', commentRoutes);

// Health check route to verify server is running
app.get('/api/health', (req, res) => {
  try {
    res.json({
      status: 'ok',
      message: 'Linked Out API is running'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the Express server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
