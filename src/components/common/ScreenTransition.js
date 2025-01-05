import React, { useEffect } from 'react';
import { Animated, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const ScreenTransition = ({
  children,
  type = 'fade', // fade, slide, scale
  direction = 'right', // right, left, up, down
  duration = 300,
  style,
}) => {
  const animatedValue = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration,
      useNativeDriver: true,
    }).start();
  }, []);

  const getTransitionStyle = () => {
    switch (type) {
      case 'slide':
        const translate = direction === 'right' || direction === 'left'
          ? 'translateX'
          : 'translateY';
        
        const outputRange = {
          right: [-width, 0],
          left: [width, 0],
          up: [height, 0],
          down: [-height, 0],
        };

        return {
          transform: [{
            [translate]: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: outputRange[direction],
            }),
          }],
        };

      case 'scale':
        return {
          opacity: animatedValue,
          transform: [{
            scale: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [0.3, 1],
            }),
          }],
        };

      default: // fade
        return {
          opacity: animatedValue,
        };
    }
  };

  return (
    <Animated.View style={[styles.container, getTransitionStyle(), style]}>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ScreenTransition; 