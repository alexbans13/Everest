import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { getFriendProfile, FriendProfile } from '@/lib/friends';
import { MaterialIcons } from '@expo/vector-icons';
import { UserJourney, JourneyMilestone } from '@/types';

export default function FriendProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [friendData, setFriendData] = useState<(FriendProfile & { isFriend: boolean }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('Friend ID is required');
      setLoading(false);
      return;
    }

    const loadFriendProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getFriendProfile(id);
        setFriendData(data);
      } catch (err: any) {
        console.error('Error loading friend profile:', err);
        setError(err.message || 'Failed to load friend profile');
      } finally {
        setLoading(false);
      }
    };

    loadFriendProfile();
  }, [id]);

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

  const isMilestoneReached = (milestone: JourneyMilestone, currentDistance: number) => {
    return currentDistance >= milestone.distance_from_start;
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (error || !friendData) {
    return (
      <View style={styles.centerContainer}>
        <MaterialIcons name="error-outline" size={64} color="#ef4444" />
        <Text style={styles.errorText}>{error || 'Friend profile not found'}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { profile, activeJourneys, completedJourneys, healthDataSummary, isFriend } = friendData;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backIconButton} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="#1f2937" />
          </TouchableOpacity>
        </View>

        {/* Profile Section */}
        <View style={styles.profileCard}>
          {profile.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <MaterialIcons name="person" size={48} color="#2563eb" />
            </View>
          )}
          <Text style={styles.profileName}>{profile.full_name || 'Unknown User'}</Text>
          <Text style={styles.profileEmail}>{profile.email}</Text>
          {!isFriend && (
            <View style={styles.notFriendBadge}>
              <MaterialIcons name="info" size={16} color="#6b7280" />
              <Text style={styles.notFriendText}>Add as friend to see full activity details</Text>
            </View>
          )}
        </View>

        {/* Health Data Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.cardTitle}>Activity Summary (Last 30 Days)</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <MaterialIcons name="directions-walk" size={24} color="#2563eb" />
              <Text style={styles.summaryValue}>{healthDataSummary.totalSteps.toLocaleString()}</Text>
              <Text style={styles.summaryLabel}>Steps</Text>
            </View>
            <View style={styles.summaryItem}>
              <MaterialIcons name="straighten" size={24} color="#10b981" />
              <Text style={styles.summaryValue}>{formatDistance(healthDataSummary.totalDistance)}</Text>
              <Text style={styles.summaryLabel}>Distance</Text>
            </View>
            <View style={styles.summaryItem}>
              <MaterialIcons name="trending-up" size={24} color="#f59e0b" />
              <Text style={styles.summaryValue}>{healthDataSummary.totalElevation.toLocaleString()}m</Text>
              <Text style={styles.summaryLabel}>Elevation</Text>
            </View>
            <View style={styles.summaryItem}>
              <MaterialIcons name="local-fire-department" size={24} color="#ef4444" />
              <Text style={styles.summaryValue}>{healthDataSummary.totalCalories.toLocaleString()}</Text>
              <Text style={styles.summaryLabel}>Calories</Text>
            </View>
          </View>
          <Text style={styles.daysActiveText}>
            {healthDataSummary.daysActive} active day{healthDataSummary.daysActive !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Active Journeys */}
        {activeJourneys.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Journeys ({activeJourneys.length})</Text>
            {activeJourneys.map((journey) => {
              const progress = getProgressPercentage(journey);
              const target = journey.journey?.category === 'altitude' && journey.journey.target_altitude
                ? journey.journey.target_altitude
                : journey.journey?.total_distance || 0;
              const milestones = journey.journey?.milestones || [];
              const reachedMilestones = milestones.filter((m) => isMilestoneReached(m, journey.current_distance));

              return (
                <View key={journey.id} style={styles.journeyCard}>
                  {journey.journey?.image_url && (
                    <Image
                      source={{ uri: journey.journey.image_url }}
                      style={styles.journeyImage}
                      resizeMode="cover"
                    />
                  )}
                  <Text style={styles.journeyName}>{journey.journey?.name}</Text>
                  <Text style={styles.journeyDescription}>{journey.journey?.description}</Text>

                  <View style={styles.progressContainer}>
                    <View style={styles.progressHeader}>
                      <Text style={styles.progressLabel}>Progress</Text>
                      <Text style={styles.progressPercent}>{progress.toFixed(1)}%</Text>
                    </View>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: `${progress}%` }]} />
                    </View>
                    <View style={styles.progressStats}>
                      <View style={styles.progressStatItem}>
                        <Text style={styles.progressStatValue}>
                          {journey.journey?.category === 'altitude'
                            ? formatAltitude(journey.current_distance)
                            : formatDistance(journey.current_distance)}
                        </Text>
                        <Text style={styles.progressStatLabel}>Completed</Text>
                      </View>
                      <View style={styles.progressStatItem}>
                        <Text style={styles.progressStatValue}>
                          {journey.journey?.category === 'altitude'
                            ? formatAltitude(Math.max(0, target - journey.current_distance))
                            : formatDistance(Math.max(0, target - journey.current_distance))}
                        </Text>
                        <Text style={styles.progressStatLabel}>Remaining</Text>
                      </View>
                    </View>
                  </View>

                  {milestones.length > 0 && (
                    <View style={styles.milestonesSection}>
                      <Text style={styles.milestonesTitle}>
                        Milestones: {reachedMilestones.length} / {milestones.length}
                      </Text>
                      <View style={styles.milestonesList}>
                        {milestones.slice(0, 3).map((milestone) => {
                          const reached = isMilestoneReached(milestone, journey.current_distance);
                          return (
                            <View key={milestone.id} style={styles.milestoneItem}>
                              {reached ? (
                                <MaterialIcons name="check-circle" size={20} color="#10b981" />
                              ) : (
                                <MaterialIcons name="radio-button-unchecked" size={20} color="#9ca3af" />
                              )}
                              <Text
                                style={[
                                  styles.milestoneName,
                                  reached && styles.milestoneNameReached,
                                ]}
                              >
                                {milestone.name}
                              </Text>
                            </View>
                          );
                        })}
                        {milestones.length > 3 && (
                          <Text style={styles.moreMilestonesText}>
                            +{milestones.length - 3} more
                          </Text>
                        )}
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Completed Journeys */}
        {completedJourneys.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Completed Journeys ({completedJourneys.length})</Text>
            {completedJourneys.map((journey) => (
              <View key={journey.id} style={styles.journeyCard}>
                <View style={styles.completedBadge}>
                  <MaterialIcons name="check-circle" size={20} color="#10b981" />
                  <Text style={styles.completedText}>Completed</Text>
                </View>
                <Text style={styles.journeyName}>{journey.journey?.name}</Text>
                {journey.completed_at && (
                  <Text style={styles.completedDate}>
                    Completed on {new Date(journey.completed_at).toLocaleDateString()}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {activeJourneys.length === 0 && completedJourneys.length === 0 && (
          <View style={styles.emptyCard}>
            <MaterialIcons name="explore" size={64} color="#9ca3af" />
            <Text style={styles.emptyText}>No journeys yet</Text>
            <Text style={styles.emptySubtext}>This friend hasn't started any journeys</Text>
          </View>
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
    padding: 20,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
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
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: '#6b7280',
  },
  notFriendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
    gap: 6,
  },
  notFriendText: {
    fontSize: 12,
    color: '#6b7280',
  },
  summaryCard: {
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
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  summaryItem: {
    width: '47%',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  daysActiveText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
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
  journeyImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#e5e7eb',
  },
  journeyName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  journeyDescription: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
  },
  progressContainer: {
    marginTop: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  progressPercent: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  progressBar: {
    height: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 6,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
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
  milestonesSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  milestonesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  milestonesList: {
    gap: 8,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  milestoneName: {
    fontSize: 14,
    color: '#6b7280',
  },
  milestoneNameReached: {
    color: '#10b981',
    fontWeight: '600',
  },
  moreMilestonesText: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
    marginTop: 4,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d1fae5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 12,
    gap: 6,
  },
  completedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
  },
  completedDate: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
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
});

