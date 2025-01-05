import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Icon from '../components/common/Icon';
import AnimationSystem from '../utils/AnimationSystem';
import { SIZES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const onboardingData = [
  {
    id: '1',
    title: 'Welcome to Automation Simulator',
    description: 'Test and monitor your automation workflows with ease',
    icon: 'home',
  },
  {
    id: '2',
    title: 'Create Custom Rules',
    description: 'Build and test automation rules with our intuitive builder',
    icon: 'rules',
  },
  {
    id: '3',
    title: 'Real-time Analytics',
    description: 'Monitor performance and get insights into your automations',
    icon: 'analytics',
  },
  {
    id: '4',
    title: 'Ready to Start?',
    description: 'Begin your automation journey now',
    icon: 'play',
  },
];

const Onboarding = ({ navigation }) => {
  const { colors } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const slideAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnimation = useRef(new Animated.Value(1)).current;
  const flatListRef = useRef(null);

  const renderItem = ({ item, index }) => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];

    const scale = slideAnimation.interpolate({
      inputRange,
      outputRange: [0.8, 1, 0.8],
    });

    return (
      <Animated.View
        style={[
          styles.slide,
          {
            backgroundColor: colors.card,
            transform: [{ scale }],
          },
        ]}
      >
        <Icon
          name={item.icon}
          size={100}
          color={colors.primary}
          containerStyle={styles.iconContainer}
        />
        <Text style={[styles.title, { color: colors.text }]}>
          {item.title}
        </Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {item.description}
        </Text>
      </Animated.View>
    );
  };

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      completeOnboarding();
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
      navigation.replace('Main');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  };

  const renderDots = () => {
    return (
      <View style={styles.pagination}>
        {onboardingData.map((_, index) => {
          const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
          ];

          const dotWidth = slideAnimation.interpolate({
            inputRange,
            outputRange: [8, 20, 8],
            extrapolate: 'clamp',
          });

          const opacity = slideAnimation.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                {
                  width: dotWidth,
                  opacity,
                  backgroundColor: colors.primary,
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: slideAnimation } } }],
          { useNativeDriver: true }
        )}
        onMomentumScrollEnd={(event) => {
          const newIndex = Math.round(
            event.nativeEvent.contentOffset.x / width
          );
          setCurrentIndex(newIndex);
        }}
        keyExtractor={(item) => item.id}
      />

      {renderDots()}

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={handleNext}
        >
          <Text style={[styles.buttonText, { color: colors.card }]}>
            {currentIndex === onboardingData.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <Icon
            name="chevronRight"
            size={20}
            color={colors.card}
            containerStyle={styles.buttonIcon}
          />
        </TouchableOpacity>

        {currentIndex < onboardingData.length - 1 && (
          <TouchableOpacity
            style={styles.skipButton}
            onPress={completeOnboarding}
          >
            <Text style={[styles.skipText, { color: colors.textSecondary }]}>
              Skip
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    width,
    height,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.padding * 2,
  },
  iconContainer: {
    marginBottom: SIZES.padding * 2,
  },
  title: {
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SIZES.padding,
  },
  description: {
    fontSize: SIZES.font,
    textAlign: 'center',
    paddingHorizontal: SIZES.padding,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 150,
    width: '100%',
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    paddingHorizontal: SIZES.padding * 2,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
  },
  buttonText: {
    fontSize: SIZES.font,
    fontWeight: 'bold',
  },
  buttonIcon: {
    marginLeft: SIZES.base,
  },
  skipButton: {
    alignItems: 'center',
    marginTop: SIZES.padding,
  },
  skipText: {
    fontSize: SIZES.font,
  },
});

export default Onboarding; 