import { enhancedAnalytics } from './enhancedAnalyticsService';
import { crashReporting } from './crashReportingService';
import { storageService } from './storageService';

class FeedbackAnalyticsService {
  constructor() {
    this.feedbackData = [];
    this.analysisCache = new Map();
    this.initialized = false;
  }

  async init() {
    try {
      if (this.initialized) return;
      
      // Load historical feedback data
      const storedData = await storageService.getItem('feedback_analytics');
      if (storedData) {
        this.feedbackData = JSON.parse(storedData);
      }

      this.initialized = true;
    } catch (error) {
      crashReporting.recordError(error, {
        context: 'feedback_analytics_init',
      });
    }
  }

  async analyzeFeedback(feedback) {
    try {
      // Add to dataset
      this.feedbackData.push(feedback);
      await this.persistData();

      // Perform analysis
      const analysis = {
        sentiment: this.analyzeSentiment(feedback.feedback),
        category: this.categorizeContent(feedback.feedback),
        urgency: this.calculateUrgency(feedback),
        impact: this.assessImpact(feedback),
        trends: await this.analyzeTrends(),
      };

      // Log analysis
      await enhancedAnalytics.logEvent('feedback_analysis', analysis);

      // Check for actionable insights
      await this.processInsights(analysis, feedback);

      return analysis;
    } catch (error) {
      crashReporting.recordError(error, {
        context: 'feedback_analysis',
        feedback,
      });
    }
  }

  analyzeSentiment(text) {
    // Simple sentiment analysis
    const positiveWords = ['good', 'great', 'awesome', 'excellent', 'love', 'perfect', 'amazing'];
    const negativeWords = ['bad', 'poor', 'terrible', 'hate', 'awful', 'horrible', 'worst'];
    
    const words = text.toLowerCase().split(/\W+/);
    let score = 0;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) score++;
      if (negativeWords.includes(word)) score--;
    });

    return {
      score,
      label: score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral',
      confidence: Math.min(Math.abs(score) / 3, 1),
    };
  }

  categorizeContent(text) {
    const categories = {
      bug: ['bug', 'crash', 'error', 'problem', 'issue', 'broken'],
      feature: ['feature', 'add', 'would like', 'should have', 'missing'],
      performance: ['slow', 'fast', 'speed', 'performance', 'lag'],
      ui: ['design', 'layout', 'look', 'ui', 'interface', 'button'],
      ux: ['confusing', 'difficult', 'easy', 'intuitive', 'hard to'],
    };

    const words = text.toLowerCase().split(/\W+/);
    const matches = {};

    Object.entries(categories).forEach(([category, keywords]) => {
      matches[category] = keywords.filter(keyword => 
        words.some(word => word.includes(keyword))
      ).length;
    });

    const topCategory = Object.entries(matches)
      .reduce((a, b) => b[1] > a[1] ? b : a);

    return {
      primary: topCategory[0],
      confidence: topCategory[1] > 0 ? topCategory[1] / words.length : 0,
      matches,
    };
  }

  calculateUrgency(feedback) {
    let urgency = 0;

    // Factor in rating
    urgency += (5 - feedback.rating) * 2;

    // Factor in sentiment
    const sentiment = this.analyzeSentiment(feedback.feedback);
    if (sentiment.label === 'negative') {
      urgency += Math.abs(sentiment.score);
    }

    // Factor in category
    const category = this.categorizeContent(feedback.feedback);
    if (category.primary === 'bug') urgency += 3;
    if (category.primary === 'performance') urgency += 2;

    return {
      score: Math.min(urgency, 10),
      level: urgency > 7 ? 'high' : urgency > 4 ? 'medium' : 'low',
    };
  }

  assessImpact(feedback) {
    return {
      userSegment: this.determineUserSegment(feedback),
      frequency: this.calculateFrequency(feedback),
      scope: this.determineScope(feedback),
    };
  }

  async analyzeTrends() {
    const timeWindow = 7 * 24 * 60 * 60 * 1000; // 7 days
    const recentFeedback = this.feedbackData.filter(
      f => Date.now() - new Date(f.timestamp).getTime() < timeWindow
    );

    return {
      averageRating: this.calculateAverageRating(recentFeedback),
      commonTopics: this.findCommonTopics(recentFeedback),
      sentimentTrend: this.calculateSentimentTrend(recentFeedback),
      categoryDistribution: this.calculateCategoryDistribution(recentFeedback),
    };
  }

  async processInsights(analysis, feedback) {
    try {
      if (this.shouldCreateIssue(analysis)) {
        await this.createIssueFromFeedback(feedback, analysis);
      }

      if (this.shouldNotifyTeam(analysis)) {
        await this.notifyTeam(feedback, analysis);
      }

      await this.updateMetrics(analysis);
    } catch (error) {
      crashReporting.recordError(error, {
        context: 'feedback_insights_processing',
        analysis,
      });
    }
  }

  async persistData() {
    try {
      // Keep only last 1000 feedback items
      if (this.feedbackData.length > 1000) {
        this.feedbackData = this.feedbackData.slice(-1000);
      }
      
      await storageService.setItem(
        'feedback_analytics',
        JSON.stringify(this.feedbackData)
      );
    } catch (error) {
      crashReporting.recordError(error, {
        context: 'feedback_data_persistence',
      });
    }
  }

  // Helper methods
  determineUserSegment(feedback) {
    // Implement user segmentation logic
    return 'general';
  }

  calculateFrequency(feedback) {
    // Implement frequency calculation
    return 'low';
  }

  determineScope(feedback) {
    // Implement scope determination
    return 'feature';
  }

  calculateAverageRating(feedbackList) {
    if (!feedbackList.length) return 0;
    return feedbackList.reduce((acc, f) => acc + f.rating, 0) / feedbackList.length;
  }

  findCommonTopics(feedbackList) {
    // Implement topic extraction
    return [];
  }

  calculateSentimentTrend(feedbackList) {
    // Implement sentiment trend calculation
    return 'stable';
  }

  calculateCategoryDistribution(feedbackList) {
    // Implement category distribution calculation
    return {};
  }
}

export const feedbackAnalytics = new FeedbackAnalyticsService(); 