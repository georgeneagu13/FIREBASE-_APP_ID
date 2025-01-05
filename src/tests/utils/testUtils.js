import React from 'react';
import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from '../../context/ThemeContext';

export const renderWithProviders = (component) => {
  return render(
    <NavigationContainer>
      <ThemeProvider>
        {component}
      </ThemeProvider>
    </NavigationContainer>
  );
};

export const mockNavigate = jest.fn();
export const mockGoBack = jest.fn();

export const mockNavigation = {
  navigate: mockNavigate,
  goBack: mockGoBack,
};

export const mockRoute = {
  params: {},
};

// Reset all mocks after each test
afterEach(() => {
  mockNavigate.mockReset();
  mockGoBack.mockReset();
}); 