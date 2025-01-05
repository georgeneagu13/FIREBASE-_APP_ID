import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import { COLORS, SIZES } from '../constants/theme';
import { authService } from '../services/authService';
import { storageService } from '../services/storageService';
import { exportService } from '../services/exportService';
import LoadingOverlay from '../components/LoadingOverlay';

const ProfileManagementScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
      
      // Load user stats
      const history = await storageService.getFoodHistory();
      setStats({
        totalScans: history.length,
        lastScan: history[0]?.timestamp,
        favoriteFood: calculateFavoriteFood(history),
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const calculateFavoriteFood = (history) => {
    // Calculate most scanned food
    const foodCounts = {};
    history.forEach(item => {
      item.results.forEach(result => {
        foodCounts[result.name] = (foodCounts[result.name] || 0) + 1;
      });
    });
    
    return Object.entries(foodCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';
  };

  const handleExportData = async () => {
    try {
      setLoading(true);
      await exportService.shareExport();
    } catch (error) {
      Alert.alert('Error', 'Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await authService.signOut();
              navigation.replace('Auth');
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return <LoadingOverlay message="Loading profile..." />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
          style={styles.avatar}
          source={{ uri: user?.photoURL || 'https://via.placeholder.com/150' }}
        />
        <Text style={styles.name}>{user?.displayName || 'User'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Your Stats</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats?.totalScans || 0}</Text>
            <Text style={styles.statLabel}>Total Scans</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats?.favoriteFood}</Text>
            <Text style={styles.statLabel}>Favorite Food</Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleExportData}
        >
          <Text style={styles.actionButtonText}>Export Data</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.signOutButton]}
          onPress={handleSignOut}
        >
          <Text style={styles.actionButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    alignItems: 'center',
    padding: SIZES.medium,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: SIZES.medium,
  },
  name: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    marginBottom: SIZES.small,
  },
  email: {
    fontSize: SIZES.font,
    color: COLORS.gray,
  },
  statsContainer: {
    padding: SIZES.medium,
  },
  sectionTitle: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    marginBottom: SIZES.medium,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: SIZES.small,
    color: COLORS.gray,
  },
  actions: {
    padding: SIZES.medium,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    padding: SIZES.medium,
    borderRadius: 8,
    marginBottom: SIZES.medium,
  },
  signOutButton: {
    backgroundColor: COLORS.error,
  },
  actionButtonText: {
    color: COLORS.white,
    textAlign: 'center',
    fontSize: SIZES.medium,
    fontWeight: '600',
  },
});

export default ProfileManagementScreen; 