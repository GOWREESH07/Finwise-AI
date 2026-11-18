require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initializeDB } = require('./db/database');
const { startScheduler } = require('./services/schedulerService');

// Import routes
const authRoutes = require('./routes/auth');
const analyzeRoutes = require('./routes/analyze');
const profileRoutes = require('./routes/profile');
const emailRoutes = require('./routes/email');
const marketRoutes = require('./routes/market');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Parse JSON bodies
app.use(express.json());

// Initialize database
initializeDB();

// Start email scheduler
startScheduler();

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/analyze', analyzeRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/market', marketRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 FinWise AI Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
