import { Tabs, Redirect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useEffect } from 'react';
import { router } from 'expo-router';

export default function TabsLayout() {
  const { user, initialized } = useAuthStore();

  useEffect(() => {
    if (initialized && !user) {
      router.replace('/(auth)/login');
    }
  }, [initialized, user]);

  if (!initialized) {
    return null;
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#6200ee',
        tabBarInactiveTintColor: '#757575',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: '#6200ee',
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tabs.Screen
        name="journeys"
        options={{
          title: '🏔️ Journeys',
          headerTitle: 'Choose Your Journey',
          tabBarLabel: 'Journeys',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="map-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="active"
        options={{
          title: '🚶 Active Journey',
          headerTitle: 'My Progress',
          tabBarLabel: 'Active',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="walk" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '👤 Profile',
          headerTitle: 'My Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

