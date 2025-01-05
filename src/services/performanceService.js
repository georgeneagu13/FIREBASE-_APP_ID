import analytics from '@react-native-firebase/analytics';
import perf from '@react-native-firebase/perf';
import { Platform } from 'react-native';
import performanceUtils from '../utils/performanceUtils';

class PerformanceService {
  constructor() {
    this.traces = new Map();
    this.metrics = new Map();
    this.isEnabled = !__DEV__;
  }

  async initialize() {
    if (!this.isEnabled) return;

    try {
      await perf().setPerformanceCollectionEnabled(true);
      this.setupMetricsCollection();
    } catch (error) {
      console.error('Failed to initialize performance monitoring:', error);
    }
  }

  async startTrace(traceName) {
    if (!this.isEnabled) return null;

    try {
      const trace = await perf().startTrace(traceName);
      this.traces.set(traceName, trace);
      return trace;
    } catch (error) {
      console.error(`Failed to start trace ${traceName}:`, error);
      return null;
    }
  }

  async stopTrace(traceName, metrics = {}) {
    if (!this.isEnabled) return;

    try {
      const trace = this.traces.get(traceName);
      if (!trace) return;

      Object.entries(metrics).forEach(([key, value]) => {
        trace.putMetric(key, value);
      });

      await trace.stop();
      this.traces.delete(traceName);

      // Log to analytics
      await this.logPerformanceMetrics(traceName, metrics);
    } catch (error) {
      console.error(`Failed to stop trace ${traceName}:`, error);
    }
  }

  async measureScreenLoad(screenName) {
    const trace = await this.startTrace(`screen_load_${screenName}`);
    
    return {
      stop: async (additionalMetrics = {}) => {
        const metrics = {
          ...additionalMetrics,
          timestamp: Date.now(),
          platform: Platform.OS,
        };
        await this.stopTrace(`screen_load_${screenName}`, metrics);
      },
    };
  }

  async measureNetworkRequest(url, method) {
    if (!this.isEnabled) return null;

    try {
      const metric = await perf().newHttpMetric(url, method);
      await metric.start();
      return metric;
    } catch (error) {
      console.error('Failed to create network metric:', error);
      return null;
    }
  }

  setupMetricsCollection() {
    // Monitor JS frame rate
    performanceUtils.subscribe((entry) => {
      if (entry.name.startsWith('frame_')) {
        this.recordFrameMetric(entry);
      }
    });

    // Monitor memory usage
    setInterval(async () => {
      if (Platform.OS === 'android') {
        const memory = await perf().getMemoryUsage();
        this.recordMemoryMetric(memory);
      }
    }, 60000); // Every minute
  }

  async recordFrameMetric(entry) {
    if (!this.isEnabled) return;

    try {
      const metric = {
        frame_time: entry.duration,
        timestamp: Date.now(),
      };

      await analytics().logEvent('frame_metric', metric);
    } catch (error) {
      console.error('Failed to record frame metric:', error);
    }
  }

  async recordMemoryMetric(memory) {
    if (!this.isEnabled) return;

    try {
      const metric = {
        memory_usage: memory,
        timestamp: Date.now(),
      };

      await analytics().logEvent('memory_metric', metric);
    } catch (error) {
      console.error('Failed to record memory metric:', error);
    }
  }

  async logPerformanceMetrics(name, metrics) {
    if (!this.isEnabled) return;

    try {
      await analytics().logEvent('performance_metric', {
        name,
        ...metrics,
        timestamp: Date.now(),
        platform: Platform.OS,
      });
    } catch (error) {
      console.error('Failed to log performance metrics:', error);
    }
  }

  getMetricsSummary() {
    const metrics = Array.from(this.metrics.values());
    return {
      averageFrameTime: this.calculateAverage(metrics, 'frame_time'),
      averageMemoryUsage: this.calculateAverage(metrics, 'memory_usage'),
      totalTraces: this.traces.size,
      metrics: metrics.slice(-100), // Last 100 metrics
    };
  }

  calculateAverage(metrics, key) {
    const values = metrics
      .filter(m => m[key])
      .map(m => m[key]);
    
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }
}

export default new PerformanceService(); 