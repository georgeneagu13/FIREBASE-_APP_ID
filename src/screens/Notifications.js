import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Icon from '../components/common/Icon';
import AnimatedCard from '../components/common/AnimatedCard';
import { SIZES, SHADOWS } from '../constants/theme';
import notificationService from '../services/notificationService';

const NotificationItem = ({ item, onPress, colors }) => {
  const formattedDate = new Date(item.timestamp).toLocaleDateString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });

  const getIconName = (type) => {
    switch (type) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'notification';
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case 'success':
        return colors.success;
      case 'error':
        return colors.error;
      case 'warning':
        return colors.warning;
      default:
        return colors.primary;
    }
  };

  return (
    <AnimatedCard
      animation="slide"
      style={[
        styles.notificationItem,
        {
          backgroundColor: colors.card,
          opacity: item.read ? 0.7 : 1,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.notificationContent}
        onPress={() => onPress(item)}
      >
        <View style={styles.iconContainer}>
          <Icon
            name={getIconName(item.type)}
            size={24}
            color={getIconColor(item.type)}
          />
          {!item.read && (
            <View
              style={[
                styles.unreadDot,
                { backgroundColor: colors.primary },
              ]}
            />
          )}
        </View>

        <View style={styles.textContainer}>
          <Text
            style={[
              styles.title,
              { color: colors.text },
            ]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text
            style={[
              styles.message,
              { color: colors.textSecondary },
            ]}
            numberOfLines={2}
          >
            {item.message}
          </Text>
          <Text
            style={[
              styles.timestamp,
              { color: colors.textSecondary },
            ]}
          >
            {formattedDate}
          </Text>
        </View>
      </TouchableOpacity>
    </AnimatedCard>
  );
};

const Notifications = ({ navigation }) => {
  const { colors } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    const stored = await notificationService.getStoredNotifications();
    setNotifications(stored);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleNotificationPress = async (notification) => {
    if (!notification.read) {
      await notificationService.markAsRead(notification.id);
      await loadNotifications();
    }

    // Handle navigation based on notification type
    if (notification.data?.screen) {
      navigation.navigate(notification.data.screen, notification.data.params);
    }
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to clear all notifications?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await notificationService.clearNotifications();
            setNotifications([]);
          },
        },
      ],
    );
  };

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: colors.primary }]}>
      <View style={styles.headerContent}>
        <Text style={[styles.headerTitle, { color: colors.card }]}>
          Notifications
        </Text>
        {notifications.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearAll}
          >
            <Text style={[styles.clearButtonText, { color: colors.card }]}>
              Clear All
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon
        name="notification"
        size={64}
        color={colors.textSecondary}
        style={styles.emptyIcon}
      />
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        No notifications yet
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {renderHeader()}

      <FlatList
        data={notifications}
        renderItem={({ item }) => (
          <NotificationItem
            item={item}
            onPress={handleNotificationPress}
            colors={colors}
          />
        )}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: SIZES.padding,
    ...SHADOWS.dark,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
  },
  clearButton: {
    padding: SIZES.base,
  },
  clearButtonText: {
    fontSize: SIZES.font,
    fontWeight: '500',
  },
  list: {
    padding: SIZES.padding,
  },
  notificationItem: {
    marginBottom: SIZES.padding,
    borderRadius: SIZES.radius,
    ...SHADOWS.medium,
  },
  notificationContent: {
    flexDirection: 'row',
    padding: SIZES.padding,
  },
  iconContainer: {
    marginRight: SIZES.padding,
  },
  unreadDot: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: SIZES.font,
    fontWeight: '600',
    marginBottom: 4,
  },
  message: {
    fontSize: SIZES.small,
    marginBottom: 8,
  },
  timestamp: {
    fontSize: SIZES.small,
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.padding * 4,
  },
  emptyIcon: {
    marginBottom: SIZES.padding,
  },
  emptyText: {
    fontSize: SIZES.font,
  },
});

export default Notifications; 