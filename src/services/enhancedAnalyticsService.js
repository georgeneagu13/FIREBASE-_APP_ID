import analytics from '@react-native-firebase/analytics';
import crashlytics from '@react-native-firebase/crashlytics';
import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import environment from '../config/environments';

class EnhancedAnalyticsService {
  constructor() {
    this.sessionStartTime = Date.now();
    this.userProperties = {};
    this.isEnabled = environment.analyticsEnabled;
  }

  async init() {
    try {
      await analytics().setAnalyticsCollectionEnabled(this.isEnabled);
      await crashlytics().setCrashlyticsCollectionEnabled(this.isEnabled);
      
      // Set default session properties
      await this.setDefaultProperties();
      
      // Track app start
      this.logEvent('app_start', {
        deviceModel: await DeviceInfo.getModel(),
        systemVersion: DeviceInfo.getSystemVersion(),
        appVersion: DeviceInfo.getVersion(),
        buildNumber: DeviceInfo.getBuildNumber(),
      });
    } catch (error) {
      console.error('Analytics init error:', error);
    }
  }

  async setDefaultProperties() {
    const deviceProps = {
      platform: Platform.OS,
      deviceId: await DeviceInfo.getUniqueId(),
      deviceModel: await DeviceInfo.getModel(),
      systemVersion: DeviceInfo.getSystemVersion(),
      appVersion: DeviceInfo.getVersion(),
      buildNumber: DeviceInfo.getBuildNumber(),
      isTablet: DeviceInfo.isTablet(),
      carrier: await DeviceInfo.getCarrier(),
      timezone: DeviceInfo.getTimezone(),
    };

    await analytics().setUserProperties(deviceProps);
    this.userProperties = deviceProps;
  }

  async logEvent(eventName, params = {}) {
    if (!this.isEnabled) return;

    try {
      const enhancedParams = {
        ...params,
        timestamp: Date.now(),
        sessionDuration: Date.now() - this.sessionStartTime,
        ...this.userProperties,
      };

      await analytics().logEvent(eventName, enhancedParams);
    } catch (error) {
      console.error('Log event error:', error);
    }
  }

  async logScreenView(screenName, screenClass) {
    if (!this.isEnabled) return;

    try {
      await analytics().logScreenView({
        screen_name: screenName,
        screen_class: screenClass,
      });

      await this.logEvent('screen_view', {
        screen_name: screenName,
        screen_class: screenClass,
      });
    } catch (error) {
      console.error('Log screen view error:', error);
    }
  }

  async logUserAction(action, category, label, value) {
    if (!this.isEnabled) return;

    try {
      await this.logEvent('user_action', {
        action,
        category,
        label,
        value,
      });
    } catch (error) {
      console.error('Log user action error:', error);
    }
  }

  async setUserId(userId) {
    if (!this.isEnabled) return;

    try {
      await analytics().setUserId(userId);
      await crashlytics().setUserId(userId);
    } catch (error) {
      console.error('Set user ID error:', error);
    }
  }

  async setUserProperties(properties) {
    if (!this.isEnabled) return;

    try {
      await analytics().setUserProperties(properties);
      this.userProperties = { ...this.userProperties, ...properties };
    } catch (error) {
      console.error('Set user properties error:', error);
    }
  }
}

export const enhancedAnalytics = new EnhancedAnalyticsService(); 