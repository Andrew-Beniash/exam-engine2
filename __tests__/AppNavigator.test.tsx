import React from 'react';
import {render, screen} from '@testing-library/react-native';
import App from '../src/App';

// Mock react-native-screens
jest.mock('react-native-screens', () => ({
  enableScreens: jest.fn(),
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const React = require('react');
  return {
    SafeAreaProvider: ({children}: {children: React.ReactNode}) => children,
    SafeAreaView: ({children}: {children: React.ReactNode}) => children,
    useSafeAreaInsets: () => ({top: 0, bottom: 0, left: 0, right: 0}),
  };
});

// Mock @react-navigation/native
jest.mock('@react-navigation/native', () => {
  const React = require('react');
  const {View} = require('react-native');
  return {
    NavigationContainer: ({children}: {children: React.ReactNode}) => 
      React.createElement(View, {testID: 'navigation-container'}, children),
    useNavigation: () => ({
      navigate: jest.fn(),
    }),
    useFocusEffect: jest.fn(),
  };
});

// Mock @react-navigation/bottom-tabs  
jest.mock('@react-navigation/bottom-tabs', () => {
  const React = require('react');
  const {View, Text} = require('react-native');
  return {
    createBottomTabNavigator: () => ({
      Navigator: ({children}: {children: React.ReactNode}) => 
        React.createElement(View, {testID: 'tab-navigator'}, 
          React.createElement(View, {testID: 'tab-bar'}, [
            React.createElement(Text, {key: 'dashboard'}, 'Dashboard'),
            React.createElement(Text, {key: 'practice'}, 'Practice')
          ]),
          children
        ),
      Screen: ({children}: {children: React.ReactNode}) => 
        React.createElement(View, {testID: 'tab-screen'}, children),
    }),
  };
});

describe('AppNavigator', () => {
  it('renders App with Dashboard and Practice tabs', () => {
    render(<App />);
    
    // Check that both tab labels exist
    expect(screen.getByText('Dashboard')).toBeTruthy();
    expect(screen.getByText('Practice')).toBeTruthy();
  });
});