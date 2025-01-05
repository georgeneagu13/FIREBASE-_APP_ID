import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';
import { alertResponseAutomation } from '../../services/alertResponseAutomationService';
import { LineChart, BarChart } from 'react-native-chart-kit';
import Svg, { Path, Circle } from 'react-native-svg';

const AutomationWorkflowVisualization = () => {
  const [workflows, setWorkflows] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [animation] = useState(new Animated.Value(0));

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    const workflowData = alertResponseAutomation.getWorkflows();
    const historyData = alertResponseAutomation.getHistory();
    setWorkflows(workflowData);
    setHistory(historyData);
    calculateMetrics(historyData);
  };

  const calculateMetrics = (historyData) => {
    const metrics = {
      totalExecutions: historyData.length,
      successRate: 0,
      averageExecutionTime: 0,
      workflowDistribution: new Map(),
    };

    if (historyData.length > 0) {
      const successful = historyData.filter(h => 
        h.results.every(r => r.success)
      ).length;
      metrics.successRate = successful / historyData.length;

      historyData.forEach(entry => {
        const workflow = entry.automations[0]?.id || 'unknown';
        metrics.workflowDistribution.set(
          workflow,
          (metrics.workflowDistribution.get(workflow) || 0) + 1
        );
      });
    }

    setMetrics(metrics);
  };

  const handleWorkflowPress = (workflow) => {
    setSelectedWorkflow(workflow);
    Animated.spring(animation, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const renderWorkflowList = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Active Workflows</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {workflows.map(([id, workflow]) => (
          <TouchableOpacity
            key={id}
            style={styles.workflowCard}
            onPress={() => handleWorkflowPress(workflow)}
          >
            <Text style={styles.workflowName}>{id}</Text>
            <Text style={styles.workflowSteps}>
              {workflow.length} steps
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderMetrics = () => {
    if (!metrics) return null;

    const distributionData = {
      labels: Array.from(metrics.workflowDistribution.keys()).slice(0, 5),
      datasets: [{
        data: Array.from(metrics.workflowDistribution.values()).slice(0, 5),
      }],
    };

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Workflow Metrics</Text>
        
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>
              {metrics.totalExecutions}
            </Text>
            <Text style={styles.metricLabel}>Total Executions</Text>
          </View>
          
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>
              {Math.round(metrics.successRate * 100)}%
            </Text>
            <Text style={styles.metricLabel}>Success Rate</Text>
          </View>
        </View>

        <Text style={styles.chartTitle}>Workflow Distribution</Text>
        <BarChart
          data={distributionData}
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

  const renderWorkflowDetails = () => {
    if (!selectedWorkflow) return null;

    return (
      <Animated.View
        style={[
          styles.detailsContainer,
          {
            transform: [{
              translateY: animation.interpolate({
                inputRange: [0, 1],
                outputRange: [300, 0],
              }),
            }],
          },
        ]}
      >
        <View style={styles.detailsHeader}>
          <Text style={styles.detailsTitle}>Workflow Details</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => {
              Animated.timing(animation, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
              }).start(() => setSelectedWorkflow(null));
            }}
          >
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.detailsContent}>
          {selectedWorkflow.map((step, index) => (
            <View key={index} style={styles.workflowStep}>
              <View style={styles.stepHeader}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.stepAction}>{step.action}</Text>
              </View>
              
              <View style={styles.stepParams}>
                {Object.entries(step.params).map(([key, value]) => (
                  <Text key={key} style={styles.paramText}>
                    {key}: {value.toString()}
                  </Text>
                ))}
              </View>

              {step.required && (
                <View style={styles.requiredBadge}>
                  <Text style={styles.requiredText}>Required</Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {renderWorkflowList()}
        {renderMetrics()}
      </ScrollView>
      {renderWorkflowDetails()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  section: {
    padding: SIZES.medium,
  },
  sectionTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    marginBottom: SIZES.medium,
  },
  workflowCard: {
    backgroundColor: COLORS.white,
    padding: SIZES.medium,
    borderRadius: 8,
    marginRight: SIZES.medium,
    minWidth: 150,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  workflowName: {
    fontSize: SIZES.font,
    fontWeight: 'bold',
    marginBottom: SIZES.small,
  },
  workflowSteps: {
    fontSize: SIZES.small,
    color: COLORS.gray,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.large,
  },
  metricCard: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
    padding: SIZES.medium,
    borderRadius: 8,
    alignItems: 'center',
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
  chartTitle: {
    fontSize: SIZES.font,
    fontWeight: 'bold',
    marginVertical: SIZES.medium,
  },
  chart: {
    borderRadius: 16,
  },
  detailsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: SIZES.medium,
    maxHeight: '80%',
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.medium,
  },
  detailsTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: SIZES.small,
  },
  closeButtonText: {
    fontSize: SIZES.extraLarge,
    color: COLORS.gray,
  },
  workflowStep: {
    backgroundColor: COLORS.lightGray,
    padding: SIZES.medium,
    borderRadius: 8,
    marginBottom: SIZES.medium,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.small,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.small,
  },
  stepNumberText: {
    color: COLORS.white,
    fontSize: SIZES.font,
    fontWeight: 'bold',
  },
  stepAction: {
    fontSize: SIZES.font,
    fontWeight: 'bold',
  },
  stepParams: {
    marginLeft: 32,
  },
  paramText: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    marginBottom: SIZES.small,
  },
  requiredBadge: {
    position: 'absolute',
    top: SIZES.small,
    right: SIZES.small,
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SIZES.small,
    paddingVertical: 2,
    borderRadius: 4,
  },
  requiredText: {
    color: COLORS.white,
    fontSize: SIZES.small,
    fontWeight: 'bold',
  },
});

export default AutomationWorkflowVisualization; 