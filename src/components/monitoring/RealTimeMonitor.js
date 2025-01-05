import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { COLORS, SIZES } from '../../constants/theme';
import { feedbackAnalytics } from '../../services/feedbackAnalyticsService';
import { enhancedAnalytics } from '../../services/enhancedAnalyticsService';

const RealTimeMonitor = () => {
  const [metrics, setMetrics] = useState({
    sentiment: {
      positive: 0,
      neutral: 0,
      negative: 0,
    },
    categories: {},
    ratings: {
      labels: ['1', '2', '3', '4', '5'],
      data: [0, 0, 0, 0, 0],
    },
    recentFeedback: [],
  });

  const [loading, setLoading] = useState(true);
  const [updateInterval, setUpdateInterval] = useState(30000); // 30 seconds

  useEffect(() => {
    loadInitialData();
    const interval = setInterval(updateMetrics, updateInterval);
    return () => clearInterval(interval);
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const data = await feedbackAnalytics.analyzeTrends();
      setMetrics(data);
      
      // Log monitoring session
      await enhancedAnalytics.logEvent('realtime_monitoring_started', {
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Failed to load initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateMetrics = async () => {
    try {
      const data = await feedbackAnalytics.analyzeTrends();
      setMetrics(prevMetrics => ({
        ...prevMetrics,
        ...data,
      }));
    } catch (error) {
      console.error('Failed to update metrics:', error);
    }
  };

  const renderSentimentChart = () => {
    const data = [
      {
        name: 'Positive',
        population: metrics.sentiment.positive,
        color: COLORS.success,
        legendFontColor: COLORS.gray,
      },
      {
        name: 'Neutral',
        population: metrics.sentiment.neutral,
        color: COLORS.warning,
        legendFontColor: COLORS.gray,
      },
      {
        name: 'Negative',
        population: metrics.sentiment.negative,
        color: COLORS.error,
        legendFontColor: COLORS.gray,
      },
    ];

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Sentiment Distribution</Text>
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

  const renderRatingsChart = () => (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Rating Distribution</Text>
      <LineChart
        data={{
          labels: metrics.ratings.labels,
          datasets: [{
            data: metrics.ratings.data,
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

  const renderRecentFeedback = () => (
    <View style={styles.recentContainer}>
      <Text style={styles.sectionTitle}>Recent Feedback</Text>
      {metrics.recentFeedback.map((feedback, index) => (
        <View key={index} style={styles.feedbackItem}>
          <Text style={styles.feedbackRating}>★ {feedback.rating}</Text>
          <Text style={styles.feedbackText}>{feedback.feedback}</Text>
          <Text style={styles.feedbackTime}>
            {new Date(feedback.timestamp).toLocaleTimeString()}
          </Text>
        </View>
      ))}
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={loadInitialData}
        />
      }
    >
      {renderSentimentChart()}
      {renderRatingsChart()}
      {renderRecentFeedback()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
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
  recentContainer: {
    padding: SIZES.medium,
  },
  sectionTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    marginBottom: SIZES.medium,
  },
  feedbackItem: {
    backgroundColor: COLORS.lightGray,
    padding: SIZES.medium,
    borderRadius: 8,
    marginBottom: SIZES.small,
  },
  feedbackRating: {
    fontSize: SIZES.font,
    color: COLORS.primary,
    marginBottom: SIZES.small,
  },
  feedbackText: {
    fontSize: SIZES.font,
    marginBottom: SIZES.small,
  },
  feedbackTime: {
    fontSize: SIZES.small,
    color: COLORS.gray,
  },
});

export default RealTimeMonitor; 