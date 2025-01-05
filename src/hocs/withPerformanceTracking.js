import React, { useEffect } from 'react';
import { performanceService } from '../services/performanceService';

export const withPerformanceTracking = (WrappedComponent, screenName) => {
  return function PerformanceTrackedComponent(props) {
    useEffect(() => {
      const trackPerformance = async () => {
        await performanceService.trackScreenLoad(screenName);
      };

      trackPerformance();
    }, []);

    return <WrappedComponent {...props} />;
  };
}; 