// PURPOSE: Tracks every job application.
// Links a Candidate (User) to a Job.
// Also stores application status as recruiter reviews it.

import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true
    },

    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    status: {
      type: String,
      enum: ['applied', 'reviewing', 'shortlisted', 'rejected', 'hired'],
      default: 'applied'
    },

    resume: {
      type: String,    // Cloudinary URL of resume uploaded at time of applying
      required: [true, 'Resume is required to apply']
    },

    coverLetter: {
      type: String,
      maxlength: [1000, 'Cover letter cannot exceed 1000 characters'],
      default: null
    },

    appliedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// ─── COMPOUND INDEX ────────────────────────────────────────────
// Prevents a candidate from applying to the same job twice
// unique: true on COMBINATION of job + applicant
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

const Application = mongoose.model('Application', applicationSchema);
export default Application;