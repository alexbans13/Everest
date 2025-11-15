import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { getActiveJourneys } from '@/lib/journeys';
import { UserJourney } from '@/types';
import { MaterialIcons } from '@expo/vector-icons';
import GradientButton from '@/components/GradientButton';

export default function HomeScreen() {
  const [activeJourneys, setActiveJourneys] = useState<UserJourney[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadActiveJourneys = async () => {
    try {
      setLoading(true);
      console.log('Loading active journeys...');
      const journeys = await getActiveJourneys();
      console.log('Active journeys loaded:', journeys.length);
      setActiveJourneys(journeys);
    } catch (error) {
      console.error('Error loading active journeys:', error);
      setActiveJourneys([]); // Clear on error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadActiveJourneys();
  }, []);

  // Reload when screen comes into focus (e.g., after syncing activity data or resetting)
  useFocusEffect(
    useCallback(() => {
      // Clear state first, then reload
      setActiveJourneys([]);
      loadActiveJourneys();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadActiveJourneys();
  };

  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(2)} km`;
    }
    return `${meters.toFixed(0)} m`;
  };

  const formatAltitude = (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(2)} km`;
    }
    return `${meters.toFixed(0)} m`;
  };

  const getProgressPercentage = (journey: UserJourney) => {
    if (!journey?.journey) return 0;
    const target = journey.journey.category === 'altitude' && journey.journey.target_altitude
      ? journey.journey.target_altitude
      : journey.journey.total_distance;
    return Math.min((journey.current_distance / target) * 100, 100);
  };

  const getTargetValue = (journey: UserJourney) => {
    if (!journey?.journey) return 0;
    if (journey.journey.category === 'altitude' && journey.journey.target_altitude) {
      return journey.journey.target_altitude;
    }
    return journey.journey.total_distance || 0;
  };

  const formatTarget = (journey: UserJourney, value: number) => {
    if (journey?.journey?.category === 'altitude') {
      return formatAltitude(value);
    }
    return formatDistance(value);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Welcome Back!</Text>

        {activeJourneys.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>
              Active Journeys ({activeJourneys.length})
            </Text>
            {activeJourneys.map((journey) => (
              <View key={journey.id} style={styles.journeyCard}>
                <Text style={styles.journeyName}>{journey.journey?.name}</Text>
                <Text style={styles.journeyDescription}>{journey.journey?.description}</Text>

                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <LinearGradient
                      colors={['#3b82f6', '#2563eb', '#1d4ed8']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.progressFill, { width: `${getProgressPercentage(journey)}%` }]}
                    />
                  </View>
                  <View style={styles.progressText}>
                    <Text style={styles.progressLabel}>
                      {journey.journey?.category === 'altitude' 
                        ? formatAltitude(journey.current_distance)
                        : formatDistance(journey.current_distance)} /{' '}
                      {formatTarget(journey, getTargetValue(journey))}
                    </Text>
                    <Text style={styles.progressPercent}>{getProgressPercentage(journey).toFixed(1)}%</Text>
                  </View>
                </View>

                <GradientButton
                  onPress={() => router.push(`/(tabs)/progress/${journey.id}`)}
                  title="View Progress"
                  icon="arrow-forward"
                />
              </View>
            ))}
          </>
        ) : (
          <View style={styles.emptyCard}>
            <MaterialIcons name="explore" size={64} color="#9ca3af" />
            <Text style={styles.emptyTitle}>No Active Journeys</Text>
            <Text style={styles.emptyText}>
              Start a new journey to begin tracking your progress!
            </Text>
            <GradientButton
              onPress={() => router.push('/(tabs)/journeys')}
              title="Browse Journeys"
              icon="explore"
            />
          </View>
        )}

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/journeys')}
          >
            <MaterialIcons name="explore" size={32} color="#2563eb" />
            <Text style={styles.actionText}>Browse Journeys</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <MaterialIcons name="settings" size={32} color="#2563eb" />
            <Text style={styles.actionText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    marginTop: 8,
  },
  journeyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  journeyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  journeyDescription: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 20,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  quickActions: {
    marginTop: 8,
  },
  actionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 16,
  },
});

