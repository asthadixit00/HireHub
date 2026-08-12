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
// ─── GET ALL JOBS WITH SEARCH + FILTER + PAGINATION ──────────
export const getJobs = async (req, res, next) => {
  try {
    const {
      search,
      location,
      jobType,
      experienceLevel,
      minSalary,
      maxSalary,
      skills,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // ── Build Filter Object ────────────────────────────────────
    const filter = { status: 'open' };

    // Search — checks title, description, skills using text index
    if (search) {
      filter.$or = [
        { title:       { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { company:     { $regex: search, $options: 'i' } },
        { skills:      { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by location
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    // Filter by job type
    if (jobType) {
      filter.jobType = jobType;
    }

    // Filter by experience level
    if (experienceLevel) {
      filter.experienceLevel = experienceLevel;
    }

    // Filter by salary range
    if (minSalary) {
      filter['salary.min'] = { $gte: Number(minSalary) };
    }
    if (maxSalary) {
      filter['salary.max'] = { $lte: Number(maxSalary) };
    }

    // Filter by skills (comma separated: "React,Node.js,MongoDB")
    if (skills) {
      const skillsArray = skills.split(',').map(s => s.trim());
      filter.skills = { $in: skillsArray };
    }

    // ── Pagination ─────────────────────────────────────────────
    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit))); // max 50 per page
    const skip     = (pageNum - 1) * limitNum;

    // ── Sorting ────────────────────────────────────────────────
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    // ── Execute Queries ────────────────────────────────────────
    // Run both queries simultaneously using Promise.all
    const [jobs, totalJobs] = await Promise.all([
      Job.find(filter)
        .populate('postedBy', 'name email company')
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      Job.countDocuments(filter) // total count for pagination meta
    ]);

    // ── Pagination Metadata ────────────────────────────────────
    const totalPages  = Math.ceil(totalJobs / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.status(200).json(
      new ApiResponse(200, {
        jobs,
        pagination: {
          totalJobs,
          totalPages,
          currentPage:  pageNum,
          limit:        limitNum,
          hasNextPage,
          hasPrevPage
        }
      }, 'Jobs fetched successfully')
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