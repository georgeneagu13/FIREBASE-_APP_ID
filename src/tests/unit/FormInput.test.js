import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import FormInput from '../../components/form/FormInput';
import { renderWithProviders } from '../../utils/testHelpers';

describe('FormInput Component', () => {
  const defaultProps = {
    label: 'Test Input',
    value: '',
    onChangeText: jest.fn(),
    onBlur: jest.fn(),
  };

  it('renders correctly with label', () => {
    const { getByText } = renderWithProviders(
      <FormInput {...defaultProps} />
    );

    expect(getByText('Test Input')).toBeTruthy();
  });

  it('shows error message when error prop is provided', () => {
    const { getByText } = renderWithProviders(
      <FormInput
        {...defaultProps}
        error="Test error message"
        touched={true}
      />
    );

    expect(getByText('Test error message')).toBeTruthy();
  });

  it('toggles password visibility when secureTextEntry is true', () => {
    const { getByTestId } = renderWithProviders(
      <FormInput
        {...defaultProps}
        secureTextEntry={true}
      />
    );

    const toggleButton = getByTestId('secure-toggle');
    const input = getByTestId('form-input');

    expect(input.props.secureTextEntry).toBe(true);

    fireEvent.press(toggleButton);

    expect(input.props.secureTextEntry).toBe(false);
  });

  it('calls onChangeText when input value changes', () => {
    const onChangeText = jest.fn();
    const { getByTestId } = renderWithProviders(
      <FormInput
        {...defaultProps}
        onChangeText={onChangeText}
      />
    );

    fireEvent.changeText(getByTestId('form-input'), 'test value');

    expect(onChangeText).toHaveBeenCalledWith('test value');
  });

  it('animates label on focus and blur', async () => {
    const { getByTestId } = renderWithProviders(
      <FormInput {...defaultProps} />
    );

    const input = getByTestId('form-input');

    await act(async () => {
      fireEvent(input, 'focus');
      await new Promise(resolve => setTimeout(resolve, 250));
    });

    // Check if label is animated to top position
    const label = getByTestId('input-label');
    expect(label.props.style).toMatchObject({
      transform: [{ translateY: -10 }],
    });

    await act(async () => {
      fireEvent(input, 'blur');
      await new Promise(resolve => setTimeout(resolve, 250));
    });

    // Check if label returns to original position when input is empty
    expect(label.props.style).toMatchObject({
      transform: [{ translateY: 0 }],
    });
  });
}); 