import express from 'express';
import {
  createJob, getJobs, getJobById,
  updateJob, deleteJob, getMyJobs
} from '../controllers/job.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { createJobValidator, updateJobValidator } from '../middleware/validators/job.validator.js';

const router = express.Router();

// ── Public Routes ──────────────────────────────────────────────
router.get('/', getJobs);                    // anyone can view jobs
router.get('/:id', getJobById);              // anyone can view one job

// ── Protected Routes ───────────────────────────────────────────
router.get('/my/jobs', authenticate, authorize('recruiter'), getMyJobs);

router.post(
  '/',
  authenticate,
  authorize('recruiter', 'admin'),
  createJobValidator,                        // validate input
  createJob
);

router.patch(
  '/:id',
  authenticate,
  authorize('recruiter', 'admin'),
  updateJobValidator,
  updateJob
);

router.delete(
  '/:id',
  authenticate,
  authorize('recruiter', 'admin'),
  deleteJob
);

export default router;