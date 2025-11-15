import { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text, Snackbar } from 'react-native-paper';
import { Link, router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);
  const { setSession, setUser } = useAuthStore();

  const handleRegister = async () => {
    console.log('[AUTH] Registration attempt started');
    if (!email || !password || !fullName) {
      console.warn('[AUTH] Registration validation failed: missing fields');
      setError('Please fill in all fields');
      setShowError(true);
      return;
    }

    if (password.length < 6) {
      console.warn('[AUTH] Registration validation failed: password too short');
      setError('Password must be at least 6 characters');
      setShowError(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('[AUTH] Attempting to sign up with Supabase');
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (authError) {
        console.error('[AUTH] Sign up error:', authError);
        throw authError;
      }

      if (data.session && data.user) {
        console.log('[AUTH] Sign up successful, creating profile:', { userId: data.user.id, email: data.user.email });
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: data.user.id,
            email: data.user.email!,
            full_name: fullName,
          });

        if (profileError) {
          console.error('[AUTH] Error creating profile:', profileError);
        } else {
          console.log('[AUTH] Profile created successfully');
        }

        setSession(data.session);
        setUser(data.user);
        console.log('[AUTH] Navigating to journeys screen');
        router.replace('/(tabs)/journeys');
      } else {
        console.warn('[AUTH] Sign up returned no session or user');
      }
    } catch (err: any) {
      console.error('[AUTH] Registration exception:', err);
      setError(err.message || 'Failed to sign up');
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
            Create Account
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Start your journey today
          </Text>

          <TextInput
            label="Full Name"
            value={fullName}
            onChangeText={setFullName}
            mode="outlined"
            style={styles.input}
            disabled={loading}
          />

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
            onPress={handleRegister}
            loading={loading}
            disabled={loading}
            style={styles.button}
          >
            Sign Up
          </Button>

          <View style={styles.linkContainer}>
            <Text>Already have an account? </Text>
            <Link href="/(auth)/login" asChild>
              <Text style={styles.link}>Sign In</Text>
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

