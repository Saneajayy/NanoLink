import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './config/db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

import authRoutes from './routes/authRoutes';
import linkRoutes from './routes/linkRoutes';
import redirectRoutes from './routes/redirectRoutes';
import paymentRoutes from './routes/paymentRoutes';
import publicRoutes from './routes/publicRoutes';
import { startClickFlusher } from './workers/clickFlusher';

// Start background workers
startClickFlusher();

// Basic route
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'NanoLink API is running' });
});

// Routes
app.use('/api', publicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/links', linkRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/r', redirectRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
