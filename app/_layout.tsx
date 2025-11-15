import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { requestNotificationPermissions } from '../lib/notifications';

export default function RootLayout() {
  useEffect(() => {
    console.log('[APP] Root layout mounted');
    console.log('[APP] Execution environment:', Constants.executionEnvironment);
    console.log('[APP] App ownership:', Constants.appOwnership);
    
    // Request notification permissions on app start
    // This will gracefully handle Expo Go limitations
    // Only try if not in Expo Go to avoid errors
    const checkAndRequest = async () => {
      try {
        const isExpoGo = Constants.executionEnvironment === 'storeClient' || !Constants.appOwnership;
        console.log('[APP] Expo Go detected:', isExpoGo);
        if (!isExpoGo) {
          console.log('[APP] Requesting notification permissions');
          await requestNotificationPermissions();
        } else {
          console.log('[APP] Skipping notification permissions (Expo Go)');
        }
      } catch (error) {
        console.warn('[APP] Error requesting notification permissions:', error);
        // Silently fail - notifications not critical for app functionality
      }
    };
    checkAndRequest();
  }, []);

  return (
    <SafeAreaProvider>
      <PaperProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="splash" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

