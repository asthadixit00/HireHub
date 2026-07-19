// PURPOSE: Initialize Cloudinary with credentials
// and configure Multer to upload directly to Cloudinary.
// WHY SEPARATE FILE: Config concerns stay in config folder.
// Both Multer and Cloudinary setup live here since
// they work together as one pipeline.
import dotenv from 'dotenv';
dotenv.config(); // ← add this

import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configure Cloudinary with credentials from .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure where and how files are stored in Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    // Determine folder based on file type
    let folder = 'hirehub/misc';
    if (file.fieldname === 'resume') folder = 'hirehub/resumes';
    if (file.fieldname === 'avatar') folder = 'hirehub/avatars';

    return {
      folder,
      allowed_formats: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'],
      resource_type: 'auto', // auto-detect image vs raw file
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`
    };
  }
});

// File filter — only allow specific file types
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);  // accept file
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, JPG, PNG allowed'), false);
  }
};

// Create Multer instance with Cloudinary storage
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
});

export default cloudinary;