// PURPOSE: Defines structure of job postings.
// Only recruiters create these.
// References User model for the poster's identity.

import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },

    description: {
      type: String,
      required: [true, 'Job description is required'],
      maxlength: [5000, 'Description cannot exceed 5000 characters']
    },

    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true
    },

    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true
    },

    jobType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship', 'remote'],
      required: [true, 'Job type is required']
    },

    experienceLevel: {
      type: String,
      enum: ['entry', 'mid', 'senior', 'lead'],
      required: [true, 'Experience level is required']
    },

    salary: {
      min: { type: Number, default: null },
      max: { type: Number, default: null },
      currency: { type: String, default: 'INR' }
    },

    skills: {
      type: [String],   // Array of strings: ["React", "Node.js", "MongoDB"]
      default: []
    },

    // Reference to User who posted this job
    // This is how MongoDB relationships work
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,   // stores the _id of a User
      ref: 'User',                             // tells Mongoose which model
      required: true
    },

    status: {
      type: String,
      enum: ['open', 'closed', 'draft'],
      default: 'open'
    },

    applicationCount: {
      type: Number,
      default: 0        // we increment this when someone applies
    },

    deadline: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// ─── INDEXES FOR SEARCH PERFORMANCE ───────────────────────────
// When users search jobs, these fields are queried most
// Indexes make queries 100x faster on large datasets
// We'll explain this deeply on Day 8 (Search & Filter)

jobSchema.index({ title: 'text', description: 'text', skills: 'text' });
jobSchema.index({ location: 1 });
jobSchema.index({ jobType: 1 });
jobSchema.index({ status: 1 });

const Job = mongoose.model('Job', jobSchema);
export default Job;