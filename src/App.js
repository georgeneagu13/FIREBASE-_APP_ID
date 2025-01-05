import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import RootNavigator from './navigation/RootNavigator';
import { analyticsService } from './services/analyticsService';
import { errorReportingService } from './services/errorReportingService';
import { backgroundTaskService } from './services/backgroundTaskService';
import { offlineHandler } from './services/offlineHandler';
import { conflictResolutionService } from './services/conflictResolutionService';
import ErrorBoundary from './components/ErrorBoundary';
import { COLORS } from './constants/theme';
import { enableScreens } from 'react-native-screens';

// Enable react-native-screens for better performance
enableScreens();

const App = () => {
  useEffect(() => {
    initializeServices();
  }, []);

  const initializeServices = async () => {
    try {
      // Initialize all services
      await Promise.all([
        analyticsService.init(),
        errorReportingService.init(),
        backgroundTaskService.init(),
        offlineHandler.init(),
        conflictResolutionService.init(),
      ]);

      // Track app start
      analyticsService.logEvent('app_start');
    } catch (error) {
      errorReportingService.captureError(error, {
        context: 'App initialization'
      });
    }
  };

  return (
    <ErrorBoundary componentName="App">
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      <RootNavigator />
    </ErrorBoundary>
  );
};

export default App; 