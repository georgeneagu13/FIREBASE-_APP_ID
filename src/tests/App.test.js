import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import App from '../App';

describe('App', () => {
  it('renders without crashing', async () => {
    const { getByTestId } = render(<App />);
    
    await waitFor(() => {
      expect(getByTestId('root-navigator')).toBeTruthy();
    });
  });
}); 