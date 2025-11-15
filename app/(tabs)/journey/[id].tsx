import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { getJourneyById, startJourney, getUserJourneys } from '@/lib/journeys';
import { Journey, JourneyMilestone, UserJourney } from '@/types';
import { MaterialIcons } from '@expo/vector-icons';
import GradientButton from '@/components/GradientButton';

export default function JourneyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [journey, setJourney] = useState<Journey | null>(null);
  const [userJourney, setUserJourney] = useState<UserJourney | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const insets = useSafeAreaInsets();

  const loadJourney = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await getJourneyById(id);
      setJourney(data);
      
      // Check if user has an active journey for this journey
      const userJourneys = await getUserJourneys();
      const activeUserJourney = userJourneys.find(
        (uj) => uj.journey_id === id && uj.is_active
      );
      setUserJourney(activeUserJourney || null);
    } catch (error) {
      console.error('Error loading journey:', error);
      Alert.alert('Error', 'Failed to load journey');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadJourney();
  }, [loadJourney]);

  // Reload when screen comes into focus (e.g., after refreshing health data)
  useFocusEffect(
    useCallback(() => {
      loadJourney();
    }, [loadJourney])
  );

  const handleStartJourney = async () => {
    if (!id) return;
    
    // If premium, navigate to payment screen
    if (journey?.is_premium) {
      router.push(`/(tabs)/payment/${id}`);
      return;
    }
    
    setStarting(true);
    try {
      const userJourney = await startJourney(id);
      // Navigate directly to progress page
      if (userJourney.id) {
        router.replace(`/(tabs)/progress/${userJourney.id}`);
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

        {journey.image_url && (
          <Image
            source={{ uri: journey.image_url }}
            style={styles.journeyImage}
            resizeMode="cover"
          />
        )}

        <View style={styles.journeyHeader}>
          <View style={styles.journeyTitleRow}>
            <Text style={styles.journeyName}>{journey.name}</Text>
            {journey.is_premium && (
              <View style={styles.premiumBadge}>
                <MaterialIcons name="star" size={16} color="#fbbf24" />
                <Text style={styles.premiumBadgeText}>Premium</Text>
              </View>
            )}
          </View>
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

        {userJourney && (
          <View style={styles.progressCard}>
            <Text style={styles.progressTitle}>Your Progress</Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(
                      (userJourney.current_distance / journey.total_distance) * 100,
                      100
                    )}%`,
                  },
                ]}
              />
            </View>
            <View style={styles.progressStats}>
              <View style={styles.progressStatItem}>
                <Text style={styles.progressStatValue}>
                  {formatDistance(userJourney.current_distance)}
                </Text>
                <Text style={styles.progressStatLabel}>Completed</Text>
              </View>
              <View style={styles.progressStatItem}>
                <Text style={styles.progressStatValue}>
                  {formatDistance(journey.total_distance - userJourney.current_distance)}
                </Text>
                <Text style={styles.progressStatLabel}>Remaining</Text>
              </View>
              <View style={styles.progressStatItem}>
                <Text style={styles.progressStatValue}>
                  {Math.min(
                    (userJourney.current_distance / journey.total_distance) * 100,
                    100
                  ).toFixed(1)}%
                </Text>
                <Text style={styles.progressStatLabel}>Progress</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.viewProgressButton}
              onPress={() => router.push(`/(tabs)/progress/${userJourney.id}`)}
            >
              <Text style={styles.viewProgressButtonText}>View Full Progress</Text>
              <MaterialIcons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

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

        {!userJourney && (
          <GradientButton
            onPress={handleStartJourney}
            title="Start Journey"
            icon="play-arrow"
            disabled={starting}
            loading={starting}
          />
        )}
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
    paddingBottom: 100, // Add padding for tab bar
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
  journeyImage: {
    width: '100%',
    height: 250,
    borderRadius: 16,
    marginBottom: 20,
    backgroundColor: '#e5e7eb',
  },
  journeyHeader: {
    marginBottom: 24,
  },
  journeyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  journeyName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  premiumBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400e',
    letterSpacing: 0.5,
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
  progressCard: {
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
  progressTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 6,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  progressStatItem: {
    alignItems: 'center',
  },
  progressStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  progressStatLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  viewProgressButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  viewProgressButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

