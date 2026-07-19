import express from 'express';
import { uploadResume, uploadAvatar } from '../controllers/upload.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// Custom Multer error handler
const handleUpload = (fieldname) => (req, res, next) => {
  upload.single(fieldname)(req, res, (err) => {
    if (err) {
      console.log('=== MULTER ERROR ===');
      console.log('Multer error:', err);
      console.log('Multer message:', err.message);
      console.log('Multer name:', err.name);
      return next(err);
    }
    console.log('=== MULTER SUCCESS ===');
    console.log('req.file after multer:', req.file);
    next();
  });
};

router.post(
  '/resume',
  authenticate,
  authorize('candidate'),
  handleUpload('resume'),
  uploadResume
);

router.post(
  '/avatar',
  authenticate,
  handleUpload('avatar'),
  uploadAvatar
);

export default router;