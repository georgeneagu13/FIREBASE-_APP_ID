import { enhancedAnalytics } from './enhancedAnalyticsService';
import { storageService } from './storageService';

class UserEngagementService {
  constructor() {
    this.sessionStart = Date.now();
    this.events = [];
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;

    try {
      // Load stored engagement data
      const storedData = await storageService.getItem('user_engagement');
      if (storedData) {
        this.events = JSON.parse(storedData);
      }

      // Start session tracking
      this.startSession();
      this.initialized = true;
    } catch (error) {
      console.error('User engagement init error:', error);
    }
  }

  startSession() {
    this.sessionStart = Date.now();
    this.trackEvent('session_start');
  }

  async endSession() {
    const duration = Date.now() - this.sessionStart;
    await this.trackEvent('session_end', { duration });
  }

  async trackEvent(eventName, data = {}) {
    try {
      const event = {
        name: eventName,
        timestamp: Date.now(),
        sessionDuration: Date.now() - this.sessionStart,
        data,
      };

      this.events.push(event);
      await this.persistEvents();
      await enhancedAnalytics.logEvent(`engagement_${eventName}`, event);
    } catch (error) {
      console.error('Track event error:', error);
    }
  }

  async trackScreenView(screenName, duration) {
    await this.trackEvent('screen_view', {
      screen: screenName,
      duration,
    });
  }

  async trackInteraction(type, target, data = {}) {
    await this.trackEvent('interaction', {
      type,
      target,
      ...data,
    });
  }

  async trackFeatureUsage(featureName, data = {}) {
    await this.trackEvent('feature_usage', {
      feature: featureName,
      ...data,
    });
  }

  async getEngagementMetrics() {
    try {
      const recentEvents = this.events.filter(
        event => Date.now() - event.timestamp < 7 * 24 * 60 * 60 * 1000 // Last 7 days
      );

      return {
        totalSessions: recentEvents.filter(e => e.name === 'session_start').length,
        averageSessionDuration: this.calculateAverageSessionDuration(recentEvents),
        mostUsedFeatures: this.getMostUsedFeatures(recentEvents),
        screenEngagement: this.getScreenEngagement(recentEvents),
        interactionRates: this.calculateInteractionRates(recentEvents),
      };
    } catch (error) {
      console.error('Get engagement metrics error:', error);
      return null;
    }
  }

  calculateAverageSessionDuration(events) {
    const sessions = events.filter(e => e.name === 'session_end');
    if (sessions.length === 0) return 0;
    
    const totalDuration = sessions.reduce(
      (sum, session) => sum + session.data.duration,
      0
    );
    return totalDuration / sessions.length;
  }

  getMostUsedFeatures(events) {
    const features = events.filter(e => e.name === 'feature_usage');
    const featureCounts = {};

    features.forEach(event => {
      const feature = event.data.feature;
      featureCounts[feature] = (featureCounts[feature] || 0) + 1;
    });

    return Object.entries(featureCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  }

  getScreenEngagement(events) {
    const screenViews = events.filter(e => e.name === 'screen_view');
    const screenTimes = {};

    screenViews.forEach(event => {
      const screen = event.data.screen;
      screenTimes[screen] = (screenTimes[screen] || 0) + event.data.duration;
    });

    return screenTimes;
  }

  calculateInteractionRates(events) {
    const interactions = events.filter(e => e.name === 'interaction');
    const rates = {};

    interactions.forEach(event => {
      const type = event.data.type;
      rates[type] = (rates[type] || 0) + 1;
    });

    return rates;
  }

  async persistEvents() {
    try {
      // Keep only last 1000 events
      if (this.events.length > 1000) {
        this.events = this.events.slice(-1000);
      }
      
      await storageService.setItem(
        'user_engagement',
        JSON.stringify(this.events)
      );
    } catch (error) {
      console.error('Persist events error:', error);
    }
  }
}

export const userEngagement = new UserEngagementService(); 