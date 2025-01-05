import { enhancedAnalytics } from './enhancedAnalyticsService';
import { automationStateManagement } from './automationStateManagementService';
import { automationAnalytics } from './automationAnalyticsService';
import { automationIntegration } from './automationIntegrationService';

class AutomationReportingService {
  constructor() {
    this.reports = new Map();
    this.templates = new Map();
    this.schedules = new Map();
    this.distributions = new Map();
    this.history = [];
    this.maxHistory = 1000;
    this.config = {
      maxReports: 1000,
      retentionPeriod: 90 * 24 * 60 * 60 * 1000, // 90 days
      defaultFormat: 'pdf',
      compressionEnabled: true,
      maxFileSize: 10485760, // 10MB
    };
  }

  async init() {
    try {
      // Register default templates
      this.registerDefaultTemplates();

      // Initialize report cleanup
      this.startCleanupJob();

      // Register default distributions
      this.registerDefaultDistributions();

    } catch (error) {
      console.error('Reporting init error:', error);
      throw error;
    }
  }

  async generateReport(config) {
    try {
      const report = {
        id: Date.now().toString(),
        ...config,
        status: 'pending',
        created: Date.now(),
        modified: Date.now(),
      };

      // Validate report configuration
      await this.validateReportConfig(report);

      // Generate report content
      const content = await this.generateReportContent(report);

      // Format report
      const formatted = await this.formatReport(content, report.format);

      // Store report
      const finalReport = {
        ...report,
        content: formatted,
        status: 'completed',
        modified: Date.now(),
      };

      this.reports.set(report.id, finalReport);

      // Distribute report if configured
      if (report.distribution) {
        await this.distributeReport(finalReport);
      }

      // Log report generation
      await this.logReportGeneration(finalReport);

      return finalReport;

    } catch (error) {
      console.error('Generate report error:', error);
      throw error;
    }
  }

  async generateReportContent(report) {
    const template = this.templates.get(report.template);
    if (!template) {
      throw new Error(`Template not found: ${report.template}`);
    }

    // Gather data
    const data = await this.gatherReportData(report);

    // Apply template
    return template.generate(data);
  }

  async gatherReportData(report) {
    const data = {
      timestamp: Date.now(),
      metrics: {},
      analytics: {},
      states: {},
      integrations: {},
    };

    // Gather automation metrics
    if (report.includeMetrics) {
      data.metrics = await this.gatherMetrics(report.timeRange);
    }

    // Gather analytics
    if (report.includeAnalytics) {
      data.analytics = await this.gatherAnalytics(report.timeRange);
    }

    // Gather state information
    if (report.includeStates) {
      data.states = await this.gatherStates(report.timeRange);
    }

    // Gather integration data
    if (report.includeIntegrations) {
      data.integrations = await this.gatherIntegrations(report.timeRange);
    }

    return data;
  }

  async gatherMetrics(timeRange) {
    return {
      automations: await automationAnalytics.getMetrics(timeRange),
      states: await automationStateManagement.getMetrics(timeRange),
      integrations: await automationIntegration.getMetrics(timeRange),
    };
  }

  async gatherAnalytics(timeRange) {
    return {
      performance: await automationAnalytics.getPerformanceMetrics(timeRange),
      effectiveness: await automationAnalytics.getEffectivenessMetrics(timeRange),
      patterns: await automationAnalytics.getPatternMetrics(timeRange),
    };
  }

  async gatherStates(timeRange) {
    return {
      current: await automationStateManagement.getCurrentStates(),
      transitions: await automationStateManagement.getTransitionMetrics(timeRange),
      distribution: await automationStateManagement.getStateDistribution(timeRange),
    };
  }

  async gatherIntegrations(timeRange) {
    return {
      status: await automationIntegration.getIntegrationStatus(),
      performance: await automationIntegration.getPerformanceMetrics(timeRange),
      errors: await automationIntegration.getErrorMetrics(timeRange),
    };
  }

  async formatReport(content, format = this.config.defaultFormat) {
    switch (format.toLowerCase()) {
      case 'pdf':
        return this.formatPDF(content);
      case 'html':
        return this.formatHTML(content);
      case 'json':
        return this.formatJSON(content);
      case 'csv':
        return this.formatCSV(content);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  async formatPDF(content) {
    // Implement PDF formatting
    return content;
  }

  async formatHTML(content) {
    // Implement HTML formatting
    return content;
  }

  async formatJSON(content) {
    return JSON.stringify(content, null, 2);
  }

  async formatCSV(content) {
    // Implement CSV formatting
    return content;
  }

  async scheduleReport(config) {
    try {
      const schedule = {
        id: Date.now().toString(),
        ...config,
        status: 'active',
        created: Date.now(),
        modified: Date.now(),
        lastRun: null,
        nextRun: this.calculateNextRun(config.schedule),
      };

      // Validate schedule
      await this.validateSchedule(schedule);

      // Store schedule
      this.schedules.set(schedule.id, schedule);

      // Log schedule creation
      await this.logScheduleCreation(schedule);

      return schedule;

    } catch (error) {
      console.error('Schedule report error:', error);
      throw error;
    }
  }

  async distributeReport(report) {
    const distribution = this.distributions.get(report.distribution);
    if (!distribution) {
      throw new Error(`Distribution not found: ${report.distribution}`);
    }

    try {
      await distribution.distribute(report);
      
      // Log distribution
      await this.logDistribution(report);

    } catch (error) {
      console.error('Distribute report error:', error);
      throw error;
    }
  }

  registerTemplate(id, template) {
    this.templates.set(id, template);
  }

  registerDistribution(id, distribution) {
    this.distributions.set(id, distribution);
  }

  registerDefaultTemplates() {
    // Register summary template
    this.registerTemplate('summary', {
      generate: async (data) => {
        // Implement summary template
        return data;
      },
    });

    // Register detailed template
    this.registerTemplate('detailed', {
      generate: async (data) => {
        // Implement detailed template
        return data;
      },
    });
  }

  registerDefaultDistributions() {
    // Register email distribution
    this.registerDistribution('email', {
      distribute: async (report) => {
        // Implement email distribution
        return true;
      },
    });

    // Register storage distribution
    this.registerDistribution('storage', {
      distribute: async (report) => {
        // Implement storage distribution
        return true;
      },
    });
  }

  startCleanupJob() {
    setInterval(() => this.cleanup(), 86400000); // Run daily
  }

  async cleanup() {
    try {
      const cutoff = Date.now() - this.config.retentionPeriod;
      
      // Clean up old reports
      for (const [id, report] of this.reports.entries()) {
        if (report.created < cutoff) {
          this.reports.delete(id);
        }
      }

      // Clean up history
      this.history = this.history.filter(
        entry => entry.timestamp >= cutoff
      );

    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }

  calculateNextRun(schedule) {
    // Implement schedule calculation
    return Date.now() + 86400000; // Default to next day
  }

  async validateReportConfig(config) {
    const errors = [];

    if (!config.template) errors.push('Template is required');
    if (!config.timeRange) errors.push('Time range is required');

    if (errors.length > 0) {
      throw new Error(`Invalid report config: ${errors.join(', ')}`);
    }
  }

  async validateSchedule(schedule) {
    const errors = [];

    if (!schedule.reportConfig) errors.push('Report configuration is required');
    if (!schedule.schedule) errors.push('Schedule configuration is required');

    if (errors.length > 0) {
      throw new Error(`Invalid schedule: ${errors.join(', ')}`);
    }
  }

  async logReportGeneration(report) {
    try {
      await enhancedAnalytics.logEvent('report_generated', {
        reportId: report.id,
        template: report.template,
        format: report.format,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Log report generation error:', error);
    }
  }

  async logScheduleCreation(schedule) {
    try {
      await enhancedAnalytics.logEvent('report_scheduled', {
        scheduleId: schedule.id,
        reportConfig: schedule.reportConfig,
        schedule: schedule.schedule,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Log schedule creation error:', error);
    }
  }

  async logDistribution(report) {
    try {
      await enhancedAnalytics.logEvent('report_distributed', {
        reportId: report.id,
        distribution: report.distribution,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Log distribution error:', error);
    }
  }

  getReports(filter = {}) {
    let reports = Array.from(this.reports.values());

    if (filter.template) {
      reports = reports.filter(r => r.template === filter.template);
    }
    if (filter.status) {
      reports = reports.filter(r => r.status === filter.status);
    }
    if (filter.startDate) {
      reports = reports.filter(r => r.created >= filter.startDate);
    }
    if (filter.endDate) {
      reports = reports.filter(r => r.created <= filter.endDate);
    }

    return reports;
  }

  getSchedules(filter = {}) {
    let schedules = Array.from(this.schedules.values());

    if (filter.status) {
      schedules = schedules.filter(s => s.status === filter.status);
    }

    return schedules;
  }

  getTemplates() {
    return Array.from(this.templates.keys());
  }

  getDistributions() {
    return Array.from(this.distributions.keys());
  }

  updateConfig(updates) {
    this.config = {
      ...this.config,
      ...updates,
    };
  }
}

export const automationReporting = new AutomationReportingService(); 