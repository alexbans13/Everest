import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { getUserJourneys } from '@/lib/journeys';
import { UserJourney, JourneyMilestone } from '@/types';
import { MaterialIcons } from '@expo/vector-icons';

export default function ProgressScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [userJourney, setUserJourney] = useState<UserJourney | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJourney();
  }, [id]);

  const loadJourney = async () => {
    try {
      const journeys = await getUserJourneys();
      const journey = journeys.find((j) => j.id === id);
      setUserJourney(journey || null);
    } catch (error) {
      console.error('Error loading journey progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(2)} km`;
    }
    return `${meters.toFixed(0)} m`;
  };

  const getProgressPercentage = () => {
    if (!userJourney?.journey) return 0;
    return Math.min(
      (userJourney.current_distance / userJourney.journey.total_distance) * 100,
      100
    );
  };

  const getDaysActive = () => {
    if (!userJourney?.started_at) return 0;
    const start = new Date(userJourney.started_at);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!userJourney) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Journey not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const progress = getProgressPercentage();
  const daysActive = getDaysActive();
  const remaining = userJourney.journey
    ? userJourney.journey.total_distance - userJourney.current_distance
    : 0;

  const milestones = userJourney.journey?.milestones || [];
  
  const isMilestoneReached = (milestone: JourneyMilestone) => {
    return userJourney.current_distance >= milestone.distance_from_start;
  };

  const getNextMilestone = () => {
    return milestones.find((m) => !isMilestoneReached(m));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backIconButton} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="#1f2937" />
          </TouchableOpacity>
        </View>

        <Text style={styles.journeyName}>{userJourney.journey?.name}</Text>
        <Text style={styles.journeyDescription}>{userJourney.journey?.description}</Text>

        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Progress</Text>
            <Text style={styles.progressPercent}>{progress.toFixed(1)}%</Text>
          </View>

          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatDistance(userJourney.current_distance)}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatDistance(remaining)}</Text>
              <Text style={styles.statLabel}>Remaining</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatDistance(userJourney.journey?.total_distance || 0)}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <MaterialIcons name="calendar-today" size={24} color="#2563eb" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Days Active</Text>
              <Text style={styles.infoValue}>{daysActive} days</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <MaterialIcons name="trending-up" size={24} color="#2563eb" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Average per Day</Text>
              <Text style={styles.infoValue}>
                {daysActive > 0
                  ? formatDistance(userJourney.current_distance / daysActive)
                  : formatDistance(0)}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <MaterialIcons name="flag" size={24} color="#2563eb" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Status</Text>
              <Text style={styles.infoValue}>
                {userJourney.is_active ? 'Active' : 'Completed'}
              </Text>
            </View>
          </View>
        </View>

        {milestones.length > 0 && (
          <View style={styles.milestonesCard}>
            <Text style={styles.milestonesTitle}>Journey Milestones</Text>
            <Text style={styles.milestonesSubtitle}>
              {getNextMilestone()
                ? `Next: ${getNextMilestone()?.name}`
                : 'All milestones reached!'}
            </Text>
            {milestones.map((milestone, index) => {
              const reached = isMilestoneReached(milestone);
              const milestoneProgress = userJourney.journey && milestone.distance_from_start > 0
                ? Math.min((userJourney.current_distance / milestone.distance_from_start) * 100, 100)
                : 0;
              const isLast = index === milestones.length - 1;

              return (
                <View
                  key={milestone.id}
                  style={[
                    styles.milestoneItem,
                    isLast && styles.milestoneItemLast,
                  ]}
                >
                  <View
                    style={[
                      styles.milestoneNumber,
                      reached && styles.milestoneNumberReached,
                    ]}
                  >
                    {reached ? (
                      <MaterialIcons name="check" size={20} color="#fff" />
                    ) : (
                      <Text style={styles.milestoneNumberText}>{index + 1}</Text>
                    )}
                  </View>
                  <View style={styles.milestoneContent}>
                    <View style={styles.milestoneHeader}>
                      <Text
                        style={[
                          styles.milestoneName,
                          reached && styles.milestoneNameReached,
                        ]}
                      >
                        {milestone.name}
                      </Text>
                      {reached && (
                        <View style={styles.reachedBadge}>
                          <Text style={styles.reachedBadgeText}>Reached</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.milestoneDescription}>
                      {milestone.description}
                    </Text>
                    <View style={styles.milestoneProgress}>
                      <View style={styles.milestoneProgressBar}>
                        <View
                          style={[
                            styles.milestoneProgressFill,
                            {
                              width: `${milestoneProgress}%`,
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.milestoneDistance}>
                        {formatDistance(milestone.distance_from_start)} from start
                        {!reached &&
                          ` • ${formatDistance(
                            milestone.distance_from_start - userJourney.current_distance
                          )} remaining`}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <View style={styles.noteCard}>
          <MaterialIcons name="info" size={20} color="#6b7280" />
          <Text style={styles.noteText}>
            Your progress is automatically updated based on your connected health data sources.
            Make sure your health apps are synced!
          </Text>
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
    padding: 20,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  backIconButton: {
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
  journeyName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  journeyDescription: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
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
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  progressPercent: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  progressBar: {
    height: 16,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 24,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
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
  noteCard: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 14,
    paddingHorizontal: 24,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  milestonesCard: {
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
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  milestoneNumberReached: {
    backgroundColor: '#10b981',
  },
  milestoneNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  milestoneContent: {
    flex: 1,
  },
  milestoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  milestoneName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  milestoneNameReached: {
    color: '#10b981',
  },
  reachedBadge: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  reachedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#10b981',
    letterSpacing: 0.5,
  },
  milestoneDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  milestoneProgress: {
    marginTop: 4,
  },
  milestoneProgressBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  milestoneProgressFill: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 3,
  },
  milestoneDistance: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
});

