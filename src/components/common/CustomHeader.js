import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';

const CustomHeader = ({ 
  title, 
  subtitle,
  leftAction,
  rightAction,
  showProfile = true 
}) => {
  return (
    <View style={styles.header}>
      <View style={styles.leftContainer}>
        {leftAction && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={leftAction.onPress}
          >
            <Image 
              source={leftAction.icon} 
              style={styles.actionIcon}
            />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && (
          <Text style={styles.subtitle}>{subtitle}</Text>
        )}
      </View>

      <View style={styles.rightContainer}>
        {rightAction && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={rightAction.onPress}
          >
            <Image 
              source={rightAction.icon} 
              style={styles.actionIcon}
            />
          </TouchableOpacity>
        )}
        {showProfile && (
          <TouchableOpacity style={styles.profileButton}>
            <Image 
              source={require('../../assets/icons/profile.png')}
              style={styles.profileIcon}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding,
    backgroundColor: COLORS.primary,
  },
  leftContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 2,
    alignItems: 'center',
  },
  rightContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  title: {
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  subtitle: {
    fontSize: SIZES.font,
    color: COLORS.white,
    opacity: 0.8,
  },
  actionButton: {
    padding: SIZES.base,
  },
  actionIcon: {
    width: 24,
    height: 24,
    tintColor: COLORS.white,
  },
  profileButton: {
    marginLeft: SIZES.base,
    padding: SIZES.base,
  },
  profileIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
});

export default CustomHeader; 