const ERROR_CONSTANTS = {
  SERVER: {
    INTERNAL_ERROR: { message: 'An internal server error occurred', code: 'INTERNAL_ERROR' },
    NOT_FOUND: { message: 'The requested resource was not found', code: 'NOT_FOUND' },
  },
  AUTH: {
    UNAUTHORIZED: { message: 'Authentication required', code: 'AUTH_REQUIRED' },
    INVALID_TOKEN: { message: 'Invalid or expired token', code: 'INVALID_TOKEN' },
    FORBIDDEN: { message: 'You do not have permission to perform this action', code: 'FORBIDDEN' },
  },
  VALIDATION: {
    BAD_REQUEST: { message: 'Invalid request data', code: 'VALIDATION_ERROR' },
  },
  RESOURCE: {
    NOT_FOUND: { message: 'Resource not found', code: 'RESOURCE_NOT_FOUND' },
    CONFLICT: { message: 'Resource conflict', code: 'RESOURCE_CONFLICT' },
  },
};

export default ERROR_CONSTANTS;
