// PURPOSE: Checks express-validator results after validation rules run.
// If errors exist, stops the request and returns 400.
// WHY SEPARATE: Keeps validation rules clean and reusable.
// One middleware handles ALL validation checking.

import { validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';

export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => ({
      field: err.path,
      message: err.msg
    }));

    return next(new ApiError(400, 'Validation failed', errorMessages));
  }

  next();
};