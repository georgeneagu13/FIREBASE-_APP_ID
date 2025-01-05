import React, { useRef } from 'react';
import {
  Animated,
  PanResponder,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { COLORS } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

const GestureHandler = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  swipeThreshold = 50,
  enableSwipe = true,
  style,
}) => {
  const pan = useRef(new Animated.ValueXY()).current;
  const scale = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => enableSwipe,
      onMoveShouldSetPanResponder: () => enableSwipe,
      
      onPanResponderGrant: () => {
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value,
        });
        pan.setValue({ x: 0, y: 0 });
        
        // Scale down slightly on touch
        Animated.spring(scale, {
          toValue: 0.95,
          useNativeDriver: true,
        }).start();
      },

      onPanResponderMove: Animated.event(
        [
          null,
          { dx: pan.x, dy: pan.y }
        ],
        { useNativeDriver: false }
      ),

      onPanResponderRelease: (_, gesture) => {
        pan.flattenOffset();

        // Reset scale
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
        }).start();

        // Handle swipes
        if (Math.abs(gesture.dx) > swipeThreshold) {
          if (gesture.dx > 0) {
            onSwipeRight && onSwipeRight();
          } else {
            onSwipeLeft && onSwipeLeft();
          }
        }

        if (Math.abs(gesture.dy) > swipeThreshold) {
          if (gesture.dy > 0) {
            onSwipeDown && onSwipeDown();
          } else {
            onSwipeUp && onSwipeUp();
          }
        }

        // Reset position with animation
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  const animatedStyle = {
    transform: [
      { translateX: pan.x },
      { translateY: pan.y },
      { scale: scale },
    ],
  };

  return (
    <Animated.View
      style={[styles.container, animatedStyle, style]}
      {...panResponder.panHandlers}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default GestureHandler; 