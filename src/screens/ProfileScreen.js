import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';

const ProfileScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>
      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
        </View>
        <Text style={styles.username}>User Name</Text>
      </View>
      <View style={styles.menuSection}>
        <TouchableOpacity style={styles.menuItem}>
          <Text>My Saved Foods</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text>History</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text>Settings</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    padding: SIZES.medium,
    backgroundColor: COLORS.primary,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
  },
  profileSection: {
    alignItems: 'center',
    padding: SIZES.extraLarge,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.medium,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 40,
  },
  username: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
  },
  menuSection: {
    padding: SIZES.medium,
  },
  menuItem: {
    padding: SIZES.medium,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
});

export default ProfileScreen; 