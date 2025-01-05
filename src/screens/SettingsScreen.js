import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Switch, 
  TouchableOpacity, 
  Alert,
  ScrollView 
} from 'react-native';
import { COLORS, SIZES } from '../constants/theme';
import { settingsService } from '../services/settingsService';
import { storageService } from '../services/storageService';
import LoadingOverlay from '../components/LoadingOverlay';

const SettingItem = ({ label, value, onPress, type = 'switch' }) => (
  <TouchableOpacity 
    style={styles.settingItem} 
    onPress={onPress}
    disabled={type === 'switch'}
  >
    <Text style={styles.settingLabel}>{label}</Text>
    {type === 'switch' ? (
      <Switch
        value={value}
        onValueChange={onPress}
        trackColor={{ false: COLORS.gray, true: COLORS.primary }}
      />
    ) : (
      <Text style={styles.settingValue}>{value}</Text>
    )}
  </TouchableOpacity>
);

const SettingsScreen = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const userSettings = await settingsService.getSettings();
      setSettings(userSettings);
    } catch (error) {
      Alert.alert('Error', 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key, value) => {
    try {
      setLoading(true);
      const updatedSettings = await settingsService.updateSettings({
        [key]: value
      });
      setSettings(updatedSettings);
    } catch (error) {
      Alert.alert('Error', 'Failed to update setting');
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all food history? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await storageService.clearFoodHistory();
              Alert.alert('Success', 'History cleared successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear history');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const defaultSettings = await settingsService.resetSettings();
              setSettings(defaultSettings);
              Alert.alert('Success', 'Settings reset successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to reset settings');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  if (loading || !settings) {
    return <LoadingOverlay message="Loading settings..." />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>General</Text>
        <SettingItem
          label="Dark Theme"
          value={settings.theme === 'dark'}
          onPress={() => updateSetting('theme', settings.theme === 'dark' ? 'light' : 'dark')}
        />
        <SettingItem
          label="Notifications"
          value={settings.notifications}
          onPress={() => updateSetting('notifications', !settings.notifications)}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Measurements</Text>
        <SettingItem
          label="Unit System"
          value={settings.measurementUnit === 'metric' ? 'Metric' : 'Imperial'}
          type="select"
          onPress={() => updateSetting('measurementUnit', 
            settings.measurementUnit === 'metric' ? 'imperial' : 'metric')}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy</Text>
        <SettingItem
          label="Privacy Mode"
          value={settings.privacyMode}
          onPress={() => updateSetting('privacyMode', !settings.privacyMode)}
        />
        <SettingItem
          label="Auto-Save Images"
          value={settings.autoSave}
          onPress={() => updateSetting('autoSave', !settings.autoSave)}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        <TouchableOpacity 
          style={styles.dangerButton}
          onPress={handleClearHistory}
        >
          <Text style={styles.dangerButtonText}>Clear Food History</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.dangerButton}
          onPress={handleResetSettings}
        >
          <Text style={styles.dangerButtonText}>Reset All Settings</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  section: {
    padding: SIZES.medium,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  sectionTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    marginBottom: SIZES.medium,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.small,
  },
  settingLabel: {
    fontSize: SIZES.font,
  },
  settingValue: {
    fontSize: SIZES.font,
    color: COLORS.gray,
  },
  dangerButton: {
    backgroundColor: COLORS.error,
    padding: SIZES.medium,
    borderRadius: 8,
    marginTop: SIZES.small,
  },
  dangerButtonText: {
    color: COLORS.white,
    textAlign: 'center',
    fontSize: SIZES.font,
    fontWeight: '600',
  },
});

export default SettingsScreen; 