import { useEffect, useState } from 'react';
import { View, StyleSheet, Image, Animated } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../store/authStore';

export default function SplashScreen() {
  const { initialize, user, initialized } = useAuthStore();
  const [fadeAnim] = useState(new Animated.Value(1));
  const [hasNavigated, setHasNavigated] = useState(false);

  useEffect(() => {
    console.log('[SPLASH] Starting splash screen initialization');
    // Initialize auth (don't wait for it to complete)
    initialize().catch((error) => {
      console.error('[SPLASH] Auth initialization error:', error);
      // Continue even if auth init fails
    });
  }, []);

  useEffect(() => {
    // Wait minimum 3 seconds, then navigate when auth is ready or after timeout
    const minDisplayTime = 3000;
    const maxWaitTime = 5000; // Max 5 seconds total wait
    const startTime = Date.now();

    const checkAndNavigate = () => {
      const elapsed = Date.now() - startTime;
      const shouldNavigate = initialized || elapsed >= maxWaitTime;
      const hasMinTime = elapsed >= minDisplayTime;

      if (shouldNavigate && hasMinTime && !hasNavigated) {
        console.log('[SPLASH] Navigation conditions met:', { initialized, elapsed, hasMinTime });
        setHasNavigated(true);
        // Fade out animation
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          // Navigate after fade out
          try {
            if (user) {
              console.log('[SPLASH] User authenticated, navigating to journeys');
              router.replace('/(tabs)/journeys');
            } else {
              console.log('[SPLASH] No user found, navigating to login');
              router.replace('/(auth)/login');
            }
          } catch (error) {
            console.error('[SPLASH] Navigation error:', error);
            // Fallback navigation
            router.replace('/(auth)/login');
          }
        });
      } else if (!hasNavigated) {
        // Check again in 100ms
        setTimeout(checkAndNavigate, 100);
      }
    };

    // Start checking after minimum display time
    const timer = setTimeout(checkAndNavigate, minDisplayTime);

    return () => clearTimeout(timer);
  }, [initialized, user, hasNavigated, fadeAnim]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Image
          source={require('../assets/splash-everest.png')}
          style={styles.image}
          resizeMode="contain"
          onError={(error) => {
            console.error('Splash image load error:', error);
            // Continue anyway - navigation will still work
          }}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

