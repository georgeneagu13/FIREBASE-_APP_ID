import { useState, useEffect } from 'react';
import { offlineService } from '../services/offlineService';
import NetInfo from '@react-native-community/netinfo';

export const useOfflineData = (key, fetchOnlineData) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    const loadData = async () => {
      try {
        // First, try to load offline data
        const offlineData = await offlineService.getOfflineData();
        if (offlineData[key] && mounted) {
          setData(offlineData[key]);
        }

        // Check network status
        const networkState = await NetInfo.fetch();
        setIsOnline(networkState.isConnected);

        // If online, fetch fresh data
        if (networkState.isConnected) {
          const onlineData = await fetchOnlineData();
          if (mounted) {
            setData(onlineData);
            // Save for offline use
            await offlineService.saveOfflineData(key, onlineData);
          }
        }
      } catch (err) {
        if (mounted) {
          setError(err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    // Subscribe to network changes
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected);
      if (state.isConnected) {
        loadData();
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [key, fetchOnlineData]);

  return { data, loading, error, isOnline };
}; 