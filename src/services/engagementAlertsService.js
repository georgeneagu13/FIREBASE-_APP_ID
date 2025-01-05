import { enhancedAnalytics } from './enhancedAnalyticsService';
import { realTimeEngagement } from './realTimeEngagementService';
import { engagementNotifications } from './engagementNotificationService';

class EngagementAlertsService {
  constructor() {
    this.alerts = new Map();
    this.thresholds = {
      userDrop: 0.3, // 30% drop
      errorSpike: 5, // 5 errors in 5 minutes
      sessionLength: 300000, // 5 minutes
      inactivityPeriod: 180000, // 3 minutes
    };
    this.alertHistory = [];
    this.maxHistory = 100;
  }

  startMonitoring() {
    realTimeEngagement.addListener(({ metrics }) => {
      this.checkAlerts(metrics);
    });
  }

  async checkAlerts(metrics) {
    try {
      const alerts = [];

      // Check user engagement
      const userAlert = this.checkUserEngagement(metrics);
      if (userAlert) alerts.push(userAlert);

      // Check error rates
      const errorAlert = this.checkErrorRates(metrics);
      if (errorAlert) alerts.push(errorAlert);

      // Check session health
      const sessionAlert = this.checkSessionHealth(metrics);
      if (sessionAlert) alerts.push(sessionAlert);

      // Process new alerts
      if (alerts.length > 0) {
        await this.processAlerts(alerts);
      }
    } catch (error) {
      console.error('Check alerts error:', error);
    }
  }

  async processAlerts(alerts) {
    try {
      // Add to history
      this.alertHistory.unshift(...alerts);
      if (this.alertHistory.length > this.maxHistory) {
        this.alertHistory = this.alertHistory.slice(0, this.maxHistory);
      }

      // Create notifications
      alerts.forEach(alert => {
        engagementNotifications.addNotifications([{
          type: 'alert',
          title: alert.title,
          message: alert.message,
          priority: alert.priority,
          timestamp: Date.now(),
          data: alert.data,
        }]);
      });

      // Log alerts
      await enhancedAnalytics.logEvent('engagement_alerts', {
        alerts: alerts.map(a => ({
          type: a.type,
          priority: a.priority,
        })),
      });

    } catch (error) {
      console.error('Process alerts error:', error);
    }
  }

  checkUserEngagement(metrics) {
    const currentUsers = metrics.realTime.activeUsers;
    const previousUsers = metrics.realTime.previousActiveUsers;

    if (previousUsers && currentUsers < previousUsers * (1 - this.thresholds.userDrop)) {
      return {
        type: 'user_drop',
        title: 'Significant Drop in Active Users',
        message: `Active users dropped from ${previousUsers} to ${currentUsers}`,
        priority: 'high',
        data: {
          current: currentUsers,
          previous: previousUsers,
          drop: (previousUsers - currentUsers) / previousUsers,
        },
      };
    }

    return null;
  }

  checkErrorRates(metrics) {
    const recentErrors = metrics.realTime.recentEvents.filter(
      e => e.type === 'error' && 
      Date.now() - e.timestamp < 300000 // Last 5 minutes
    );

    if (recentErrors.length >= this.thresholds.errorSpike) {
      return {
        type: 'error_spike',
        title: 'Error Rate Spike Detected',
        message: `${recentErrors.length} errors in the last 5 minutes`,
        priority: 'high',
        data: {
          count: recentErrors.length,
          errors: recentErrors,
        },
      };
    }

    return null;
  }

  checkSessionHealth(metrics) {
    const sessions = metrics.realTime.recentEvents.filter(
      e => e.type === 'session_end'
    );

    const shortSessions = sessions.filter(
      s => s.data.duration < this.thresholds.sessionLength
    );

    if (shortSessions.length >= 3) {
      return {
        type: 'short_sessions',
        title: 'Multiple Short Sessions Detected',
        message: 'Users are leaving the app quickly',
        priority: 'medium',
        data: {
          count: shortSessions.length,
          sessions: shortSessions,
        },
      };
    }

    return null;
  }

  setThreshold(metric, value) {
    if (this.thresholds.hasOwnProperty(metric)) {
      this.thresholds[metric] = value;
    }
  }

  getAlertHistory() {
    return [...this.alertHistory];
  }

  clearHistory() {
    this.alertHistory = [];
  }
}

export const engagementAlerts = new EngagementAlertsService(); 