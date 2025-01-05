import { enhancedAnalytics } from './enhancedAnalyticsService';
import { crashReporting } from './crashReportingService';

class IssueTemplateService {
  constructor() {
    this.templates = new Map();
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;

    try {
      // Register default templates
      this.registerTemplate('bug', this.createBugTemplate());
      this.registerTemplate('feature', this.createFeatureTemplate());
      this.registerTemplate('performance', this.createPerformanceTemplate());
      this.registerTemplate('crash', this.createCrashTemplate());
      this.registerTemplate('feedback', this.createFeedbackTemplate());

      this.initialized = true;
    } catch (error) {
      crashReporting.recordError(error, {
        context: 'issue_template_init',
      });
    }
  }

  registerTemplate(type, template) {
    this.templates.set(type, template);
  }

  async generateIssue(type, data) {
    try {
      const template = this.templates.get(type);
      if (!template) {
        throw new Error(`No template found for type: ${type}`);
      }

      const issue = await template(data);

      // Log template usage
      await enhancedAnalytics.logEvent('issue_template_used', {
        type,
        timestamp: Date.now(),
      });

      return issue;
    } catch (error) {
      crashReporting.recordError(error, {
        context: 'issue_generation',
        type,
        data,
      });
      return null;
    }
  }

  createBugTemplate() {
    return (data) => ({
      title: `Bug: ${data.title || 'Untitled Bug'}`,
      description: this.formatBugDescription(data),
      labels: ['bug', data.severity || 'normal'],
      priority: this.calculatePriority(data),
    });
  }

  createFeatureTemplate() {
    return (data) => ({
      title: `Feature: ${data.title || 'Untitled Feature'}`,
      description: this.formatFeatureDescription(data),
      labels: ['enhancement', data.size || 'medium'],
      priority: this.calculatePriority(data),
    });
  }

  createPerformanceTemplate() {
    return (data) => ({
      title: `Performance: ${data.title || 'Performance Issue'}`,
      description: this.formatPerformanceDescription(data),
      labels: ['performance', data.severity || 'normal'],
      priority: this.calculatePriority(data),
    });
  }

  createCrashTemplate() {
    return (data) => ({
      title: `Crash: ${data.title || 'App Crash'}`,
      description: this.formatCrashDescription(data),
      labels: ['crash', 'bug', data.severity || 'high'],
      priority: 'high',
    });
  }

  createFeedbackTemplate() {
    return (data) => ({
      title: `Feedback: ${data.title || 'User Feedback'}`,
      description: this.formatFeedbackDescription(data),
      labels: ['feedback', data.category || 'general'],
      priority: this.calculatePriority(data),
    });
  }

  formatBugDescription(data) {
    return `
## Bug Description
${data.description || 'No description provided'}

## Steps to Reproduce
${data.steps || 'No steps provided'}

## Expected Behavior
${data.expected || 'No expected behavior provided'}

## Actual Behavior
${data.actual || 'No actual behavior provided'}

## Environment
- Device: ${data.device || 'Unknown'}
- OS: ${data.os || 'Unknown'}
- App Version: ${data.version || 'Unknown'}

## Additional Context
${data.context || 'No additional context provided'}
    `.trim();
  }

  // ... similar format methods for other templates ...

  calculatePriority(data) {
    // Implement priority calculation logic
    return 'medium';
  }
}

export const issueTemplate = new IssueTemplateService(); 