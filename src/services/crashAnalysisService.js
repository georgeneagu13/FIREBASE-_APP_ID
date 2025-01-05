import { crashReporting } from './crashReportingService';
import { enhancedAnalytics } from './enhancedAnalyticsService';

class CrashAnalysisService {
  constructor() {
    this.patterns = new Map();
    this.threshold = 3; // Number of similar crashes to trigger pattern detection
  }

  async analyzeCrash(error, context) {
    try {
      // Generate crash signature
      const signature = this.generateCrashSignature(error);
      
      // Update pattern tracking
      this.updatePatterns(signature, error, context);
      
      // Check for patterns
      await this.checkPatterns(signature);
      
      // Analyze crash context
      const analysis = await this.analyzeContext(error, context);
      
      // Log analysis results
      await this.logAnalysis(analysis);
      
      return analysis;
    } catch (err) {
      console.error('Crash analysis failed:', err);
      return null;
    }
  }

  generateCrashSignature(error) {
    // Create a unique signature based on error properties
    const signature = `${error.name}:${error.message}:${
      error.stack?.split('\n')[1] || ''
    }`;
    return signature;
  }

  updatePatterns(signature, error, context) {
    if (!this.patterns.has(signature)) {
      this.patterns.set(signature, {
        count: 0,
        firstSeen: Date.now(),
        lastSeen: Date.now(),
        contexts: [],
      });
    }

    const pattern = this.patterns.get(signature);
    pattern.count++;
    pattern.lastSeen = Date.now();
    pattern.contexts.push(context);

    // Keep only last 10 contexts
    if (pattern.contexts.length > 10) {
      pattern.contexts.shift();
    }
  }

  async checkPatterns(signature) {
    const pattern = this.patterns.get(signature);
    
    if (pattern && pattern.count >= this.threshold) {
      // Pattern detected
      await this.handlePatternDetection(pattern, signature);
    }
  }

  async handlePatternDetection(pattern, signature) {
    // Log pattern detection
    await enhancedAnalytics.logEvent('crash_pattern_detected', {
      signature,
      count: pattern.count,
      timespan: pattern.lastSeen - pattern.firstSeen,
      contexts: pattern.contexts,
    });

    // You could implement additional actions here:
    // - Send notifications to developers
    // - Create automatic issue tickets
    // - Trigger automatic error reporting
  }

  async analyzeContext(error, context) {
    const analysis = {
      severity: this.calculateSeverity(error, context),
      category: this.categorizeError(error),
      impact: this.assessImpact(context),
      recommendation: this.generateRecommendation(error),
      timestamp: Date.now(),
    };

    return analysis;
  }

  calculateSeverity(error, context) {
    let severity = 'low';
    
    if (context.fatal) {
      severity = 'critical';
    } else if (error.message.includes('memory')) {
      severity = 'high';
    } else if (context.userImpact) {
      severity = 'medium';
    }

    return severity;
  }

  categorizeError(error) {
    if (error.name.includes('Network')) {
      return 'network';
    } else if (error.name.includes('Syntax')) {
      return 'syntax';
    } else if (error.message.includes('memory')) {
      return 'memory';
    }
    return 'unknown';
  }

  assessImpact(context) {
    return {
      userCount: context.userCount || 1,
      screenName: context.screenName,
      isBlocking: context.fatal || false,
      timestamp: Date.now(),
    };
  }

  generateRecommendation(error) {
    // Add your error-specific recommendations here
    const recommendations = {
      network: 'Check network connectivity and API endpoints',
      syntax: 'Review recent code changes and validate input data',
      memory: 'Investigate memory usage and implement cleanup',
      unknown: 'Monitor for pattern and gather more context',
    };

    return recommendations[this.categorizeError(error)] || recommendations.unknown;
  }

  async logAnalysis(analysis) {
    await enhancedAnalytics.logEvent('crash_analysis', analysis);
  }
}

export const crashAnalysis = new CrashAnalysisService(); 