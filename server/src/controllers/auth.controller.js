import User from '../models/User.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken.js';
import jwt from 'jsonwebtoken';

// ─── REGISTER ─────────────────────────────────────────────────
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, company } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(409, 'Email already registered');
    }

    // Create user — pre-save hook hashes password automatically
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'candidate',
      company: role === 'recruiter' ? company : null
    });

    // Don't return password in response
    const userResponse = await User.findById(user._id).select('-password -refreshToken');

    res.status(201).json(
      new ApiResponse(201, { user: userResponse }, 'Registration successful')
    );

  } catch (error) {
    next(error); // passes to error middleware
  }
};

// ─── LOGIN ────────────────────────────────────────────────────
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Must explicitly select password (select: false in schema)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    // Compare entered password with hashed password
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      throw new ApiError(401, 'Invalid email or password');
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token in database
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // Send refresh token in httpOnly cookie (JS cannot access)
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
    });

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    res.status(200).json(
      new ApiResponse(200, { user: userResponse, accessToken }, 'Login successful')
    );

  } catch (error) {
    next(error);
  }
};

// ─── LOGOUT ───────────────────────────────────────────────────
export const logout = async (req, res, next) => {
  try {
    // Clear refresh token from database
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });

    // Clear cookie
    res.clearCookie('refreshToken');

    res.status(200).json(
      new ApiResponse(200, {}, 'Logged out successfully')
    );
  } catch (error) {
    next(error);
  }
};

// ─── REFRESH ACCESS TOKEN ─────────────────────────────────────
export const refreshAccessToken = async (req, res, next) => {
  try {
    const incomingRefreshToken = req.cookies?.refreshToken;

    if (!incomingRefreshToken) {
      throw new ApiError(401, 'Refresh token not found');
    }

    // Verify the refresh token
    const decoded = jwt.verify(incomingRefreshToken, process.env.JWT_REFRESH_SECRET);

    const user = await User.findById(decoded.userId).select('+refreshToken');

    if (!user || user.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, 'Invalid refresh token');
    }

    // Generate new access token
    const accessToken = generateAccessToken(user._id, user.role);

    res.status(200).json(
      new ApiResponse(200, { accessToken }, 'Access token refreshed')
    );

  } catch (error) {
    next(error);
  }
};