import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { COLORS } from '../constants/theme';

// Screens
import SimulatorDashboard from '../screens/SimulatorDashboard';
import AutomationDetails from '../screens/AutomationDetails';
import Analytics from '../screens/Analytics';
import Settings from '../screens/Settings';
import RuleBuilder from '../screens/RuleBuilder';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.lightGray,
          height: 60,
          paddingBottom: 5,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray,
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={SimulatorDashboard}
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Icon name="dashboard" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Rules" 
        component={RuleBuilder}
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Icon name="rule" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Analytics" 
        component={Analytics}
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Icon name="analytics" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={Settings}
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Icon name="settings" size={24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Main"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AutomationDetails"
          component={AutomationDetails}
          options={{
            title: 'Automation Details',
            headerStyle: {
              backgroundColor: COLORS.primary,
            },
            headerTintColor: COLORS.white,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 