import { Alert } from 'react-native';
import * as Sentry from '@sentry/react-native';
import analytics from './analyticsService';

class ErrorService {
  constructor() {
    this.initializeSentry();
  }

  initializeSentry() {
    Sentry.init({
      dsn: 'YOUR_SENTRY_DSN',
      enableAutoSessionTracking: true,
      sessionTrackingIntervalMillis: 30000,
      debug: __DEV__,
      enabled: !__DEV__,
    });
  }

  handleError = (error, context = {}, showAlert = true) => {
    console.error('Error occurred:', error);

    // Log to analytics
    analytics.logEvent('error_occurred', {
      error_message: error.message,
      error_stack: error.stack,
      error_context: context,
    });

    // Log to Sentry
    Sentry.captureException(error, {
      extra: context,
    });

    if (showAlert) {
      this.showErrorAlert(error);
    }

    return {
      message: error.message,
      code: error.code || 'UNKNOWN_ERROR',
      context,
    };
  };

  handleApiError = (error, context = {}, showAlert = true) => {
    const apiError = {
      message: error.response?.data?.message || error.message,
      code: error.response?.data?.code || error.code || 'API_ERROR',
      status: error.response?.status,
      context,
    };

    // Log to analytics
    analytics.logEvent('api_error', {
      ...apiError,
      url: error.config?.url,
      method: error.config?.method,
    });

    // Log to Sentry
    Sentry.captureException(error, {
      extra: {
        ...apiError,
        request: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data,
        },
        response: error.response?.data,
      },
    });

    if (showAlert) {
      this.showErrorAlert(apiError);
    }

    return apiError;
  };

  showErrorAlert = (error) => {
    const message = this.getErrorMessage(error);
    
    Alert.alert(
      'Error',
      message,
      [{ text: 'OK' }],
      { cancelable: true }
    );
  };

  getErrorMessage = (error) => {
    // Add custom error messages based on error codes
    const errorMessages = {
      'NETWORK_ERROR': 'Please check your internet connection and try again.',
      'UNAUTHORIZED': 'Your session has expired. Please log in again.',
      'FORBIDDEN': 'You don\'t have permission to perform this action.',
      'NOT_FOUND': 'The requested resource was not found.',
      'VALIDATION_ERROR': 'Please check your input and try again.',
      'SERVER_ERROR': 'Something went wrong on our end. Please try again later.',
    };

    return errorMessages[error.code] || error.message || 'An unexpected error occurred.';
  };

  setErrorBoundary = (error, errorInfo) => {
    Sentry.captureException(error, {
      extra: errorInfo,
    });
  };
}

export default new ErrorService(); 