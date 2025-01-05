import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import errorService from '../services/errorService';

export const useError = (options = {}) => {
  const {
    showAlert = true,
    captureInSentry = true,
    logToAnalytics = true,
    context = {},
  } = options;

  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleError = useCallback((error, additionalContext = {}) => {
    const errorInfo = {
      message: error.message,
      code: error.code,
      context: {
        ...context,
        ...additionalContext,
      },
    };

    setError(errorInfo);

    if (captureInSentry) {
      errorService.handleError(error, errorInfo.context, showAlert);
    } else if (showAlert) {
      Alert.alert('Error', errorInfo.message);
    }

    if (logToAnalytics) {
      // Log to analytics service
      analytics.logEvent('error_occurred', errorInfo);
    }

    return errorInfo;
  }, [showAlert, captureInSentry, logToAnalytics, context]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const withErrorHandling = useCallback((asyncFn) => {
    return async (...args) => {
      try {
        setIsLoading(true);
        clearError();
        const result = await asyncFn(...args);
        return result;
      } catch (error) {
        handleError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    };
  }, [handleError, clearError]);

  return {
    error,
    isLoading,
    handleError,
    clearError,
    withErrorHandling,
  };
}; 