// PURPOSE: Prevents abuse by limiting requests per IP
// WHY: Protects against brute force, DDoS, and spam
// Different limits for different routes based on sensitivity

import rateLimit from 'express-rate-limit';

// General API limit — applied to all routes
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                   // 100 requests per 15 min per IP
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  },
  standardHeaders: true,  // Return rate limit info in headers
  legacyHeaders: false
});

// Strict limit for auth routes — prevents brute force
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                    // only 10 login attempts per 15 min
  message: {
    success: false,
    message: 'Too many login attempts, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Upload limit — prevents storage abuse
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,                    // 20 uploads per hour
  message: {
    success: false,
    message: 'Too many uploads, please try again after an hour'
  },
  standardHeaders: true,
  legacyHeaders: false
});