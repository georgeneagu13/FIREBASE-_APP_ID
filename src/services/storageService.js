import AsyncStorage from '@react-native-async-storage/async-storage';

const FOOD_HISTORY_KEY = '@food_history';

export const storageService = {
  // Save food scan result
  saveFoodScan: async (scanData) => {
    try {
      const timestamp = new Date().toISOString();
      const newScan = {
        id: timestamp,
        timestamp,
        ...scanData
      };

      // Get existing history
      const existingHistory = await AsyncStorage.getItem(FOOD_HISTORY_KEY);
      const history = existingHistory ? JSON.parse(existingHistory) : [];

      // Add new scan to history
      const updatedHistory = [newScan, ...history];

      // Keep only last 50 items
      const trimmedHistory = updatedHistory.slice(0, 50);

      // Save updated history
      await AsyncStorage.setItem(FOOD_HISTORY_KEY, JSON.stringify(trimmedHistory));

      return newScan;
    } catch (error) {
      console.error('Error saving food scan:', error);
      throw error;
    }
  },

  // Get food history
  getFoodHistory: async () => {
    try {
      const history = await AsyncStorage.getItem(FOOD_HISTORY_KEY);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Error getting food history:', error);
      throw error;
    }
  },

  // Clear food history
  clearFoodHistory: async () => {
    try {
      await AsyncStorage.removeItem(FOOD_HISTORY_KEY);
    } catch (error) {
      console.error('Error clearing food history:', error);
      throw error;
    }
  }
}; 