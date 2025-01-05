import { enhancedAnalytics } from './enhancedAnalyticsService';
import { alertResponse } from './alertResponseService';
import { engagementAlerts } from './engagementAlertsService';

class AlertAnalyticsService {
  constructor() {
    this.metrics = {
      totalAlerts: 0,
      alertsByType: new Map(),
      alertsByPriority: new Map(),
      responseEffectiveness: new Map(),
      automationSuccess: new Map(),
      timeToResolve: [],
    };
    this.updateInterval = 3600000; // 1 hour
  }

  startTracking() {
    this.updateMetrics();
    setInterval(() => this.updateMetrics(), this.updateInterval);
  }

  async updateMetrics() {
    try {
      const alerts = engagementAlerts.getAlertHistory();
      const responses = alertResponse.getHistory();

      this.metrics.totalAlerts = alerts.length;

      // Analyze alerts by type
      this.analyzeAlertsByType(alerts);

      // Analyze alerts by priority
      this.analyzeAlertsByPriority(alerts);

      // Analyze response effectiveness
      this.analyzeResponseEffectiveness(responses);

      // Analyze automation success
      this.analyzeAutomationSuccess(responses);

      // Calculate time to resolve
      this.calculateTimeToResolve(alerts, responses);

      // Log updated metrics
      await this.logMetrics();

    } catch (error) {
      console.error('Update metrics error:', error);
    }
  }

  analyzeAlertsByType(alerts) {
    this.metrics.alertsByType.clear();
    alerts.forEach(alert => {
      const count = this.metrics.alertsByType.get(alert.type) || 0;
      this.metrics.alertsByType.set(alert.type, count + 1);
    });
  }

  analyzeAlertsByPriority(alerts) {
    this.metrics.alertsByPriority.clear();
    alerts.forEach(alert => {
      const count = this.metrics.alertsByPriority.get(alert.priority) || 0;
      this.metrics.alertsByPriority.set(alert.priority, count + 1);
    });
  }

  analyzeResponseEffectiveness(responses) {
    this.metrics.responseEffectiveness.clear();
    responses.forEach(response => {
      const type = response.alert.type;
      const success = response.results.every(r => r.success);
      
      const stats = this.metrics.responseEffectiveness.get(type) || {
        total: 0,
        successful: 0,
      };
      
      stats.total++;
      if (success) stats.successful++;
      
      this.metrics.responseEffectiveness.set(type, stats);
    });
  }

  analyzeAutomationSuccess(responses) {
    this.metrics.automationSuccess.clear();
    responses.forEach(response => {
      response.results.forEach(result => {
        const stats = this.metrics.automationSuccess.get(result.type) || {
          total: 0,
          successful: 0,
        };
        
        stats.total++;
        if (result.success) stats.successful++;
        
        this.metrics.automationSuccess.set(result.type, stats);
      });
    });
  }

  calculateTimeToResolve(alerts, responses) {
    this.metrics.timeToResolve = [];
    
    const alertMap = new Map(
      alerts.map(alert => [alert.id, alert.timestamp])
    );

    responses.forEach(response => {
      const alertTime = alertMap.get(response.alert.id);
      if (alertTime) {
        const resolveTime = response.timestamp - alertTime;
        this.metrics.timeToResolve.push(resolveTime);
      }
    });
  }

  async logMetrics() {
    try {
      await enhancedAnalytics.logEvent('alert_analytics', {
        totalAlerts: this.metrics.totalAlerts,
        typeDistribution: Object.fromEntries(this.metrics.alertsByType),
        priorityDistribution: Object.fromEntries(this.metrics.alertsByPriority),
        averageTimeToResolve: this.calculateAverageTimeToResolve(),
        effectiveness: this.calculateOverallEffectiveness(),
      });
    } catch (error) {
      console.error('Log metrics error:', error);
    }
  }

  calculateAverageTimeToResolve() {
    if (this.metrics.timeToResolve.length === 0) return 0;
    const sum = this.metrics.timeToResolve.reduce((a, b) => a + b, 0);
    return sum / this.metrics.timeToResolve.length;
  }

  calculateOverallEffectiveness() {
    let totalSuccessful = 0;
    let totalResponses = 0;

    this.metrics.responseEffectiveness.forEach(stats => {
      totalSuccessful += stats.successful;
      totalResponses += stats.total;
    });

    return totalResponses === 0 ? 0 : totalSuccessful / totalResponses;
  }

  getMetrics() {
    return {
      ...this.metrics,
      averageTimeToResolve: this.calculateAverageTimeToResolve(),
      overallEffectiveness: this.calculateOverallEffectiveness(),
    };
  }

  getTypeDistribution() {
    return Object.fromEntries(this.metrics.alertsByType);
  }

  getPriorityDistribution() {
    return Object.fromEntries(this.metrics.alertsByPriority);
  }

  getResponseEffectiveness() {
    return Object.fromEntries(this.metrics.responseEffectiveness);
  }

  getAutomationSuccess() {
    return Object.fromEntries(this.metrics.automationSuccess);
  }
}

export const alertAnalytics = new AlertAnalyticsService(); 