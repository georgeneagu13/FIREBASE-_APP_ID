import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { automationAnalytics } from '../services/automationAnalyticsService';
import { automationScheduling } from '../services/automationSchedulingService';
import { automationStateManagement } from '../services/automationStateManagementService';

const Settings = () => {
  const [settings, setSettings] = useState({
    analytics: {
      enabled: true,
      retentionDays: 30,
      detailedLogging: true,
    },
    scheduling: {
      maxConcurrent: 10,
      retryEnabled: true,
      maxRetries: 3,
    },
    notifications: {
      enabled: true,
      emailNotifications: true,
      pushNotifications: true,
      criticalAlertsOnly: false,
    },
    performance: {
      lowLatencyMode: false,
      compressionEnabled: true,
      cacheEnabled: true,
    },
    security: {
      encryptionEnabled: true,
      auditLogging: true,
      accessControl: true,
    },
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Load settings from various services
      const analyticsConfig = await automationAnalytics.getConfig();
      const schedulingConfig = await automationScheduling.getConfig();
      const stateConfig = await automationStateManagement.getConfig();

      setSettings(prev => ({
        ...prev,
        analytics: {
          ...prev.analytics,
          ...analyticsConfig,
        },
        scheduling: {
          ...prev.scheduling,
          ...schedulingConfig,
        },
      }));
    } catch (error) {
      console.error('Load settings error:', error);
      Alert.alert('Error', 'Failed to load settings');
    }
  };

  const updateSetting = async (category, setting, value) => {
    try {
      setSettings(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          [setting]: value,
        },
      }));

      // Update respective service configurations
      switch (category) {
        case 'analytics':
          await automationAnalytics.updateConfig({ [setting]: value });
          break;
        case 'scheduling':
          await automationScheduling.updateConfig({ [setting]: value });
          break;
        // Add other cases as needed
      }
    } catch (error) {
      console.error('Update setting error:', error);
      Alert.alert('Error', 'Failed to update setting');
    }
  };

  const renderSettingSection = (title, settings, category) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {Object.entries(settings).map(([key, value]) => (
        <View key={key} style={styles.settingRow}>
          <Text style={styles.settingLabel}>
            {key.split(/(?=[A-Z])/).join(' ')}
          </Text>
          {typeof value === 'boolean' ? (
            <Switch
              value={value}
              onValueChange={(newValue) => updateSetting(category, key, newValue)}
              trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
            />
          ) : typeof value === 'number' ? (
            <TouchableOpacity
              style={styles.numberInput}
              onPress={() => {
                Alert.prompt(
                  'Update Value',
                  `Enter new value for ${key}`,
                  (text) => {
                    const num = parseInt(text);
                    if (!isNaN(num)) {
                      updateSetting(category, key, num);
                    }
                  }
                );
              }}
            >
              <Text style={styles.numberInputText}>{value}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ))}
    </View>
  );

  const resetSettings = async () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await automationAnalytics.resetConfig();
              await automationScheduling.resetConfig();
              await automationStateManagement.resetConfig();
              await loadSettings();
              Alert.alert('Success', 'Settings reset to default');
            } catch (error) {
              console.error('Reset settings error:', error);
              Alert.alert('Error', 'Failed to reset settings');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <TouchableOpacity
          onPress={resetSettings}
          style={styles.resetButton}
        >
          <Text style={styles.resetButtonText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {renderSettingSection('Analytics', settings.analytics, 'analytics')}
        {renderSettingSection('Scheduling', settings.scheduling, 'scheduling')}
        {renderSettingSection('Notifications', settings.notifications, 'notifications')}
        {renderSettingSection('Performance', settings.performance, 'performance')}
        {renderSettingSection('Security', settings.security, 'security')}
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  resetButton: {
    backgroundColor: COLORS.error,
    padding: SIZES.base,
    borderRadius: SIZES.radius,
  },
  resetButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
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
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  settingLabel: {
    fontSize: SIZES.font,
    textTransform: 'capitalize',
  },
  numberInput: {
    backgroundColor: COLORS.card,
    padding: SIZES.base,
    borderRadius: SIZES.radius,
    minWidth: 50,
    alignItems: 'center',
  },
  numberInputText: {
    fontSize: SIZES.font,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});

export default Settings; 