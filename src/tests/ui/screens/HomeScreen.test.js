import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import HomeScreen from '../../../screens/HomeScreen';
import { renderWithProviders } from '../../utils/testUtils';

describe('HomeScreen UI', () => {
  it('renders all main components', () => {
    const { getByText, getByTestId } = renderWithProviders(<HomeScreen />);

    expect(getByText('FoodAI')).toBeTruthy();
    expect(getByTestId('scan-button')).toBeTruthy();
    expect(getByTestId('recent-scans-list')).toBeTruthy();
  });

  it('shows offline banner when network is unavailable', async () => {
    const { getByText } = renderWithProviders(<HomeScreen />, {
      isOnline: false,
    });

    await waitFor(() => {
      expect(getByText("You're offline. Some features may be limited.")).toBeTruthy();
    });
  });

  it('navigates to camera screen when scan button is pressed', () => {
    const mockNavigate = jest.fn();
    const { getByTestId } = renderWithProviders(<HomeScreen />, {
      navigation: { navigate: mockNavigate },
    });

    fireEvent.press(getByTestId('scan-button'));
    expect(mockNavigate).toHaveBeenCalledWith('Camera');
  });

  it('displays recent scans in reverse chronological order', async () => {
    const mockRecentScans = [
      { id: '1', name: 'Apple', timestamp: '2024-01-02' },
      { id: '2', name: 'Banana', timestamp: '2024-01-01' },
    ];

    const { getAllByTestId } = renderWithProviders(<HomeScreen />, {
      recentScans: mockRecentScans,
    });

    const items = getAllByTestId('recent-scan-item');
    expect(items[0]).toHaveTextContent('Apple');
    expect(items[1]).toHaveTextContent('Banana');
  });
}); 