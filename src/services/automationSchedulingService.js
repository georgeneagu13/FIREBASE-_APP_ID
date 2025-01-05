import { enhancedAnalytics } from './enhancedAnalyticsService';
import { alertResponseAutomation } from './alertResponseAutomationService';
import { automationRuleBuilder } from './automationRuleBuilderService';

class AutomationSchedulingService {
  constructor() {
    this.schedules = new Map();
    this.queue = new Map();
    this.running = new Set();
    this.history = [];
    this.maxHistory = 1000;
    this.workers = new Map();
    this.config = {
      maxConcurrent: 10,
      maxQueueSize: 1000,
      defaultPriority: 5,
      maxRetries: 3,
      retryDelay: 5000,
      workerTimeout: 30000,
    };
  }

  async init() {
    try {
      // Initialize scheduler
      this.startScheduler();

      // Initialize queue processor
      this.startQueueProcessor();

      // Register default workers
      this.registerDefaultWorkers();

    } catch (error) {
      console.error('Scheduler init error:', error);
      throw error;
    }
  }

  async scheduleAutomation(config) {
    try {
      const schedule = {
        id: Date.now().toString(),
        ...config,
        status: 'scheduled',
        created: Date.now(),
        modified: Date.now(),
        nextRun: this.calculateNextRun(config),
        runs: [],
      };

      // Validate schedule
      await this.validateSchedule(schedule);

      // Store schedule
      this.schedules.set(schedule.id, schedule);

      // Log schedule creation
      await this.logScheduleCreation(schedule);

      return schedule;

    } catch (error) {
      console.error('Schedule automation error:', error);
      throw error;
    }
  }

  async queueAutomation(automation, priority = this.config.defaultPriority) {
    try {
      if (this.queue.size >= this.config.maxQueueSize) {
        throw new Error('Queue is full');
      }

      const queueItem = {
        id: Date.now().toString(),
        automation,
        priority,
        status: 'queued',
        created: Date.now(),
        modified: Date.now(),
        attempts: 0,
      };

      // Add to queue
      this.queue.set(queueItem.id, queueItem);

      // Log queue addition
      await this.logQueueAddition(queueItem);

      return queueItem;

    } catch (error) {
      console.error('Queue automation error:', error);
      throw error;
    }
  }

  startScheduler() {
    setInterval(() => this.processSchedules(), 60000); // Check every minute
  }

  startQueueProcessor() {
    setInterval(() => this.processQueue(), 1000); // Process queue every second
  }

  async processSchedules() {
    const now = Date.now();
    const dueSchedules = Array.from(this.schedules.values())
      .filter(schedule => 
        schedule.status === 'scheduled' &&
        schedule.nextRun <= now
      );

    for (const schedule of dueSchedules) {
      try {
        // Queue the automation
        await this.queueAutomation(
          schedule.automation,
          schedule.priority || this.config.defaultPriority
        );

        // Update next run time
        schedule.nextRun = this.calculateNextRun(schedule);
        schedule.modified = now;
        this.schedules.set(schedule.id, schedule);

      } catch (error) {
        console.error(`Process schedule error (${schedule.id}):`, error);
        await this.logScheduleError(schedule, error);
      }
    }
  }

  async processQueue() {
    if (this.running.size >= this.config.maxConcurrent) {
      return;
    }

    // Get highest priority items
    const items = Array.from(this.queue.values())
      .sort((a, b) => b.priority - a.priority)
      .slice(0, this.config.maxConcurrent - this.running.size);

    for (const item of items) {
      try {
        // Remove from queue
        this.queue.delete(item.id);

        // Add to running set
        this.running.add(item.id);

        // Execute automation
        this.executeQueueItem(item);

      } catch (error) {
        console.error(`Process queue item error (${item.id}):`, error);
        await this.logQueueError(item, error);
      }
    }
  }

  async executeQueueItem(item) {
    try {
      item.status = 'running';
      item.modified = Date.now();
      item.attempts++;

      const worker = this.selectWorker(item.automation);
      if (!worker) {
        throw new Error('No suitable worker found');
      }

      const result = await Promise.race([
        worker.execute(item.automation),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Worker timeout')), 
          this.config.workerTimeout)
        ),
      ]);

      // Handle success
      await this.handleExecutionSuccess(item, result);

    } catch (error) {
      // Handle failure
      await this.handleExecutionFailure(item, error);
    } finally {
      // Remove from running set
      this.running.delete(item.id);
    }
  }

  async handleExecutionSuccess(item, result) {
    item.status = 'completed';
    item.modified = Date.now();
    item.result = result;

    // Update history
    this.updateHistory({
      type: 'execution',
      item,
      success: true,
      timestamp: Date.now(),
    });

    // Log success
    await this.logExecutionSuccess(item);
  }

  async handleExecutionFailure(item, error) {
    if (item.attempts < this.config.maxRetries) {
      // Requeue with delay
      setTimeout(() => {
        this.queueAutomation(
          item.automation,
          item.priority
        );
      }, this.config.retryDelay * item.attempts);
    } else {
      item.status = 'failed';
      item.modified = Date.now();
      item.error = error.message;

      // Update history
      this.updateHistory({
        type: 'execution',
        item,
        success: false,
        error: error.message,
        timestamp: Date.now(),
      });

      // Log failure
      await this.logExecutionFailure(item, error);
    }
  }

  calculateNextRun(schedule) {
    if (!schedule.frequency) return null;

    const now = Date.now();
    switch (schedule.frequency) {
      case 'minutes':
        return now + (schedule.interval * 60000);
      case 'hourly':
        return now + 3600000;
      case 'daily':
        return now + 86400000;
      case 'weekly':
        return now + 604800000;
      case 'monthly':
        return now + 2592000000;
      case 'cron':
        // Implement cron expression parsing
        return now + 86400000;
      default:
        return null;
    }
  }

  registerWorker(type, worker) {
    this.workers.set(type, worker);
  }

  registerDefaultWorkers() {
    this.registerWorker('default', {
      execute: async (automation) => {
        return alertResponseAutomation.processAutomation(automation);
      },
    });
  }

  selectWorker(automation) {
    return this.workers.get(automation.type) || this.workers.get('default');
  }

  async validateSchedule(schedule) {
    const errors = [];

    if (!schedule.automation) errors.push('Automation is required');
    if (!schedule.frequency) errors.push('Frequency is required');
    if (schedule.frequency === 'minutes' && !schedule.interval) {
      errors.push('Interval is required for minute frequency');
    }

    if (errors.length > 0) {
      throw new Error(`Invalid schedule: ${errors.join(', ')}`);
    }
  }

  async logScheduleCreation(schedule) {
    try {
      await enhancedAnalytics.logEvent('schedule_created', {
        scheduleId: schedule.id,
        frequency: schedule.frequency,
        automationType: schedule.automation.type,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Log schedule creation error:', error);
    }
  }

  async logQueueAddition(item) {
    try {
      await enhancedAnalytics.logEvent('automation_queued', {
        itemId: item.id,
        priority: item.priority,
        automationType: item.automation.type,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Log queue addition error:', error);
    }
  }

  async logExecutionSuccess(item) {
    try {
      await enhancedAnalytics.logEvent('automation_executed', {
        itemId: item.id,
        automationType: item.automation.type,
        attempts: item.attempts,
        duration: Date.now() - item.created,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Log execution success error:', error);
    }
  }

  async logExecutionFailure(item, error) {
    try {
      await enhancedAnalytics.logEvent('automation_failed', {
        itemId: item.id,
        automationType: item.automation.type,
        attempts: item.attempts,
        error: error.message,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Log execution failure error:', error);
    }
  }

  updateHistory(entry) {
    this.history.unshift(entry);
    if (this.history.length > this.maxHistory) {
      this.history = this.history.slice(0, this.maxHistory);
    }
  }

  getSchedules(filter = {}) {
    let schedules = Array.from(this.schedules.values());

    if (filter.status) {
      schedules = schedules.filter(s => s.status === filter.status);
    }
    if (filter.frequency) {
      schedules = schedules.filter(s => s.frequency === filter.frequency);
    }

    return schedules;
  }

  getQueue() {
    return Array.from(this.queue.values());
  }

  getRunning() {
    return Array.from(this.running);
  }

  getHistory() {
    return [...this.history];
  }

  updateConfig(updates) {
    this.config = {
      ...this.config,
      ...updates,
    };
  }
}

export const automationScheduling = new AutomationSchedulingService(); 