import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {
  LineChart,
  BarChart,
  PieChart,
  ContributionGraph,
} from 'react-native-chart-kit';
import { COLORS, SIZES } from '../../constants/theme';
import { alertAnalytics } from '../../services/alertAnalyticsService';
import { alertTrends } from '../../services/alertTrendService';

const AlertAnalyticsDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [trends, setTrends] = useState(null);
  const [timeRange, setTimeRange] = useState('week');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 300000); // 5 minutes
    return () => clearInterval(interval);
  }, [timeRange]);

  const loadData = async () => {
    setLoading(true);
    try {
      const newMetrics = alertAnalytics.getMetrics();
      const newTrends = await alertTrends.getTrends(timeRange);
      setMetrics(newMetrics);
      setTrends(newTrends);
    } catch (error) {
      console.error('Load data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderTimeRangeSelector = () => (
    <View style={styles.timeRangeContainer}>
      {['day', 'week', 'month', 'year'].map((range) => (
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

  const renderAlertDistribution = () => {
    if (!metrics?.alertsByType) return null;

    const data = Object.entries(metrics.alertsByType).map(([name, value], index) => ({
      name,
      population: value,
      color: COLORS.chartColors[index % COLORS.chartColors.length],
      legendFontColor: COLORS.text,
    }));

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Alert Distribution</Text>
        <PieChart
          data={data}
          width={Dimensions.get('window').width - 40}
          height={220}
          chartConfig={{
            color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
        />
      </View>
    );
  };

  const renderTrendAnalysis = () => {
    if (!trends?.daily) return null;

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Alert Trends</Text>
        <LineChart
          data={{
            labels: trends.daily.labels,
            datasets: [
              {
                data: trends.daily.values,
              },
            ],
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

  const renderResponseEffectiveness = () => {
    if (!metrics?.responseEffectiveness) return null;

    const data = Object.entries(metrics.responseEffectiveness).map(([type, stats]) => ({
      name: type,
      effectiveness: (stats.successful / stats.total) * 100,
    }));

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Response Effectiveness</Text>
        <BarChart
          data={{
            labels: data.map(d => d.name),
            datasets: [{
              data: data.map(d => d.effectiveness),
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
          {metrics?.totalAlerts || 0}
        </Text>
        <Text style={styles.metricLabel}>Total Alerts</Text>
      </View>
      <View style={styles.metricCard}>
        <Text style={styles.metricValue}>
          {Math.round((metrics?.overallEffectiveness || 0) * 100)}%
        </Text>
        <Text style={styles.metricLabel}>Effectiveness</Text>
      </View>
      <View style={styles.metricCard}>
        <Text style={styles.metricValue}>
          {Math.round((metrics?.averageTimeToResolve || 0) / 1000)}s
        </Text>
        <Text style={styles.metricLabel}>Avg. Resolution</Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {renderTimeRangeSelector()}
      {renderMetricCards()}
      {renderAlertDistribution()}
      {renderTrendAnalysis()}
      {renderResponseEffectiveness()}
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

export default AlertAnalyticsDashboard; 