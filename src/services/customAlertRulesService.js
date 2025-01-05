import { enhancedAnalytics } from './enhancedAnalyticsService';
import { engagementAlerts } from './engagementAlertsService';

class CustomAlertRulesService {
  constructor() {
    this.rules = new Map();
    this.conditions = new Map();
    this.actions = new Map();
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;

    try {
      // Register default conditions
      this.registerCondition('threshold', this.createThresholdCondition());
      this.registerCondition('trend', this.createTrendCondition());
      this.registerCondition('pattern', this.createPatternCondition());
      this.registerCondition('composite', this.createCompositeCondition());

      // Register default actions
      this.registerAction('notification', this.createNotificationAction());
      this.registerAction('email', this.createEmailAction());
      this.registerAction('slack', this.createSlackAction());
      this.registerAction('webhook', this.createWebhookAction());

      this.initialized = true;
    } catch (error) {
      console.error('Custom alert rules init error:', error);
    }
  }

  createRule(config) {
    const rule = {
      id: Date.now().toString(),
      name: config.name,
      description: config.description,
      conditions: config.conditions.map(c => ({
        type: c.type,
        params: c.params,
      })),
      actions: config.actions.map(a => ({
        type: a.type,
        params: a.params,
      })),
      enabled: true,
      created: Date.now(),
    };

    this.rules.set(rule.id, rule);
    return rule.id;
  }

  registerCondition(type, condition) {
    this.conditions.set(type, condition);
  }

  registerAction(type, action) {
    this.actions.set(type, action);
  }

  async evaluateMetrics(metrics) {
    try {
      const triggeredRules = [];

      for (const [id, rule] of this.rules) {
        if (!rule.enabled) continue;

        const conditions = rule.conditions.map(c => {
          const condition = this.conditions.get(c.type);
          return condition ? condition(metrics, c.params) : false;
        });

        if (conditions.every(c => c)) {
          triggeredRules.push(rule);
          await this.executeActions(rule, metrics);
        }
      }

      if (triggeredRules.length > 0) {
        await this.logTriggeredRules(triggeredRules, metrics);
      }

    } catch (error) {
      console.error('Evaluate metrics error:', error);
    }
  }

  async executeActions(rule, metrics) {
    try {
      for (const actionConfig of rule.actions) {
        const action = this.actions.get(actionConfig.type);
        if (action) {
          await action(metrics, actionConfig.params, rule);
        }
      }
    } catch (error) {
      console.error('Execute actions error:', error);
    }
  }

  createThresholdCondition() {
    return (metrics, params) => {
      const value = this.getMetricValue(metrics, params.metric);
      switch (params.operator) {
        case '>':
          return value > params.value;
        case '<':
          return value < params.value;
        case '>=':
          return value >= params.value;
        case '<=':
          return value <= params.value;
        case '==':
          return value === params.value;
        default:
          return false;
      }
    };
  }

  createTrendCondition() {
    return (metrics, params) => {
      const values = this.getMetricHistory(metrics, params.metric);
      if (values.length < 2) return false;

      const trend = this.calculateTrend(values);
      return trend * params.direction > 0;
    };
  }

  createPatternCondition() {
    return (metrics, params) => {
      const values = this.getMetricHistory(metrics, params.metric);
      return this.matchPattern(values, params.pattern);
    };
  }

  createCompositeCondition() {
    return (metrics, params) => {
      const results = params.conditions.map(c => {
        const condition = this.conditions.get(c.type);
        return condition ? condition(metrics, c.params) : false;
      });

      return params.operator === 'AND' 
        ? results.every(r => r)
        : results.some(r => r);
    };
  }

  createNotificationAction() {
    return async (metrics, params, rule) => {
      engagementAlerts.processAlerts([{
        type: 'custom_rule',
        title: params.title || rule.name,
        message: params.message || rule.description,
        priority: params.priority || 'medium',
        data: {
          ruleId: rule.id,
          metrics,
        },
      }]);
    };
  }

  createEmailAction() {
    return async (metrics, params, rule) => {
      // Implement email sending logic
      console.log('Would send email:', params.template, metrics);
    };
  }

  createSlackAction() {
    return async (metrics, params, rule) => {
      // Implement Slack notification logic
      console.log('Would send Slack message:', params.channel, metrics);
    };
  }

  createWebhookAction() {
    return async (metrics, params, rule) => {
      // Implement webhook call logic
      console.log('Would call webhook:', params.url, metrics);
    };
  }

  getMetricValue(metrics, path) {
    return path.split('.').reduce((obj, key) => obj?.[key], metrics);
  }

  getMetricHistory(metrics, metric) {
    // Implement metric history retrieval
    return [];
  }

  calculateTrend(values) {
    // Simple linear regression slope
    const n = values.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    
    values.forEach((y, x) => {
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumX2 += x * x;
    });

    return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  }

  matchPattern(values, pattern) {
    // Implement pattern matching logic
    return false;
  }

  async logTriggeredRules(rules, metrics) {
    await enhancedAnalytics.logEvent('custom_rules_triggered', {
      rules: rules.map(r => ({
        id: r.id,
        name: r.name,
      })),
      timestamp: Date.now(),
    });
  }

  getRules() {
    return Array.from(this.rules.values());
  }

  getRule(id) {
    return this.rules.get(id);
  }

  updateRule(id, updates) {
    const rule = this.rules.get(id);
    if (rule) {
      this.rules.set(id, { ...rule, ...updates });
      return true;
    }
    return false;
  }

  deleteRule(id) {
    return this.rules.delete(id);
  }
}

export const customAlertRules = new CustomAlertRulesService(); 