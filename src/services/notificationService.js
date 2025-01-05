import PushNotification from 'react-native-push-notification';
import AsyncStorage from '@react-native-async-storage/async-storage';

class NotificationService {
  constructor() {
    this.configure();
    this.lastId = 0;
  }

  configure = () => {
    PushNotification.configure({
      onRegister: function (token) {
        console.log('TOKEN:', token);
      },

      onNotification: function (notification) {
        console.log('NOTIFICATION:', notification);
      },

      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      popInitialNotification: true,
      requestPermissions: true,
    });

    PushNotification.createChannel(
      {
        channelId: 'automation-alerts',
        channelName: 'Automation Alerts',
        channelDescription: 'Notifications for automation events',
        playSound: true,
        soundName: 'default',
        importance: 4,
        vibrate: true,
      },
      (created) => console.log(`Channel created: ${created}`)
    );
  };

  scheduleNotification = async ({
    title,
    message,
    date,
    type = 'default',
    data = {},
  }) => {
    const id = this.lastId++;
    const storedNotifications = await this.getStoredNotifications();

    const notification = {
      id,
      title,
      message,
      type,
      data,
      timestamp: date.getTime(),
      read: false,
    };

    await this.storeNotification(notification);

    PushNotification.localNotificationSchedule({
      id: String(id),
      channelId: 'automation-alerts',
      title,
      message,
      date,
      userInfo: { ...data, notificationId: id },
      allowWhileIdle: true,
    });

    return id;
  };

  showNotification = async ({
    title,
    message,
    type = 'default',
    data = {},
  }) => {
    const id = this.lastId++;
    const notification = {
      id,
      title,
      message,
      type,
      data,
      timestamp: Date.now(),
      read: false,
    };

    await this.storeNotification(notification);

    PushNotification.localNotification({
      id: String(id),
      channelId: 'automation-alerts',
      title,
      message,
      userInfo: { ...data, notificationId: id },
    });

    return id;
  };

  cancelNotification = (id) => {
    PushNotification.cancelLocalNotification(String(id));
  };

  cancelAllNotifications = () => {
    PushNotification.cancelAllLocalNotifications();
  };

  getStoredNotifications = async () => {
    try {
      const notifications = await AsyncStorage.getItem('notifications');
      return notifications ? JSON.parse(notifications) : [];
    } catch (error) {
      console.error('Error getting stored notifications:', error);
      return [];
    }
  };

  storeNotification = async (notification) => {
    try {
      const notifications = await this.getStoredNotifications();
      notifications.unshift(notification);
      await AsyncStorage.setItem('notifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('Error storing notification:', error);
    }
  };

  markAsRead = async (id) => {
    try {
      const notifications = await this.getStoredNotifications();
      const updatedNotifications = notifications.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      );
      await AsyncStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  clearNotifications = async () => {
    try {
      await AsyncStorage.setItem('notifications', JSON.stringify([]));
      this.cancelAllNotifications();
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };
}

export default new NotificationService(); 