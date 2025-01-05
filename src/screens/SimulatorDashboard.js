import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { COLORS, SIZES } from '../constants/theme';
import AutomationSimulator from '../components/simulator/AutomationSimulator';

const SimulatorDashboard = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Automation Simulator</Text>
        <Text style={styles.headerSubtitle}>Test and monitor automation flows</Text>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.content}>
        <AutomationSimulator />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
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
  },
});

export default SimulatorDashboard; 