import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { COLORS, SIZES } from '../../constants/theme';
import { userEngagement } from '../../services/userEngagementService';
import { enhancedAnalytics } from '../../services/enhancedAnalyticsService';

const EngagementDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week'); // week, month, year
  const [selectedMetric, setSelectedMetric] = useState('sessions');

  useEffect(() => {
    loadMetrics();
  }, [timeRange]);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const data = await userEngagement.getEngagementMetrics();
      setMetrics(data);
      
      await enhancedAnalytics.logEvent('engagement_dashboard_viewed', {
        timeRange,
        selectedMetric,
      });
    } catch (error) {
      console.error('Failed to load metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderTimeRangeSelector = () => (
    <View style={styles.timeRangeContainer}>
      {['week', 'month', 'year'].map((range) => (
        <TouchableOpacity
          key={range}
          style={[
            styles.timeRangeButton,
            timeRange === range && styles.timeRangeButtonSelected,
          ]}
          onPress={() => setTimeRange(range)}
        >
          <Text
            style={[
              styles.timeRangeText,
              timeRange === range && styles.timeRangeTextSelected,
            ]}
          >
            {range.charAt(0).toUpperCase() + range.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderSessionsChart = () => {
    if (!metrics?.totalSessions) return null;

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Session Activity</Text>
        <LineChart
          data={{
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
              data: Object.values(metrics.sessionData || [0, 0, 0, 0, 0, 0, 0]),
            }],
          }}
          width={Dimensions.get('window').width - 40}
          height={220}
          chartConfig={{
            backgroundColor: COLORS.primary,
            backgroundGradientFrom: COLORS.primary,
            backgroundGradientTo: COLORS.secondary,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          }}
          bezier
          style={styles.chart}
        />
      </View>
    );
  };

  const renderFeatureUsageChart = () => {
    if (!metrics?.mostUsedFeatures) return null;

    const data = metrics.mostUsedFeatures.map(([feature, count]) => ({
      name: feature,
      population: count,
      color: COLORS.primary,
      legendFontColor: COLORS.gray,
    }));

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Feature Usage</Text>
        <PieChart
          data={data}
          width={Dimensions.get('window').width - 40}
          height={220}
          chartConfig={{
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
        />
      </View>
    );
  };

  const renderScreenEngagement = () => {
    if (!metrics?.screenEngagement) return null;

    const data = Object.entries(metrics.screenEngagement)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Screen Time Distribution</Text>
        <BarChart
          data={{
            labels: data.map(([screen]) => screen.split(' ')[0]),
            datasets: [{
              data: data.map(([, time]) => time / 60000), // Convert to minutes
            }],
          }}
          width={Dimensions.get('window').width - 40}
          height={220}
          chartConfig={{
            backgroundColor: COLORS.primary,
            backgroundGradientFrom: COLORS.primary,
            backgroundGradientTo: COLORS.secondary,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          }}
          style={styles.chart}
        />
      </View>
    );
  };

  const renderMetricCards = () => (
    <View style={styles.metricsContainer}>
      <View style={styles.metricCard}>
        <Text style={styles.metricValue}>
          {metrics?.totalSessions || 0}
        </Text>
        <Text style={styles.metricLabel}>Total Sessions</Text>
      </View>
      <View style={styles.metricCard}>
        <Text style={styles.metricValue}>
          {Math.round((metrics?.averageSessionDuration || 0) / 60000)}m
        </Text>
        <Text style={styles.metricLabel}>Avg. Session</Text>
      </View>
      <View style={styles.metricCard}>
        <Text style={styles.metricValue}>
          {Object.keys(metrics?.interactionRates || {}).length}
        </Text>
        <Text style={styles.metricLabel}>Interactions</Text>
      </View>
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
      {renderMetricCards()}
      {renderSessionsChart()}
      {renderFeatureUsageChart()}
      {renderScreenEngagement()}
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
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: SIZES.medium,
  },
  metricCard: {
    backgroundColor: COLORS.lightGray,
    padding: SIZES.medium,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: SIZES.small,
  },
  metricValue: {
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  metricLabel: {
    fontSize: SIZES.font,
    color: COLORS.gray,
    marginTop: SIZES.small,
  },
});

export default EngagementDashboard; 