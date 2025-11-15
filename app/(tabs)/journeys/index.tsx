import { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, ActivityIndicator, Snackbar } from 'react-native-paper';
import { useAuthStore } from '../../../store/authStore';
import { useJourneyStore } from '../../../store/journeyStore';
import JourneyCard from '../../../components/JourneyCard';
import { router } from 'expo-router';

export default function JourneysScreen() {
  const { user } = useAuthStore();
  const { journeys, activeJourney, loading, fetchJourneys, startJourney } = useJourneyStore();
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    console.log('[JOURNEYS] Screen mounted, user:', user?.id || 'none');
    if (user) {
      console.log('[JOURNEYS] Fetching available journeys');
      fetchJourneys();
    }
  }, [user]);

  const handleStartJourney = async (journeyId: string) => {
    if (!user) {
      console.warn('[JOURNEYS] Cannot start journey - no user');
      return;
    }

    console.log('[JOURNEYS] Starting journey:', journeyId);
    try {
      await startJourney(user.id, journeyId);
      console.log('[JOURNEYS] Journey started, navigating to active screen');
      router.push('/(tabs)/active');
    } catch (err: any) {
      console.error('[JOURNEYS] Error starting journey:', err);
      setError(err.message || 'Failed to start journey');
      setShowError(true);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchJourneys();
    setRefreshing(false);
  };

  if (loading && journeys.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Select a journey to begin your adventure
        </Text>
      </View>

      {journeys.length === 0 ? (
        <View style={styles.center}>
          <Text variant="bodyLarge">No journeys available</Text>
        </View>
      ) : (
        journeys.map((journey) => (
          <JourneyCard
            key={journey.id}
            journey={journey}
            onStart={() => handleStartJourney(journey.id)}
            isActive={activeJourney?.journey_id === journey.id}
          />
        ))
      )}

      <Snackbar
        visible={showError}
        onDismiss={() => setShowError(false)}
        duration={3000}
      >
        {error}
      </Snackbar>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  subtitle: {
    opacity: 0.7,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
});

