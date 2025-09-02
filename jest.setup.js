import '@testing-library/jest-native/extend-expect';

// Mock react-native modules
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');

// Mock Animated module
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');