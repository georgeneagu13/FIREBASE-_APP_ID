import NetInfo from '@react-native-community/netinfo';
import { offlineService } from './offlineService';
import { notificationService } from './notificationService';

class OfflineHandler {
  constructor() {
    this.syncInProgress = false;
    this.syncProgress = 0;
    this.syncListeners = new Set();
    this.retryAttempts = 0;
    this.maxRetries = 3;
  }

  // Initialize offline handler
  init() {
    NetInfo.addEventListener(state => {
      if (state.isConnected && !this.syncInProgress) {
        this.startSync();
      }
    });
  }

  // Add sync listener
  addSyncListener(listener) {
    this.syncListeners.add(listener);
    return () => this.syncListeners.delete(listener);
  }

  // Notify listeners of sync progress
  notifySyncListeners(progress, message) {
    this.syncProgress = progress;
    this.syncListeners.forEach(listener => 
      listener({ progress, message })
    );
  }

  // Start sync process
  async startSync() {
    if (this.syncInProgress) return;

    try {
      this.syncInProgress = true;
      this.notifySyncListeners(0, 'Starting sync...');

      // Get offline queue
      const queue = await offlineService.getOfflineQueue();
      if (queue.length === 0) {
        this.notifySyncListeners(1, 'No items to sync');
        return;
      }

      // Process queue items
      for (let i = 0; i < queue.length; i++) {
        const progress = (i + 1) / queue.length;
        this.notifySyncListeners(
          progress, 
          `Syncing item ${i + 1} of ${queue.length}...`
        );

        await this.processSyncItem(queue[i]);
      }

      this.notifySyncListeners(1, 'Sync completed');
      this.retryAttempts = 0;

    } catch (error) {
      console.error('Sync error:', error);
      await this.handleSyncError();
    } finally {
      this.syncInProgress = false;
    }
  }

  // Process single sync item
  async processSyncItem(item) {
    try {
      switch (item.type) {
        case 'SAVE_FOOD':
          await this.syncFoodItem(item);
          break;
        case 'UPDATE_PROFILE':
          await this.syncProfileUpdate(item);
          break;
        // Add more sync types as needed
      }
    } catch (error) {
      throw new Error(`Failed to sync item: ${error.message}`);
    }
  }

  // Handle sync errors
  async handleSyncError() {
    this.retryAttempts++;
    
    if (this.retryAttempts < this.maxRetries) {
      // Schedule retry
      const delay = Math.pow(2, this.retryAttempts) * 1000; // Exponential backoff
      this.notifySyncListeners(
        this.syncProgress, 
        `Retry ${this.retryAttempts} of ${this.maxRetries} in ${delay/1000}s...`
      );

      setTimeout(() => this.startSync(), delay);
    } else {
      // Max retries reached
      this.notifySyncListeners(
        this.syncProgress, 
        'Sync failed. Will try again when online.'
      );

      notificationService.showLocalNotification(
        'Sync Failed',
        'Some changes could not be synchronized. Will retry when connection improves.'
      );
    }
  }

  // Sync food item
  async syncFoodItem(item) {
    // Implement food item sync logic
  }

  // Sync profile update
  async syncProfileUpdate(item) {
    // Implement profile update sync logic
  }
}

export const offlineHandler = new OfflineHandler(); 