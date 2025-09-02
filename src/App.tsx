import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import Dashboard from './screens/Dashboard';
import Practice from './screens/Practice';

export type RootTabParamList = {
  Dashboard: undefined;
  Practice: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: true,
            tabBarActiveTintColor: '#007AFF',
            tabBarInactiveTintColor: '#8E8E93',
          }}>
          <Tab.Screen 
            name="Dashboard" 
            component={Dashboard}
            options={{
              title: 'Dashboard',
            }}
          />
          <Tab.Screen 
            name="Practice" 
            component={Practice}
            options={{
              title: 'Practice',
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;