import { enhancedAnalytics } from './enhancedAnalyticsService';
import { userEngagement } from './userEngagementService';

class InsightsService {
  constructor() {
    this.insights = [];
    this.thresholds = {
      significantChange: 0.2, // 20% change
      minimumSessions: 10,
      trendDays: 7,
    };
  }

  async generateInsights() {
    try {
      const metrics = await userEngagement.getEngagementMetrics();
      const insights = [];

      // Analyze session trends
      const sessionInsights = this.analyzeSessionTrends(metrics);
      insights.push(...sessionInsights);

      // Analyze feature usage
      const featureInsights = this.analyzeFeatureUsage(metrics);
      insights.push(...featureInsights);

      // Analyze screen engagement
      const screenInsights = this.analyzeScreenEngagement(metrics);
      insights.push(...screenInsights);

      // Analyze user behavior
      const behaviorInsights = this.analyzeUserBehavior(metrics);
      insights.push(...behaviorInsights);

      // Store and log insights
      this.insights = insights;
      await this.logInsights(insights);

      return insights;
    } catch (error) {
      console.error('Generate insights error:', error);
      return [];
    }
  }

  analyzeSessionTrends(metrics) {
    const insights = [];

    if (metrics.totalSessions < this.thresholds.minimumSessions) {
      return insights;
    }

    const avgDuration = metrics.averageSessionDuration;
    const prevAvgDuration = metrics.previousAverageSessionDuration;

    if (prevAvgDuration) {
      const change = (avgDuration - prevAvgDuration) / prevAvgDuration;
      
      if (Math.abs(change) > this.thresholds.significantChange) {
        insights.push({
          type: 'session_duration',
          title: `Session Duration ${change > 0 ? 'Increased' : 'Decreased'}`,
          description: `Average session duration has ${
            change > 0 ? 'increased' : 'decreased'
          } by ${Math.abs(Math.round(change * 100))}%`,
          importance: 'high',
          metric: 'session_duration',
          change,
        });
      }
    }

    return insights;
  }

  analyzeFeatureUsage(metrics) {
    const insights = [];
    const features = metrics.mostUsedFeatures;

    if (!features.length) return insights;

    // Find features with significant changes
    features.forEach(([feature, count]) => {
      const previousCount = metrics.previousFeatureUsage?.[feature] || 0;
      const change = (count - previousCount) / (previousCount || 1);

      if (Math.abs(change) > this.thresholds.significantChange) {
        insights.push({
          type: 'feature_usage',
          title: `${feature} Usage ${change > 0 ? 'Increased' : 'Decreased'}`,
          description: `${feature} usage has ${
            change > 0 ? 'increased' : 'decreased'
          } by ${Math.abs(Math.round(change * 100))}%`,
          importance: 'medium',
          metric: 'feature_usage',
          feature,
          change,
        });
      }
    });

    return insights;
  }

  analyzeScreenEngagement(metrics) {
    const insights = [];
    const screens = metrics.screenEngagement;

    if (!screens) return insights;

    Object.entries(screens).forEach(([screen, time]) => {
      const previousTime = metrics.previousScreenEngagement?.[screen] || 0;
      const change = (time - previousTime) / (previousTime || 1);

      if (Math.abs(change) > this.thresholds.significantChange) {
        insights.push({
          type: 'screen_engagement',
          title: `${screen} Engagement ${change > 0 ? 'Increased' : 'Decreased'}`,
          description: `Time spent on ${screen} has ${
            change > 0 ? 'increased' : 'decreased'
          } by ${Math.abs(Math.round(change * 100))}%`,
          importance: 'medium',
          metric: 'screen_time',
          screen,
          change,
        });
      }
    });

    return insights;
  }

  analyzeUserBehavior(metrics) {
    const insights = [];
    const interactions = metrics.interactionRates;

    if (!interactions) return insights;

    Object.entries(interactions).forEach(([type, rate]) => {
      const previousRate = metrics.previousInteractionRates?.[type] || 0;
      const change = (rate - previousRate) / (previousRate || 1);

      if (Math.abs(change) > this.thresholds.significantChange) {
        insights.push({
          type: 'user_behavior',
          title: `${type} Interaction ${change > 0 ? 'Increased' : 'Decreased'}`,
          description: `${type} interactions have ${
            change > 0 ? 'increased' : 'decreased'
          } by ${Math.abs(Math.round(change * 100))}%`,
          importance: 'low',
          metric: 'interaction_rate',
          interactionType: type,
          change,
        });
      }
    });

    return insights;
  }

  async logInsights(insights) {
    try {
      await enhancedAnalytics.logEvent('insights_generated', {
        count: insights.length,
        types: insights.map(i => i.type),
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Log insights error:', error);
    }
  }

  getInsights() {
    return this.insights;
  }

  setThreshold(metric, value) {
    if (this.thresholds.hasOwnProperty(metric)) {
      this.thresholds[metric] = value;
    }
  }
}

export const insights = new InsightsService(); 