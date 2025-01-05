import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  StyleSheet,
  Platform,
  Animated,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { useTheme } from '../context/ThemeContext';
import Icon from '../components/common/Icon';
import AnimatedCard from '../components/common/AnimatedCard';
import { SIZES, SHADOWS } from '../constants/theme';

const About = ({ navigation }) => {
  const { colors } = useTheme();
  const [appInfo, setAppInfo] = useState({
    version: DeviceInfo.getVersion(),
    buildNumber: DeviceInfo.getBuildNumber(),
    bundleId: DeviceInfo.getBundleId(),
  });
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const easterEggAnimation = new Animated.Value(0);

  const teamMembers = [
    {
      name: 'John Doe',
      role: 'Lead Developer',
      avatar: require('../assets/images/team/john.png'),
    },
    {
      name: 'Jane Smith',
      role: 'UI/UX Designer',
      avatar: require('../assets/images/team/jane.png'),
    },
    // Add more team members as needed
  ];

  const socialLinks = [
    {
      icon: 'github',
      url: 'https://github.com/yourusername',
    },
    {
      icon: 'twitter',
      url: 'https://twitter.com/yourusername',
    },
    {
      icon: 'linkedin',
      url: 'https://linkedin.com/in/yourusername',
    },
  ];

  const handleLogoPress = () => {
    let pressCount = 0;
    const timer = setTimeout(() => {
      pressCount = 0;
    }, 2000);

    pressCount++;
    if (pressCount === 5) {
      clearTimeout(timer);
      setShowEasterEgg(true);
      Animated.sequence([
        Animated.spring(easterEggAnimation, {
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(easterEggAnimation, {
          toValue: 0,
          duration: 1000,
          delay: 2000,
          useNativeDriver: true,
        }),
      ]).start(() => setShowEasterEgg(false));
    }
  };

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: colors.primary }]}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="chevronLeft" size={24} color={colors.card} />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, { color: colors.card }]}>
        About
      </Text>
    </View>
  );

  const renderAppInfo = () => (
    <AnimatedCard style={styles.section}>
      <TouchableOpacity
        style={styles.logoContainer}
        onPress={handleLogoPress}
        activeOpacity={0.8}
      >
        <Image
          source={require('../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        {showEasterEgg && (
          <Animated.View
            style={[
              styles.easterEgg,
              {
                opacity: easterEggAnimation,
                transform: [{
                  scale: easterEggAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1],
                  }),
                }],
              },
            ]}
          >
            <Text style={[styles.easterEggText, { color: colors.primary }]}>
              🎉 You found the easter egg! 🎉
            </Text>
          </Animated.View>
        )}
      </TouchableOpacity>

      <Text style={[styles.appName, { color: colors.text }]}>
        Automation Simulator
      </Text>
      <Text style={[styles.appVersion, { color: colors.textSecondary }]}>
        Version {appInfo.version} ({appInfo.buildNumber})
      </Text>
      <Text style={[styles.copyright, { color: colors.textSecondary }]}>
        © 2024 Your Company. All rights reserved.
      </Text>
    </AnimatedCard>
  );

  const renderTeam = () => (
    <AnimatedCard style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Our Team
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.teamContainer}
      >
        {teamMembers.map((member, index) => (
          <View
            key={index}
            style={[styles.teamMember, { backgroundColor: colors.card }]}
          >
            <Image
              source={member.avatar}
              style={styles.teamAvatar}
            />
            <Text style={[styles.teamName, { color: colors.text }]}>
              {member.name}
            </Text>
            <Text style={[styles.teamRole, { color: colors.textSecondary }]}>
              {member.role}
            </Text>
          </View>
        ))}
      </ScrollView>
    </AnimatedCard>
  );

  const renderSocialLinks = () => (
    <AnimatedCard style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Connect With Us
      </Text>
      <View style={styles.socialContainer}>
        {socialLinks.map((link, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.socialButton, { backgroundColor: colors.primary }]}
            onPress={() => Linking.openURL(link.url)}
          >
            <Icon name={link.icon} size={24} color={colors.card} />
          </TouchableOpacity>
        ))}
      </View>
    </AnimatedCard>
  );

  const renderAdditionalInfo = () => (
    <AnimatedCard style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Additional Information
      </Text>
      <TouchableOpacity
        style={styles.infoItem}
        onPress={() => Linking.openURL('https://yourapp.com/privacy')}
      >
        <Text style={[styles.infoText, { color: colors.text }]}>
          Privacy Policy
        </Text>
        <Icon name="chevronRight" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.infoItem}
        onPress={() => Linking.openURL('https://yourapp.com/terms')}
      >
        <Text style={[styles.infoText, { color: colors.text }]}>
          Terms of Service
        </Text>
        <Icon name="chevronRight" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.infoItem}
        onPress={() => Linking.openURL('https://yourapp.com/licenses')}
      >
        <Text style={[styles.infoText, { color: colors.text }]}>
          Open Source Licenses
        </Text>
        <Icon name="chevronRight" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    </AnimatedCard>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {renderHeader()}
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {renderAppInfo()}
        {renderTeam()}
        {renderSocialLinks()}
        {renderAdditionalInfo()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: SIZES.padding,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.dark,
  },
  backButton: {
    marginRight: SIZES.padding,
  },
  headerTitle: {
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
  },
  content: {
    padding: SIZES.padding,
  },
  section: {
    marginBottom: SIZES.padding,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SIZES.padding,
  },
  logo: {
    width: 120,
    height: 120,
  },
  easterEgg: {
    position: 'absolute',
    top: -30,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    ...SHADOWS.medium,
  },
  easterEggText: {
    fontSize: SIZES.font,
    fontWeight: 'bold',
  },
  appName: {
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SIZES.base,
  },
  appVersion: {
    fontSize: SIZES.font,
    textAlign: 'center',
    marginBottom: SIZES.padding,
  },
  copyright: {
    fontSize: SIZES.small,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    marginBottom: SIZES.padding,
  },
  teamContainer: {
    paddingBottom: SIZES.padding,
  },
  teamMember: {
    alignItems: 'center',
    padding: SIZES.padding,
    marginRight: SIZES.padding,
    borderRadius: SIZES.radius,
    width: 150,
    ...SHADOWS.medium,
  },
  teamAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: SIZES.base,
  },
  teamName: {
    fontSize: SIZES.font,
    fontWeight: '600',
    marginBottom: SIZES.base / 2,
  },
  teamRole: {
    fontSize: SIZES.small,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SIZES.padding,
  },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.medium,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.padding,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  infoText: {
    fontSize: SIZES.font,
  },
});

export default About; 