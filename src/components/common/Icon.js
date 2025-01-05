import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

// Define icon paths
const ICONS = {
  // Navigation icons
  home: require('../../assets/icons/home.png'),
  analytics: require('../../assets/icons/analytics.png'),
  rules: require('../../assets/icons/rules.png'),
  settings: require('../../assets/icons/settings.png'),
  
  // Action icons
  add: require('../../assets/icons/add.png'),
  delete: require('../../assets/icons/delete.png'),
  edit: require('../../assets/icons/edit.png'),
  search: require('../../assets/icons/search.png'),
  
  // Status icons
  success: require('../../assets/icons/success.png'),
  error: require('../../assets/icons/error.png'),
  warning: require('../../assets/icons/warning.png'),
  info: require('../../assets/icons/info.png'),
  
  // Automation icons
  play: require('../../assets/icons/play.png'),
  pause: require('../../assets/icons/pause.png'),
  stop: require('../../assets/icons/stop.png'),
  refresh: require('../../assets/icons/refresh.png'),
  
  // UI icons
  chevronRight: require('../../assets/icons/chevron-right.png'),
  chevronLeft: require('../../assets/icons/chevron-left.png'),
  menu: require('../../assets/icons/menu.png'),
  close: require('../../assets/icons/close.png'),
  
  // Feature icons
  notification: require('../../assets/icons/notification.png'),
  profile: require('../../assets/icons/profile.png'),
  calendar: require('../../assets/icons/calendar.png'),
  filter: require('../../assets/icons/filter.png'),
};

const Icon = ({
  name,
  size = 24,
  color,
  style,
  containerStyle,
}) => {
  const { colors } = useTheme();
  
  if (!ICONS[name]) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  return (
    <View style={[styles.container, containerStyle]}>
      <Image
        source={ICONS[name]}
        style={[
          {
            width: size,
            height: size,
            tintColor: color || colors.text,
          },
          style,
        ]}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Icon; 