import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { automationStateManagement } from '../services/automationStateManagementService';
import { automationAnalytics } from '../services/automationAnalyticsService';
import { LineChart } from 'react-native-chart-kit';

const AutomationDetails = ({ route, navigation }) => {
  const { automationId } = route.params;
  const [automation, setAutomation] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAutomationDetails();
  }, [automationId]);

  const loadAutomationDetails = async () => {
    try {
      setLoading(true);
      
      // Load automation details
      const state = await automationStateManagement.getState(automationId);
      const analytics = await automationAnalytics.getAutomationMetrics(automationId);
      const executionHistory = await automationStateManagement.getHistory({
        automationId,
        limit: 10,
      });

      setAutomation({
        id: automationId,
        state,
        ...analytics.details,
      });
      setMetrics(analytics.metrics);
      setHistory(executionHistory);

    } catch (error) {
      console.error('Load automation details error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Automation Details</Text>
    </View>
  );

  const renderBasicInfo = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Basic Information</Text>
      <View style={styles.infoRow}>
        <Text style={styles.label}>ID:</Text>
        <Text style={styles.value}>{automation.id}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.label}>Status:</Text>
        <View style={[styles.statusBadge, styles[`status_${automation.state}`]]}>
          <Text style={styles.statusText}>{automation.state}</Text>
        </View>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.label}>Type:</Text>
        <Text style={styles.value}>{automation.type}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.label}>Created:</Text>
        <Text style={styles.value}>
          {new Date(automation.created).toLocaleString()}
        </Text>
      </View>
    </View>
  );

  const renderMetrics = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Performance Metrics</Text>
      {metrics.performance && (
        <LineChart
          data={{
            labels: metrics.performance.labels,
            datasets: [{
              data: metrics.performance.values
            }]
          }}
          width={styles.chart.width}
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
      )}
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{metrics?.executions || 0}</Text>
          <Text style={styles.metricLabel}>Total Executions</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>
            {(metrics?.successRate * 100 || 0).toFixed(1)}%
          </Text>
          <Text style={styles.metricLabel}>Success Rate</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>
            {metrics?.avgDuration || 0}ms
          </Text>
          <Text style={styles.metricLabel}>Avg Duration</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{metrics?.failures || 0}</Text>
          <Text style={styles.metricLabel}>Failures</Text>
        </View>
      </View>
    </View>
  );

  const renderHistory = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Execution History</Text>
      <ScrollView style={styles.historyList}>
        {history.map((entry, index) => (
          <View key={index} style={styles.historyEntry}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyTimestamp}>
                {new Date(entry.timestamp).toLocaleString()}
              </Text>
              <View style={[styles.statusBadge, styles[`status_${entry.status}`]]}>
                <Text style={styles.statusText}>{entry.status}</Text>
              </View>
            </View>
            {entry.details && (
              <Text style={styles.historyDetails}>{entry.details}</Text>
            )}
            {entry.error && (
              <Text style={styles.historyError}>{entry.error}</Text>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading automation details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!automation) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Automation not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <ScrollView style={styles.content}>
        {renderBasicInfo()}
        {renderMetrics()}
        {renderHistory()}
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: SIZES.base,
  },
  backButtonText: {
    color: COLORS.white,
    fontSize: SIZES.extraLarge,
  },
  headerTitle: {
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  content: {
    flex: 1,
    padding: SIZES.padding,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.padding,
    ...SHADOWS.medium,
  },
  sectionTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    marginBottom: SIZES.padding,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  label: {
    fontSize: SIZES.font,
    color: COLORS.gray,
  },
  value: {
    fontSize: SIZES.font,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: SIZES.base,
    paddingVertical: 4,
    borderRadius: SIZES.radius,
  },
  status_active: {
    backgroundColor: COLORS.success,
  },
  status_failed: {
    backgroundColor: COLORS.error,
  },
  status_running: {
    backgroundColor: COLORS.primary,
  },
  statusText: {
    color: COLORS.white,
    fontSize: SIZES.small,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  chart: {
    marginVertical: SIZES.padding,
    borderRadius: SIZES.radius,
    width: 350,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: SIZES.padding,
  },
  metricCard: {
    width: '48%',
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.base,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  metricLabel: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    marginTop: 4,
  },
  historyList: {
    maxHeight: 300,
  },
  historyEntry: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    paddingVertical: SIZES.base,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyTimestamp: {
    fontSize: SIZES.small,
    color: COLORS.gray,
  },
  historyDetails: {
    fontSize: SIZES.font,
    marginTop: 4,
  },
  historyError: {
    fontSize: SIZES.font,
    color: COLORS.error,
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SIZES.padding,
    fontSize: SIZES.font,
    color: COLORS.gray,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: SIZES.large,
    color: COLORS.error,
  },
});

export default AutomationDetails; 