import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSystemTheme, setIsSystemTheme] = useState(true);

  useEffect(() => {
    loadThemePreference();
  }, []);

  useEffect(() => {
    if (isSystemTheme) {
      setIsDarkMode(systemColorScheme === 'dark');
    }
  }, [systemColorScheme, isSystemTheme]);

  const loadThemePreference = async () => {
    try {
      const themePrefs = await AsyncStorage.getItem('themePreferences');
      if (themePrefs) {
        const { isDark, useSystem } = JSON.parse(themePrefs);
        setIsSystemTheme(useSystem);
        setIsDarkMode(useSystem ? systemColorScheme === 'dark' : isDark);
      }
    } catch (error) {
      console.error('Error loading theme preferences:', error);
    }
  };

  const saveThemePreference = async (isDark, useSystem) => {
    try {
      await AsyncStorage.setItem(
        'themePreferences',
        JSON.stringify({ isDark, useSystem })
      );
    } catch (error) {
      console.error('Error saving theme preferences:', error);
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
    setIsSystemTheme(false);
    saveThemePreference(!isDarkMode, false);
  };

  const setSystemTheme = () => {
    setIsSystemTheme(true);
    setIsDarkMode(systemColorScheme === 'dark');
    saveThemePreference(isDarkMode, true);
  };

  const theme = {
    isDarkMode,
    isSystemTheme,
    toggleTheme,
    setSystemTheme,
    colors: isDarkMode ? darkColors : lightColors,
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const lightColors = {
  primary: '#2E5BFF',
  secondary: '#FF2E63',
  background: '#F5F5F5',
  card: '#FFFFFF',
  text: '#000000',
  textSecondary: '#83829A',
  border: '#E1E1E1',
  notification: '#FF3B30',
  success: '#00C48C',
  warning: '#FFB800',
  error: '#FF4444',
};

const darkColors = {
  primary: '#3366FF',
  secondary: '#FF4081',
  background: '#121212',
  card: '#1E1E1E',
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  border: '#2C2C2C',
  notification: '#FF453A',
  success: '#32D74B',
  warning: '#FFD60A',
  error: '#FF453A',
}; 