import { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text, Snackbar } from 'react-native-paper';
import { Link, router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);
  const { setSession, setUser } = useAuthStore();

  const handleLogin = async () => {
    console.log('[AUTH] Login attempt started');
    if (!email || !password) {
      console.warn('[AUTH] Login validation failed: missing fields');
      setError('Please fill in all fields');
      setShowError(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('[AUTH] Attempting to sign in with Supabase');
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error('[AUTH] Sign in error:', authError);
        throw authError;
      }

      if (data.session && data.user) {
        console.log('[AUTH] Sign in successful:', { userId: data.user.id, email: data.user.email });
        setSession(data.session);
        setUser(data.user);
        console.log('[AUTH] Navigating to journeys screen');
        router.replace('/(tabs)/journeys');
      } else {
        console.warn('[AUTH] Sign in returned no session or user');
      }
    } catch (err: any) {
      console.error('[AUTH] Login exception:', err);
      setError(err.message || 'Failed to sign in');
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text variant="headlineLarge" style={styles.title}>
            Welcome to Everest
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Sign in to continue your journey
          </Text>

          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            disabled={loading}
          />

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry
            style={styles.input}
            disabled={loading}
          />

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            style={styles.button}
          >
            Sign In
          </Button>

          <View style={styles.linkContainer}>
            <Text>Don't have an account? </Text>
            <Link href="/(auth)/register" asChild>
              <Text style={styles.link}>Sign Up</Text>
            </Link>
          </View>
        </View>
      </ScrollView>

      <Snackbar
        visible={showError}
        onDismiss={() => setShowError(false)}
        duration={3000}
      >
        {error}
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    padding: 20,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: 32,
    textAlign: 'center',
    opacity: 0.7,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    marginBottom: 16,
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  link: {
    color: '#6200ee',
    fontWeight: 'bold',
  },
});

