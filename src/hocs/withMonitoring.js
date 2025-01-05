import React, { useEffect } from 'react';
import { enhancedAnalytics } from '../services/enhancedAnalyticsService';
import { crashReporting } from '../services/crashReportingService';
import { performanceService } from '../services/performanceService';

export const withMonitoring = (WrappedComponent, screenName) => {
  return function MonitoredComponent(props) {
    useEffect(() => {
      const startTime = Date.now();
      let screenTrace;

      const initializeMonitoring = async () => {
        try {
          // Start performance trace
          screenTrace = await performanceService.startTrace(`screen_${screenName}`);
          
          // Log screen view
          await enhancedAnalytics.logScreenView(screenName, WrappedComponent.name);
          
          // Add breadcrumb
          await crashReporting.addBreadcrumb(
            `Navigated to ${screenName}`,
            'navigation'
          );

        } catch (error) {
          crashReporting.recordError(error, {
            context: 'screen_monitoring_initialization',
            screenName,
          });
        }
      };

      const cleanupMonitoring = async () => {
        try {
          if (screenTrace) {
            // Add metrics before stopping trace
            screenTrace.putMetric('screen_time', Date.now() - startTime);
            await screenTrace.stop();
          }

          // Log exit analytics
          await enhancedAnalytics.logEvent('screen_exit', {
            screen_name: screenName,
            duration: Date.now() - startTime,
          });

        } catch (error) {
          crashReporting.recordError(error, {
            context: 'screen_monitoring_cleanup',
            screenName,
          });
        }
      };

      initializeMonitoring();
      return cleanupMonitoring;
    }, []);

    // Wrap the component with error boundary
    return (
      <ErrorBoundary
        screenName={screenName}
        onError={(error) => {
          crashReporting.recordError(error, {
            context: 'screen_render_error',
            screenName,
          });
        }}
      >
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}; 