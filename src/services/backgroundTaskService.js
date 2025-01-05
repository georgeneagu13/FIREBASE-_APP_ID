import BackgroundFetch from 'react-native-background-fetch';
import { offlineService } from './offlineService';
import { notificationService } from './notificationService';

export const backgroundTaskService = {
  // Initialize background tasks
  init: async () => {
    try {
      // Configure background fetch
      await BackgroundFetch.configure({
        minimumFetchInterval: 15, // Fetch every 15 minutes
        stopOnTerminate: false,
        enableHeadless: true,
        startOnBoot: true,
        requiredNetworkType: BackgroundFetch.NETWORK_TYPE_ANY,
      }, async (taskId) => {
        // Execute background task
        await backgroundTaskService.executeTask();
        // Signal completion of the task
        BackgroundFetch.finish(taskId);
      }, (error) => {
        console.error('Background fetch failed:', error);
      });

      // Start the background fetch
      await BackgroundFetch.start();
    } catch (error) {
      console.error('Background task init error:', error);
    }
  },

  // Execute background task
  executeTask: async () => {
    try {
      // Process offline queue
      await offlineService.processQueue();

      // Sync data
      await backgroundTaskService.syncData();

      // Check for pending notifications
      await backgroundTaskService.checkNotifications();
    } catch (error) {
      console.error('Background task execution error:', error);
    }
  },

  // Sync data with server
  syncData: async () => {
    try {
      const offlineData = await offlineService.getOfflineData();
      // Implement your sync logic here
    } catch (error) {
      console.error('Data sync error:', error);
    }
  },

  // Check for pending notifications
  checkNotifications: async () => {
    try {
      // Implement notification check logic
    } catch (error) {
      console.error('Notification check error:', error);
    }
  },
}; 