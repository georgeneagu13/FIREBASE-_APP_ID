import AsyncStorage from '@react-native-async-storage/async-storage';
import { offlineHandler } from './offlineHandler';
import { notificationService } from './notificationService';

const ERROR_LOG_KEY = '@error_log';
const MAX_RETRY_ATTEMPTS = 3;

export const errorRecoveryService = {
  // Initialize error recovery
  init: async () => {
    try {
      const errorLog = await AsyncStorage.getItem(ERROR_LOG_KEY);
      return errorLog ? JSON.parse(errorLog) : [];
    } catch (error) {
      console.error('Error recovery init error:', error);
      return [];
    }
  },

  // Log error
  logError: async (error, context) => {
    try {
      const errorLog = await errorRecoveryService.init();
      const errorEntry = {
        id: Date.now().toString(),
        error: error.message,
        stack: error.stack,
        context,
        timestamp: new Date().toISOString(),
        retryAttempts: 0,
        status: 'pending',
      };
      
      errorLog.push(errorEntry);
      await AsyncStorage.setItem(ERROR_LOG_KEY, JSON.stringify(errorLog));
      
      // Attempt recovery
      await errorRecoveryService.attemptRecovery(errorEntry);
    } catch (err) {
      console.error('Error logging error:', err);
    }
  },

  // Attempt recovery
  attemptRecovery: async (errorEntry) => {
    try {
      if (errorEntry.retryAttempts >= MAX_RETRY_ATTEMPTS) {
        await errorRecoveryService.updateErrorStatus(
          errorEntry.id, 
          'failed'
        );
        
        notificationService.showLocalNotification(
          'Error Recovery Failed',
          'Please contact support for assistance.'
        );
        return;
      }

      // Increment retry attempts
      await errorRecoveryService.updateErrorStatus(
        errorEntry.id, 
        'retrying',
        errorEntry.retryAttempts + 1
      );

      // Attempt recovery based on context
      switch (errorEntry.context.type) {
        case 'SYNC':
          await offlineHandler.startSync();
          break;
        case 'DATA_UPLOAD':
          // Handle data upload recovery
          break;
        // Add more recovery scenarios
      }

      // Mark as resolved if successful
      await errorRecoveryService.updateErrorStatus(
        errorEntry.id, 
        'resolved'
      );
    } catch (error) {
      console.error('Recovery attempt failed:', error);
      
      // Schedule next retry with exponential backoff
      const delay = Math.pow(2, errorEntry.retryAttempts) * 1000;
      setTimeout(() => {
        errorRecoveryService.attemptRecovery(errorEntry);
      }, delay);
    }
  },

  // Update error status
  updateErrorStatus: async (errorId, status, retryAttempts) => {
    try {
      const errorLog = await errorRecoveryService.init();
      const index = errorLog.findIndex(item => item.id === errorId);
      
      if (index !== -1) {
        errorLog[index] = {
          ...errorLog[index],
          status,
          retryAttempts: retryAttempts || errorLog[index].retryAttempts,
          updatedAt: new Date().toISOString(),
        };
        
        await AsyncStorage.setItem(ERROR_LOG_KEY, JSON.stringify(errorLog));
      }
    } catch (error) {
      console.error('Update error status failed:', error);
    }
  },

  // Get error log
  getErrorLog: async () => {
    return await errorRecoveryService.init();
  },

  // Clear resolved errors
  clearResolvedErrors: async () => {
    try {
      const errorLog = await errorRecoveryService.init();
      const activeErrors = errorLog.filter(
        error => error.status !== 'resolved'
      );
      await AsyncStorage.setItem(ERROR_LOG_KEY, JSON.stringify(activeErrors));
    } catch (error) {
      console.error('Clear resolved errors failed:', error);
    }
  },
}; 