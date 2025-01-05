import { enhancedAnalytics } from './enhancedAnalytics';
import { userEngagement } from './userEngagementService';
import { insights } from './insightsService';

class RealTimeEngagementService {
  constructor() {
    this.currentSession = null;
    this.listeners = new Set();
    this.metrics = {
      activeUsers: 0,
      currentScreens: new Map(),
      recentEvents: [],
      interactions: new Map(),
    };
    this.updateInterval = 5000; // 5 seconds
    this.maxEvents = 100;
  }

  startTracking() {
    this.currentSession = {
      id: Date.now().toString(),
      startTime: Date.now(),
      events: [],
    };

    // Start periodic updates
    this.updateInterval = setInterval(() => {
      this.processUpdates();
    }, this.updateInterval);

    // Track session start
    this.trackEvent('session_start');
  }

  stopTracking() {
    if (this.currentSession) {
      this.trackEvent('session_end');
      clearInterval(this.updateInterval);
      this.currentSession = null;
    }
  }

  addListener(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async trackEvent(eventType, data = {}) {
    if (!this.currentSession) return;

    const event = {
      type: eventType,
      timestamp: Date.now(),
      sessionId: this.currentSession.id,
      data,
    };

    // Add to current session
    this.currentSession.events.push(event);

    // Add to recent events
    this.metrics.recentEvents.unshift(event);
    if (this.metrics.recentEvents.length > this.maxEvents) {
      this.metrics.recentEvents.pop();
    }

    // Update metrics
    this.updateMetrics(event);

    // Notify listeners
    this.notifyListeners();

    // Log to analytics
    await enhancedAnalytics.logEvent(`realtime_${eventType}`, {
      ...data,
      sessionId: this.currentSession.id,
    });
  }

  updateMetrics(event) {
    switch (event.type) {
      case 'screen_view':
        this.metrics.currentScreens.set(event.data.userId, event.data.screen);
        break;
      case 'interaction':
        const count = this.metrics.interactions.get(event.data.type) || 0;
        this.metrics.interactions.set(event.data.type, count + 1);
        break;
      case 'session_start':
        this.metrics.activeUsers++;
        break;
      case 'session_end':
        this.metrics.activeUsers = Math.max(0, this.metrics.activeUsers - 1);
        break;
    }
  }

  async processUpdates() {
    try {
      // Generate real-time insights
      const newInsights = await insights.generateInsights();
      
      // Update engagement metrics
      const metrics = await userEngagement.getEngagementMetrics();
      
      // Combine with real-time data
      const combinedMetrics = {
        ...metrics,
        realTime: {
          activeUsers: this.metrics.activeUsers,
          currentScreens: Array.from(this.metrics.currentScreens.values()),
          recentEvents: this.metrics.recentEvents,
          interactions: Object.fromEntries(this.metrics.interactions),
        },
      };

      // Notify listeners
      this.notifyListeners(combinedMetrics, newInsights);
    } catch (error) {
      console.error('Process updates error:', error);
    }
  }

  notifyListeners(metrics = null, insights = null) {
    this.listeners.forEach(listener => {
      try {
        listener({
          metrics: metrics || this.metrics,
          insights,
          timestamp: Date.now(),
        });
      } catch (error) {
        console.error('Listener notification error:', error);
      }
    });
  }

  getCurrentMetrics() {
    return { ...this.metrics };
  }

  getSessionData() {
    return this.currentSession ? { ...this.currentSession } : null;
  }
}

export const realTimeEngagement = new RealTimeEngagementService(); 