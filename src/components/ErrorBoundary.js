import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';
import { errorReportingService } from '../services/errorReportingService';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    errorReportingService.captureError(error, {
      componentStack: errorInfo.componentStack,
      componentName: this.props.componentName,
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  handleReport = () => {
    if (this.state.error) {
      errorReportingService.captureError(this.state.error, {
        userTriggered: true,
        componentName: this.props.componentName,
      });
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Oops! Something went wrong</Text>
          <Text style={styles.message}>
            Don't worry, we've been notified and are working on a fix.
          </Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={this.handleRetry}
            >
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.reportButton}
              onPress={this.handleReport}
            >
              <Text style={styles.buttonText}>Report Issue</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.medium,
    backgroundColor: COLORS.white,
  },
  title: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    marginBottom: SIZES.medium,
    textAlign: 'center',
  },
  message: {
    fontSize: SIZES.font,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: SIZES.extraLarge,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    padding: SIZES.medium,
    borderRadius: 8,
    marginHorizontal: SIZES.small,
  },
  reportButton: {
    backgroundColor: COLORS.secondary,
    padding: SIZES.medium,
    borderRadius: 8,
    marginHorizontal: SIZES.small,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: SIZES.font,
    fontWeight: '600',
  },
});

export default ErrorBoundary; 