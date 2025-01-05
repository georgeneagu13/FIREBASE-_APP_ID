import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Icon from '../components/common/Icon';
import AnimatedCard from '../components/common/AnimatedCard';
import { SIZES, SHADOWS } from '../constants/theme';
import { chatService } from '../services/chatService';

const Message = ({ message, isUser, colors }) => (
  <View style={[
    styles.messageContainer,
    isUser ? styles.userMessage : styles.agentMessage,
  ]}>
    <View style={[
      styles.messageBubble,
      {
        backgroundColor: isUser ? colors.primary : colors.card,
      },
    ]}>
      <Text style={[
        styles.messageText,
        { color: isUser ? colors.card : colors.text },
      ]}>
        {message.text}
      </Text>
      <Text style={[
        styles.messageTime,
        { color: isUser ? colors.card : colors.textSecondary },
      ]}>
        {new Date(message.timestamp).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Text>
    </View>
  </View>
);

const TypingIndicator = ({ colors }) => (
  <View style={[styles.typingIndicator, { backgroundColor: colors.card }]}>
    <View style={styles.typingDots}>
      <View style={[styles.dot, { backgroundColor: colors.primary }]} />
      <View style={[styles.dot, { backgroundColor: colors.primary }]} />
      <View style={[styles.dot, { backgroundColor: colors.primary }]} />
    </View>
    <Text style={[styles.typingText, { color: colors.textSecondary }]}>
      Agent is typing...
    </Text>
  </View>
);

const LiveChat = ({ navigation }) => {
  const { colors } = useTheme();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const flatListRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    connectToChat();
    return () => {
      disconnectFromChat();
    };
  }, []);

  const connectToChat = async () => {
    try {
      await chatService.connect();
      setIsConnected(true);
      loadChatHistory();
      
      chatService.onMessage((message) => {
        setMessages(prev => [...prev, message]);
      });

      chatService.onTypingStatus((status) => {
        setIsAgentTyping(status.isTyping);
      });

      chatService.onConnectionStatus((status) => {
        setIsConnected(status.connected);
      });
    } catch (error) {
      console.error('Chat connection error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadChatHistory = async () => {
    try {
      const history = await chatService.getChatHistory();
      setMessages(history);
    } catch (error) {
      console.error('Load chat history error:', error);
    }
  };

  const disconnectFromChat = () => {
    chatService.disconnect();
  };

  const handleSend = async () => {
    if (!inputText.trim() || !isConnected) return;

    const message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      timestamp: new Date().toISOString(),
      isUser: true,
    };

    setMessages(prev => [...prev, message]);
    setInputText('');

    try {
      await chatService.sendMessage(message);
    } catch (error) {
      console.error('Send message error:', error);
      // Handle error (e.g., show retry button)
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
      
      <View style={styles.headerInfo}>
        <Text style={[styles.headerTitle, { color: colors.card }]}>
          Live Support
        </Text>
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusDot,
            { backgroundColor: isConnected ? colors.success : colors.error },
          ]} />
          <Text style={[styles.statusText, { color: colors.card }]}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderMessage = ({ item }) => (
    <Message
      message={item}
      isUser={item.isUser}
      colors={colors}
    />
  );

  const renderInputBar = () => (
    <View style={[styles.inputBar, { backgroundColor: colors.card }]}>
      <TextInput
        style={[styles.input, { color: colors.text }]}
        placeholder="Type your message..."
        placeholderTextColor={colors.textSecondary}
        value={inputText}
        onChangeText={setInputText}
        multiline
        maxLength={500}
      />
      <TouchableOpacity
        style={[
          styles.sendButton,
          {
            backgroundColor: colors.primary,
            opacity: !inputText.trim() || !isConnected ? 0.5 : 1,
          },
        ]}
        onPress={handleSend}
        disabled={!inputText.trim() || !isConnected}
      >
        <Icon name="send" size={20} color={colors.card} />
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {renderHeader()}

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        onLayout={() => flatListRef.current?.scrollToEnd()}
      />

      {isAgentTyping && <TypingIndicator colors={colors} />}
      {renderInputBar()}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.padding,
    ...SHADOWS.dark,
  },
  backButton: {
    marginRight: SIZES.padding,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SIZES.base,
  },
  statusText: {
    fontSize: SIZES.small,
  },
  messagesList: {
    padding: SIZES.padding,
  },
  messageContainer: {
    marginBottom: SIZES.padding,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  agentMessage: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    ...SHADOWS.light,
  },
  messageText: {
    fontSize: SIZES.font,
    marginBottom: 4,
  },
  messageTime: {
    fontSize: SIZES.small,
    alignSelf: 'flex-end',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.padding,
    marginHorizontal: SIZES.padding,
    marginBottom: SIZES.padding,
    borderRadius: SIZES.radius,
    ...SHADOWS.light,
  },
  typingDots: {
    flexDirection: 'row',
    marginRight: SIZES.base,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
    opacity: 0.7,
  },
  typingText: {
    fontSize: SIZES.small,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.padding,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1,
    marginRight: SIZES.padding,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    maxHeight: 100,
    fontSize: SIZES.font,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.light,
  },
});

export default LiveChat; 