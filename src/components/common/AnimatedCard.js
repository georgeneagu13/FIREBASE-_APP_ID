import React, { useEffect } from 'react';
import { 
  View, 
  Animated, 
  StyleSheet, 
  TouchableOpacity 
} from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

const AnimatedCard = ({ 
  children, 
  onPress, 
  style, 
  delay = 0,
  animation = 'fade' // fade, slide, scale
}) => {
  const animatedValue = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 600,
      delay,
      useNativeDriver: true,
    }).start();
  }, []);

  const getAnimationStyle = () => {
    switch (animation) {
      case 'slide':
        return {
          opacity: animatedValue,
          transform: [{
            translateY: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0],
            }),
          }],
        };
      case 'scale':
        return {
          opacity: animatedValue,
          transform: [{
            scale: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [0.8, 1],
            }),
          }],
        };
      default: // fade
        return {
          opacity: animatedValue,
        };
    }
  };

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container onPress={onPress} activeOpacity={0.8}>
      <Animated.View style={[
        styles.card,
        style,
        getAnimationStyle(),
      ]}>
        {children}
      </Animated.View>
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.padding,
    ...SHADOWS.medium,
  },
});

export default AnimatedCard; 