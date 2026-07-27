import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import passport from 'passport';
import connectDB from './config/db.js';
import getRedisClient from './config/redis.js';
import './config/passport.js';
import authRoutes from './routes/authRoutes.js';
import linkRoutes from './routes/linkRoutes.js';
import qrRoutes from './routes/qrRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import billingRoutes from './routes/billingRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import { redirectSlug } from './controllers/linkController.js';
import startAnalyticsWorker from './services/analyticsWorker.js';
import { apiLimiter, redirectLimiter } from './middleware/rateLimiter.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [process.env.CLIENT_URL || 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// Apply global API rate limiting per Section 8 and disable browser caching of API endpoints
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  next();
}, apiLimiter);

// Public Redirect Route per Section 5 & 8 (protected by high-throughput redirect limiter)
app.get('/r/:slug', redirectLimiter, redirectSlug);

// API Routes (auth route protected by auth limiter against brute force attempts)
app.use('/api/auth', authRoutes);
app.use('/api/links', linkRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/settings', settingsRoutes);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

// Root fallback
app.get('/', (req, res) => {
  res.send('NanoLink Backend API is running.');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack || err.message);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Initialize DB, Redis, Worker, and start server
connectDB().then(() => {
  getRedisClient(); // Initialize Redis client / mock fallback
  startAnalyticsWorker(30000); // Start batch counter flushing worker (30s) per Section 8
  app.listen(PORT, () => {
    console.log(`🚀 NanoLink Backend Server running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to initialize database:', err);
});

export default app;
