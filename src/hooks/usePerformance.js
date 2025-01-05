import { useEffect, useCallback, useRef } from 'react';
import performanceService from '../services/performanceService';

export const usePerformance = (componentName, options = {}) => {
  const {
    trackMount = true,
    trackUpdates = false,
    trackNetwork = true,
    trackInteractions = true,
  } = options;

  const mountTime = useRef(Date.now());
  const updateCount = useRef(0);
  const networkRequests = useRef(new Map());

  useEffect(() => {
    if (trackMount) {
      const trace = performanceService.startTrace(`${componentName}_mount`);
      
      return () => {
        const mountDuration = Date.now() - mountTime.current;
        performanceService.stopTrace(`${componentName}_mount`, {
          duration: mountDuration,
          updateCount: updateCount.current,
        });
      };
    }
  }, [componentName, trackMount]);

  useEffect(() => {
    if (trackUpdates) {
      updateCount.current++;
      performanceService.logPerformanceMetrics(`${componentName}_update`, {
        updateCount: updateCount.current,
        timestamp: Date.now(),
      });
    }
  });

  const trackNetworkRequest = useCallback(async (url, method = 'GET') => {
    if (!trackNetwork) return null;

    const requestId = `${method}_${url}_${Date.now()}`;
    const metric = await performanceService.measureNetworkRequest(url, method);
    
    if (metric) {
      networkRequests.current.set(requestId, metric);
    }

    return {
      stop: async (response) => {
        const metric = networkRequests.current.get(requestId);
        if (!metric) return;

        metric.setHttpResponseCode(response?.status);
        metric.setResponseContentType(response?.headers?.['content-type']);
        metric.setResponsePayloadSize(response?.data?.length || 0);
        
        await metric.stop();
        networkRequests.current.delete(requestId);
      },
    };
  }, [componentName, trackNetwork]);

  const trackInteraction = useCallback(async (interactionName, callback) => {
    if (!trackInteractions) return callback();

    const traceName = `${componentName}_${interactionName}`;
    const trace = await performanceService.startTrace(traceName);
    
    try {
      const result = await callback();
      await performanceService.stopTrace(traceName, {
        success: true,
        timestamp: Date.now(),
      });
      return result;
    } catch (error) {
      await performanceService.stopTrace(traceName, {
        success: false,
        error: error.message,
      });
      throw error;
    }
  }, [componentName, trackInteractions]);

  return {
    trackNetworkRequest,
    trackInteraction,
  };
}; 