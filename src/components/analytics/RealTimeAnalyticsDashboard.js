import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { COLORS, SIZES } from '../../constants/theme';
import { realTimeEngagement } from '../../services/realTimeEngagementService';
import { engagementNotifications } from '../../services/engagementNotificationService';
import { enhancedAnalytics } from '../../services/enhancedAnalyticsService';

const RealTimeAnalyticsDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [selectedMetric, setSelectedMetric] = useState('users');
  const [alertAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    const metricsUnsubscribe = realTimeEngagement.addListener(
      ({ metrics: newMetrics }) => {
        setMetrics(newMetrics);
      }
    );

    const notificationsUnsubscribe = engagementNotifications.subscribe(
      (newNotifications) => {
        setNotifications(newNotifications);
        if (newNotifications.length > 0) {
          animateAlert();
        }
      }
    );

    // Log dashboard view
    enhancedAnalytics.logEvent('realtime_dashboard_viewed');

    return () => {
      metricsUnsubscribe();
      notificationsUnsubscribe();
    };
  }, []);

  const animateAlert = useCallback(() => {
    Animated.sequence([
      Animated.timing(alertAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(alertAnimation, {
        toValue: 0,
        duration: 300,
        delay: 2000,
        useNativeDriver: true,
      }),
    ]).start();
  }, [alertAnimation]);

  const renderActiveUsers = () => (
    <View style={styles.metricCard}>
      <Text style={styles.metricTitle}>Active Users</Text>
      <Text style={styles.metricValue}>
        {metrics?.realTime?.activeUsers || 0}
      </Text>
      <LineChart
        data={{
          labels: ['5m', '4m', '3m', '2m', '1m', 'now'],
          datasets: [{
            data: metrics?.realTime?.activeUsersHistory || [0, 0, 0, 0, 0, 0],
          }],
        }}
        width={Dimensions.get('window').width - 40}
        height={100}
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

  const renderInteractions = () => (
    <View style={styles.metricCard}>
      <Text style={styles.metricTitle}>Recent Interactions</Text>
      <BarChart
        data={{
          labels: Object.keys(metrics?.realTime?.interactions || {}),
          datasets: [{
            data: Object.values(metrics?.realTime?.interactions || {}),
          }],
        }}
        width={Dimensions.get('window').width - 40}
        height={200}
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

  const renderCurrentScreens = () => (
    <View style={styles.metricCard}>
      <Text style={styles.metricTitle}>Active Screens</Text>
      {metrics?.realTime?.currentScreens.map((screen, index) => (
        <View key={index} style={styles.screenItem}>
          <Text style={styles.screenName}>{screen}</Text>
          <Text style={styles.screenCount}>
            {metrics?.realTime?.currentScreens.filter(s => s === screen).length}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderNotifications = () => (
    <Animated.View
      style={[
        styles.notificationsContainer,
        {
          transform: [{
            translateY: alertAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [-100, 0],
            }),
          }],
        },
      ]}
    >
      {notifications.slice(0, 3).map((notification, index) => (
        <View
          key={notification.id}
          style={[
            styles.notification,
            { backgroundColor: getPriorityColor(notification.priority) },
          ]}
        >
          <Text style={styles.notificationTitle}>{notification.title}</Text>
          <Text style={styles.notificationMessage}>{notification.message}</Text>
        </View>
      ))}
    </Animated.View>
  );

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return COLORS.error;
      case 'medium':
        return COLORS.warning;
      default:
        return COLORS.success;
    }
  };

  return (
    <View style={styles.container}>
      {renderNotifications()}
      <ScrollView>
        {renderActiveUsers()}
        {renderInteractions()}
        {renderCurrentScreens()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  metricCard: {
    margin: SIZES.medium,
    padding: SIZES.medium,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  metricTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    marginBottom: SIZES.small,
  },
  metricValue: {
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SIZES.medium,
  },
  chart: {
    borderRadius: 16,
  },
  screenItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SIZES.small,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  screenName: {
    fontSize: SIZES.font,
  },
  screenCount: {
    fontSize: SIZES.font,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  notificationsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  notification: {
    margin: SIZES.small,
    padding: SIZES.medium,
    borderRadius: 8,
  },
  notificationTitle: {
    color: COLORS.white,
    fontSize: SIZES.font,
    fontWeight: 'bold',
    marginBottom: SIZES.small,
  },
  notificationMessage: {
    color: COLORS.white,
    fontSize: SIZES.font,
  },
});

export default RealTimeAnalyticsDashboard; 