import crashlytics from '@react-native-firebase/crashlytics';
import { enhancedAnalytics } from './enhancedAnalyticsService';
import environment from '../config/environments';

class CrashReportingService {
  constructor() {
    this.isEnabled = environment.analyticsEnabled;
    this.breadcrumbs = [];
    this.maxBreadcrumbs = 100;
  }

  async init() {
    try {
      await crashlytics().setCrashlyticsCollectionEnabled(this.isEnabled);
      
      // Set up global error handlers
      this.setupErrorHandlers();
    } catch (error) {
      console.error('Crash reporting init error:', error);
    }
  }

  setupErrorHandlers() {
    // Handle unhandled JS errors
    ErrorUtils.setGlobalHandler((error, isFatal) => {
      this.recordError(error, {
        fatal: isFatal,
        type: 'unhandled_js_error',
      });
    });

    // Handle unhandled promise rejections
    const originalHandler = global.onunhandledrejection;
    global.onunhandledrejection = (event) => {
      this.recordError(event.reason, {
        type: 'unhandled_promise_rejection',
      });
      if (originalHandler) originalHandler(event);
    };
  }

  async recordError(error, context = {}) {
    if (!this.isEnabled) return;

    try {
      // Log to analytics
      await enhancedAnalytics.logEvent('app_error', {
        error_message: error.message,
        error_stack: error.stack,
        ...context,
      });

      // Set custom keys for the crash report
      Object.entries(context).forEach(([key, value]) => {
        crashlytics().setCustomKey(key, String(value));
      });

      // Add breadcrumbs to the crash report
      this.breadcrumbs.forEach(breadcrumb => {
        crashlytics().recordError(breadcrumb);
      });

      // Record the error
      await crashlytics().recordError(error);
    } catch (err) {
      console.error('Record error failed:', err);
    }
  }

  async addBreadcrumb(message, category = 'app', level = 'info') {
    if (!this.isEnabled) return;

    try {
      const breadcrumb = {
        timestamp: Date.now(),
        message,
        category,
        level,
      };

      // Add to local breadcrumbs array
      this.breadcrumbs.push(breadcrumb);
      if (this.breadcrumbs.length > this.maxBreadcrumbs) {
        this.breadcrumbs.shift();
      }

      // Record in crashlytics
      await crashlytics().log(`${category}: ${message}`);
    } catch (error) {
      console.error('Add breadcrumb error:', error);
    }
  }

  async setAttribute(key, value) {
    if (!this.isEnabled) return;

    try {
      await crashlytics().setCustomKey(key, String(value));
    } catch (error) {
      console.error('Set attribute error:', error);
    }
  }

  async setAttributes(attributes) {
    if (!this.isEnabled) return;

    try {
      Object.entries(attributes).forEach(([key, value]) => {
        crashlytics().setCustomKey(key, String(value));
      });
    } catch (error) {
      console.error('Set attributes error:', error);
    }
  }
}

export const crashReporting = new CrashReportingService(); 