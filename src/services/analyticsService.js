import analytics from '@react-native-firebase/analytics';
import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';

class AnalyticsService {
  constructor() {
    this.isEnabled = !__DEV__;
    this.sessionStartTime = Date.now();
    this.screenStartTime = null;
    this.currentScreen = null;
  }

  async initialize() {
    if (!this.isEnabled) return;

    try {
      await analytics().setAnalyticsCollectionEnabled(true);
      await this.setUserProperties();
      this.trackAppOpen();
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
    }
  }

  async setUserProperties() {
    try {
      const deviceInfo = {
        deviceId: await DeviceInfo.getUniqueId(),
        brand: DeviceInfo.getBrand(),
        model: DeviceInfo.getModel(),
        systemVersion: DeviceInfo.getSystemVersion(),
        appVersion: DeviceInfo.getVersion(),
        buildNumber: DeviceInfo.getBuildNumber(),
      };

      Object.entries(deviceInfo).forEach(([key, value]) => {
        analytics().setUserProperty(key, String(value));
      });
    } catch (error) {
      console.error('Failed to set user properties:', error);
    }
  }

  async trackScreen(screenName, params = {}) {
    if (!this.isEnabled) return;

    try {
      // Track screen view
      await analytics().logScreenView({
        screen_name: screenName,
        screen_class: screenName,
      });

      // Track screen time for previous screen
      if (this.currentScreen && this.screenStartTime) {
        const timeSpent = Date.now() - this.screenStartTime;
        await this.logEvent('screen_time', {
          screen_name: this.currentScreen,
          time_spent: timeSpent,
        });
      }

      // Update current screen
      this.currentScreen = screenName;
      this.screenStartTime = Date.now();

      // Log additional screen parameters
      await this.logEvent('screen_view', {
        screen_name: screenName,
        ...params,
      });
    } catch (error) {
      console.error('Failed to track screen:', error);
    }
  }

  async logEvent(eventName, params = {}) {
    if (!this.isEnabled) return;

    try {
      await analytics().logEvent(eventName, {
        ...params,
        platform: Platform.OS,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Failed to log event:', error);
    }
  }

  async trackUserAction(action, category, params = {}) {
    await this.logEvent('user_action', {
      action,
      category,
      ...params,
    });
  }

  async trackError(error, context = {}) {
    await this.logEvent('error', {
      error_message: error.message,
      error_code: error.code,
      ...context,
    });
  }

  async trackAppOpen() {
    await this.logEvent('app_open', {
      session_id: this.sessionStartTime,
    });
  }

  async trackAppClose() {
    const sessionDuration = Date.now() - this.sessionStartTime;
    await this.logEvent('app_close', {
      session_id: this.sessionStartTime,
      session_duration: sessionDuration,
    });
  }
}

export default new AnalyticsService(); 