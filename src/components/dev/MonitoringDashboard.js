import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { COLORS, SIZES } from '../../constants/theme';
import { enhancedAnalytics } from '../../services/enhancedAnalyticsService';
import { crashReporting } from '../../services/crashReportingService';
import { performanceService } from '../../services/performanceService';

const MonitoringDashboard = () => {
  const [metrics, setMetrics] = useState({
    crashes: [],
    performance: [],
    userSessions: [],
    errors: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');

  useEffect(() => {
    loadMetrics();
  }, [selectedTimeRange]);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const [crashes, performance, sessions, errors] = await Promise.all([
        crashReporting.getRecentCrashes(selectedTimeRange),
        performanceService.getMetrics(selectedTimeRange),
        enhancedAnalytics.getUserSessions(selectedTimeRange),
        crashReporting.getErrors(selectedTimeRange),
      ]);

      setMetrics({
        crashes,
        performance,
        userSessions: sessions,
        errors,
      });
    } catch (error) {
      console.error('Failed to load metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderPerformanceChart = () => (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Performance Metrics</Text>
      <LineChart
        data={{
          labels: metrics.performance.map(p => p.timestamp),
          datasets: [{
            data: metrics.performance.map(p => p.value)
          }]
        }}
        width={SIZES.width - 40}
        height={220}
        chartConfig={{
          backgroundColor: COLORS.primary,
          backgroundGradientFrom: COLORS.primary,
          backgroundGradientTo: COLORS.secondary,
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        }}
        bezier
        style={styles.chart}
      />
    </View>
  );

  const renderCrashesChart = () => (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Crash Distribution</Text>
      <BarChart
        data={{
          labels: metrics.crashes.map(c => c.type),
          datasets: [{
            data: metrics.crashes.map(c => c.count)
          }]
        }}
        width={SIZES.width - 40}
        height={220}
        chartConfig={{
          backgroundColor: COLORS.error,
          backgroundGradientFrom: COLORS.error,
          backgroundGradientTo: COLORS.primary,
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        }}
        style={styles.chart}
      />
    </View>
  );

  const renderTimeRangeSelector = () => (
    <View style={styles.timeRangeContainer}>
      {['1h', '24h', '7d', '30d'].map(range => (
        <TouchableOpacity
          key={range}
          style={[
            styles.timeRangeButton,
            selectedTimeRange === range && styles.timeRangeButtonSelected
          ]}
          onPress={() => setSelectedTimeRange(range)}
        >
          <Text style={[
            styles.timeRangeText,
            selectedTimeRange === range && styles.timeRangeTextSelected
          ]}>
            {range}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={loadMetrics}
        />
      }
    >
      {renderTimeRangeSelector()}
      {renderPerformanceChart()}
      {renderCrashesChart()}
      
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Summary</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {metrics.crashes.reduce((acc, c) => acc + c.count, 0)}
            </Text>
            <Text style={styles.statLabel}>Total Crashes</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {metrics.userSessions.length}
            </Text>
            <Text style={styles.statLabel}>Active Sessions</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {metrics.errors.length}
            </Text>
            <Text style={styles.statLabel}>Errors</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: SIZES.medium,
    backgroundColor: COLORS.lightGray,
  },
  timeRangeButton: {
    padding: SIZES.small,
    borderRadius: 8,
  },
  timeRangeButtonSelected: {
    backgroundColor: COLORS.primary,
  },
  timeRangeText: {
    color: COLORS.gray,
    fontSize: SIZES.font,
  },
  timeRangeTextSelected: {
    color: COLORS.white,
  },
  chartContainer: {
    padding: SIZES.medium,
    marginBottom: SIZES.medium,
  },
  chartTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    marginBottom: SIZES.small,
  },
  chart: {
    borderRadius: 16,
    marginVertical: SIZES.small,
  },
  statsContainer: {
    padding: SIZES.medium,
  },
  statsTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    marginBottom: SIZES.medium,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: SIZES.font,
    color: COLORS.gray,
    marginTop: SIZES.small,
  },
});

export default MonitoringDashboard; 