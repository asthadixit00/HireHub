import Job from '../models/Job.model.js';
import ApiResponse from '../utils/ApiResponse.js';

// Temporary test controller — full CRUD comes Day 5
export const createJob = async (req, res, next) => {
  try {
    const job = await Job.create({
      ...req.body,
      postedBy: req.user._id   // comes from auth middleware
    });

    res.status(201).json(
      new ApiResponse(201, { job }, 'Job created successfully')
    );
  } catch (error) {
    next(error);
  }
};

export const getJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find().populate('postedBy', 'name email company');

    res.status(200).json(
      new ApiResponse(200, { jobs, count: jobs.length }, 'Jobs fetched successfully')
    );
  } catch (error) {
    next(error);
  }
};