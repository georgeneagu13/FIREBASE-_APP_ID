import { useEffect, useCallback, useRef } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import analyticsService from '../services/analyticsService';

export const useAnalytics = (screenName, options = {}) => {
  const {
    trackScreenView = true,
    trackUserActions = true,
    trackErrors = true,
  } = options;

  const navigation = useNavigation();
  const route = useRoute();
  const screenStartTime = useRef(Date.now());

  useEffect(() => {
    if (trackScreenView) {
      analyticsService.trackScreen(screenName, {
        ...route.params,
        previous_screen: route.params?.previousScreen,
      });
    }

    return () => {
      const screenTime = Date.now() - screenStartTime.current;
      analyticsService.logEvent('screen_exit', {
        screen_name: screenName,
        time_spent: screenTime,
      });
    };
  }, [screenName, route.params, trackScreenView]);

  const trackEvent = useCallback((eventName, params = {}) => {
    analyticsService.logEvent(eventName, {
      screen_name: screenName,
      ...params,
    });
  }, [screenName]);

  const trackAction = useCallback((action, params = {}) => {
    if (trackUserActions) {
      analyticsService.trackUserAction(action, screenName, params);
    }
  }, [screenName, trackUserActions]);

  const trackError = useCallback((error, context = {}) => {
    if (trackErrors) {
      analyticsService.trackError(error, {
        screen_name: screenName,
        ...context,
      });
    }
  }, [screenName, trackErrors]);

  return {
    trackEvent,
    trackAction,
    trackError,
  };
}; 