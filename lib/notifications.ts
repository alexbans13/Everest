import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Check if we're running in Expo Go
// Multiple ways to detect Expo Go since executionEnvironment might not be reliable
const isExpoGo = 
  Constants.executionEnvironment === 'storeClient' ||
  !Constants.appOwnership ||
  Constants.appOwnership === 'expo';

// Lazy import notifications to avoid errors in Expo Go
let Notifications: any = null;
let notificationsAvailable = false;
let notificationsInitialized = false;

// Function to safely get notifications module
function getNotificationsModule() {
  if (notificationsInitialized) {
    return { Notifications, notificationsAvailable };
  }
  
  notificationsInitialized = true;
  
  // Don't even try to load in Expo Go to avoid the error
  if (isExpoGo) {
    console.log('Running in Expo Go - notifications module not loaded');
    notificationsAvailable = false;
    return { Notifications: null, notificationsAvailable: false };
  }
  
  try {
    Notifications = require('expo-notifications');
    notificationsAvailable = true;
    
    // Configure how notifications are handled when app is in foreground
    if (Notifications) {
      try {
        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
          }),
        });
      } catch (error) {
        console.warn('Could not set notification handler:', error);
      }
    }
  } catch (error) {
    console.warn('expo-notifications not available:', error);
    notificationsAvailable = false;
  }
  
  return { Notifications, notificationsAvailable };
}

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  const { Notifications: NotifModule, notificationsAvailable: available } = getNotificationsModule();
  
  if (!available || !NotifModule) {
    console.warn('Notifications not available');
    return false;
  }
  
  Notifications = NotifModule;

  // In Expo Go, local notifications should still work, but push notifications don't
  if (isExpoGo) {
    console.log('Running in Expo Go - local notifications only');
    // In Expo Go, we can't use notifications
    console.warn('Notifications not available in Expo Go');
    return false;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return false;
    }

    // Configure notification channel for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}

/**
 * Get Expo push token (for remote notifications)
 * Note: Not available in Expo Go
 */
export async function getExpoPushToken(): Promise<string | null> {
  if (isExpoGo) {
    console.warn('Push notifications are not available in Expo Go');
    return null;
  }

  const { Notifications: NotifModule, notificationsAvailable: available } = getNotificationsModule();
  
  if (!available || !NotifModule) {
    return null;
  }
  
  Notifications = NotifModule;

  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return null;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: 'everest-app', // This should match your app.json extra.eas.projectId
    });

    return tokenData.data;
  } catch (error) {
    console.error('Error getting Expo push token:', error);
    return null;
  }
}

/**
 * Schedule a local notification
 * Works in Expo Go for local notifications
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: any
): Promise<string> {
  if (isExpoGo) {
    // In Expo Go, we can't use notifications - just log
    console.log(`[Notification] ${title}: ${body}`);
    return '';
  }

  const { Notifications: NotifModule, notificationsAvailable: available } = getNotificationsModule();
  
  if (!available || !NotifModule) {
    console.warn('Notifications not available - cannot schedule notification');
    return '';
  }
  
  Notifications = NotifModule;

  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.warn('Notification permissions not granted');
      return '';
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: null, // Show immediately
    });

    return notificationId;
  } catch (error) {
    console.error('Error scheduling local notification:', error);
    // Don't throw - just log the error so the app continues to work
    return '';
  }
}

/**
 * Send a milestone achievement notification
 */
export async function sendMilestoneNotification(milestoneName: string): Promise<void> {
  try {
    await scheduleLocalNotification(
      'Milestone Achieved! 🎉',
      `Congratulations! You have reached: ${milestoneName}`,
      { type: 'milestone', milestoneName }
    );
  } catch (error) {
    console.error('Error sending milestone notification:', error);
  }
}

/**
 * Set up notification listeners
 */
export function setupNotificationListeners(
  onNotificationReceived?: (notification: any) => void,
  onNotificationTapped?: (response: any) => void
) {
  if (isExpoGo) {
    console.warn('Notifications not available in Expo Go - listeners not set up');
    return () => {};
  }

  const { Notifications: NotifModule, notificationsAvailable: available } = getNotificationsModule();
  
  if (!available || !NotifModule) {
    console.warn('Notifications not available - cannot set up listeners');
    return () => {};
  }
  
  Notifications = NotifModule;

  try {
    // Listener for notifications received while app is in foreground
    const receivedListener = Notifications.addNotificationReceivedListener((notification: any) => {
      if (onNotificationReceived) {
        onNotificationReceived(notification);
      }
    });

    // Listener for when user taps on a notification
    const responseListener = Notifications.addNotificationResponseReceivedListener((response: any) => {
      if (onNotificationTapped) {
        onNotificationTapped(response);
      }
    });

    return () => {
      try {
        Notifications.removeNotificationSubscription(receivedListener);
        Notifications.removeNotificationSubscription(responseListener);
      } catch (error) {
        console.warn('Error removing notification listeners:', error);
      }
    };
  } catch (error) {
    console.warn('Error setting up notification listeners:', error);
    // Return a no-op cleanup function
    return () => {};
  }
}

