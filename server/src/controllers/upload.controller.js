// PURPOSE: Handles file upload endpoints.
// Multer middleware processes the file BEFORE this
// controller runs — req.file is already uploaded
// to Cloudinary by the time we get here.

import User from '../models/User.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

// ─── UPLOAD RESUME ────────────────────────────────────────────
export const uploadResume = async (req, res, next) => {
  try {
    // req.file is set by Multer after successful upload
    if (!req.file) {
      throw new ApiError(400, 'No file uploaded');
    }

    // Cloudinary URL is in req.file.path
    const resumeUrl = req.file.path;

    // Save URL to user's profile in MongoDB
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { resume: resumeUrl },
      { new: true }
    ).select('-password -refreshToken');

    res.status(200).json(
      new ApiResponse(200, { user, resumeUrl }, 'Resume uploaded successfully')
    );
  } catch (error) {
    next(error);
  }
};

// ─── UPLOAD AVATAR ────────────────────────────────────────────
export const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ApiError(400, 'No file uploaded');
    }

    const avatarUrl = req.file.path;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarUrl },
      { new: true }
    ).select('-password -refreshToken');

    res.status(200).json(
      new ApiResponse(200, { user, avatarUrl }, 'Avatar uploaded successfully')
    );
  } catch (error) {
    next(error);
  }
};