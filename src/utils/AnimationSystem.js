import { Animated, Easing } from 'react-native';

class AnimationSystem {
  static sequences = {
    popIn: (value, config = {}) => {
      const { duration = 300, delay = 0 } = config;
      value.setValue(0);
      
      return Animated.sequence([
        Animated.delay(delay),
        Animated.spring(value, {
          toValue: 1.1,
          useNativeDriver: true,
        }),
        Animated.spring(value, {
          toValue: 1,
          useNativeDriver: true,
        }),
      ]);
    },

    shake: (value, config = {}) => {
      const { intensity = 10, duration = 500 } = config;
      value.setValue(0);
      
      return Animated.sequence([
        Animated.timing(value, {
          toValue: intensity,
          duration: duration / 5,
          useNativeDriver: true,
        }),
        Animated.timing(value, {
          toValue: -intensity,
          duration: duration / 5,
          useNativeDriver: true,
        }),
        Animated.timing(value, {
          toValue: intensity / 2,
          duration: duration / 5,
          useNativeDriver: true,
        }),
        Animated.timing(value, {
          toValue: -intensity / 2,
          duration: duration / 5,
          useNativeDriver: true,
        }),
        Animated.timing(value, {
          toValue: 0,
          duration: duration / 5,
          useNativeDriver: true,
        }),
      ]);
    },

    pulse: (value, config = {}) => {
      const { minScale = 0.8, maxScale = 1.2, duration = 1000 } = config;
      value.setValue(1);
      
      return Animated.sequence([
        Animated.timing(value, {
          toValue: maxScale,
          duration: duration / 2,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(value, {
          toValue: minScale,
          duration: duration / 2,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ]);
    },

    slideIn: (value, config = {}) => {
      const { direction = 'right', duration = 300 } = config;
      const startValue = {
        right: 100,
        left: -100,
        up: 100,
        down: -100,
      }[direction];
      
      value.setValue(startValue);
      
      return Animated.spring(value, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 8,
      });
    },

    fadeInOut: (value, config = {}) => {
      const { duration = 1000, delay = 0 } = config;
      value.setValue(0);
      
      return Animated.sequence([
        Animated.delay(delay),
        Animated.timing(value, {
          toValue: 1,
          duration: duration / 2,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(value, {
          toValue: 0,
          duration: duration / 2,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ]);
    },
  };

  static interpolations = {
    spin: (value) => {
      return value.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
      });
    },

    bounce: (value) => {
      return value.interpolate({
        inputRange: [0, 0.2, 0.4, 0.43, 0.53, 0.7, 0.8, 0.9, 1],
        outputRange: [0, 0, -30, -30, 0, -15, 0, -4, 0],
      });
    },

    flash: (value) => {
      return value.interpolate({
        inputRange: [0, 0.25, 0.5, 0.75, 1],
        outputRange: [0, 1, 0, 1, 0],
      });
    },
  };

  static loops = {
    infinite: (animation) => {
      return Animated.loop(animation);
    },

    count: (animation, count) => {
      return Animated.loop(animation, { iterations: count });
    },
  };
}

export default AnimationSystem; 