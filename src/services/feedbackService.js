import { enhancedAnalytics } from './enhancedAnalyticsService';
import { crashReporting } from './crashReportingService';
import { storageService } from './storageService';

class FeedbackService {
  constructor() {
    this.feedbackQueue = [];
    this.isProcessing = false;
  }

  async submitFeedback(feedback) {
    try {
      // Add metadata
      const enrichedFeedback = {
        ...feedback,
        deviceInfo: await this.getDeviceInfo(),
        appInfo: await this.getAppInfo(),
      };

      // Log to analytics
      await enhancedAnalytics.logEvent('feedback_submitted', enrichedFeedback);

      // Store feedback
      await this.storeFeedback(enrichedFeedback);

      // Process feedback queue
      await this.processFeedbackQueue();

      return true;
    } catch (error) {
      crashReporting.recordError(error, {
        context: 'feedback_submission',
        feedback,
      });
      return false;
    }
  }

  async storeFeedback(feedback) {
    try {
      this.feedbackQueue.push(feedback);
      await storageService.setItem(
        'feedback_queue',
        JSON.stringify(this.feedbackQueue)
      );
    } catch (error) {
      crashReporting.recordError(error, {
        context: 'feedback_storage',
      });
    }
  }

  async processFeedbackQueue() {
    if (this.isProcessing) return;

    try {
      this.isProcessing = true;
      
      while (this.feedbackQueue.length > 0) {
        const feedback = this.feedbackQueue[0];
        
        // Send to backend
        await this.sendFeedbackToServer(feedback);
        
        // Remove from queue if successful
        this.feedbackQueue.shift();
        await storageService.setItem(
          'feedback_queue',
          JSON.stringify(this.feedbackQueue)
        );
      }
    } catch (error) {
      crashReporting.recordError(error, {
        context: 'feedback_processing',
      });
    } finally {
      this.isProcessing = false;
    }
  }

  async sendFeedbackToServer(feedback) {
    // Implement your API call here
    // This is a placeholder implementation
    return new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });
  }

  async getDeviceInfo() {
    // Implement device info collection
    return {
      platform: Platform.OS,
      // Add more device info as needed
    };
  }

  async getAppInfo() {
    // Implement app info collection
    return {
      version: '1.0.0',
      // Add more app info as needed
    };
  }

  async getFeedbackHistory() {
    try {
      const queue = await storageService.getItem('feedback_queue');
      return queue ? JSON.parse(queue) : [];
    } catch (error) {
      crashReporting.recordError(error, {
        context: 'feedback_history',
      });
      return [];
    }
  }
}

export const feedbackService = new FeedbackService(); 