import { enhancedAnalytics } from './enhancedAnalyticsService';
import { alertTrends } from './alertTrendService';

class AlertPatternDetectionService {
  constructor() {
    this.patterns = new Map();
    this.sequences = new Map();
    this.correlations = new Map();
    this.config = {
      minPatternLength: 2,
      maxPatternLength: 10,
      minSupport: 0.1,
      minConfidence: 0.5,
      timeWindow: 3600000, // 1 hour
      maxTimeGap: 300000, // 5 minutes
    };
  }

  async detectPatterns(alerts) {
    try {
      // Clear previous patterns
      this.patterns.clear();
      this.sequences.clear();
      this.correlations.clear();

      // Find frequent patterns
      const frequentPatterns = this.findFrequentPatterns(alerts);
      
      // Detect sequential patterns
      const sequentialPatterns = this.detectSequentialPatterns(alerts);
      
      // Analyze correlations
      const correlations = this.analyzeCorrelations(alerts);

      // Store results
      this.patterns = new Map(frequentPatterns);
      this.sequences = new Map(sequentialPatterns);
      this.correlations = new Map(correlations);

      // Log pattern detection
      await this.logPatternDetection({
        patternCount: frequentPatterns.length,
        sequenceCount: sequentialPatterns.length,
        correlationCount: correlations.length,
      });

      return {
        patterns: Array.from(this.patterns.entries()),
        sequences: Array.from(this.sequences.entries()),
        correlations: Array.from(this.correlations.entries()),
      };

    } catch (error) {
      console.error('Detect patterns error:', error);
      return null;
    }
  }

  findFrequentPatterns(alerts) {
    const patterns = new Map();
    const alertCount = alerts.length;

    // Group alerts by type
    const typeGroups = new Map();
    alerts.forEach(alert => {
      const group = typeGroups.get(alert.type) || [];
      group.push(alert);
      typeGroups.set(alert.type, group);
    });

    // Find patterns within each type
    typeGroups.forEach((groupAlerts, type) => {
      for (let length = this.config.minPatternLength; 
           length <= this.config.maxPatternLength; 
           length++) {
        const windowPatterns = this.findWindowPatterns(groupAlerts, length);
        windowPatterns.forEach((support, pattern) => {
          if (support / alertCount >= this.config.minSupport) {
            patterns.set(pattern, {
              type,
              length,
              support,
              confidence: support / alertCount,
              occurrences: Math.floor(support),
            });
          }
        });
      }
    });

    return Array.from(patterns.entries());
  }

  findWindowPatterns(alerts, length) {
    const patterns = new Map();
    const sortedAlerts = [...alerts].sort((a, b) => a.timestamp - b.timestamp);

    for (let i = 0; i <= sortedAlerts.length - length; i++) {
      const window = sortedAlerts.slice(i, i + length);
      if (this.isValidTimeWindow(window)) {
        const pattern = this.createPattern(window);
        patterns.set(pattern, (patterns.get(pattern) || 0) + 1);
      }
    }

    return patterns;
  }

  detectSequentialPatterns(alerts) {
    const sequences = new Map();
    const sortedAlerts = [...alerts].sort((a, b) => a.timestamp - b.timestamp);

    for (let i = 0; i < sortedAlerts.length - 1; i++) {
      const current = sortedAlerts[i];
      const next = sortedAlerts[i + 1];

      if (next.timestamp - current.timestamp <= this.config.maxTimeGap) {
        const sequence = `${current.type}->${next.type}`;
        const data = sequences.get(sequence) || {
          count: 0,
          intervals: [],
          confidence: 0,
        };

        data.count++;
        data.intervals.push(next.timestamp - current.timestamp);
        data.confidence = data.count / alerts.length;

        sequences.set(sequence, data);
      }
    }

    return Array.from(sequences.entries())
      .filter(([_, data]) => data.confidence >= this.config.minConfidence);
  }

  analyzeCorrelations(alerts) {
    const correlations = new Map();
    const typeGroups = new Map();

    // Group alerts by time windows
    alerts.forEach(alert => {
      const windowStart = Math.floor(alert.timestamp / this.config.timeWindow);
      const window = typeGroups.get(windowStart) || new Set();
      window.add(alert.type);
      typeGroups.set(windowStart, window);
    });

    // Find correlations between alert types
    const windows = Array.from(typeGroups.values());
    const types = new Set(alerts.map(a => a.type));

    types.forEach(type1 => {
      types.forEach(type2 => {
        if (type1 !== type2) {
          const pair = [type1, type2].sort().join(',');
          if (!correlations.has(pair)) {
            const cooccurrences = windows.filter(
              window => window.has(type1) && window.has(type2)
            ).length;

            const correlation = cooccurrences / windows.length;
            if (correlation >= this.config.minConfidence) {
              correlations.set(pair, {
                types: [type1, type2],
                cooccurrences,
                correlation,
                windows: windows.length,
              });
            }
          }
        }
      });
    });

    return Array.from(correlations.entries());
  }

  isValidTimeWindow(alerts) {
    if (alerts.length < 2) return true;
    return alerts[alerts.length - 1].timestamp - alerts[0].timestamp <= this.config.timeWindow;
  }

  createPattern(alerts) {
    return alerts
      .map(a => `${a.type}:${a.priority}`)
      .join(',');
  }

  async logPatternDetection(stats) {
    try {
      await enhancedAnalytics.logEvent('patterns_detected', {
        ...stats,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Log pattern detection error:', error);
    }
  }

  getPatterns() {
    return Array.from(this.patterns.entries());
  }

  getSequences() {
    return Array.from(this.sequences.entries());
  }

  getCorrelations() {
    return Array.from(this.correlations.entries());
  }

  updateConfig(updates) {
    this.config = {
      ...this.config,
      ...updates,
    };
  }
}

export const alertPatternDetection = new AlertPatternDetectionService(); 