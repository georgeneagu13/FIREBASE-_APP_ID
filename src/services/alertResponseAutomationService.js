import { enhancedAnalytics } from './enhancedAnalyticsService';
import { alertResponseTemplate } from './alertResponseTemplateService';
import { alertPatternDetection } from './alertPatternDetectionService';

class AlertResponseAutomationService {
  constructor() {
    this.automations = new Map();
    this.actions = new Map();
    this.workflows = new Map();
    this.history = [];
    this.maxHistory = 100;
    this.config = {
      maxRetries: 3,
      retryDelay: 5000,
      timeout: 30000,
      batchSize: 10,
      concurrentLimit: 5,
    };
  }

  async init() {
    try {
      // Register default actions
      this.registerAction('notify', this.createNotifyAction());
      this.registerAction('scale', this.createScaleAction());
      this.registerAction('restart', this.createRestartAction());
      this.registerAction('backup', this.createBackupAction());
      this.registerAction('rollback', this.createRollbackAction());

      // Register default workflows
      this.registerWorkflow('performance', this.createPerformanceWorkflow());
      this.registerWorkflow('error', this.createErrorWorkflow());
      this.registerWorkflow('security', this.createSecurityWorkflow());

      // Initialize automation rules
      await this.initializeAutomations();

    } catch (error) {
      console.error('Alert response automation init error:', error);
    }
  }

  registerAction(type, action) {
    this.actions.set(type, action);
  }

  registerWorkflow(type, workflow) {
    this.workflows.set(type, workflow);
  }

  async processAlert(alert) {
    try {
      // Find matching automations
      const automations = this.findMatchingAutomations(alert);
      if (automations.length === 0) return null;

      // Generate response from template
      const response = await alertResponseTemplate.generateResponse(alert);
      if (!response) return null;

      // Execute automations
      const results = await this.executeAutomations(automations, alert, response);

      // Log automation execution
      await this.logAutomation(alert, automations, results);

      // Update history
      this.updateHistory({
        alert,
        automations,
        results,
        timestamp: Date.now(),
      });

      return results;

    } catch (error) {
      console.error('Process alert error:', error);
      return null;
    }
  }

  findMatchingAutomations(alert) {
    return Array.from(this.automations.values())
      .filter(automation => this.matchesConditions(alert, automation.conditions));
  }

  matchesConditions(alert, conditions) {
    return conditions.every(condition => {
      switch (condition.type) {
        case 'type':
          return alert.type === condition.value;
        case 'priority':
          return alert.priority === condition.value;
        case 'pattern':
          return this.matchesPattern(alert, condition.value);
        case 'threshold':
          return this.checkThreshold(alert, condition.value);
        default:
          return false;
      }
    });
  }

  async executeAutomations(automations, alert, response) {
    const results = [];
    const executing = new Set();

    for (const automation of automations) {
      try {
        // Check concurrent limit
        if (executing.size >= this.config.concurrentLimit) {
          await this.waitForAvailableSlot(executing);
        }

        // Execute automation with retry logic
        const promise = this.executeWithRetry(automation, alert, response);
        executing.add(promise);

        promise.finally(() => executing.delete(promise));
        results.push(await promise);

      } catch (error) {
        console.error(`Automation execution error (${automation.id}):`, error);
        results.push({
          automationId: automation.id,
          success: false,
          error: error.message,
        });
      }
    }

    // Wait for all executions to complete
    await Promise.all(Array.from(executing));
    return results;
  }

  async executeWithRetry(automation, alert, response) {
    let lastError;
    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        const result = await this.executeWorkflow(
          automation.workflow,
          alert,
          response
        );
        return {
          automationId: automation.id,
          success: true,
          result,
        };
      } catch (error) {
        lastError = error;
        if (attempt < this.config.maxRetries) {
          await new Promise(resolve => 
            setTimeout(resolve, this.config.retryDelay * attempt)
          );
        }
      }
    }

    throw lastError;
  }

  async executeWorkflow(workflow, alert, response) {
    const results = [];
    for (const step of workflow) {
      const action = this.actions.get(step.action);
      if (!action) {
        throw new Error(`Unknown action: ${step.action}`);
      }

      const result = await action.execute(step.params, alert, response);
      results.push(result);

      if (step.required && !result.success) {
        throw new Error(`Required action failed: ${step.action}`);
      }
    }
    return results;
  }

  async waitForAvailableSlot(executing) {
    while (executing.size >= this.config.concurrentLimit) {
      await Promise.race(Array.from(executing));
    }
  }

  createNotifyAction() {
    return {
      execute: async (params, alert, response) => {
        // Implement notification logic
        console.log('Would notify:', params.channel, response.content);
        return { notified: true };
      },
    };
  }

  createScaleAction() {
    return {
      execute: async (params, alert) => {
        // Implement scaling logic
        console.log('Would scale:', params.service, params.amount);
        return { scaled: true };
      },
    };
  }

  createRestartAction() {
    return {
      execute: async (params, alert) => {
        // Implement restart logic
        console.log('Would restart:', params.service);
        return { restarted: true };
      },
    };
  }

  createBackupAction() {
    return {
      execute: async (params, alert) => {
        // Implement backup logic
        console.log('Would backup:', params.target);
        return { backed_up: true };
      },
    };
  }

  createRollbackAction() {
    return {
      execute: async (params, alert) => {
        // Implement rollback logic
        console.log('Would rollback:', params.service, params.version);
        return { rolled_back: true };
      },
    };
  }

  createPerformanceWorkflow() {
    return [
      {
        action: 'notify',
        params: { channel: 'ops', priority: 'high' },
        required: true,
      },
      {
        action: 'scale',
        params: { amount: 2 },
        required: false,
      },
    ];
  }

  createErrorWorkflow() {
    return [
      {
        action: 'notify',
        params: { channel: 'dev', priority: 'high' },
        required: true,
      },
      {
        action: 'restart',
        params: { graceful: true },
        required: false,
      },
    ];
  }

  createSecurityWorkflow() {
    return [
      {
        action: 'notify',
        params: { channel: 'security', priority: 'critical' },
        required: true,
      },
      {
        action: 'backup',
        params: { type: 'full' },
        required: true,
      },
    ];
  }

  async initializeAutomations() {
    // Add default automations
    this.automations.set('performance_high', {
      id: 'performance_high',
      conditions: [
        { type: 'type', value: 'performance' },
        { type: 'priority', value: 'high' },
      ],
      workflow: this.workflows.get('performance'),
    });

    this.automations.set('error_critical', {
      id: 'error_critical',
      conditions: [
        { type: 'type', value: 'error' },
        { type: 'priority', value: 'critical' },
      ],
      workflow: this.workflows.get('error'),
    });

    this.automations.set('security_breach', {
      id: 'security_breach',
      conditions: [
        { type: 'type', value: 'security' },
        { type: 'pattern', value: 'breach' },
      ],
      workflow: this.workflows.get('security'),
    });
  }

  async logAutomation(alert, automations, results) {
    try {
      await enhancedAnalytics.logEvent('automation_executed', {
        alertType: alert.type,
        automationCount: automations.length,
        successCount: results.filter(r => r.success).length,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Log automation error:', error);
    }
  }

  updateHistory(entry) {
    this.history.unshift(entry);
    if (this.history.length > this.maxHistory) {
      this.history = this.history.slice(0, this.maxHistory);
    }
  }

  getHistory() {
    return [...this.history];
  }

  getAutomations() {
    return Array.from(this.automations.values());
  }

  getActions() {
    return Array.from(this.actions.keys());
  }

  getWorkflows() {
    return Array.from(this.workflows.entries());
  }

  updateConfig(updates) {
    this.config = {
      ...this.config,
      ...updates,
    };
  }
}

export const alertResponseAutomation = new AlertResponseAutomationService(); 