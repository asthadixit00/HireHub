// PURPOSE: Defines validation rules for job-related requests.
// WHY SEPARATE FILE: Keeps route files clean.
// Each validator is an array of rules + the validate middleware.

import { body } from 'express-validator';
import { validate } from '../validate.middleware.js';

export const createJobValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Job title is required')
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),

  body('description')
    .trim()
    .notEmpty().withMessage('Job description is required')
    .isLength({ min: 50 }).withMessage('Description must be at least 50 characters'),

  body('company')
    .trim()
    .notEmpty().withMessage('Company name is required'),

  body('location')
    .trim()
    .notEmpty().withMessage('Location is required'),

  body('jobType')
    .notEmpty().withMessage('Job type is required')
    .isIn(['full-time', 'part-time', 'contract', 'internship', 'remote'])
    .withMessage('Invalid job type'),

  body('experienceLevel')
    .notEmpty().withMessage('Experience level is required')
    .isIn(['entry', 'mid', 'senior', 'lead'])
    .withMessage('Invalid experience level'),

  body('salary.min')
    .optional()
    .isNumeric().withMessage('Minimum salary must be a number'),

  body('salary.max')
    .optional()
    .isNumeric().withMessage('Maximum salary must be a number'),

  validate  // ← runs last, checks all rules above
];

export const updateJobValidator = [
  body('title')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),

  body('jobType')
    .optional()
    .isIn(['full-time', 'part-time', 'contract', 'internship', 'remote'])
    .withMessage('Invalid job type'),

  body('experienceLevel')
    .optional()
    .isIn(['entry', 'mid', 'senior', 'lead'])
    .withMessage('Invalid experience level'),

  validate
];