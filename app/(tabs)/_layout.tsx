import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Platform } from 'react-native';

export default function TabsLayout() {
  const isWeb = Platform.OS === 'web';

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#6b7280',
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          height: isWeb ? 70 : 60,
          paddingBottom: 8,
          paddingTop: 8,
          paddingLeft: 0,
          paddingRight: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarItemStyle: {
          flex: isWeb ? 1 : 0,
          ...(isWeb ? {
            minWidth: 0,
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 8,
            paddingHorizontal: 4,
          } : {
            flexBasis: '20%',
            width: '20%',
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 4,
          }),
        },
        tabBarIconStyle: {
          marginBottom: 0,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="journeys"
        options={{
          title: 'Journeys',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="explore" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: 'Activity',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="directions-walk" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: 'Friends',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="people" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="journey/[id]"
        options={{
          title: 'Journey Details',
          tabBarButton: () => null,
        }}
      />
      <Tabs.Screen
        name="progress/[id]"
        options={{
          title: 'Journey Progress',
          tabBarButton: () => null,
        }}
      />
      <Tabs.Screen
        name="payment/[id]"
        options={{
          title: 'Purchase Journey',
          tabBarButton: () => null,
        }}
      />
      <Tabs.Screen
        name="friend/[id]"
        options={{
          title: 'Friend Profile',
          tabBarButton: () => null,
        }}
      />
    </Tabs>
  );
}

