import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getJourneyById, startJourney } from '@/lib/journeys';
import { Journey, JourneyMilestone } from '@/types';
import { MaterialIcons } from '@expo/vector-icons';

export default function JourneyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [journey, setJourney] = useState<Journey | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (id) {
      loadJourney();
    }
  }, [id]);

  const loadJourney = async () => {
    try {
      const data = await getJourneyById(id);
      setJourney(data);
    } catch (error) {
      console.error('Error loading journey:', error);
      Alert.alert('Error', 'Failed to load journey');
    } finally {
      setLoading(false);
    }
  };

  const handleStartJourney = async () => {
    if (!id) return;
    setStarting(true);
    try {
      const userJourney = await startJourney(id);
      // Navigate directly to progress page
      if (userJourney.id) {
        router.replace(`/progress/${userJourney.id}`);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to start journey');
      setStarting(false);
    }
  };

  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(0)} km`;
    }
    return `${meters.toFixed(0)} m`;
  };

  const getDifficultyColor = (difficulty: Journey['difficulty']) => {
    switch (difficulty) {
      case 'easy':
        return '#10b981';
      case 'medium':
        return '#f59e0b';
      case 'hard':
        return '#ef4444';
      case 'extreme':
        return '#7c3aed';
      default:
        return '#6b7280';
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!journey) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Journey not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.content, { paddingTop: Math.max(insets.top + 20, 40) }]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="#1f2937" />
          </TouchableOpacity>
        </View>

        <View style={styles.journeyHeader}>
          <Text style={styles.journeyName}>{journey.name}</Text>
          <View
            style={[
              styles.difficultyBadge,
              { backgroundColor: getDifficultyColor(journey.difficulty) },
            ]}
          >
            <Text style={styles.difficultyText}>{journey.difficulty.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <MaterialIcons name="straighten" size={24} color="#2563eb" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Total Distance</Text>
              <Text style={styles.infoValue}>{formatDistance(journey.total_distance)}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <MaterialIcons name="place" size={24} color="#2563eb" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Route</Text>
              <Text style={styles.infoValue}>
                {journey.start_location} → {journey.end_location}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.descriptionCard}>
          <Text style={styles.descriptionTitle}>About This Journey</Text>
          <Text style={styles.descriptionText}>{journey.description}</Text>
        </View>

        {journey.milestones && journey.milestones.length > 0 && (
          <View style={styles.milestonesCard}>
            <Text style={styles.milestonesTitle}>Journey Milestones</Text>
            <Text style={styles.milestonesSubtitle}>
              Checkpoints along your journey
            </Text>
            {journey.milestones.map((milestone, index) => {
              const isLast = index === journey.milestones.length - 1;
              return (
                <View
                  key={milestone.id}
                  style={[
                    styles.milestoneItem,
                    isLast && styles.milestoneItemLast,
                  ]}
                >
                <View style={styles.milestoneNumber}>
                  <Text style={styles.milestoneNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.milestoneContent}>
                  <Text style={styles.milestoneName}>{milestone.name}</Text>
                  <Text style={styles.milestoneDescription}>
                    {milestone.description}
                  </Text>
                  <Text style={styles.milestoneDistance}>
                    {formatDistance(milestone.distance_from_start)} from start
                  </Text>
                </View>
              </View>
              );
            })}
          </View>
        )}

        <TouchableOpacity
          style={[styles.startButton, starting && styles.startButtonDisabled]}
          onPress={handleStartJourney}
          disabled={starting}
        >
          {starting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Text style={styles.startButtonText}>Start Journey</Text>
              <MaterialIcons name="play-arrow" size={24} color="#fff" />
            </>
          )}
        </TouchableOpacity>
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
  header: {
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  journeyHeader: {
    marginBottom: 24,
  },
  journeyName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  difficultyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  difficultyText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  infoCard: {
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  infoContent: {
    marginLeft: 16,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  descriptionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  descriptionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
  startButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  startButtonDisabled: {
    opacity: 0.6,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
  },
  milestonesCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  milestonesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  milestonesSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
  },
  milestoneItem: {
    flexDirection: 'row',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  milestoneItemLast: {
    borderBottomWidth: 0,
    marginBottom: 0,
  },
  milestoneNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  milestoneNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  milestoneContent: {
    flex: 1,
  },
  milestoneName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  milestoneDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    lineHeight: 20,
  },
  milestoneDistance: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
});

