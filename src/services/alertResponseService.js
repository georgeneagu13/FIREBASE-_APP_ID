import { enhancedAnalytics } from './enhancedAnalyticsService';
import { customAlertRules } from './customAlertRulesService';
import { engagementAlerts } from './engagementAlertsService';

class AlertResponseService {
  constructor() {
    this.responses = new Map();
    this.automations = new Map();
    this.history = [];
    this.maxHistory = 100;
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;

    try {
      // Register default responses
      this.registerResponse('performance', this.createPerformanceResponse());
      this.registerResponse('engagement', this.createEngagementResponse());
      this.registerResponse('error', this.createErrorResponse());
      this.registerResponse('security', this.createSecurityResponse());

      // Register default automations
      this.registerAutomation('scaling', this.createScalingAutomation());
      this.registerAutomation('notification', this.createNotificationAutomation());
      this.registerAutomation('recovery', this.createRecoveryAutomation());

      this.initialized = true;
    } catch (error) {
      console.error('Alert response init error:', error);
    }
  }

  registerResponse(type, response) {
    this.responses.set(type, response);
  }

  registerAutomation(type, automation) {
    this.automations.set(type, automation);
  }

  async processAlert(alert) {
    try {
      const response = this.selectResponse(alert);
      if (!response) return;

      const actions = await response.analyze(alert);
      const results = await this.executeActions(actions, alert);

      await this.logResponse({
        alert,
        actions,
        results,
        timestamp: Date.now(),
      });

    } catch (error) {
      console.error('Process alert error:', error);
    }
  }

  selectResponse(alert) {
    // Select appropriate response based on alert type and priority
    for (const [type, response] of this.responses) {
      if (response.canHandle(alert)) {
        return response;
      }
    }
    return null;
  }

  async executeActions(actions, alert) {
    const results = [];

    for (const action of actions) {
      try {
        const automation = this.automations.get(action.type);
        if (automation) {
          const result = await automation.execute(action.params, alert);
          results.push({
            type: action.type,
            success: true,
            result,
          });
        }
      } catch (error) {
        console.error(`Action execution error (${action.type}):`, error);
        results.push({
          type: action.type,
          success: false,
          error: error.message,
        });
      }
    }

    return results;
  }

  createPerformanceResponse() {
    return {
      canHandle: (alert) => 
        alert.type.includes('performance') || 
        alert.data?.metrics?.performance,

      analyze: async (alert) => {
        const actions = [];

        if (alert.priority === 'high') {
          actions.push({
            type: 'scaling',
            params: {
              scale: 'up',
              amount: 2,
            },
          });
        }

        actions.push({
          type: 'notification',
          params: {
            channel: 'tech',
            template: 'performance_alert',
          },
        });

        return actions;
      },
    };
  }

  createEngagementResponse() {
    return {
      canHandle: (alert) => 
        alert.type.includes('engagement') || 
        alert.type.includes('user'),

      analyze: async (alert) => {
        const actions = [];

        if (alert.data?.metrics?.activeUsers < 100) {
          actions.push({
            type: 'notification',
            params: {
              channel: 'product',
              template: 'engagement_drop',
            },
          });
        }

        return actions;
      },
    };
  }

  createErrorResponse() {
    return {
      canHandle: (alert) => 
        alert.type.includes('error') || 
        alert.type.includes('crash'),

      analyze: async (alert) => {
        const actions = [];

        actions.push({
          type: 'recovery',
          params: {
            strategy: 'restart',
            component: alert.data?.component,
          },
        });

        if (alert.priority === 'high') {
          actions.push({
            type: 'notification',
            params: {
              channel: 'emergency',
              template: 'critical_error',
            },
          });
        }

        return actions;
      },
    };
  }

  createSecurityResponse() {
    return {
      canHandle: (alert) => 
        alert.type.includes('security'),

      analyze: async (alert) => {
        const actions = [];

        actions.push({
          type: 'notification',
          params: {
            channel: 'security',
            template: 'security_alert',
            priority: 'high',
          },
        });

        return actions;
      },
    };
  }

  createScalingAutomation() {
    return {
      execute: async (params, alert) => {
        // Implement scaling logic
        console.log('Would scale:', params.scale, params.amount);
        return { scaled: true };
      },
    };
  }

  createNotificationAutomation() {
    return {
      execute: async (params, alert) => {
        // Implement notification logic
        console.log('Would notify:', params.channel, params.template);
        return { notified: true };
      },
    };
  }

  createRecoveryAutomation() {
    return {
      execute: async (params, alert) => {
        // Implement recovery logic
        console.log('Would recover:', params.strategy, params.component);
        return { recovered: true };
      },
    };
  }

  async logResponse(response) {
    try {
      this.history.unshift(response);
      if (this.history.length > this.maxHistory) {
        this.history = this.history.slice(0, this.maxHistory);
      }

      await enhancedAnalytics.logEvent('alert_response', {
        alertType: response.alert.type,
        actions: response.actions.map(a => a.type),
        success: response.results.every(r => r.success),
      });
    } catch (error) {
      console.error('Log response error:', error);
    }
  }

  getHistory() {
    return [...this.history];
  }

  getResponses() {
    return Array.from(this.responses.keys());
  }

  getAutomations() {
    return Array.from(this.automations.keys());
  }
}

export const alertResponse = new AlertResponseService(); 