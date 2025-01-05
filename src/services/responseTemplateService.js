import { enhancedAnalytics } from './enhancedAnalyticsService';
import { feedbackAnalytics } from './feedbackAnalyticsService';

class ResponseTemplateService {
  constructor() {
    this.templates = new Map();
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;

    try {
      // Register default templates
      this.registerTemplate('positive', this.createPositiveTemplate());
      this.registerTemplate('negative', this.createNegativeTemplate());
      this.registerTemplate('bug', this.createBugTemplate());
      this.registerTemplate('feature', this.createFeatureTemplate());
      this.registerTemplate('general', this.createGeneralTemplate());

      this.initialized = true;
    } catch (error) {
      console.error('Response template init error:', error);
    }
  }

  registerTemplate(type, template) {
    this.templates.set(type, template);
  }

  async generateResponse(feedback) {
    try {
      const analysis = await feedbackAnalytics.analyzeFeedback(feedback);
      const template = this.selectTemplate(analysis);
      
      if (!template) {
        return this.templates.get('general')(feedback);
      }

      const response = template(feedback);

      // Log template usage
      await enhancedAnalytics.logEvent('response_template_used', {
        type: template.type,
        sentiment: analysis.sentiment.label,
        category: analysis.category.primary,
      });

      return response;
    } catch (error) {
      console.error('Generate response error:', error);
      return this.templates.get('general')(feedback);
    }
  }

  selectTemplate(analysis) {
    if (analysis.sentiment.label === 'negative' && analysis.category.primary === 'bug') {
      return this.templates.get('bug');
    }

    if (analysis.category.primary === 'feature') {
      return this.templates.get('feature');
    }

    return this.templates.get(analysis.sentiment.label);
  }

  createPositiveTemplate() {
    return (feedback) => ({
      subject: 'Thank You for Your Positive Feedback!',
      body: `
Dear ${feedback.email ? feedback.email.split('@')[0] : 'Valued User'},

Thank you for your wonderful feedback! We're thrilled to hear that you're enjoying our app. Your positive comments help us understand what we're doing right and motivate us to maintain our high standards.

${this.generateSpecificResponse(feedback)}

Thank you for being a part of our community!

Best regards,
The FoodAI Team
      `.trim(),
      type: 'positive',
    });
  }

  createNegativeTemplate() {
    return (feedback) => ({
      subject: 'We Appreciate Your Feedback',
      body: `
Dear ${feedback.email ? feedback.email.split('@')[0] : 'Valued User'},

Thank you for taking the time to share your feedback with us. We're sorry to hear about your experience and appreciate you bringing this to our attention.

${this.generateSpecificResponse(feedback)}

We take all feedback seriously and will use your comments to improve our service.

Best regards,
The FoodAI Team
      `.trim(),
      type: 'negative',
    });
  }

  createBugTemplate() {
    return (feedback) => ({
      subject: 'We\'re Looking Into This Issue',
      body: `
Dear ${feedback.email ? feedback.email.split('@')[0] : 'Valued User'},

Thank you for reporting this issue. We've logged the problem and our development team is investigating it.

${this.generateSpecificResponse(feedback)}

We'll notify you once we have a resolution.

Best regards,
The FoodAI Team
      `.trim(),
      type: 'bug',
    });
  }

  createFeatureTemplate() {
    return (feedback) => ({
      subject: 'Thanks for Your Feature Suggestion',
      body: `
Dear ${feedback.email ? feedback.email.split('@')[0] : 'Valued User'},

Thank you for your feature suggestion! We love hearing ideas from our users about how we can make our app even better.

${this.generateSpecificResponse(feedback)}

We'll carefully consider your suggestion for future updates.

Best regards,
The FoodAI Team
      `.trim(),
      type: 'feature',
    });
  }

  createGeneralTemplate() {
    return (feedback) => ({
      subject: 'Thank You for Your Feedback',
      body: `
Dear ${feedback.email ? feedback.email.split('@')[0] : 'Valued User'},

Thank you for taking the time to share your feedback with us. We value all input from our users as it helps us improve our service.

${this.generateSpecificResponse(feedback)}

Best regards,
The FoodAI Team
      `.trim(),
      type: 'general',
    });
  }

  generateSpecificResponse(feedback) {
    // Implement custom response generation based on feedback content
    return '';
  }
}

export const responseTemplate = new ResponseTemplateService(); 