import * as Sentry from '@sentry/react-native';
import { analyticsService } from './analyticsService';

export const errorReportingService = {
  // Initialize error reporting
  init: () => {
    Sentry.init({
      dsn: 'YOUR_SENTRY_DSN',
      enableAutoSessionTracking: true,
      debug: __DEV__,
      beforeSend: (event) => {
        // Filter out certain errors or modify event data
        if (event.exception) {
          // Log to analytics
          analyticsService.logError(event.exception);
        }
        return event;
      },
    });
  },

  // Capture error
  captureError: (error, context = {}) => {
    try {
      Sentry.captureException(error, {
        extra: context,
      });
      
      // Also log to analytics
      analyticsService.logError(error, context);
    } catch (err) {
      console.error('Error capture failed:', err);
    }
  },

  // Set user context
  setUser: (user) => {
    try {
      Sentry.setUser({
        id: user.id,
        email: user.email,
        username: user.displayName,
      });

      // Also set analytics user properties
      analyticsService.setUserProperties({
        user_id: user.id,
        email: user.email,
        username: user.displayName,
      });
    } catch (error) {
      console.error('Set user context error:', error);
    }
  },

  // Add breadcrumb
  addBreadcrumb: (category, message, data = {}) => {
    try {
      Sentry.addBreadcrumb({
        category,
        message,
        data,
        level: Sentry.Severity.Info,
      });
    } catch (error) {
      console.error('Add breadcrumb error:', error);
    }
  },
}; 