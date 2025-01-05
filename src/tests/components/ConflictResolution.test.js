import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import ConflictResolution from '../../components/ConflictResolution';
import { renderWithProviders } from '../utils/testUtils';

describe('ConflictResolution', () => {
  const mockConflict = {
    type: 'FOOD_DATA',
    localData: {
      name: 'Local Food',
      calories: '100',
    },
    serverData: {
      name: 'Server Food',
      calories: '150',
    },
  };

  const mockOnResolve = jest.fn();
  const mockOnCancel = jest.fn();

  it('renders correctly with conflict data', () => {
    const { getByText } = renderWithProviders(
      <ConflictResolution
        visible={true}
        conflict={mockConflict}
        onResolve={mockOnResolve}
        onCancel={mockOnCancel}
      />
    );

    expect(getByText('Data Conflict Detected')).toBeTruthy();
    expect(getByText('Local Version')).toBeTruthy();
    expect(getByText('Server Version')).toBeTruthy();
  });

  it('calls onResolve with correct parameter when Keep Local is pressed', () => {
    const { getByText } = renderWithProviders(
      <ConflictResolution
        visible={true}
        conflict={mockConflict}
        onResolve={mockOnResolve}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.press(getByText('Keep Local'));
    expect(mockOnResolve).toHaveBeenCalledWith('local');
  });

  it('calls onCancel when Decide Later is pressed', () => {
    const { getByText } = renderWithProviders(
      <ConflictResolution
        visible={true}
        conflict={mockConflict}
        onResolve={mockOnResolve}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.press(getByText('Decide Later'));
    expect(mockOnCancel).toHaveBeenCalled();
  });
}); 