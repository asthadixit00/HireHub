import Application from '../models/Application.model.js';
import Job from '../models/Job.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

// ─── APPLY FOR A JOB ──────────────────────────────────────────
// Only candidates can apply
export const applyForJob = async (req, res, next) => {
  try {
    const { id: jobId } = req.params;
    const { coverLetter } = req.body;
    const candidateId = req.user._id;

    // 1. Check if job exists and is open
    const job = await Job.findById(jobId);
    if (!job) {
      throw new ApiError(404, 'Job not found');
    }
    if (job.status !== 'open') {
      throw new ApiError(400, 'This job is no longer accepting applications');
    }

    // 2. Check if candidate already applied
    // The compound unique index handles this at DB level too
    // but we check here first for a better error message
    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: candidateId
    });
    if (existingApplication) {
      throw new ApiError(409, 'You have already applied for this job');
    }

    // 3. Check resume — must have one uploaded
    // Either from their profile or uploaded now
    const resumeUrl = req.user.resume;
    if (!resumeUrl) {
      throw new ApiError(400, 'Please upload your resume before applying');
    }

    // 4. Create application
    const application = await Application.create({
      job: jobId,
      applicant: candidateId,
      resume: resumeUrl,
      coverLetter: coverLetter || null
    });

    // 5. Increment job's application count
    await Job.findByIdAndUpdate(jobId, {
      $inc: { applicationCount: 1 }
    });

    // 6. Populate response with job and applicant details
    const populatedApplication = await Application.findById(application._id)
      .populate('job', 'title company location')
      .populate('applicant', 'name email');

    res.status(201).json(
      new ApiResponse(201, { application: populatedApplication }, 'Application submitted successfully')
    );
  } catch (error) {
    next(error);
  }
};

// ─── GET MY APPLICATIONS (Candidate) ──────────────────────────
// Candidates see their own applications
export const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({
      applicant: req.user._id
    })
      .populate('job', 'title company location jobType status')
      .sort({ appliedAt: -1 }); // newest first

    res.status(200).json(
      new ApiResponse(
        200,
        { applications, count: applications.length },
        'Applications fetched successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};

// ─── GET APPLICATIONS FOR A JOB (Recruiter) ───────────────────
// Recruiters see who applied to their job
export const getJobApplications = async (req, res, next) => {
  try {
    const { id: jobId } = req.params;

    // Verify the recruiter owns this job
    const job = await Job.findById(jobId);
    if (!job) {
      throw new ApiError(404, 'Job not found');
    }

    if (job.postedBy.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'You are not authorized to view these applications');
    }

    const applications = await Application.find({ job: jobId })
      .populate('applicant', 'name email resume')
      .sort({ appliedAt: -1 });

    res.status(200).json(
      new ApiResponse(
        200,
        { applications, count: applications.length },
        'Applications fetched successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};

// ─── UPDATE APPLICATION STATUS (Recruiter) ────────────────────
// Recruiter moves application through the state machine
export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { id: applicationId } = req.params;
    const { status } = req.body;

    // Validate status value
    const validStatuses = ['applied', 'reviewing', 'shortlisted', 'rejected', 'hired'];
    if (!validStatuses.includes(status)) {
      throw new ApiError(400, `Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    // Find the application
    const application = await Application.findById(applicationId)
      .populate('job');

    if (!application) {
      throw new ApiError(404, 'Application not found');
    }

    // Verify recruiter owns the job this application is for
    if (application.job.postedBy.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'You are not authorized to update this application');
    }

    // Update status
    application.status = status;
    await application.save();

    res.status(200).json(
      new ApiResponse(
        200,
        { application },
        `Application status updated to '${status}'`
      )
    );
  } catch (error) {
    next(error);
  }
};

// ─── WITHDRAW APPLICATION (Candidate) ─────────────────────────
// Candidate can withdraw their own application
export const withdrawApplication = async (req, res, next) => {
  try {
    const { id: applicationId } = req.params;

    const application = await Application.findById(applicationId);

    if (!application) {
      throw new ApiError(404, 'Application not found');
    }

    // Only the applicant can withdraw their own application
    if (application.applicant.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'You are not authorized to withdraw this application');
    }

    // Can't withdraw if already hired
    if (application.status === 'hired') {
      throw new ApiError(400, 'Cannot withdraw an accepted offer');
    }

    await Application.findByIdAndDelete(applicationId);

    // Decrement job application count
    await Job.findByIdAndUpdate(application.job, {
      $inc: { applicationCount: -1 }
    });

    res.status(200).json(
      new ApiResponse(200, {}, 'Application withdrawn successfully')
    );
  } catch (error) {
    next(error);
  }
};