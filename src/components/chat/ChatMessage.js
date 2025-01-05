import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import Icon from '../common/Icon';
import { SIZES, SHADOWS } from '../../constants/theme';

const ChatMessage = ({
  message,
  isUser,
  showAvatar = true,
  onPress,
  onLongPress,
  style,
}) => {
  const { colors } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const renderAvatar = () => {
    if (!showAvatar) return null;

    return isUser ? (
      <Image
        source={{ uri: message.userAvatar }}
        style={[
          styles.avatar,
          { backgroundColor: colors.background },
        ]}
      />
    ) : (
      <View style={[
        styles.avatar,
        { backgroundColor: colors.primary },
      ]}>
        <Icon name="support" size={20} color={colors.card} />
      </View>
    );
  };

  const renderTimestamp = () => (
    <Text style={[
      styles.timestamp,
      { color: isUser ? colors.card : colors.textSecondary },
    ]}>
      {new Date(message.timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })}
    </Text>
  );

  const renderStatus = () => {
    if (!isUser) return null;

    return (
      <View style={styles.statusContainer}>
        <Icon
          name={message.status === 'sent' ? 'checkmark' : 'clock'}
          size={16}
          color={colors.card}
          style={styles.statusIcon}
        />
      </View>
    );
  };

  return (
    <Animated.View
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.agentContainer,
        { opacity: fadeAnim },
        style,
      ]}
    >
      {!isUser && renderAvatar()}
      
      <TouchableOpacity
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.agentBubble,
          {
            backgroundColor: isUser ? colors.primary : colors.card,
          },
        ]}
        onPress={onPress}
        onLongPress={onLongPress}
        activeOpacity={0.8}
      >
        <Text style={[
          styles.message,
          { color: isUser ? colors.card : colors.text },
        ]}>
          {message.text}
        </Text>
        
        {renderTimestamp()}
        {renderStatus()}
      </TouchableOpacity>
      
      {isUser && renderAvatar()}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: SIZES.base,
    paddingHorizontal: SIZES.padding,
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  agentContainer: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginHorizontal: SIZES.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    maxWidth: '70%',
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    ...SHADOWS.light,
  },
  userBubble: {
    borderTopRightRadius: 4,
  },
  agentBubble: {
    borderTopLeftRadius: 4,
  },
  message: {
    fontSize: SIZES.font,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: SIZES.small,
    alignSelf: 'flex-end',
  },
  statusContainer: {
    position: 'absolute',
    right: -20,
    bottom: 4,
  },
  statusIcon: {
    marginLeft: 4,
  },
});

export default ChatMessage; 