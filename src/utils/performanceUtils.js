import { PerformanceObserver, performance } from 'perf_hooks';
import { InteractionManager } from 'react-native';

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = new Set();
    this.setupObserver();
  }

  setupObserver() {
    this.observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        this.metrics.set(entry.name, entry);
        this.notifyObservers(entry);
      });
    });

    this.observer.observe({ entryTypes: ['measure', 'mark'] });
  }

  startMeasure(name) {
    performance.mark(`${name}_start`);
  }

  endMeasure(name) {
    performance.mark(`${name}_end`);
    performance.measure(name, `${name}_start`, `${name}_end`);
  }

  async measureAsync(name, callback) {
    this.startMeasure(name);
    const result = await callback();
    this.endMeasure(name);
    return result;
  }

  measureInteraction(name, callback) {
    return new Promise((resolve) => {
      this.startMeasure(name);
      
      InteractionManager.runAfterInteractions(() => {
        callback();
        this.endMeasure(name);
        resolve();
      });
    });
  }

  getMetric(name) {
    return this.metrics.get(name);
  }

  getAllMetrics() {
    return Array.from(this.metrics.values());
  }

  clearMetrics() {
    this.metrics.clear();
    performance.clearMarks();
    performance.clearMeasures();
  }

  subscribe(callback) {
    this.observers.add(callback);
    return () => this.observers.delete(callback);
  }

  notifyObservers(entry) {
    this.observers.forEach(callback => callback(entry));
  }

  generateReport() {
    const metrics = this.getAllMetrics();
    return {
      summary: {
        totalMeasurements: metrics.length,
        averageDuration: this.calculateAverage(metrics),
        maxDuration: this.calculateMax(metrics),
        minDuration: this.calculateMin(metrics),
      },
      details: metrics.map(metric => ({
        name: metric.name,
        duration: metric.duration,
        startTime: metric.startTime,
        endTime: metric.startTime + metric.duration,
      })),
    };
  }

  calculateAverage(metrics) {
    if (metrics.length === 0) return 0;
    const sum = metrics.reduce((acc, metric) => acc + metric.duration, 0);
    return sum / metrics.length;
  }

  calculateMax(metrics) {
    if (metrics.length === 0) return 0;
    return Math.max(...metrics.map(metric => metric.duration));
  }

  calculateMin(metrics) {
    if (metrics.length === 0) return 0;
    return Math.min(...metrics.map(metric => metric.duration));
  }
}

export default new PerformanceMonitor(); 