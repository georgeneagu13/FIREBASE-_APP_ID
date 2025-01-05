import AsyncStorage from '@react-native-async-storage/async-storage';

const CONFLICT_QUEUE_KEY = '@conflict_queue';

export const conflictResolutionService = {
  // Initialize conflict resolution
  init: async () => {
    try {
      const queue = await AsyncStorage.getItem(CONFLICT_QUEUE_KEY);
      return queue ? JSON.parse(queue) : [];
    } catch (error) {
      console.error('Conflict resolution init error:', error);
      return [];
    }
  },

  // Add conflict to queue
  addConflict: async (conflict) => {
    try {
      const queue = await conflictResolutionService.init();
      queue.push({
        id: Date.now().toString(),
        ...conflict,
        status: 'pending',
        timestamp: new Date().toISOString(),
      });
      await AsyncStorage.setItem(CONFLICT_QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('Add conflict error:', error);
    }
  },

  // Resolve conflict
  resolveConflict: async (conflictId, resolution) => {
    try {
      const queue = await conflictResolutionService.init();
      const index = queue.findIndex(item => item.id === conflictId);
      
      if (index !== -1) {
        queue[index] = {
          ...queue[index],
          status: 'resolved',
          resolution,
          resolvedAt: new Date().toISOString(),
        };
        
        await AsyncStorage.setItem(CONFLICT_QUEUE_KEY, JSON.stringify(queue));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Resolve conflict error:', error);
      return false;
    }
  },

  // Get pending conflicts
  getPendingConflicts: async () => {
    try {
      const queue = await conflictResolutionService.init();
      return queue.filter(item => item.status === 'pending');
    } catch (error) {
      console.error('Get pending conflicts error:', error);
      return [];
    }
  },
}; 