// PURPOSE: Verifies JWT access token and attaches the
// authenticated user to req.user for use in controllers.
// WHY IT EXISTS: Without this, every protected route would
// need to manually verify tokens — violates DRY principle.

import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import ApiError from '../utils/ApiError.js';

export const authenticate = async (req, res, next) => {
  try {
    // 1. Extract token from "Authorization: Bearer <token>" header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'No token provided, access denied');
    }

    const token = authHeader.split(' ')[1]; // "Bearer xyz" → "xyz"

    // 2. Verify token signature and expiry
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new ApiError(401, 'Access token expired, please refresh');
      }
      throw new ApiError(401, 'Invalid token');
    }

    // 3. Find the user in database
    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new ApiError(401, 'User belonging to this token no longer exists');
    }

    if (!user.isActive) {
      throw new ApiError(403, 'Your account has been deactivated');
    }

    // 4. Attach user to request object — available in all subsequent handlers
    req.user = user;

    next(); // continue to next middleware/controller

  } catch (error) {
    next(error);
  }
};