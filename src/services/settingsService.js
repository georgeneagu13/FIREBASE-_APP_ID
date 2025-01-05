import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = '@user_settings';

const DEFAULT_SETTINGS = {
  theme: 'light',
  notifications: true,
  measurementUnit: 'metric', // metric or imperial
  privacyMode: false,
  language: 'en',
  autoSave: true,
};

export const settingsService = {
  // Get user settings
  getSettings: async () => {
    try {
      const settings = await AsyncStorage.getItem(SETTINGS_KEY);
      return settings ? { ...DEFAULT_SETTINGS, ...JSON.parse(settings) } : DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Error getting settings:', error);
      return DEFAULT_SETTINGS;
    }
  },

  // Update settings
  updateSettings: async (newSettings) => {
    try {
      const currentSettings = await settingsService.getSettings();
      const updatedSettings = { ...currentSettings, ...newSettings };
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updatedSettings));
      return updatedSettings;
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  },

  // Reset settings to default
  resetSettings: async () => {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Error resetting settings:', error);
      throw error;
    }
  }
}; 