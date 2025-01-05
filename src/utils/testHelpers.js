import { act, renderHook } from '@testing-library/react-hooks';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';

// Custom renderer with providers
export const renderWithProviders = (component, options = {}) => {
  const {
    initialTheme = 'light',
    initialAuth = { user: null, token: null },
    ...renderOptions
  } = options;

  return render(
    <ThemeProvider initialTheme={initialTheme}>
      <AuthProvider initialState={initialAuth}>
        {component}
      </AuthProvider>
    </ThemeProvider>,
    renderOptions
  );
};

// Hook testing wrapper
export const renderHookWithProviders = (hook, options = {}) => {
  const {
    initialTheme = 'light',
    initialAuth = { user: null, token: null },
    ...renderOptions
  } = options;

  const wrapper = ({ children }) => (
    <ThemeProvider initialTheme={initialTheme}>
      <AuthProvider initialState={initialAuth}>
        {children}
      </AuthProvider>
    </ThemeProvider>
  );

  return renderHook(hook, { wrapper, ...renderOptions });
};

// Common test utilities
export const testUtils = {
  // Wait for animations to complete
  waitForAnimations: async () => {
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
  },

  // Simulate delay
  delay: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  // Mock navigation
  createNavigationMock: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    setOptions: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
  }),

  // Mock route
  createRouteMock: (params = {}) => ({
    params,
    key: 'test',
    name: 'TestScreen',
  }),

  // Fire input change
  changeInput: (input, value) => {
    fireEvent.changeText(input, value);
  },

  // Submit form
  submitForm: async (submitButton) => {
    await waitFor(() => {
      fireEvent.press(submitButton);
    });
  },

  // Mock API response
  mockApiResponse: (data, delay = 100) => {
    return new Promise(resolve => {
      setTimeout(() => resolve(data), delay);
    });
  },

  // Create mock event
  createMockEvent: (type, data = {}) => ({
    type,
    timestamp: new Date().toISOString(),
    ...data,
  }),
};

export default testUtils; 