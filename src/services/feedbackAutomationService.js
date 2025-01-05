import { enhancedAnalytics } from './enhancedAnalyticsService';
import { feedbackAnalytics } from './feedbackAnalyticsService';
import { responseTemplate } from './responseTemplateService';
import { issueTemplate } from './issueTemplateService';
import { issueTracking } from './issueTrackingService';

class FeedbackAutomationService {
  constructor() {
    this.rules = new Map();
    this.actions = new Map();
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;

    try {
      // Register default automation rules
      this.registerRule('urgent_issues', this.createUrgentIssueRule());
      this.registerRule('feature_requests', this.createFeatureRequestRule());
      this.registerRule('negative_feedback', this.createNegativeFeedbackRule());
      this.registerRule('bug_reports', this.createBugReportRule());

      // Register default actions
      this.registerAction('create_issue', this.createIssueAction());
      this.registerAction('send_response', this.sendResponseAction());
      this.registerAction('notify_team', this.notifyTeamAction());

      this.initialized = true;
    } catch (error) {
      console.error('Feedback automation init error:', error);
    }
  }

  registerRule(name, rule) {
    this.rules.set(name, rule);
  }

  registerAction(name, action) {
    this.actions.set(name, action);
  }

  async processFeedback(feedback) {
    try {
      const analysis = await feedbackAnalytics.analyzeFeedback(feedback);
      const matchedRules = this.evaluateRules(feedback, analysis);
      
      for (const rule of matchedRules) {
        await this.executeActions(rule, feedback, analysis);
      }

      // Log automation results
      await enhancedAnalytics.logEvent('feedback_automation', {
        rulesMatched: matchedRules.length,
        feedbackType: analysis.category.primary,
        sentiment: analysis.sentiment.label,
      });

    } catch (error) {
      console.error('Process feedback error:', error);
    }
  }

  evaluateRules(feedback, analysis) {
    const matchedRules = [];

    for (const [name, rule] of this.rules) {
      if (rule.condition(feedback, analysis)) {
        matchedRules.push({
          name,
          actions: rule.actions,
          priority: rule.priority,
        });
      }
    }

    // Sort by priority
    return matchedRules.sort((a, b) => b.priority - a.priority);
  }

  async executeActions(rule, feedback, analysis) {
    for (const actionName of rule.actions) {
      const action = this.actions.get(actionName);
      if (action) {
        await action(feedback, analysis, rule);
      }
    }
  }

  createUrgentIssueRule() {
    return {
      condition: (feedback, analysis) => {
        return analysis.urgency.level === 'high' && 
               analysis.sentiment.label === 'negative';
      },
      actions: ['create_issue', 'notify_team', 'send_response'],
      priority: 1,
    };
  }

  createFeatureRequestRule() {
    return {
      condition: (feedback, analysis) => {
        return analysis.category.primary === 'feature';
      },
      actions: ['create_issue', 'send_response'],
      priority: 2,
    };
  }

  createNegativeFeedbackRule() {
    return {
      condition: (feedback, analysis) => {
        return analysis.sentiment.label === 'negative' &&
               analysis.sentiment.confidence > 0.7;
      },
      actions: ['send_response', 'notify_team'],
      priority: 3,
    };
  }

  createBugReportRule() {
    return {
      condition: (feedback, analysis) => {
        return analysis.category.primary === 'bug';
      },
      actions: ['create_issue', 'send_response'],
      priority: 2,
    };
  }

  createIssueAction() {
    return async (feedback, analysis, rule) => {
      try {
        const template = await issueTemplate.generateIssue(
          analysis.category.primary,
          {
            title: feedback.feedback.substring(0, 100),
            description: feedback.feedback,
            severity: analysis.urgency.level,
            category: analysis.category.primary,
            sentiment: analysis.sentiment.label,
          }
        );

        await issueTracking.createIssue(template);
      } catch (error) {
        console.error('Create issue action error:', error);
      }
    };
  }

  sendResponseAction() {
    return async (feedback, analysis) => {
      try {
        const response = await responseTemplate.generateResponse(feedback);
        // Implement your email/notification sending logic here
        console.log('Would send response:', response);
      } catch (error) {
        console.error('Send response action error:', error);
      }
    };
  }

  notifyTeamAction() {
    return async (feedback, analysis) => {
      try {
        // Implement your team notification logic here
        console.log('Would notify team about:', feedback);
      } catch (error) {
        console.error('Notify team action error:', error);
      }
    };
  }
}

export const feedbackAutomation = new FeedbackAutomationService(); 