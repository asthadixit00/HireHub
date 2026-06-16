// PURPOSE: Restricts route access based on user role.
// WHY SEPARATE FROM authenticate: Authentication and
// Authorization are different concerns. This middleware
// assumes authenticate already ran and req.user exists.

import ApiError from '../utils/ApiError.js';

// Higher-order function — returns a middleware function
// Usage: authorize('recruiter', 'admin')
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ApiError(403, `Role '${req.user.role}' is not authorized to access this resource`)
      );
    }

    next();
  };
};