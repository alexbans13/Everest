import { useEffect, useState, useCallback, useRef } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Button, ActivityIndicator, Divider } from 'react-native-paper';
import { useAuthStore } from '../../../store/authStore';
import { useJourneyStore } from '../../../store/journeyStore';
import { useHealthStore } from '../../../store/healthStore';
import ProgressBar from '../../../components/ProgressBar';
import MilestoneCard from '../../../components/MilestoneCard';
import HealthSourceSelector from '../../../components/HealthSourceSelector';
import { supabase } from '../../../lib/supabase';
import { sendMilestoneNotification } from '../../../lib/notifications';
import { Milestone } from '../../../types';
import { useNavigation } from 'expo-router';

export default function ActiveJourneyScreen() {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const {
    activeJourney,
    milestones,
    achievedMilestones,
    fetchActiveJourney,
    fetchMilestones,
    fetchAchievedMilestones,
    updateProgress,
  } = useJourneyStore();
  const { activeSource, healthData, fetchHealthData, refreshHealthData } = useHealthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [hasManuallySynced, setHasManuallySynced] = useState(false);
  const isManualSyncInProgress = useRef(false);

  useEffect(() => {
    console.log('[ACTIVE] Screen mounted, user:', user?.id || 'none');
    if (user) {
      console.log('[ACTIVE] Fetching active journey for user:', user.id);
      fetchActiveJourney(user.id);
    }
  }, [user]);

  useEffect(() => {
    if (user && activeSource) {
      console.log('[ACTIVE] User and health source available, fetching health data');
      fetchHealthData();
    } else {
      console.log('[ACTIVE] Health data fetch skipped:', { hasUser: !!user, hasActiveSource: !!activeSource });
    }
  }, [user, activeSource]);

  // Only auto-sync on initial load, not on every healthData change
  useEffect(() => {
    if (activeJourney && healthData && healthData.distance && !hasManuallySynced) {
      // Only auto-sync once when health data is first loaded
      const timer = setTimeout(() => {
        syncProgress();
      }, 1000); // Small delay to prevent immediate sync
      
      return () => clearTimeout(timer);
    }
  }, [healthData?.distance, activeJourney?.id]); // Only depend on the actual values, not the whole objects

  const syncProgress = async () => {
    if (!activeJourney || !healthData || !healthData.distance) {
      console.log('[ACTIVE] Sync skipped - missing data:', { 
        hasActiveJourney: !!activeJourney, 
        hasHealthData: !!healthData, 
        hasDistance: !!healthData?.distance 
      });
      return;
    }

    console.log('[ACTIVE] Starting progress sync');
    console.log('[ACTIVE] Current distance:', `${(activeJourney.distance_traveled / 1000).toFixed(2)} km`);
    console.log('[ACTIVE] New health data distance:', `${(healthData.distance / 1000).toFixed(2)} km`);
    
    setSyncing(true);
    try {
      const newDistance = activeJourney.distance_traveled + healthData.distance;
      const journeyTotal = activeJourney.journey?.total_distance || 0;
      const cappedDistance = Math.min(newDistance, journeyTotal);

      console.log('[ACTIVE] Calculated new distance:', `${(newDistance / 1000).toFixed(2)} km`);
      console.log('[ACTIVE] Journey total:', `${(journeyTotal / 1000).toFixed(2)} km`);
      console.log('[ACTIVE] Capped distance:', `${(cappedDistance / 1000).toFixed(2)} km`);

      await updateProgress(activeJourney.id, cappedDistance);

      // Check for milestone achievements
      if (user && activeJourney) {
        console.log('[ACTIVE] Checking for milestone achievements');
        await checkMilestones(cappedDistance);
        console.log('[ACTIVE] Refreshing active journey data');
        await fetchActiveJourney(user.id);
      }
      
      console.log('[ACTIVE] Progress sync completed successfully');
    } catch (error) {
      console.error('[ACTIVE] Error syncing progress:', error);
    } finally {
      setSyncing(false);
    }
  };

  const checkMilestones = async (currentDistance: number) => {
    if (!user || !activeJourney || !milestones.length) {
      console.log('[ACTIVE] Milestone check skipped:', { 
        hasUser: !!user, 
        hasActiveJourney: !!activeJourney, 
        milestonesCount: milestones.length 
      });
      return;
    }

    console.log('[ACTIVE] Checking milestones for distance:', `${(currentDistance / 1000).toFixed(2)} km`);
    const achievedMilestoneIds = new Set(achievedMilestones.map((m) => m.milestone_id));
    console.log('[ACTIVE] Already achieved milestones:', achievedMilestoneIds.size);

    for (const milestone of milestones) {
      // Check if milestone is achieved but not yet recorded
      if (
        currentDistance >= milestone.distance_from_start &&
        !achievedMilestoneIds.has(milestone.id)
      ) {
        console.log('[ACTIVE] 🎉 New milestone achieved!', { 
          name: milestone.name, 
          distance: `${(milestone.distance_from_start / 1000).toFixed(2)} km` 
        });
        try {
          // Record milestone achievement
          const { error } = await supabase.from('user_milestones').insert({
            user_id: user.id,
            milestone_id: milestone.id,
            user_journey_id: activeJourney.id,
          });

          if (error) {
            console.error('[ACTIVE] Error recording milestone in database:', error);
            throw error;
          }

          console.log('[ACTIVE] Milestone recorded successfully in database');
          // Send notification
          await sendMilestoneNotification(milestone.name);
          console.log('[ACTIVE] Milestone notification sent');

          // Refresh achieved milestones
          await fetchAchievedMilestones(user.id, activeJourney.id);
        } catch (error) {
          console.error('[ACTIVE] Error recording milestone:', error);
        }
      }
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    if (user) {
      await fetchActiveJourney(user.id);
      await refreshHealthData();
    }
    setRefreshing(false);
  };

  const handleManualSync = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (isManualSyncInProgress.current || syncing) {
      return;
    }
    
    isManualSyncInProgress.current = true;
    setHasManuallySynced(true);
    setSyncing(true);
    
    try {
      await refreshHealthData();
      // Wait a moment for healthData to update in the store
      await new Promise(resolve => setTimeout(resolve, 300));
      // Get the latest healthData from the store after refresh
      const currentHealthData = useHealthStore.getState().healthData;
      if (currentHealthData && currentHealthData.distance && activeJourney) {
        // Manually trigger sync with the fresh data
        const newDistance = activeJourney.distance_traveled + currentHealthData.distance;
        const journeyTotal = activeJourney.journey?.total_distance || 0;
        const cappedDistance = Math.min(newDistance, journeyTotal);
        
        await updateProgress(activeJourney.id, cappedDistance);
        
        // Check for milestone achievements
        if (user && activeJourney) {
          await checkMilestones(cappedDistance);
          await fetchActiveJourney(user.id);
        }
      }
    } catch (error) {
      console.error('Error in manual sync:', error);
    } finally {
      setSyncing(false);
      isManualSyncInProgress.current = false;
    }
  }, [syncing, activeJourney, refreshHealthData, updateProgress, user]);

  if (!activeJourney) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.center}>
        <Text variant="headlineSmall" style={styles.emptyTitle}>
          No Active Journey
        </Text>
        <Text variant="bodyMedium" style={styles.emptyText}>
          Start a journey from the Journeys tab to begin tracking your progress
        </Text>
      </ScrollView>
    );
  }

  const journey = activeJourney.journey;
  if (!journey) return null;

  // Update header title with journey name
  useEffect(() => {
    if (journey) {
      navigation.setOptions({
        headerTitle: journey.name || 'My Progress',
      });
    }
  }, [journey, navigation]);

  const progress = journey.total_distance > 0
    ? activeJourney.distance_traveled / journey.total_distance
    : 0;
  const remainingDistance = Math.max(0, journey.total_distance - activeJourney.distance_traveled);
  const remainingKm = (remainingDistance / 1000).toFixed(1);
  const traveledKm = (activeJourney.distance_traveled / 1000).toFixed(1);
  const totalKm = (journey.total_distance / 1000).toFixed(0);

  // Find current and next milestones
  const achievedMilestoneIds = new Set(achievedMilestones.map((m) => m.milestone_id));
  const sortedMilestones = [...milestones].sort((a, b) => a.order - b.order);
  
  let currentMilestone: Milestone | null = null;
  let nextMilestone: Milestone | null = null;

  for (let i = sortedMilestones.length - 1; i >= 0; i--) {
    if (activeJourney.distance_traveled >= sortedMilestones[i].distance_from_start) {
      if (achievedMilestoneIds.has(sortedMilestones[i].id)) {
        currentMilestone = sortedMilestones[i];
      }
      break;
    }
  }

  for (const milestone of sortedMilestones) {
    if (
      activeJourney.distance_traveled < milestone.distance_from_start &&
      !achievedMilestoneIds.has(milestone.id)
    ) {
      nextMilestone = milestone;
      break;
    }
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      <View style={styles.header}>
        <Text variant="bodyMedium" style={styles.subtitle}>
          {journey.description}
        </Text>
      </View>

      <Card style={styles.progressCard}>
        <Card.Content>
          <ProgressBar progress={progress} label="Journey Progress" />
          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text variant="headlineSmall" style={styles.statValue}>
                {traveledKm}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                km traveled
              </Text>
            </View>
            <Divider style={styles.divider} />
            <View style={styles.stat}>
              <Text variant="headlineSmall" style={styles.statValue}>
                {remainingKm}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                km remaining
              </Text>
            </View>
            <Divider style={styles.divider} />
            <View style={styles.stat}>
              <Text variant="headlineSmall" style={styles.statValue}>
                {totalKm}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                km total
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {!activeSource && (
        <View style={styles.section}>
          <HealthSourceSelector />
        </View>
      )}

      {activeSource && (
        <Card style={styles.healthCard}>
          <Card.Content>
            <View style={styles.healthHeader}>
              <Text variant="titleMedium">Health Data</Text>
              <Button
                mode="outlined"
                onPress={handleManualSync}
                loading={syncing}
                disabled={syncing}
                compact
              >
                Refresh
              </Button>
            </View>
            {healthData && (
              <View style={styles.healthData}>
                <Text variant="bodyMedium">
                  Steps: {healthData.steps?.toLocaleString() || 'N/A'}
                </Text>
                <Text variant="bodyMedium">
                  Distance: {healthData.distance ? `${(healthData.distance / 1000).toFixed(2)} km` : 'N/A'}
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>
      )}

      {nextMilestone && (
        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Next Milestone
          </Text>
          <MilestoneCard milestone={nextMilestone} isNext />
        </View>
      )}

      {currentMilestone && (
        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Current Milestone
          </Text>
          <MilestoneCard milestone={currentMilestone} achieved />
        </View>
      )}

      {achievedMilestones.length > 0 && (
        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Achieved Milestones ({achievedMilestones.length})
          </Text>
          {achievedMilestones
            .sort((a, b) => {
              const milestoneA = milestones.find((m) => m.id === a.milestone_id);
              const milestoneB = milestones.find((m) => m.id === b.milestone_id);
              return (milestoneA?.order || 0) - (milestoneB?.order || 0);
            })
            .map((userMilestone) => {
              const milestone = milestones.find((m) => m.id === userMilestone.milestone_id);
              if (!milestone) return null;
              return (
                <MilestoneCard key={userMilestone.id} milestone={milestone} achieved />
              );
            })}
        </View>
      )}

      {milestones.length > 0 && achievedMilestones.length === 0 && (
        <View style={styles.section}>
          <Text variant="bodyMedium" style={styles.emptyMilestones}>
            Keep walking to achieve your first milestone!
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  header: {
    padding: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  subtitle: {
    opacity: 0.7,
  },
  progressCard: {
    margin: 16,
    marginTop: 8,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontWeight: 'bold',
    color: '#6200ee',
  },
  statLabel: {
    marginTop: 4,
    opacity: 0.7,
  },
  divider: {
    width: 1,
    marginHorizontal: 8,
  },
  section: {
    marginTop: 8,
  },
  sectionTitle: {
    marginHorizontal: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  healthCard: {
    margin: 16,
    marginTop: 8,
  },
  healthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  healthData: {
    gap: 8,
  },
  emptyTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.7,
  },
  emptyMilestones: {
    textAlign: 'center',
    padding: 20,
    opacity: 0.7,
  },
});

