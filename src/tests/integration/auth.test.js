import React from 'react';
import { act, fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '../../utils/testHelpers';
import LoginScreen from '../../screens/Login';
import authService from '../../services/authService';
import { AuthContext } from '../../context/AuthContext';

jest.mock('../../services/authService');

describe('Authentication Flow', () => {
  const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('successfully logs in with valid credentials', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
    };

    authService.login.mockResolvedValueOnce({
      token: 'test-token',
      user: mockUser,
    });

    const { getByTestId, getByText } = renderWithProviders(
      <LoginScreen navigation={mockNavigation} />
    );

    await act(async () => {
      fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'password123');
      fireEvent.press(getByTestId('login-button'));
    });

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(mockNavigation.navigate).toHaveBeenCalledWith('Home');
    });
  });

  it('shows error message with invalid credentials', async () => {
    authService.login.mockRejectedValueOnce(new Error('Invalid credentials'));

    const { getByTestId, getByText } = renderWithProviders(
      <LoginScreen navigation={mockNavigation} />
    );

    await act(async () => {
      fireEvent.changeText(getByTestId('email-input'), 'invalid@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'wrongpass');
      fireEvent.press(getByTestId('login-button'));
    });

    await waitFor(() => {
      expect(getByText('Invalid credentials')).toBeTruthy();
      expect(mockNavigation.navigate).not.toHaveBeenCalled();
    });
  });

  it('maintains authentication state across app reload', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
    };

    authService.getCurrentUser.mockResolvedValueOnce(mockUser);

    const { getByTestId } = renderWithProviders(
      <AuthContext.Consumer>
        {({ user }) => (
          <Text testID="user-email">{user?.email}</Text>
        )}
      </AuthContext.Consumer>
    );

    await waitFor(() => {
      expect(getByTestId('user-email').props.children).toBe('test@example.com');
    });
  });
}); 