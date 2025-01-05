import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import errorTrackingService from '../services/errorTrackingService';
import { useTheme } from '../context/ThemeContext';
import { SIZES, SHADOWS } from '../constants/theme';
import Icon from '../components/common/Icon';

const ErrorReporting = () => {
  const { colors } = useTheme();
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedError, setSelectedError] = useState(null);

  useEffect(() => {
    loadErrors();
  }, []);

  const loadErrors = async () => {
    setLoading(true);
    try {
      const errorList = await errorTrackingService.getRecentErrors();
      setErrors(errorList);
    } catch (error) {
      console.error('Failed to load errors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleErrorPress = (error) => {
    setSelectedError(error);
  };

  const handleResolve = async (errorId) => {
    try {
      await errorTrackingService.resolveError(errorId);
      setErrors(errors.filter(e => e.id !== errorId));
      setSelectedError(null);
    } catch (error) {
      console.error('Failed to resolve error:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadErrors}
            tintColor={colors.primary}
          />
        }
      >
        {errors.map(error => (
          <ErrorCard
            key={error.id}
            error={error}
            colors={colors}
            onPress={() => handleErrorPress(error)}
            selected={selectedError?.id === error.id}
          />
        ))}
      </ScrollView>

      {selectedError && (
        <ErrorDetails
          error={selectedError}
          colors={colors}
          onClose={() => setSelectedError(null)}
          onResolve={() => handleResolve(selectedError.id)}
        />
      )}
    </View>
  );
};

const ErrorCard = ({ error, colors, onPress, selected }) => (
  <TouchableOpacity
    style={[
      styles.card,
      {
        backgroundColor: colors.card,
        borderColor: selected ? colors.primary : colors.border,
      },
    ]}
    onPress={onPress}
  >
    <View style={styles.errorHeader}>
      <Text style={[styles.errorType, { color: colors.error }]}>
        {error.type}
      </Text>
      <Text style={[styles.errorTime, { color: colors.textSecondary }]}>
        {new Date(error.timestamp).toLocaleString()}
      </Text>
    </View>

    <Text style={[styles.errorMessage, { color: colors.text }]}>
      {error.message}
    </Text>

    <View style={styles.errorFooter}>
      <Text style={[styles.errorCount, { color: colors.textSecondary }]}>
        {error.count} occurrences
      </Text>
      <Text style={[styles.errorDevice, { color: colors.textSecondary }]}>
        {error.device}
      </Text>
    </View>
  </TouchableOpacity>
);

const ErrorDetails = ({ error, colors, onClose, onResolve }) => (
  <View style={[styles.detailsContainer, { backgroundColor: colors.card }]}>
    <View style={styles.detailsHeader}>
      <TouchableOpacity onPress={onClose}>
        <Icon name="close" size={24} color={colors.text} />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.resolveButton, { backgroundColor: colors.primary }]}
        onPress={onResolve}
      >
        <Text style={[styles.resolveText, { color: colors.card }]}>
          Resolve
        </Text>
      </TouchableOpacity>
    </View>

    <ScrollView style={styles.detailsContent}>
      <Text style={[styles.detailsTitle, { color: colors.text }]}>
        Error Details
      </Text>

      <DetailItem
        label="Type"
        value={error.type}
        colors={colors}
      />
      <DetailItem
        label="Message"
        value={error.message}
        colors={colors}
      />
      <DetailItem
        label="Stack Trace"
        value={error.stackTrace}
        colors={colors}
        monospace
      />
      <DetailItem
        label="Device Info"
        value={JSON.stringify(error.deviceInfo, null, 2)}
        colors={colors}
        monospace
      />
    </ScrollView>
  </View>
);

const DetailItem = ({ label, value, colors, monospace }) => (
  <View style={styles.detailItem}>
    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
      {label}
    </Text>
    <Text
      style={[
        styles.detailValue,
        { color: colors.text },
        monospace && styles.monospace,
      ]}
    >
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  // ... (styles implementation)
});

export default ErrorReporting; 