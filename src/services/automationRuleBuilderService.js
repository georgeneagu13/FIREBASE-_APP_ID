import { enhancedAnalytics } from './enhancedAnalyticsService';
import { alertResponseAutomation } from './alertResponseAutomationService';

class AutomationRuleBuilderService {
  constructor() {
    this.rules = new Map();
    this.templates = new Map();
    this.validations = new Map();
    this.dependencies = new Map();
    this.history = [];
    this.maxHistory = 100;
  }

  async createRule(config) {
    try {
      // Validate rule configuration
      const validationResult = await this.validateRule(config);
      if (!validationResult.isValid) {
        throw new Error(`Invalid rule configuration: ${validationResult.errors.join(', ')}`);
      }

      // Check dependencies
      const dependencyResult = await this.checkDependencies(config);
      if (!dependencyResult.isValid) {
        throw new Error(`Dependency check failed: ${dependencyResult.errors.join(', ')}`);
      }

      // Create rule
      const rule = {
        id: Date.now().toString(),
        ...config,
        created: Date.now(),
        modified: Date.now(),
        status: 'active',
        version: 1,
      };

      // Store rule
      this.rules.set(rule.id, rule);

      // Log rule creation
      await this.logRuleCreation(rule);

      return rule;

    } catch (error) {
      console.error('Create rule error:', error);
      throw error;
    }
  }

  async validateRule(config) {
    const errors = [];

    // Validate basic structure
    if (!config.name) errors.push('Rule name is required');
    if (!config.conditions || !Array.isArray(config.conditions)) {
      errors.push('Rule conditions must be an array');
    }
    if (!config.actions || !Array.isArray(config.actions)) {
      errors.push('Rule actions must be an array');
    }

    // Validate conditions
    if (config.conditions) {
      config.conditions.forEach((condition, index) => {
        if (!condition.type) {
          errors.push(`Condition ${index} must have a type`);
        }
        if (!condition.value) {
          errors.push(`Condition ${index} must have a value`);
        }
      });
    }

    // Validate actions
    if (config.actions) {
      config.actions.forEach((action, index) => {
        if (!action.type) {
          errors.push(`Action ${index} must have a type`);
        }
        if (!action.params) {
          errors.push(`Action ${index} must have parameters`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  async checkDependencies(config) {
    const errors = [];
    const dependencies = new Set();

    // Check action dependencies
    if (config.actions) {
      for (const action of config.actions) {
        const actionDeps = this.dependencies.get(action.type);
        if (actionDeps) {
          actionDeps.forEach(dep => dependencies.add(dep));
        }
      }
    }

    // Validate dependencies
    for (const dep of dependencies) {
      if (!this.validateDependency(dep)) {
        errors.push(`Missing dependency: ${dep}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      dependencies: Array.from(dependencies),
    };
  }

  validateDependency(dependency) {
    // Implement dependency validation logic
    return true;
  }

  async updateRule(id, updates) {
    const rule = this.rules.get(id);
    if (!rule) {
      throw new Error(`Rule not found: ${id}`);
    }

    // Validate updates
    const validationResult = await this.validateRule({
      ...rule,
      ...updates,
    });
    if (!validationResult.isValid) {
      throw new Error(`Invalid rule updates: ${validationResult.errors.join(', ')}`);
    }

    // Update rule
    const updatedRule = {
      ...rule,
      ...updates,
      modified: Date.now(),
      version: rule.version + 1,
    };

    this.rules.set(id, updatedRule);

    // Log rule update
    await this.logRuleUpdate(updatedRule);

    return updatedRule;
  }

  async deleteRule(id) {
    const rule = this.rules.get(id);
    if (!rule) {
      throw new Error(`Rule not found: ${id}`);
    }

    // Check for dependent rules
    const dependents = this.findDependentRules(id);
    if (dependents.length > 0) {
      throw new Error(`Rule has dependents: ${dependents.map(r => r.name).join(', ')}`);
    }

    // Delete rule
    this.rules.delete(id);

    // Log rule deletion
    await this.logRuleDeletion(rule);

    return true;
  }

  findDependentRules(ruleId) {
    return Array.from(this.rules.values())
      .filter(rule => this.isRuleDependent(rule, ruleId));
  }

  isRuleDependent(rule, dependencyId) {
    // Check actions for dependencies
    return rule.actions.some(action => {
      const actionDeps = this.dependencies.get(action.type);
      return actionDeps && actionDeps.includes(dependencyId);
    });
  }

  async createRuleTemplate(config) {
    // Validate template configuration
    const validationResult = await this.validateRule(config);
    if (!validationResult.isValid) {
      throw new Error(`Invalid template configuration: ${validationResult.errors.join(', ')}`);
    }

    const template = {
      id: Date.now().toString(),
      ...config,
      created: Date.now(),
      type: 'template',
    };

    this.templates.set(template.id, template);
    return template;
  }

  async createRuleFromTemplate(templateId, customizations = {}) {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    return this.createRule({
      ...template,
      ...customizations,
      templateId,
    });
  }

  registerValidation(type, validator) {
    this.validations.set(type, validator);
  }

  registerDependency(type, dependencies) {
    this.dependencies.set(type, dependencies);
  }

  async logRuleCreation(rule) {
    try {
      this.updateHistory({
        type: 'create',
        rule: rule.id,
        timestamp: Date.now(),
      });

      await enhancedAnalytics.logEvent('rule_created', {
        ruleId: rule.id,
        ruleName: rule.name,
        conditions: rule.conditions.length,
        actions: rule.actions.length,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Log rule creation error:', error);
    }
  }

  async logRuleUpdate(rule) {
    try {
      this.updateHistory({
        type: 'update',
        rule: rule.id,
        version: rule.version,
        timestamp: Date.now(),
      });

      await enhancedAnalytics.logEvent('rule_updated', {
        ruleId: rule.id,
        ruleName: rule.name,
        version: rule.version,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Log rule update error:', error);
    }
  }

  async logRuleDeletion(rule) {
    try {
      this.updateHistory({
        type: 'delete',
        rule: rule.id,
        timestamp: Date.now(),
      });

      await enhancedAnalytics.logEvent('rule_deleted', {
        ruleId: rule.id,
        ruleName: rule.name,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Log rule deletion error:', error);
    }
  }

  updateHistory(entry) {
    this.history.unshift(entry);
    if (this.history.length > this.maxHistory) {
      this.history = this.history.slice(0, this.maxHistory);
    }
  }

  getRules() {
    return Array.from(this.rules.values());
  }

  getRule(id) {
    return this.rules.get(id);
  }

  getTemplates() {
    return Array.from(this.templates.values());
  }

  getHistory() {
    return [...this.history];
  }
}

export const automationRuleBuilder = new AutomationRuleBuilderService(); 