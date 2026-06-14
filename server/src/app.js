// server/src/app.js
// PURPOSE: Configure the Express application.
// All middleware and routes are registered here.
// WHY SEPARATE FROM server.js: Clean separation between
// app config and server startup.

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

const app = express();

// --- MIDDLEWARE CHAIN ---
// Every request passes through these in order, top to bottom

// 1. Security headers
app.use(helmet());

// 2. Enable CORS (allows React on port 5173 to call us)
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// 3. Parse incoming JSON bodies
app.use(express.json());

// 4. Parse URL-encoded bodies (form submissions)
app.use(express.urlencoded({ extended: true }));

// 5. HTTP request logging
app.use(morgan('dev'));

// --- HEALTH CHECK ROUTE ---
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'HireHub API is running'
  });
});

// --- API ROUTES (added as we build) ---
// app.use('/api/v1/auth', authRoutes);
// app.use('/api/v1/jobs', jobRoutes);

export default app;