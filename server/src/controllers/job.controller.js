// PURPOSE: Handles all job-related business logic.
// Each function = one API endpoint's logic.
// Controllers are kept thin — they orchestrate,
// not implement business rules directly.

import Job from '../models/Job.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

// ─── CREATE JOB ───────────────────────────────────────────────
// Only recruiters can create jobs (enforced in routes)
export const createJob = async (req, res, next) => {
  try {
    const {
      title, description, company, location,
      jobType, experienceLevel, salary, skills, deadline
    } = req.body;

    const job = await Job.create({
      title,
      description,
      company,
      location,
      jobType,
      experienceLevel,
      salary,
      skills: skills || [],
      deadline,
      postedBy: req.user._id  // from auth middleware
    });

    res.status(201).json(
      new ApiResponse(201, { job }, 'Job created successfully')
    );
  } catch (error) {
    next(error);
  }
};

// ─── GET ALL JOBS ─────────────────────────────────────────────
// Public route — anyone can view jobs
export const getJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ status: 'open' })
      .populate('postedBy', 'name email company')
      .sort({ createdAt: -1 }); // newest first

    res.status(200).json(
      new ApiResponse(200, { jobs, count: jobs.length }, 'Jobs fetched successfully')
    );
  } catch (error) {
    next(error);
  }
};

// ─── GET SINGLE JOB ───────────────────────────────────────────
export const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'name email company website');

    if (!job) {
      throw new ApiError(404, 'Job not found');
    }

    res.status(200).json(
      new ApiResponse(200, { job }, 'Job fetched successfully')
    );
  } catch (error) {
    next(error);
  }
};

// ─── UPDATE JOB ───────────────────────────────────────────────
// Only the recruiter who posted the job can update it
export const updateJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      throw new ApiError(404, 'Job not found');
    }

    // Check ownership — only the poster can update
    if (job.postedBy.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'You are not authorized to update this job');
    }

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
      // new: true      → returns updated document, not original
      // runValidators  → runs schema validation on update too
    );

    res.status(200).json(
      new ApiResponse(200, { job: updatedJob }, 'Job updated successfully')
    );
  } catch (error) {
    next(error);
  }
};

// ─── DELETE JOB ───────────────────────────────────────────────
// Only the recruiter who posted it OR admin can delete
export const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      throw new ApiError(404, 'Job not found');
    }

    // Allow if user is the poster OR if user is admin
    const isOwner = job.postedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      throw new ApiError(403, 'You are not authorized to delete this job');
    }

    await Job.findByIdAndDelete(req.params.id);

    res.status(200).json(
      new ApiResponse(200, {}, 'Job deleted successfully')
    );
  } catch (error) {
    next(error);
  }
};

// ─── GET MY JOBS (Recruiter's own jobs) ───────────────────────
export const getMyJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json(
      new ApiResponse(200, { jobs, count: jobs.length }, 'Your jobs fetched successfully')
    );
  } catch (error) {
    next(error);
  }
};