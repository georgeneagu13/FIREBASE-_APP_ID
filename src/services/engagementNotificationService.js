import { enhancedAnalytics } from './enhancedAnalyticsService';
import { realTimeEngagement } from './realTimeEngagementService';
import { insights } from './insightsService';

class EngagementNotificationService {
  constructor() {
    this.notifications = [];
    this.subscribers = new Set();
    this.rules = new Map();
    this.maxNotifications = 50;
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;

    try {
      // Register default notification rules
      this.registerRule('high_engagement', this.createHighEngagementRule());
      this.registerRule('low_engagement', this.createLowEngagementRule());
      this.registerRule('feature_adoption', this.createFeatureAdoptionRule());
      this.registerRule('unusual_activity', this.createUnusualActivityRule());

      // Start listening to real-time engagement
      this.startListening();

      this.initialized = true;
    } catch (error) {
      console.error('Engagement notification init error:', error);
    }
  }

  registerRule(name, rule) {
    this.rules.set(name, rule);
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  startListening() {
    realTimeEngagement.addListener(async ({ metrics, insights }) => {
      await this.processMetrics(metrics, insights);
    });
  }

  async processMetrics(metrics, newInsights) {
    try {
      const notifications = [];

      // Check each rule
      for (const [name, rule] of this.rules) {
        if (rule.condition(metrics, newInsights)) {
          notifications.push({
            id: Date.now().toString(),
            type: name,
            title: rule.getTitle(metrics, newInsights),
            message: rule.getMessage(metrics, newInsights),
            priority: rule.priority,
            timestamp: Date.now(),
            data: rule.getData(metrics, newInsights),
          });
        }
      }

      // Add new notifications
      this.addNotifications(notifications);

      // Notify subscribers
      this.notifySubscribers();

    } catch (error) {
      console.error('Process metrics error:', error);
    }
  }

  addNotifications(notifications) {
    this.notifications.unshift(...notifications);
    
    // Keep only recent notifications
    if (this.notifications.length > this.maxNotifications) {
      this.notifications = this.notifications.slice(0, this.maxNotifications);
    }

    // Log notifications
    notifications.forEach(notification => {
      enhancedAnalytics.logEvent('engagement_notification', {
        type: notification.type,
        priority: notification.priority,
      });
    });
  }

  notifySubscribers() {
    this.subscribers.forEach(callback => {
      try {
        callback(this.notifications);
      } catch (error) {
        console.error('Subscriber notification error:', error);
      }
    });
  }

  createHighEngagementRule() {
    return {
      condition: (metrics) => {
        return metrics.realTime.activeUsers > 10 ||
               metrics.realTime.interactions.size > 50;
      },
      getTitle: () => 'High User Engagement Detected',
      getMessage: (metrics) => 
        `Currently ${metrics.realTime.activeUsers} active users with high interaction rates`,
      priority: 'high',
      getData: (metrics) => ({
        activeUsers: metrics.realTime.activeUsers,
        interactions: metrics.realTime.interactions,
      }),
    };
  }

  createLowEngagementRule() {
    return {
      condition: (metrics) => {
        return metrics.realTime.activeUsers < 2 &&
               metrics.realTime.interactions.size < 10;
      },
      getTitle: () => 'Low User Engagement Alert',
      getMessage: () => 'User engagement has dropped significantly',
      priority: 'medium',
      getData: (metrics) => ({
        activeUsers: metrics.realTime.activeUsers,
        interactions: metrics.realTime.interactions,
      }),
    };
  }

  createFeatureAdoptionRule() {
    return {
      condition: (metrics, insights) => {
        return insights?.some(i => 
          i.type === 'feature_usage' && i.change > 0.5
        );
      },
      getTitle: () => 'New Feature Adoption Spike',
      getMessage: (_, insights) => {
        const feature = insights.find(i => 
          i.type === 'feature_usage' && i.change > 0.5
        );
        return `${feature.feature} usage has increased by ${
          Math.round(feature.change * 100)
        }%`;
      },
      priority: 'medium',
      getData: (_, insights) => ({
        feature: insights.find(i => 
          i.type === 'feature_usage' && i.change > 0.5
        ),
      }),
    };
  }

  createUnusualActivityRule() {
    return {
      condition: (metrics) => {
        const events = metrics.realTime.recentEvents;
        const unusualCount = events.filter(e => 
          e.type === 'error' || e.type === 'crash'
        ).length;
        return unusualCount > 5;
      },
      getTitle: () => 'Unusual Activity Detected',
      getMessage: (metrics) => {
        const errorCount = metrics.realTime.recentEvents.filter(e => 
          e.type === 'error' || e.type === 'crash'
        ).length;
        return `Detected ${errorCount} errors in recent activity`;
      },
      priority: 'high',
      getData: (metrics) => ({
        errors: metrics.realTime.recentEvents.filter(e => 
          e.type === 'error' || e.type === 'crash'
        ),
      }),
    };
  }

  getNotifications() {
    return [...this.notifications];
  }

  clearNotifications() {
    this.notifications = [];
    this.notifySubscribers();
  }
}

export const engagementNotifications = new EngagementNotificationService(); 