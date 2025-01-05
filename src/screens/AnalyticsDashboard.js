import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import analyticsService from '../services/analyticsService';
import performanceService from '../services/performanceService';
import { useTheme } from '../context/ThemeContext';
import { SIZES, SHADOWS } from '../constants/theme';

const AnalyticsDashboard = () => {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    performance: null,
    userEngagement: null,
    errors: null,
  });
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    loadMetrics();
  }, [timeRange]);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const [performance, userEngagement, errors] = await Promise.all([
        performanceService.getMetricsSummary(),
        analyticsService.getUserEngagementMetrics(timeRange),
        errorTrackingService.getErrorMetrics(timeRange),
      ]);

      setMetrics({ performance, userEngagement, errors });
    } catch (error) {
      console.error('Failed to load metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Analytics Dashboard
        </Text>
        <TimeRangeSelector
          selected={timeRange}
          onSelect={setTimeRange}
          colors={colors}
        />
      </View>

      <MetricCard
        title="Performance"
        data={metrics.performance}
        colors={colors}
        renderChart={() => (
          <PerformanceChart
            data={metrics.performance}
            colors={colors}
          />
        )}
      />

      <MetricCard
        title="User Engagement"
        data={metrics.userEngagement}
        colors={colors}
        renderChart={() => (
          <EngagementChart
            data={metrics.userEngagement}
            colors={colors}
          />
        )}
      />

      <MetricCard
        title="Error Tracking"
        data={metrics.errors}
        colors={colors}
        renderChart={() => (
          <ErrorChart
            data={metrics.errors}
            colors={colors}
          />
        )}
      />
    </ScrollView>
  );
};

const MetricCard = ({ title, data, colors, renderChart }) => (
  <View style={[styles.card, { backgroundColor: colors.card }]}>
    <Text style={[styles.cardTitle, { color: colors.text }]}>
      {title}
    </Text>
    {renderChart()}
    <MetricSummary data={data} colors={colors} />
  </View>
);

const TimeRangeSelector = ({ selected, onSelect, colors }) => {
  const ranges = [
    { label: '24h', value: '24h' },
    { label: '7d', value: '7d' },
    { label: '30d', value: '30d' },
  ];

  return (
    <View style={styles.timeRangeContainer}>
      {ranges.map(range => (
        <TouchableOpacity
          key={range.value}
          style={[
            styles.timeRangeButton,
            {
              backgroundColor: selected === range.value
                ? colors.primary
                : colors.card,
            },
          ]}
          onPress={() => onSelect(range.value)}
        >
          <Text
            style={[
              styles.timeRangeText,
              {
                color: selected === range.value
                  ? colors.card
                  : colors.text,
              },
            ]}
          >
            {range.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: SIZES.padding,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
  },
  card: {
    margin: SIZES.padding,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    ...SHADOWS.medium,
  },
  cardTitle: {
    fontSize: SIZES.font,
    fontWeight: '600',
    marginBottom: SIZES.padding,
  },
  timeRangeContainer: {
    flexDirection: 'row',
  },
  timeRangeButton: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
    borderRadius: SIZES.radius,
    marginLeft: SIZES.base,
  },
  timeRangeText: {
    fontSize: SIZES.font,
    fontWeight: '500',
  },
});

export default AnalyticsDashboard; 