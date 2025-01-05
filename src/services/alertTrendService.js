import { enhancedAnalytics } from './enhancedAnalyticsService';
import { alertAnalytics } from './alertAnalyticsService';

class AlertTrendService {
  constructor() {
    this.trends = {
      daily: [],
      weekly: [],
      monthly: [],
      patterns: new Map(),
    };
    this.patternThresholds = {
      minOccurrences: 3,
      similarityThreshold: 0.8,
      timeWindow: 86400000, // 24 hours
    };
  }

  async analyzeTrends(timeRange = 'week') {
    try {
      const metrics = alertAnalytics.getMetrics();
      const alerts = alertAnalytics.getAlertHistory();

      // Analyze time-based trends
      this.analyzeTimeBasedTrends(alerts);

      // Detect patterns
      this.detectPatterns(alerts);

      // Analyze correlations
      const correlations = this.analyzeCorrelations(alerts);

      // Predict future trends
      const predictions = this.predictTrends(alerts);

      // Log trend analysis
      await this.logTrendAnalysis({
        timeRange,
        patterns: Array.from(this.trends.patterns.values()),
        correlations,
        predictions,
      });

      return {
        daily: this.trends.daily,
        weekly: this.trends.weekly,
        monthly: this.trends.monthly,
        patterns: Array.from(this.trends.patterns.values()),
        correlations,
        predictions,
      };

    } catch (error) {
      console.error('Analyze trends error:', error);
      return null;
    }
  }

  analyzeTimeBasedTrends(alerts) {
    // Group alerts by time periods
    const now = Date.now();
    const dayMs = 86400000;
    const weekMs = dayMs * 7;
    const monthMs = dayMs * 30;

    // Daily trends
    this.trends.daily = this.groupAlertsByPeriod(alerts, now - weekMs, now, dayMs);

    // Weekly trends
    this.trends.weekly = this.groupAlertsByPeriod(alerts, now - monthMs, now, weekMs);

    // Monthly trends
    this.trends.monthly = this.groupAlertsByPeriod(alerts, now - (monthMs * 12), now, monthMs);
  }

  groupAlertsByPeriod(alerts, start, end, interval) {
    const periods = Math.ceil((end - start) / interval);
    const groups = new Array(periods).fill(0);

    alerts.forEach(alert => {
      if (alert.timestamp >= start && alert.timestamp < end) {
        const periodIndex = Math.floor((alert.timestamp - start) / interval);
        if (periodIndex >= 0 && periodIndex < periods) {
          groups[periodIndex]++;
        }
      }
    });

    return {
      values: groups,
      labels: groups.map((_, index) => {
        const date = new Date(start + (index * interval));
        return date.toLocaleDateString();
      }),
    };
  }

  detectPatterns(alerts) {
    this.trends.patterns.clear();

    // Group alerts by type
    const alertsByType = new Map();
    alerts.forEach(alert => {
      const typeAlerts = alertsByType.get(alert.type) || [];
      typeAlerts.push(alert);
      alertsByType.set(alert.type, typeAlerts);
    });

    // Analyze patterns for each alert type
    alertsByType.forEach((typeAlerts, type) => {
      const patterns = this.findPatterns(typeAlerts);
      if (patterns.length > 0) {
        this.trends.patterns.set(type, {
          type,
          patterns,
          frequency: patterns.length / typeAlerts.length,
          confidence: this.calculatePatternConfidence(patterns),
        });
      }
    });
  }

  findPatterns(alerts) {
    const patterns = [];
    const timeWindows = new Map();

    // Group alerts by time windows
    alerts.forEach(alert => {
      const windowStart = Math.floor(alert.timestamp / this.patternThresholds.timeWindow);
      const window = timeWindows.get(windowStart) || [];
      window.push(alert);
      timeWindows.set(windowStart, window);
    });

    // Analyze each time window for patterns
    timeWindows.forEach(windowAlerts => {
      if (windowAlerts.length >= this.patternThresholds.minOccurrences) {
        const pattern = this.extractPattern(windowAlerts);
        if (pattern) {
          patterns.push(pattern);
        }
      }
    });

    return patterns;
  }

  extractPattern(alerts) {
    // Find common characteristics
    const commonProps = {
      type: alerts[0].type,
      priority: this.findMostCommon(alerts.map(a => a.priority)),
      timeOfDay: this.findTimeOfDayPattern(alerts),
      interval: this.calculateAverageInterval(alerts),
    };

    // Check if pattern is significant
    if (this.isSignificantPattern(commonProps, alerts)) {
      return {
        ...commonProps,
        occurrences: alerts.length,
        confidence: this.calculateConfidence(commonProps, alerts),
        lastSeen: Math.max(...alerts.map(a => a.timestamp)),
      };
    }

    return null;
  }

  findMostCommon(values) {
    const counts = new Map();
    let maxCount = 0;
    let mostCommon = values[0];

    values.forEach(value => {
      const count = (counts.get(value) || 0) + 1;
      counts.set(value, count);
      if (count > maxCount) {
        maxCount = count;
        mostCommon = value;
      }
    });

    return mostCommon;
  }

  findTimeOfDayPattern(alerts) {
    const hours = alerts.map(a => new Date(a.timestamp).getHours());
    const avgHour = hours.reduce((sum, h) => sum + h, 0) / hours.length;
    return Math.round(avgHour);
  }

  calculateAverageInterval(alerts) {
    if (alerts.length < 2) return null;

    const sortedAlerts = [...alerts].sort((a, b) => a.timestamp - b.timestamp);
    const intervals = [];

    for (let i = 1; i < sortedAlerts.length; i++) {
      intervals.push(sortedAlerts[i].timestamp - sortedAlerts[i-1].timestamp);
    }

    return intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
  }

  isSignificantPattern(pattern, alerts) {
    const confidence = this.calculateConfidence(pattern, alerts);
    return confidence >= this.patternThresholds.similarityThreshold;
  }

  calculateConfidence(pattern, alerts) {
    let matchingProperties = 0;
    let totalProperties = 0;

    alerts.forEach(alert => {
      if (alert.type === pattern.type) matchingProperties++;
      if (alert.priority === pattern.priority) matchingProperties++;
      
      const alertHour = new Date(alert.timestamp).getHours();
      if (Math.abs(alertHour - pattern.timeOfDay) <= 1) matchingProperties++;

      totalProperties += 3;
    });

    return matchingProperties / totalProperties;
  }

  calculatePatternConfidence(patterns) {
    if (patterns.length === 0) return 0;
    return patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length;
  }

  analyzeCorrelations(alerts) {
    // Implement correlation analysis
    return [];
  }

  predictTrends(alerts) {
    // Implement trend prediction
    return [];
  }

  async logTrendAnalysis(analysis) {
    try {
      await enhancedAnalytics.logEvent('alert_trends_analyzed', {
        timeRange: analysis.timeRange,
        patternCount: analysis.patterns.length,
        correlationCount: analysis.correlations.length,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Log trend analysis error:', error);
    }
  }

  getTrends(timeRange = 'week') {
    return this.analyzeTrends(timeRange);
  }

  getPatterns() {
    return Array.from(this.trends.patterns.values());
  }
}

export const alertTrends = new AlertTrendService(); 