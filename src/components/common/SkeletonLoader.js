import React, { useEffect } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';

const { width } = Dimensions.get('window');

const SkeletonLoader = ({ 
  width: itemWidth = '100%',
  height = 20,
  style,
  variant = 'rectangle' // rectangle, circle, card
}) => {
  const animatedValue = new Animated.Value(0);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const getVariantStyle = () => {
    switch (variant) {
      case 'circle':
        return {
          width: height,
          height: height,
          borderRadius: height / 2,
        };
      case 'card':
        return {
          width: itemWidth,
          height: height,
          borderRadius: SIZES.radius,
          padding: SIZES.padding,
          ...styles.card,
        };
      default:
        return {
          width: itemWidth,
          height: height,
          borderRadius: SIZES.base,
        };
    }
  };

  return (
    <Animated.View
      style={[
        styles.skeleton,
        getVariantStyle(),
        { opacity },
        style,
      ]}
    />
  );
};

const SkeletonPlaceholder = ({ children, style }) => (
  <View style={[styles.container, style]}>
    {children}
  </View>
);

// Preset layouts
SkeletonLoader.Card = ({ style }) => (
  <SkeletonPlaceholder>
    <SkeletonLoader variant="rectangle" height={200} style={style} />
    <SkeletonLoader 
      variant="rectangle" 
      height={20} 
      width="80%" 
      style={styles.cardTitle} 
    />
    <SkeletonLoader 
      variant="rectangle" 
      height={16} 
      width="60%" 
      style={styles.cardSubtitle} 
    />
  </SkeletonPlaceholder>
);

SkeletonLoader.ListItem = ({ style }) => (
  <SkeletonPlaceholder>
    <View style={[styles.listItem, style]}>
      <SkeletonLoader variant="circle" height={40} width={40} />
      <View style={styles.listItemContent}>
        <SkeletonLoader 
          variant="rectangle" 
          height={16} 
          width="70%" 
          style={styles.listItemTitle} 
        />
        <SkeletonLoader 
          variant="rectangle" 
          height={12} 
          width="50%" 
          style={styles.listItemSubtitle} 
        />
      </View>
    </View>
  </SkeletonPlaceholder>
);

const styles = StyleSheet.create({
  container: {
    padding: SIZES.base,
  },
  skeleton: {
    backgroundColor: COLORS.lightGray,
  },
  card: {
    ...Platform.select({
      ios: {
        shadowColor: COLORS.gray,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardTitle: {
    marginTop: SIZES.padding,
    marginBottom: SIZES.base,
  },
  cardSubtitle: {
    marginBottom: SIZES.padding,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.base,
  },
  listItemContent: {
    flex: 1,
    marginLeft: SIZES.padding,
  },
  listItemTitle: {
    marginBottom: SIZES.base,
  },
  listItemSubtitle: {
    marginBottom: SIZES.base,
  },
});

export default SkeletonLoader; 