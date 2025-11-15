import { useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, Divider } from 'react-native-paper';
import { router } from 'expo-router';
import { useAuthStore } from '../../../store/authStore';
import { useHealthStore } from '../../../store/healthStore';
import HealthSourceSelector from '../../../components/HealthSourceSelector';

export default function ProfileScreen() {
  const { user, profile, signOut } = useAuthStore();
  const { activeSource, fetchHealthSources } = useHealthStore();

  useEffect(() => {
    if (user) {
      fetchHealthSources(user.id);
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  return (
    <ScrollView style={styles.container}>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Account Information
          </Text>
          <View style={styles.infoRow}>
            <Text variant="bodyMedium" style={styles.label}>
              Email:
            </Text>
            <Text variant="bodyMedium">{profile?.email || user?.email}</Text>
          </View>
          {profile?.full_name && (
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>
                Name:
              </Text>
              <Text variant="bodyMedium">{profile.full_name}</Text>
            </View>
          )}
        </Card.Content>
      </Card>

      <View style={styles.section}>
        <HealthSourceSelector />
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Button
            mode="outlined"
            onPress={handleSignOut}
            textColor="#d32f2f"
            style={styles.signOutButton}
          >
            Sign Out
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    marginTop: 8,
  },
  section: {
    marginTop: 8,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    fontWeight: '600',
    opacity: 0.7,
  },
  signOutButton: {
    borderColor: '#d32f2f',
  },
});

