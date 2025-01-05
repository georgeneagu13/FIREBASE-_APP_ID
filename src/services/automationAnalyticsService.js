import { enhancedAnalytics } from './enhancedAnalyticsService';
import { alertResponseAutomation } from './alertResponseAutomationService';
import { alertPatternDetection } from './alertPatternDetectionService';

class AutomationAnalyticsService {
  constructor() {
    this.metrics = {
      executions: new Map(),
      performance: new Map(),
      effectiveness: new Map(),
      patterns: new Map(),
      failures: new Map(),
    };
    this.insights = [];
    this.maxInsights = 100;
    this.config = {
      analysisWindow: 604800000, // 7 days
      performanceThreshold: 5000, // 5 seconds
      effectivenessThreshold: 0.8, // 80%
      anomalyThreshold: 2, // 2 standard deviations
    };
  }

  async analyzeAutomations() {
    try {
      const history = alertResponseAutomation.getHistory();
      const patterns = await alertPatternDetection.getPatterns();

      // Clear previous metrics
      this.resetMetrics();

      // Analyze execution metrics
      this.analyzeExecutions(history);

      // Analyze performance metrics
      this.analyzePerformance(history);

      // Analyze effectiveness
      this.analyzeEffectiveness(history);

      // Analyze patterns
      this.analyzePatterns(patterns, history);

      // Analyze failures
      this.analyzeFailures(history);

      // Generate insights
      await this.generateInsights();

      // Log analytics
      await this.logAnalytics();

      return {
        metrics: this.getMetrics(),
        insights: this.getInsights(),
      };

    } catch (error) {
      console.error('Analyze automations error:', error);
      return null;
    }
  }

  resetMetrics() {
    this.metrics.executions.clear();
    this.metrics.performance.clear();
    this.metrics.effectiveness.clear();
    this.metrics.patterns.clear();
    this.metrics.failures.clear();
  }

  analyzeExecutions(history) {
    history.forEach(entry => {
      entry.automations.forEach(automation => {
        const stats = this.metrics.executions.get(automation.id) || {
          total: 0,
          successful: 0,
          failed: 0,
          lastExecution: null,
        };

        stats.total++;
        if (entry.results.every(r => r.success)) {
          stats.successful++;
        } else {
          stats.failed++;
        }
        stats.lastExecution = entry.timestamp;

        this.metrics.executions.set(automation.id, stats);
      });
    });
  }

  analyzePerformance(history) {
    history.forEach(entry => {
      entry.automations.forEach(automation => {
        const durations = this.metrics.performance.get(automation.id) || [];
        
        entry.results.forEach(result => {
          if (result.timestamp) {
            durations.push(result.timestamp - entry.timestamp);
          }
        });

        this.metrics.performance.set(automation.id, durations);
      });
    });
  }

  analyzeEffectiveness(history) {
    const recentHistory = history.filter(
      entry => Date.now() - entry.timestamp <= this.config.analysisWindow
    );

    recentHistory.forEach(entry => {
      entry.automations.forEach(automation => {
        const stats = this.metrics.effectiveness.get(automation.id) || {
          resolved: 0,
          total: 0,
          trends: [],
        };

        stats.total++;
        if (entry.results.every(r => r.success)) {
          stats.resolved++;
        }

        stats.trends.push({
          timestamp: entry.timestamp,
          success: entry.results.every(r => r.success),
        });

        this.metrics.effectiveness.set(automation.id, stats);
      });
    });
  }

  analyzePatterns(patterns, history) {
    patterns.forEach(([pattern, data]) => {
      const automations = new Set();
      const occurrences = [];

      history.forEach(entry => {
        if (this.matchesPattern(entry.alert, pattern)) {
          entry.automations.forEach(automation => {
            automations.add(automation.id);
          });
          occurrences.push(entry.timestamp);
        }
      });

      this.metrics.patterns.set(pattern, {
        automations: Array.from(automations),
        occurrences,
        confidence: data.confidence,
      });
    });
  }

  analyzeFailures(history) {
    history.forEach(entry => {
      entry.results
        .filter(r => !r.success)
        .forEach(result => {
          const stats = this.metrics.failures.get(result.error) || {
            count: 0,
            automations: new Set(),
            lastOccurrence: null,
          };

          stats.count++;
          entry.automations.forEach(automation => {
            stats.automations.add(automation.id);
          });
          stats.lastOccurrence = entry.timestamp;

          this.metrics.failures.set(result.error, stats);
        });
    });
  }

  async generateInsights() {
    this.insights = [];

    // Performance insights
    this.generatePerformanceInsights();

    // Effectiveness insights
    this.generateEffectivenessInsights();

    // Pattern insights
    this.generatePatternInsights();

    // Failure insights
    this.generateFailureInsights();

    // Sort insights by priority
    this.insights.sort((a, b) => b.priority - a.priority);

    // Limit number of insights
    if (this.insights.length > this.maxInsights) {
      this.insights = this.insights.slice(0, this.maxInsights);
    }
  }

  generatePerformanceInsights() {
    this.metrics.performance.forEach((durations, automationId) => {
      const avgDuration = this.calculateAverage(durations);
      if (avgDuration > this.config.performanceThreshold) {
        this.addInsight({
          type: 'performance',
          priority: 1,
          automation: automationId,
          message: `High average execution time (${Math.round(avgDuration)}ms)`,
          data: { avgDuration, threshold: this.config.performanceThreshold },
        });
      }
    });
  }

  generateEffectivenessInsights() {
    this.metrics.effectiveness.forEach((stats, automationId) => {
      const effectiveness = stats.resolved / stats.total;
      if (effectiveness < this.config.effectivenessThreshold) {
        this.addInsight({
          type: 'effectiveness',
          priority: 2,
          automation: automationId,
          message: `Low resolution rate (${Math.round(effectiveness * 100)}%)`,
          data: { effectiveness, threshold: this.config.effectivenessThreshold },
        });
      }
    });
  }

  generatePatternInsights() {
    this.metrics.patterns.forEach((data, pattern) => {
      if (data.occurrences.length >= 3) {
        this.addInsight({
          type: 'pattern',
          priority: 3,
          pattern,
          message: `Recurring pattern detected (${data.occurrences.length} occurrences)`,
          data,
        });
      }
    });
  }

  generateFailureInsights() {
    this.metrics.failures.forEach((stats, error) => {
      if (stats.count >= 3) {
        this.addInsight({
          type: 'failure',
          priority: 1,
          error,
          message: `Recurring failure (${stats.count} occurrences)`,
          data: stats,
        });
      }
    });
  }

  addInsight(insight) {
    this.insights.push({
      ...insight,
      id: Date.now().toString(),
      timestamp: Date.now(),
    });
  }

  calculateAverage(values) {
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  matchesPattern(alert, pattern) {
    // Implement pattern matching logic
    return false;
  }

  async logAnalytics() {
    try {
      await enhancedAnalytics.logEvent('automation_analytics', {
        executionCount: Array.from(this.metrics.executions.values())
          .reduce((sum, stats) => sum + stats.total, 0),
        failureCount: Array.from(this.metrics.failures.values())
          .reduce((sum, stats) => sum + stats.count, 0),
        insightCount: this.insights.length,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Log analytics error:', error);
    }
  }

  getMetrics() {
    return {
      executions: Object.fromEntries(this.metrics.executions),
      performance: Object.fromEntries(this.metrics.performance),
      effectiveness: Object.fromEntries(this.metrics.effectiveness),
      patterns: Object.fromEntries(this.metrics.patterns),
      failures: Object.fromEntries(this.metrics.failures),
    };
  }

  getInsights() {
    return [...this.insights];
  }

  updateConfig(updates) {
    this.config = {
      ...this.config,
      ...updates,
    };
  }
}

export const automationAnalytics = new AutomationAnalyticsService(); 