import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import errorTrackingService from '../../services/errorTrackingService';
import analyticsService from '../../services/analyticsService';
import { useTheme } from '../../context/ThemeContext';
import { SIZES, SHADOWS } from '../../constants/theme';

class EnhancedErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });

    // Track error
    errorTrackingService.captureError(error, {
      componentStack: errorInfo.componentStack,
      ...this.props.errorContext,
    });

    // Log to analytics
    analyticsService.trackError(error, {
      type: 'react_error_boundary',
      component: this.props.componentName,
      ...this.props.errorContext,
    });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    analyticsService.trackEvent('error_boundary_retry', {
      component: this.props.componentName,
    });
  };

  handleReport = () => {
    const { error, errorInfo } = this.state;
    
    // Send additional error report
    errorTrackingService.captureError(error, {
      componentStack: errorInfo.componentStack,
      userTriggered: true,
      ...this.props.errorContext,
    });

    analyticsService.trackEvent('error_report_submitted', {
      component: this.props.componentName,
    });
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback, componentName } = this.props;

    if (!hasError) return children;

    if (fallback) {
      return fallback({
        error,
        errorInfo,
        reset: this.handleRetry,
        report: this.handleReport,
      });
    }

    return (
      <DefaultErrorUI
        error={error}
        errorInfo={errorInfo}
        componentName={componentName}
        onRetry={this.handleRetry}
        onReport={this.handleReport}
      />
    );
  }
}

const DefaultErrorUI = ({
  error,
  errorInfo,
  componentName,
  onRetry,
  onReport,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          Oops! Something went wrong
        </Text>
        
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {componentName && `Error in ${componentName}`}
        </Text>

        <ScrollView style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.error }]}>
            {error?.message || 'An unexpected error occurred'}
          </Text>
          
          {__DEV__ && errorInfo && (
            <Text style={[styles.stackTrace, { color: colors.textSecondary }]}>
              {errorInfo.componentStack}
            </Text>
          )}
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={onRetry}
          >
            <Text style={[styles.buttonText, { color: colors.card }]}>
              Try Again
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.card }]}
            onPress={onReport}
          >
            <Text style={[styles.buttonText, { color: colors.primary }]}>
              Report Issue
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: SIZES.padding,
  },
  card: {
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    ...SHADOWS.medium,
  },
  title: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    marginBottom: SIZES.base,
  },
  subtitle: {
    fontSize: SIZES.font,
    marginBottom: SIZES.padding,
  },
  errorContainer: {
    maxHeight: 200,
    marginBottom: SIZES.padding,
  },
  errorText: {
    fontSize: SIZES.font,
    marginBottom: SIZES.base,
  },
  stackTrace: {
    fontSize: SIZES.small,
    fontFamily: 'monospace',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    marginHorizontal: SIZES.base,
  },
  buttonText: {
    fontSize: SIZES.font,
    fontWeight: '600',
  },
});

export default EnhancedErrorBoundary; 