import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Platform,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Icon from '../components/common/Icon';
import AnimatedCard from '../components/common/AnimatedCard';
import { SIZES, SHADOWS } from '../constants/theme';
import { settingsService } from '../services/settingsService';

const SettingsEnhanced = ({ navigation }) => {
  const { colors, isDarkMode, toggleTheme, isSystemTheme, setSystemTheme } = useTheme();
  const [settings, setSettings] = useState({
    notifications: {
      enabled: true,
      pushNotifications: true,
      emailNotifications: true,
      soundEnabled: true,
      vibrationEnabled: true,
      dailyDigest: false,
    },
    privacy: {
      shareAnalytics: true,
      crashReports: true,
      locationServices: false,
    },
    automation: {
      autoSync: true,
      backgroundProcessing: true,
      lowPowerMode: false,
      debugMode: false,
    },
    display: {
      animations: true,
      compactMode: false,
      highContrast: false,
    },
    storage: {
      cacheEnabled: true,
      autoCleanup: true,
      compressionEnabled: true,
    }
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await settingsService.getSettings();
      setSettings(savedSettings);
    } catch (error) {
      console.error('Load settings error:', error);
      Alert.alert('Error', 'Failed to load settings');
    }
  };

  const handleSettingChange = async (category, setting, value) => {
    try {
      setSettings(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          [setting]: value,
        },
      }));
      
      await settingsService.updateSetting(category, setting, value);
      
      // Handle special cases
      if (category === 'automation' && setting === 'debugMode') {
        if (value) {
          Alert.alert('Debug Mode', 'Debug mode is now enabled. Performance may be affected.');
        }
      }
    } catch (error) {
      console.error('Update setting error:', error);
      Alert.alert('Error', 'Failed to update setting');
    }
  };

  const renderSectionHeader = (title, icon) => (
    <View style={styles.sectionHeader}>
      <Icon name={icon} size={24} color={colors.primary} />
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {title}
      </Text>
    </View>
  );

  const renderSwitch = (category, setting, label, description) => (
    <View style={styles.settingItem}>
      <View style={styles.settingContent}>
        <Text style={[styles.settingLabel, { color: colors.text }]}>
          {label}
        </Text>
        {description && (
          <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
            {description}
          </Text>
        )}
      </View>
      <Switch
        value={settings[category][setting]}
        onValueChange={(value) => handleSettingChange(category, setting, value)}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={Platform.OS === 'ios' ? undefined : colors.card}
      />
    </View>
  );

  const renderStorageInfo = () => (
    <AnimatedCard style={styles.storageCard}>
      <Text style={[styles.storageTitle, { color: colors.text }]}>
        Storage Usage
      </Text>
      <View style={styles.storageBar}>
        <View 
          style={[
            styles.storageUsed,
            { 
              backgroundColor: colors.primary,
              width: '65%' // This should be dynamic based on actual usage
            }
          ]} 
        />
      </View>
      <View style={styles.storageInfo}>
        <Text style={[styles.storageText, { color: colors.textSecondary }]}>
          6.5 GB used of 10 GB
        </Text>
        <TouchableOpacity
          style={[styles.clearButton, { backgroundColor: colors.primary }]}
          onPress={() => Alert.alert('Clear Cache', 'Are you sure you want to clear the cache?')}
        >
          <Text style={[styles.clearButtonText, { color: colors.card }]}>
            Clear Cache
          </Text>
        </TouchableOpacity>
      </View>
    </AnimatedCard>
  );

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Theme Settings */}
      <AnimatedCard style={styles.section}>
        {renderSectionHeader('Display & Theme', 'settings')}
        <View style={styles.themeButtons}>
          <TouchableOpacity
            style={[
              styles.themeButton,
              { 
                backgroundColor: !isSystemTheme && !isDarkMode ? colors.primary : colors.card,
                borderColor: colors.border,
              }
            ]}
            onPress={() => {
              toggleTheme(false);
            }}
          >
            <Icon 
              name="sun" 
              size={24} 
              color={!isSystemTheme && !isDarkMode ? colors.card : colors.text} 
            />
            <Text style={[
              styles.themeButtonText,
              { color: !isSystemTheme && !isDarkMode ? colors.card : colors.text }
            ]}>
              Light
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.themeButton,
              { 
                backgroundColor: !isSystemTheme && isDarkMode ? colors.primary : colors.card,
                borderColor: colors.border,
              }
            ]}
            onPress={() => {
              toggleTheme(true);
            }}
          >
            <Icon 
              name="moon" 
              size={24} 
              color={!isSystemTheme && isDarkMode ? colors.card : colors.text} 
            />
            <Text style={[
              styles.themeButtonText,
              { color: !isSystemTheme && isDarkMode ? colors.card : colors.text }
            ]}>
              Dark
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.themeButton,
              { 
                backgroundColor: isSystemTheme ? colors.primary : colors.card,
                borderColor: colors.border,
              }
            ]}
            onPress={setSystemTheme}
          >
            <Icon 
              name="smartphone" 
              size={24} 
              color={isSystemTheme ? colors.card : colors.text} 
            />
            <Text style={[
              styles.themeButtonText,
              { color: isSystemTheme ? colors.card : colors.text }
            ]}>
              System
            </Text>
          </TouchableOpacity>
        </View>

        {renderSwitch('display', 'animations', 'Enable Animations', 'Show animations throughout the app')}
        {renderSwitch('display', 'compactMode', 'Compact Mode', 'Reduce spacing between elements')}
        {renderSwitch('display', 'highContrast', 'High Contrast', 'Increase text and icon contrast')}
      </AnimatedCard>

      {/* Notifications */}
      <AnimatedCard style={styles.section}>
        {renderSectionHeader('Notifications', 'notification')}
        {renderSwitch('notifications', 'enabled', 'Enable Notifications')}
        {renderSwitch('notifications', 'pushNotifications', 'Push Notifications')}
        {renderSwitch('notifications', 'emailNotifications', 'Email Notifications')}
        {renderSwitch('notifications', 'soundEnabled', 'Sound')}
        {renderSwitch('notifications', 'vibrationEnabled', 'Vibration')}
        {renderSwitch('notifications', 'dailyDigest', 'Daily Digest')}
      </AnimatedCard>

      {/* Privacy */}
      <AnimatedCard style={styles.section}>
        {renderSectionHeader('Privacy', 'lock')}
        {renderSwitch('privacy', 'shareAnalytics', 'Share Analytics')}
        {renderSwitch('privacy', 'crashReports', 'Send Crash Reports')}
        {renderSwitch('privacy', 'locationServices', 'Location Services')}
      </AnimatedCard>

      {/* Automation */}
      <AnimatedCard style={styles.section}>
        {renderSectionHeader('Automation', 'automation')}
        {renderSwitch('automation', 'autoSync', 'Auto Sync')}
        {renderSwitch('automation', 'backgroundProcessing', 'Background Processing')}
        {renderSwitch('automation', 'lowPowerMode', 'Low Power Mode')}
        {renderSwitch('automation', 'debugMode', 'Debug Mode')}
      </AnimatedCard>

      {/* Storage */}
      <AnimatedCard style={styles.section}>
        {renderSectionHeader('Storage', 'storage')}
        {renderStorageInfo()}
        {renderSwitch('storage', 'cacheEnabled', 'Enable Cache')}
        {renderSwitch('storage', 'autoCleanup', 'Auto Cleanup')}
        {renderSwitch('storage', 'compressionEnabled', 'Enable Compression')}
      </AnimatedCard>

      {/* About */}
      <AnimatedCard style={styles.section}>
        {renderSectionHeader('About', 'info')}
        <TouchableOpacity 
          style={styles.aboutItem}
          onPress={() => navigation.navigate('About')}
        >
          <Text style={[styles.aboutText, { color: colors.text }]}>
            Version 1.0.0
          </Text>
          <Icon name="chevronRight" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </AnimatedCard>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    margin: SIZES.padding,
    marginBottom: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.padding,
  },
  sectionTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    marginLeft: SIZES.base,
  },
  themeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.padding,
  },
  themeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    marginHorizontal: SIZES.base / 2,
  },
  themeButtonText: {
    marginLeft: SIZES.base,
    fontSize: SIZES.font,
    fontWeight: '500',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SIZES.padding,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingContent: {
    flex: 1,
    marginRight: SIZES.padding,
  },
  settingLabel: {
    fontSize: SIZES.font,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: SIZES.small,
  },
  storageCard: {
    padding: SIZES.padding,
    marginTop: SIZES.base,
  },
  storageTitle: {
    fontSize: SIZES.font,
    fontWeight: '500',
    marginBottom: SIZES.base,
  },
  storageBar: {
    height: 8,
    backgroundColor: '#E1E1E1',
    borderRadius: 4,
    overflow: 'hidden',
  },
  storageUsed: {
    height: '100%',
    borderRadius: 4,
  },
  storageInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SIZES.base,
  },
  storageText: {
    fontSize: SIZES.small,
  },
  clearButton: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
    borderRadius: SIZES.radius,
  },
  clearButtonText: {
    fontSize: SIZES.small,
    fontWeight: '500',
  },
  aboutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SIZES.padding,
  },
  aboutText: {
    fontSize: SIZES.font,
  },
});

export default SettingsEnhanced; 