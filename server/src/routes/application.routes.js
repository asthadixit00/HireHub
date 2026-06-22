import express from 'express';
import {
  applyForJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  withdrawApplication
} from '../controllers/application.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';

const router = express.Router();

// Candidate applies to a job
// POST /api/v1/applications/job/:id
router.post(
  '/job/:id',
  authenticate,
  authorize('candidate'),
  applyForJob
);

// Candidate sees their own applications
// GET /api/v1/applications/my
router.get(
  '/my',
  authenticate,
  authorize('candidate'),
  getMyApplications
);

// Candidate withdraws their application
// DELETE /api/v1/applications/:id/withdraw
router.delete(
  '/:id/withdraw',
  authenticate,
  authorize('candidate'),
  withdrawApplication
);

// Recruiter sees all applications for their job
// GET /api/v1/applications/job/:id
router.get(
  '/job/:id',
  authenticate,
  authorize('recruiter', 'admin'),
  getJobApplications
);

// Recruiter updates application status
// PATCH /api/v1/applications/:id/status
router.patch(
  '/:id/status',
  authenticate,
  authorize('recruiter', 'admin'),
  updateApplicationStatus
);

export default router;