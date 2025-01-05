import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';
import errorService from './errorService';

class ChatService {
  constructor() {
    this.socket = null;
    this.messageHandlers = new Set();
    this.typingHandlers = new Set();
    this.connectionHandlers = new Set();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // Start with 1 second
  }

  async connect() {
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      this.socket = io(`${API_URL}/chat`, {
        auth: {
          token,
        },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        reconnectionDelayMax: 5000,
      });

      this.setupSocketListeners();
      
      return new Promise((resolve, reject) => {
        this.socket.on('connect', () => {
          this.reconnectAttempts = 0;
          this.notifyConnectionStatus(true);
          resolve();
        });

        this.socket.on('connect_error', (error) => {
          this.notifyConnectionStatus(false);
          reject(error);
        });
      });
    } catch (error) {
      errorService.handleError(error, { context: 'ChatService.connect' });
      throw error;
    }
  }

  setupSocketListeners() {
    this.socket.on('message', (message) => {
      this.notifyMessageHandlers(message);
    });

    this.socket.on('typing', (status) => {
      this.notifyTypingHandlers(status);
    });

    this.socket.on('disconnect', () => {
      this.notifyConnectionStatus(false);
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      this.reconnectAttempts = attemptNumber;
      if (attemptNumber > 1) {
        // Exponential backoff
        this.reconnectDelay = Math.min(1000 * Math.pow(2, attemptNumber - 1), 5000);
      }
    });

    this.socket.on('error', (error) => {
      errorService.handleError(error, { context: 'ChatService.socketError' });
    });
  }

  async getChatHistory() {
    try {
      const response = await fetch(`${API_URL}/chat/history`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${await AsyncStorage.getItem('userToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch chat history');
      }

      const history = await response.json();
      return history;
    } catch (error) {
      errorService.handleError(error, { context: 'ChatService.getChatHistory' });
      return [];
    }
  }

  async sendMessage(message) {
    try {
      if (!this.socket?.connected) {
        throw new Error('Not connected to chat server');
      }

      return new Promise((resolve, reject) => {
        this.socket.emit('message', message, (acknowledgement) => {
          if (acknowledgement.error) {
            reject(new Error(acknowledgement.error));
          } else {
            resolve(acknowledgement);
          }
        });

        // Timeout if no acknowledgement received
        setTimeout(() => {
          reject(new Error('Message sending timeout'));
        }, 5000);
      });
    } catch (error) {
      errorService.handleError(error, { context: 'ChatService.sendMessage' });
      throw error;
    }
  }

  sendTypingStatus(isTyping) {
    if (this.socket?.connected) {
      this.socket.emit('typing', { isTyping });
    }
  }

  onMessage(handler) {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  onTypingStatus(handler) {
    this.typingHandlers.add(handler);
    return () => this.typingHandlers.delete(handler);
  }

  onConnectionStatus(handler) {
    this.connectionHandlers.add(handler);
    return () => this.connectionHandlers.delete(handler);
  }

  notifyMessageHandlers(message) {
    this.messageHandlers.forEach(handler => handler(message));
  }

  notifyTypingHandlers(status) {
    this.typingHandlers.forEach(handler => handler(status));
  }

  notifyConnectionStatus(connected) {
    this.connectionHandlers.forEach(handler => handler({ connected }));
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.messageHandlers.clear();
    this.typingHandlers.clear();
    this.connectionHandlers.clear();
  }

  // Utility method to check connection status
  isConnected() {
    return this.socket?.connected || false;
  }

  // Method to handle reconnection manually
  async reconnect() {
    this.disconnect();
    return this.connect();
  }

  // Method to clean up chat history from storage
  async clearChatHistory() {
    try {
      await AsyncStorage.removeItem('chatHistory');
    } catch (error) {
      errorService.handleError(error, { context: 'ChatService.clearChatHistory' });
    }
  }
}

export default new ChatService(); 