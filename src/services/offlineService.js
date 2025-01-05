import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

const OFFLINE_QUEUE_KEY = '@offline_queue';
const OFFLINE_DATA_KEY = '@offline_data';

export const offlineService = {
  isOnline: true,
  queue: [],

  init: async () => {
    try {
      // Load offline queue
      const savedQueue = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
      if (savedQueue) {
        offlineService.queue = JSON.parse(savedQueue);
      }

      // Subscribe to network state
      NetInfo.addEventListener(state => {
        offlineService.isOnline = state.isConnected;
        
        if (state.isConnected) {
          offlineService.processQueue();
        }
      });
    } catch (error) {
      console.error('Offline service init error:', error);
    }
  },

  // Add action to queue
  addToQueue: async (action) => {
    try {
      offlineService.queue.push(action);
      await AsyncStorage.setItem(
        OFFLINE_QUEUE_KEY, 
        JSON.stringify(offlineService.queue)
      );
    } catch (error) {
      console.error('Add to queue error:', error);
    }
  },

  // Process offline queue
  processQueue: async () => {
    try {
      while (offlineService.queue.length > 0 && offlineService.isOnline) {
        const action = offlineService.queue[0];
        await offlineService.processAction(action);
        offlineService.queue.shift();
      }
      
      await AsyncStorage.setItem(
        OFFLINE_QUEUE_KEY, 
        JSON.stringify(offlineService.queue)
      );
    } catch (error) {
      console.error('Process queue error:', error);
    }
  },

  // Process single action
  processAction: async (action) => {
    switch (action.type) {
      case 'SAVE_FOOD':
        // Process food saving
        break;
      case 'UPDATE_PROFILE':
        // Process profile update
        break;
      // Add more action types as needed
    }
  },

  // Save data for offline access
  saveOfflineData: async (key, data) => {
    try {
      const offlineData = await offlineService.getOfflineData();
      offlineData[key] = data;
      await AsyncStorage.setItem(
        OFFLINE_DATA_KEY, 
        JSON.stringify(offlineData)
      );
    } catch (error) {
      console.error('Save offline data error:', error);
    }
  },

  // Get offline data
  getOfflineData: async () => {
    try {
      const data = await AsyncStorage.getItem(OFFLINE_DATA_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Get offline data error:', error);
      return {};
    }
  },

  // Clear offline data
  clearOfflineData: async () => {
    try {
      await AsyncStorage.removeItem(OFFLINE_DATA_KEY);
      await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
      offlineService.queue = [];
    } catch (error) {
      console.error('Clear offline data error:', error);
    }
  },
}; 