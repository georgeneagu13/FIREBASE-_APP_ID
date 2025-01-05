import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import performanceService from '../../services/performanceService';
import { useTheme } from '../../context/ThemeContext';
import { SIZES } from '../../constants/theme';

const PerformanceMonitor = ({ visible = __DEV__ }) => {
  const { colors } = useTheme();
  const [metrics, setMetrics] = useState({
    fps: 0,
    memory: 0,
    networkRequests: 0,
  });

  useEffect(() => {
    if (!visible) return;

    const interval = setInterval(async () => {
      const summary = performanceService.getMetricsSummary();
      setMetrics({
        fps: Math.round(1000 / summary.averageFrameTime),
        memory: Math.round(summary.averageMemoryUsage / 1024 / 1024),
        networkRequests: summary.totalTraces,
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <Text style={[styles.text, { color: colors.text }]}>
        FPS: {metrics.fps}
      </Text>
      <Text style={[styles.text, { color: colors.text }]}>
        Memory: {metrics.memory}MB
      </Text>
      <Text style={[styles.text, { color: colors.text }]}>
        Network: {metrics.networkRequests}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: SIZES.base,
    borderBottomLeftRadius: SIZES.radius,
    opacity: 0.8,
  },
  text: {
    fontSize: SIZES.small,
  },
});

export default PerformanceMonitor; 