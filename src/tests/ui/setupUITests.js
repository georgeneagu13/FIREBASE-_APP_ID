import 'react-native-gesture-handler/jestSetup';
import '@testing-library/jest-native/extend-expect';

// Mock native modules that aren't critical for UI testing
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
jest.mock('@react-native-firebase/analytics', () => ({
  default: () => ({
    logEvent: jest.fn(),
    setUserProperties: jest.fn(),
  }),
}));

jest.mock('@react-native-firebase/auth', () => ({
  default: () => ({
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
  }),
}));

// Mock async storage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
}));

global.window = {};
global.window = global; 