import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import Icon from '../common/Icon';
import AnimatedCard from '../common/AnimatedCard';
import { SIZES, SHADOWS } from '../../constants/theme';
import errorService from '../../services/errorService';

class ErrorBoundaryClass extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo,
    });
    errorService.setErrorBoundary(error, errorInfo);
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.resetError}
          colors={this.props.colors}
        />
      );
    }

    return this.props.children;
  }
}

const ErrorFallback = ({ error, errorInfo, onReset, colors }) => {
  const isDebug = __DEV__;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Icon
          name="error"
          size={64}
          color={colors.error}
          style={styles.icon}
        />

        <Text style={[styles.title, { color: colors.text }]}>
          Oops! Something went wrong
        </Text>

        <Text style={[styles.message, { color: colors.textSecondary }]}>
          We're sorry, but something unexpected happened. Please try again.
        </Text>

        {isDebug && (
          <AnimatedCard style={styles.debugInfo}>
            <Text style={[styles.debugTitle, { color: colors.text }]}>
              Debug Information
            </Text>
            
            <Text style={[styles.debugText, { color: colors.textSecondary }]}>
              Error: {error?.toString()}
            </Text>
            
            <Text style={[styles.debugText, { color: colors.textSecondary }]}>
              Stack Trace:
            </Text>
            
            <ScrollView style={styles.stackTrace}>
              <Text style={[styles.stackTraceText, { color: colors.textSecondary }]}>
                {errorInfo?.componentStack || 'No stack trace available'}
              </Text>
            </ScrollView>
          </AnimatedCard>
        )}

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={onReset}
          >
            <Icon name="refresh" size={20} color={colors.card} />
            <Text style={[styles.buttonText, { color: colors.card }]}>
              Try Again
            </Text>
          </TouchableOpacity>

          {isDebug && (
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.error }]}
              onPress={() => {
                // Force a crash for testing
                throw new Error('Forced crash for testing');
              }}
            >
              <Icon name="warning" size={20} color={colors.card} />
              <Text style={[styles.buttonText, { color: colors.card }]}>
                Test Crash
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SIZES.padding * 2,
    alignItems: 'center',
  },
  icon: {
    marginBottom: SIZES.padding * 2,
  },
  title: {
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SIZES.padding,
  },
  message: {
    fontSize: SIZES.font,
    textAlign: 'center',
    marginBottom: SIZES.padding * 2,
  },
  debugInfo: {
    width: '100%',
    padding: SIZES.padding,
    marginBottom: SIZES.padding * 2,
  },
  debugTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    marginBottom: SIZES.padding,
  },
  debugText: {
    fontSize: SIZES.font,
    marginBottom: SIZES.base,
  },
  stackTrace: {
    maxHeight: 200,
    marginTop: SIZES.base,
  },
  stackTraceText: {
    fontSize: SIZES.small,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SIZES.padding,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    ...SHADOWS.medium,
  },
  buttonText: {
    fontSize: SIZES.font,
    fontWeight: '600',
    marginLeft: SIZES.base,
  },
});

const ErrorBoundary = (props) => {
  const { colors } = useTheme();
  return <ErrorBoundaryClass {...props} colors={colors} />;
};

export default ErrorBoundary; 