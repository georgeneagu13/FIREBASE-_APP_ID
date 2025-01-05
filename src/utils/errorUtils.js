import { Platform } from 'react-native';

// Custom error classes
export class APIError extends Error {
  constructor(message, code, response) {
    super(message);
    this.name = 'APIError';
    this.code = code;
    this.response = response;
  }
}

export class ValidationError extends Error {
  constructor(message, fields) {
    super(message);
    this.name = 'ValidationError';
    this.fields = fields;
  }
}

export class NetworkError extends Error {
  constructor(message, originalError) {
    super(message || 'Network connection error');
    this.name = 'NetworkError';
    this.originalError = originalError;
  }
}

// Error mapping functions
export const mapAPIError = (error) => {
  if (!error.response) {
    return new NetworkError();
  }

  const { status, data } = error.response;
  let message = data?.message || 'An unexpected error occurred';
  let code = data?.code || 'UNKNOWN_ERROR';

  switch (status) {
    case 400:
      return new ValidationError(message, data?.fields);
    case 401:
      return new APIError('Authentication required', 'UNAUTHORIZED', error.response);
    case 403:
      return new APIError('Access denied', 'FORBIDDEN', error.response);
    case 404:
      return new APIError('Resource not found', 'NOT_FOUND', error.response);
    case 429:
      return new APIError('Too many requests', 'RATE_LIMIT', error.response);
    case 500:
      return new APIError('Server error', 'SERVER_ERROR', error.response);
    default:
      return new APIError(message, code, error.response);
  }
};

// Error formatting functions
export const formatErrorForUser = (error) => {
  const errorMessages = {
    NetworkError: 'Please check your internet connection and try again.',
    ValidationError: 'Please check your input and try again.',
    APIError: {
      UNAUTHORIZED: 'Please log in to continue.',
      FORBIDDEN: 'You don\'t have permission to perform this action.',
      NOT_FOUND: 'The requested resource was not found.',
      RATE_LIMIT: 'Please try again later.',
      SERVER_ERROR: 'Something went wrong on our end. Please try again later.',
    },
  };

  if (error instanceof NetworkError) {
    return errorMessages.NetworkError;
  }

  if (error instanceof ValidationError) {
    if (error.fields) {
      return Object.values(error.fields).join('\n');
    }
    return errorMessages.ValidationError;
  }

  if (error instanceof APIError) {
    return errorMessages.APIError[error.code] || error.message;
  }

  return error.message || 'An unexpected error occurred';
};

// Error debugging helpers
export const getErrorDetails = (error) => {
  return {
    name: error.name,
    message: error.message,
    code: error.code,
    stack: __DEV__ ? error.stack : undefined,
    platform: Platform.OS,
    version: Platform.Version,
    timestamp: new Date().toISOString(),
  };
};

// Validation helpers
export const validateFields = (data, schema) => {
  const errors = {};
  
  Object.keys(schema).forEach(field => {
    const value = data[field];
    const rules = schema[field];

    if (rules.required && !value) {
      errors[field] = `${field} is required`;
    }

    if (rules.minLength && value?.length < rules.minLength) {
      errors[field] = `${field} must be at least ${rules.minLength} characters`;
    }

    if (rules.maxLength && value?.length > rules.maxLength) {
      errors[field] = `${field} must be less than ${rules.maxLength} characters`;
    }

    if (rules.pattern && !rules.pattern.test(value)) {
      errors[field] = `${field} is invalid`;
    }

    if (rules.custom) {
      const customError = rules.custom(value, data);
      if (customError) {
        errors[field] = customError;
      }
    }
  });

  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Validation failed', errors);
  }

  return true;
};

// Retry logic
export const withRetry = async (fn, options = {}) => {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoff = 2,
    shouldRetry = (error) => error instanceof NetworkError,
  } = options;

  let lastError;
  let attempt = 0;

  while (attempt < maxAttempts) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (!shouldRetry(error) || attempt + 1 >= maxAttempts) {
        throw error;
      }

      const waitTime = delay * Math.pow(backoff, attempt);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      attempt++;
    }
  }

  throw lastError;
}; 