// // server/src/app.js
// // PURPOSE: Configure the Express application.
// // All middleware and routes are registered here.
// // WHY SEPARATE FROM server.js: Clean separation between
// // app config and server startup.
// /*
// import express from 'express';
// import cors from 'cors';
// import helmet from 'helmet';
// import morgan from 'morgan';
// import authRoutes from './routes/auth.routes.js';
// import errorMiddleware from './middleware/error.middleware.js';
// import cookieParser from 'cookie-parser';

// const app = express();

// // --- MIDDLEWARE CHAIN ---
// // Every request passes through these in order, top to bottom

// // 1. Security headers
// app.use(helmet());

// // 2. Enable CORS (allows React on port 5173 to call us)
// app.use(cors({
//   origin: process.env.CLIENT_URL || 'http://localhost:5173',
//   credentials: true
// }));

// // 3. Parse incoming JSON bodies
// app.use(express.json());

// // 4. Parse URL-encoded bodies (form submissions)
// app.use(express.urlencoded({ extended: true }));

// // 5. HTTP request logging
// app.use(morgan('dev'));

// // 6. Parse cookies from incoming requests
// app.use(cookieParser());


// // --- HEALTH CHECK ROUTE ---
// app.get('/health', (req, res) => {
//   res.status(200).json({
//     success: true,
//     message: 'HireHub API is running'
//   });
// });

// // --- API ROUTES (added as we build) ---
// // app.use('/api/v1/auth', authRoutes);
// // app.use('/api/v1/jobs', jobRoutes);
// app.use('/api/v1/auth', authRoutes);

// app.use(errorMiddleware);

// export default app;

// */

// import express from 'express';
// import cors from 'cors';
// import helmet from 'helmet';
// import morgan from 'morgan';
// import cookieParser from 'cookie-parser';
// import authRoutes from './routes/auth.routes.js';
// import errorMiddleware from './middleware/error.middleware.js';
// import jobRoutes from './routes/job.routes.js';
// import applicationRoutes from './routes/application.routes.js';
// import uploadRoutes from './routes/upload.routes.js';
// import { generalLimiter, authLimiter } from './middleware/rateLimiter.middleware.js';


// const app = express();
// app.use('/api/v1/upload', uploadRoutes);
// app.use(helmet());
// app.use(cors({
//   origin: process.env.CLIENT_URL || 'http://localhost:5173',
//   credentials: true
// }));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(morgan('dev'));
// app.use(cookieParser());

// app.get('/health', (req, res) => {
//   res.status(200).json({ success: true, message: 'HireHub API is running' });
// });

// app.use('/api/v1/auth', authRoutes);
// app.use('/api/v1/jobs', jobRoutes);
// app.use('/api/v1/applications', applicationRoutes);

// app.use('/api/', generalLimiter);
// app.use('/api/v1/auth/login', authLimiter);
// app.use('/api/v1/auth/register', authLimiter);

// app.use(errorMiddleware);

// export default app;
import express          from 'express';
import cors             from 'cors';
import helmet           from 'helmet';
import morgan           from 'morgan';
import cookieParser     from 'cookie-parser';
import mongoSanitize    from 'express-mongo-sanitize';

import authRoutes        from './routes/auth.routes.js';
import jobRoutes         from './routes/job.routes.js';
import applicationRoutes from './routes/application.routes.js';
import uploadRoutes      from './routes/upload.routes.js';
import errorMiddleware   from './middleware/error.middleware.js';
import { generalLimiter, authLimiter } from './middleware/rateLimiter.middleware.js';

const app = express();

// 1. Security Headers
app.use(helmet());

// 2. CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// 3. Rate Limiting — BEFORE routes
app.use('/api/', generalLimiter);
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);

// 4. Body Parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize()); // ← goes here, after body parsing
app.use(cookieParser());
app.use(morgan('dev'));

// 5. Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'HireHub API is running' });
});

// 6. Routes
app.use('/api/v1/auth',         authRoutes);
app.use('/api/v1/jobs',         jobRoutes);
app.use('/api/v1/applications', applicationRoutes);
app.use('/api/v1/upload',       uploadRoutes);

// 7. Error Handler — MUST BE LAST
app.use(errorMiddleware);

export default app;