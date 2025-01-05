import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  Animated 
} from 'react-native';
import { COLORS, SIZES } from '../constants/theme';

const SyncProgress = ({ progress, message, isVisible }) => {
  const [fadeAnim] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: isVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.content}>
        <ActivityIndicator color={COLORS.primary} size="small" />
        <Text style={styles.message}>{message}</Text>
        {progress !== undefined && (
          <Text style={styles.progress}>{Math.round(progress * 100)}%</Text>
        )}
      </View>
      <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.small,
  },
  message: {
    marginLeft: SIZES.small,
    fontSize: SIZES.font,
    color: COLORS.gray,
    flex: 1,
  },
  progress: {
    fontSize: SIZES.font,
    color: COLORS.primary,
    marginLeft: SIZES.small,
  },
  progressBar: {
    height: 2,
    backgroundColor: COLORS.primary,
  },
});

export default SyncProgress; 