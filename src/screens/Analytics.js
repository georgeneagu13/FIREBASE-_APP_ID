import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { automationAnalytics } from '../services/automationAnalyticsService';

const Analytics = () => {
  const [metrics, setMetrics] = useState(null);
  const [timeRange, setTimeRange] = useState('24h');
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      const data = await automationAnalytics.analyzeAutomations();
      setMetrics(data.metrics);
    } catch (error) {
      console.error('Load analytics error:', error);
    }
  };

  const renderPerformanceChart = () => (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Performance Metrics</Text>
      <LineChart
        data={{
          labels: ['1h', '2h', '3h', '4h', '5h', '6h'],
          datasets: [{
            data: metrics?.performance?.map(p => p.value) || [0, 0, 0, 0, 0, 0]
          }]
        }}
        width={screenWidth - 40}
        height={220}
        chartConfig={{
          backgroundColor: COLORS.white,
          backgroundGradientFrom: COLORS.white,
          backgroundGradientTo: COLORS.white,
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(46, 91, 255, ${opacity})`,
          style: {
            borderRadius: 16,
          }
        }}
        style={styles.chart}
      />
    </View>
  );

  const renderSuccessRateChart = () => (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Success Rate</Text>
      <PieChart
        data={[
          {
            name: 'Success',
            population: metrics?.effectiveness?.success || 0,
            color: COLORS.success,
            legendFontColor: COLORS.black,
          },
          {
            name: 'Failed',
            population: metrics?.effectiveness?.failed || 0,
            color: COLORS.error,
            legendFontColor: COLORS.black,
          }
        ]}
        width={screenWidth - 40}
        height={220}
        chartConfig={{
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        style={styles.chart}
      />
    </View>
  );

  const renderAutomationTypeChart = () => (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Automation Types</Text>
      <BarChart
        data={{
          labels: ['Rules', 'Schedules', 'Triggers', 'Custom'],
          datasets: [{
            data: metrics?.types?.map(t => t.count) || [0, 0, 0, 0]
          }]
        }}
        width={screenWidth - 40}
        height={220}
        chartConfig={{
          backgroundColor: COLORS.white,
          backgroundGradientFrom: COLORS.white,
          backgroundGradientTo: COLORS.white,
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(46, 91, 255, ${opacity})`,
          style: {
            borderRadius: 16,
          }
        }}
        style={styles.chart}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analytics</Text>
        <Text style={styles.headerSubtitle}>Automation Performance Insights</Text>
      </View>

      <ScrollView style={styles.content}>
        {metrics ? (
          <>
            {renderPerformanceChart()}
            {renderSuccessRateChart()}
            {renderAutomationTypeChart()}
          </>
        ) : (
          <View style={styles.loading}>
            <Text>Loading analytics...</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SIZES.padding,
    backgroundColor: COLORS.primary,
  },
  headerTitle: {
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: SIZES.font,
    color: COLORS.white,
    opacity: 0.8,
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: SIZES.padding,
  },
  chartContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.padding,
    ...SHADOWS.medium,
  },
  chartTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    marginBottom: SIZES.base,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Analytics; 