import * as Sentry from '@sentry/react-native';
import analytics from '@react-native-firebase/analytics';
import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';

class ErrorTrackingService {
  constructor() {
    this.isInitialized = false;
    this.environment = __DEV__ ? 'development' : 'production';
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      Sentry.init({
        dsn: 'YOUR_SENTRY_DSN',
        environment: this.environment,
        enableAutoSessionTracking: true,
        debug: __DEV__,
        beforeSend: (event) => this.beforeSend(event),
        integrations: [
          new Sentry.ReactNativeTracing({
            tracingOrigins: ['localhost', 'your-api-domain.com'],
            routingInstrumentation: Sentry.routingInstrumentation,
          }),
        ],
      });

      await this.setUserContext();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize error tracking:', error);
    }
  }

  async setUserContext(user = null) {
    try {
      if (user) {
        Sentry.setUser({
          id: user.id,
          email: user.email,
          username: user.username,
        });
      }

      const deviceInfo = {
        deviceId: await DeviceInfo.getUniqueId(),
        brand: DeviceInfo.getBrand(),
        model: DeviceInfo.getModel(),
        systemVersion: DeviceInfo.getSystemVersion(),
        appVersion: DeviceInfo.getVersion(),
        buildNumber: DeviceInfo.getBuildNumber(),
      };

      Sentry.setContext('device', deviceInfo);
    } catch (error) {
      console.error('Failed to set user context:', error);
    }
  }

  beforeSend(event) {
    // Filter out certain errors or modify event data
    if (this.shouldIgnoreError(event)) {
      return null;
    }

    // Add additional context
    event.extra = {
      ...event.extra,
      deviceMemory: DeviceInfo.getTotalMemory(),
      batteryLevel: DeviceInfo.getBatteryLevel(),
      carrier: DeviceInfo.getCarrier(),
      timeZone: DeviceInfo.getTimezone(),
    };

    return event;
  }

  shouldIgnoreError(event) {
    // List of errors to ignore
    const ignoredErrors = [
      'Network request failed',
      'User cancelled',
      'Aborted',
    ];

    return ignoredErrors.some(ignored => 
      event.message?.includes(ignored) ||
      event.exception?.values?.[0]?.value?.includes(ignored)
    );
  }

  captureError(error, context = {}) {
    try {
      Sentry.captureException(error, {
        extra: context,
      });

      // Also log to analytics
      this.logErrorToAnalytics(error, context);
    } catch (e) {
      console.error('Failed to capture error:', e);
    }
  }

  async logErrorToAnalytics(error, context) {
    try {
      await analytics().logEvent('error_occurred', {
        error_message: error.message,
        error_stack: error.stack,
        error_context: JSON.stringify(context),
        platform: Platform.OS,
        timestamp: Date.now(),
      });
    } catch (e) {
      console.error('Failed to log error to analytics:', e);
    }
  }

  setTag(key, value) {
    Sentry.setTag(key, value);
  }

  addBreadcrumb(breadcrumb) {
    Sentry.addBreadcrumb(breadcrumb);
  }
}

export default new ErrorTrackingService(); 