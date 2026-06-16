import express from 'express';
import { createJob, getJobs } from '../controllers/job.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';

const router = express.Router();

// Anyone logged in can VIEW jobs
router.get('/', authenticate, getJobs);

// Only recruiters and admins can CREATE jobs
router.post('/', authenticate, authorize('recruiter', 'admin'), createJob);

export default router;