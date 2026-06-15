// PURPOSE: Generate JWT access and refresh tokens
// WHY SEPARATE FILE: Token generation logic used in
// multiple places (login, refresh) — DRY principle
/*
import jwt from 'jsonwebtoken';

export const generateAccessToken = (userId, role) => {
  return jwt.sign(
    { userId, role },                    // payload — what we store in token
    process.env.JWT_ACCESS_SECRET,       // secret key for signing
    { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' }
  );
};

export const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d' }
  );
}; */

import jwt from 'jsonwebtoken';

export const generateAccessToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' }
  );
};

export const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};