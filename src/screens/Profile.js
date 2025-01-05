import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Icon from '../components/common/Icon';
import AnimatedCard from '../components/common/AnimatedCard';
import { SIZES, SHADOWS } from '../constants/theme';
import { userProfile } from '../services/userProfileService';

const Profile = ({ navigation }) => {
  const { colors } = useTheme();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    automations: 0,
    successRate: 0,
    activeRules: 0,
  });

  useEffect(() => {
    loadProfile();
    loadStats();
  }, []);

  const loadProfile = async () => {
    try {
      const userData = await userProfile.getProfile();
      setProfile(userData);
    } catch (error) {
      console.error('Load profile error:', error);
      Alert.alert('Error', 'Failed to load profile');
    }
  };

  const loadStats = async () => {
    try {
      const userStats = await userProfile.getStats();
      setStats(userStats);
    } catch (error) {
      console.error('Load stats error:', error);
    }
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile', { profile });
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await userProfile.logout();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: colors.primary }]}>
      <View style={styles.profileHeader}>
        <Image
          source={profile?.avatar ? { uri: profile.avatar } : require('../assets/images/default-avatar.png')}
          style={styles.avatar}
        />
        <View style={styles.profileInfo}>
          <Text style={[styles.name, { color: colors.card }]}>
            {profile?.name || 'User Name'}
          </Text>
          <Text style={[styles.email, { color: colors.card }]}>
            {profile?.email || 'email@example.com'}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderStats = () => (
    <AnimatedCard style={styles.statsContainer} animation="slide">
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.primary }]}>
            {stats.automations}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Automations
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.primary }]}>
            {stats.successRate}%
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Success Rate
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.primary }]}>
            {stats.activeRules}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Active Rules
          </Text>
        </View>
      </View>
    </AnimatedCard>
  );

  const renderMenuItem = (icon, title, onPress) => (
    <TouchableOpacity
      style={[styles.menuItem, { backgroundColor: colors.card }]}
      onPress={onPress}
    >
      <View style={styles.menuItemContent}>
        <Icon name={icon} size={24} color={colors.primary} />
        <Text style={[styles.menuItemText, { color: colors.text }]}>
          {title}
        </Text>
      </View>
      <Icon name="chevronRight" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      {renderHeader()}
      
      {renderStats()}

      <View style={styles.menuSection}>
        {renderMenuItem('edit', 'Edit Profile', handleEditProfile)}
        {renderMenuItem('notification', 'Notifications', () => navigation.navigate('Notifications'))}
        {renderMenuItem('settings', 'Settings', () => navigation.navigate('Settings'))}
        {renderMenuItem('info', 'Help & Support', () => navigation.navigate('Support'))}
        {renderMenuItem('logout', 'Logout', handleLogout)}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: SIZES.padding * 2,
    borderBottomLeftRadius: SIZES.radius * 2,
    borderBottomRightRadius: SIZES.radius * 2,
    ...SHADOWS.dark,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: SIZES.padding,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
    marginBottom: SIZES.base,
  },
  email: {
    fontSize: SIZES.font,
    opacity: 0.8,
  },
  statsContainer: {
    margin: SIZES.padding,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SIZES.padding,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
    marginBottom: SIZES.base,
  },
  statLabel: {
    fontSize: SIZES.font,
  },
  menuSection: {
    padding: SIZES.padding,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.base,
    ...SHADOWS.light,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: SIZES.font,
    marginLeft: SIZES.padding,
  },
});

export default Profile; 