import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { COLORS, SIZES } from '../../constants/theme';
import { engagementAlerts } from '../../services/engagementAlertsService';
import { customAlertRules } from '../../services/customAlertRulesService';

const AlertVisualization = () => {
  const [alerts, setAlerts] = useState([]);
  const [rules, setRules] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [animation] = useState(new Animated.Value(0));

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    const alertHistory = engagementAlerts.getAlertHistory();
    setAlerts(alertHistory);
    setRules(customAlertRules.getRules());
  };

  const handleAlertPress = (alert) => {
    setSelectedAlert(alert);
    Animated.spring(animation, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleCloseDetails = () => {
    Animated.timing(animation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setSelectedAlert(null));
  };

  const renderAlertTimeline = () => (
    <View style={styles.timelineContainer}>
      <Text style={styles.sectionTitle}>Alert Timeline</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <LineChart
          data={{
            labels: alerts.slice(-6).map(a => 
              new Date(a.timestamp).toLocaleTimeString()
            ),
            datasets: [{
              data: alerts.slice(-6).map(a => a.priority === 'high' ? 3 : 
                                            a.priority === 'medium' ? 2 : 1),
            }],
          }}
          width={600}
          height={200}
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
      </ScrollView>
    </View>
  );

  const renderAlertList = () => (
    <View style={styles.listContainer}>
      <Text style={styles.sectionTitle}>Recent Alerts</Text>
      <ScrollView>
        {alerts.map((alert, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.alertItem,
              { borderLeftColor: getPriorityColor(alert.priority) },
            ]}
            onPress={() => handleAlertPress(alert)}
          >
            <Text style={styles.alertTitle}>{alert.title}</Text>
            <Text style={styles.alertTime}>
              {new Date(alert.timestamp).toLocaleTimeString()}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderAlertDetails = () => {
    if (!selectedAlert) return null;

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
          <Text style={styles.detailsTitle}>{selectedAlert.title}</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleCloseDetails}
          >
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.detailsContent}>
          <Text style={styles.detailsMessage}>{selectedAlert.message}</Text>
          <Text style={styles.detailsLabel}>Priority</Text>
          <Text style={[
            styles.detailsPriority,
            { color: getPriorityColor(selectedAlert.priority) },
          ]}>
            {selectedAlert.priority.toUpperCase()}
          </Text>
          <Text style={styles.detailsLabel}>Time</Text>
          <Text style={styles.detailsTime}>
            {new Date(selectedAlert.timestamp).toLocaleString()}
          </Text>
          {selectedAlert.data && (
            <>
              <Text style={styles.detailsLabel}>Additional Data</Text>
              <Text style={styles.detailsData}>
                {JSON.stringify(selectedAlert.data, null, 2)}
              </Text>
            </>
          )}
        </ScrollView>
      </Animated.View>
    );
  };

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
      {renderAlertTimeline()}
      {renderAlertList()}
      {renderAlertDetails()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  timelineContainer: {
    padding: SIZES.medium,
  },
  sectionTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    marginBottom: SIZES.medium,
  },
  chart: {
    borderRadius: 16,
  },
  listContainer: {
    flex: 1,
    padding: SIZES.medium,
  },
  alertItem: {
    backgroundColor: COLORS.white,
    padding: SIZES.medium,
    borderRadius: 8,
    marginBottom: SIZES.small,
    borderLeftWidth: 4,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  alertTitle: {
    fontSize: SIZES.font,
    fontWeight: 'bold',
  },
  alertTime: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    marginTop: SIZES.small,
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
    flex: 1,
  },
  closeButton: {
    padding: SIZES.small,
  },
  closeButtonText: {
    fontSize: SIZES.extraLarge,
    color: COLORS.gray,
  },
  detailsContent: {
    flex: 1,
  },
  detailsMessage: {
    fontSize: SIZES.font,
    marginBottom: SIZES.medium,
  },
  detailsLabel: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    marginBottom: SIZES.small,
  },
  detailsPriority: {
    fontSize: SIZES.font,
    fontWeight: 'bold',
    marginBottom: SIZES.medium,
  },
  detailsTime: {
    fontSize: SIZES.font,
    marginBottom: SIZES.medium,
  },
  detailsData: {
    fontSize: SIZES.small,
    fontFamily: 'monospace',
    backgroundColor: COLORS.lightGray,
    padding: SIZES.small,
    borderRadius: 4,
  },
});

export default AlertVisualization; 