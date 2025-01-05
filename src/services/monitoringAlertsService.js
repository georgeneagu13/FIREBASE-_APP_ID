import { enhancedAnalytics } from './enhancedAnalyticsService';
import { crashReporting } from './crashReportingService';
import { performanceService } from './performanceService';

class MonitoringAlertsService {
  constructor() {
    this.alerts = new Map();
    this.thresholds = {
      crashRate: 0.02, // 2% crash rate
      responseTime: 3000, // 3 seconds
      errorRate: 0.05, // 5% error rate
      memoryUsage: 0.8, // 80% usage
      batteryDrain: 0.1, // 10% per hour
    };
    this.alertHandlers = new Set();
  }

  addAlertHandler(handler) {
    this.alertHandlers.add(handler);
    return () => this.alertHandlers.delete(handler);
  }

  async checkMetrics() {
    try {
      const metrics = await this.gatherMetrics();
      const alerts = this.analyzeMetrics(metrics);
      
      if (alerts.length > 0) {
        await this.handleAlerts(alerts);
      }
    } catch (error) {
      crashReporting.recordError(error, {
        context: 'monitoring_alerts',
      });
    }
  }

  async gatherMetrics() {
    const [performance, crashes, errors] = await Promise.all([
      performanceService.getMetrics(),
      crashReporting.getRecentCrashes(),
      crashReporting.getErrors(),
    ]);

    return {
      performance,
      crashes,
      errors,
      timestamp: Date.now(),
    };
  }

  analyzeMetrics(metrics) {
    const alerts = [];

    // Check crash rate
    const crashRate = this.calculateCrashRate(metrics.crashes);
    if (crashRate > this.thresholds.crashRate) {
      alerts.push({
        type: 'crash_rate',
        severity: 'high',
        value: crashRate,
        threshold: this.thresholds.crashRate,
        message: `Crash rate (${(crashRate * 100).toFixed(2)}%) exceeds threshold`,
      });
    }

    // Check response time
    const avgResponseTime = this.calculateAverageResponseTime(metrics.performance);
    if (avgResponseTime > this.thresholds.responseTime) {
      alerts.push({
        type: 'response_time',
        severity: 'medium',
        value: avgResponseTime,
        threshold: this.thresholds.responseTime,
        message: `Average response time (${avgResponseTime}ms) exceeds threshold`,
      });
    }

    // Check error rate
    const errorRate = this.calculateErrorRate(metrics.errors);
    if (errorRate > this.thresholds.errorRate) {
      alerts.push({
        type: 'error_rate',
        severity: 'medium',
        value: errorRate,
        threshold: this.thresholds.errorRate,
        message: `Error rate (${(errorRate * 100).toFixed(2)}%) exceeds threshold`,
      });
    }

    return alerts;
  }

  async handleAlerts(alerts) {
    // Notify all registered handlers
    this.alertHandlers.forEach(handler => handler(alerts));

    // Log alerts to analytics
    await enhancedAnalytics.logEvent('monitoring_alerts', {
      alerts: alerts.map(alert => ({
        type: alert.type,
        severity: alert.severity,
        value: alert.value,
        timestamp: Date.now(),
      })),
    });

    // Create issues for high severity alerts
    const highSeverityAlerts = alerts.filter(
      alert => alert.severity === 'high'
    );
    
    if (highSeverityAlerts.length > 0) {
      await this.createIssues(highSeverityAlerts);
    }
  }

  calculateCrashRate(crashes) {
    // Implement crash rate calculation
    return crashes.length / this.getTotalSessions();
  }

  calculateAverageResponseTime(performance) {
    // Implement response time calculation
    return performance.reduce((acc, p) => acc + p.value, 0) / performance.length;
  }

  calculateErrorRate(errors) {
    // Implement error rate calculation
    return errors.length / this.getTotalRequests();
  }

  getTotalSessions() {
    // Implement session count retrieval
    return 1000; // Placeholder
  }

  getTotalRequests() {
    // Implement request count retrieval
    return 10000; // Placeholder
  }

  setThreshold(metric, value) {
    if (this.thresholds.hasOwnProperty(metric)) {
      this.thresholds[metric] = value;
    }
  }

  getThresholds() {
    return { ...this.thresholds };
  }
}

export const monitoringAlerts = new MonitoringAlertsService(); 