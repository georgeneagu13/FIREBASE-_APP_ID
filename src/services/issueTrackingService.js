import { enhancedAnalytics } from './enhancedAnalyticsService';
import { crashReporting } from './crashReportingService';

class IssueTrackingService {
  constructor() {
    this.issueQueue = [];
    this.isProcessing = false;
    this.providers = new Map();
  }

  registerProvider(provider) {
    this.providers.set(provider.name, provider);
  }

  async createIssue(data) {
    try {
      const issue = {
        id: Date.now().toString(),
        title: data.title || 'Untitled Issue',
        description: this.formatDescription(data),
        type: data.type || 'bug',
        severity: data.severity || 'medium',
        status: 'open',
        metadata: {
          ...data.metadata,
          created: new Date().toISOString(),
          source: 'automated',
        },
      };

      // Add to queue
      this.issueQueue.push(issue);

      // Process queue
      await this.processQueue();

      return issue.id;
    } catch (error) {
      crashReporting.recordError(error, {
        context: 'issue_creation',
        data,
      });
      return null;
    }
  }

  formatDescription(data) {
    const sections = [
      `## Description`,
      data.description || 'No description provided',
      `## Technical Details`,
      '```json',
      JSON.stringify(data.metadata, null, 2),
      '```',
      `## Steps to Reproduce`,
      data.steps || 'No steps provided',
      `## Expected Behavior`,
      data.expected || 'No expected behavior provided',
      `## Actual Behavior`,
      data.actual || 'No actual behavior provided',
    ];

    return sections.join('\n\n');
  }

  async processQueue() {
    if (this.isProcessing) return;

    try {
      this.isProcessing = true;

      while (this.issueQueue.length > 0) {
        const issue = this.issueQueue[0];

        // Try each provider
        for (const provider of this.providers.values()) {
          try {
            await provider.createIssue(issue);
            
            // Log success
            await enhancedAnalytics.logEvent('issue_created', {
              issueId: issue.id,
              provider: provider.name,
              type: issue.type,
              severity: issue.severity,
            });

            // Remove from queue if successful
            this.issueQueue.shift();
            break;
          } catch (error) {
            console.error(`Failed to create issue with ${provider.name}:`, error);
          }
        }

        // If all providers failed, leave in queue for retry
        if (this.issueQueue[0] === issue) {
          break;
        }
      }
    } catch (error) {
      crashReporting.recordError(error, {
        context: 'issue_queue_processing',
      });
    } finally {
      this.isProcessing = false;
    }
  }

  async getIssues(filters = {}) {
    try {
      const issues = [];
      
      for (const provider of this.providers.values()) {
        const providerIssues = await provider.getIssues(filters);
        issues.push(...providerIssues);
      }

      return issues;
    } catch (error) {
      crashReporting.recordError(error, {
        context: 'issue_retrieval',
        filters,
      });
      return [];
    }
  }

  async updateIssue(issueId, updates) {
    try {
      for (const provider of this.providers.values()) {
        try {
          await provider.updateIssue(issueId, updates);
          return true;
        } catch (error) {
          console.error(`Failed to update issue with ${provider.name}:`, error);
        }
      }
      return false;
    } catch (error) {
      crashReporting.recordError(error, {
        context: 'issue_update',
        issueId,
        updates,
      });
      return false;
    }
  }
}

export const issueTracking = new IssueTrackingService(); 