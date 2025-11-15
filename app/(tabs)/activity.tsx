import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { syncMultipleHealthData, getHealthData, ensureHealthDataRecords } from '@/lib/health';
import { syncJourneyProgressFromHealthData } from '@/lib/journeys';
import { getCurrentUser } from '@/lib/auth';

interface ActivityData {
  date: string;
  steps: number;
  distance: number; // in meters
  elevation: number; // in meters
  calories: number;
  activeMinutes: number;
}

export default function ActivityScreen() {
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshingData, setRefreshingData] = useState(false);

  // Load existing health data from database and convert to ActivityData format
  const loadExistingHealthData = async (): Promise<Map<string, ActivityData>> => {
    try {
      // Get profile creation date
      const user = await getCurrentUser();
      if (!user) {
        return new Map();
      }
      
      const profileCreatedDate = new Date(user.created_at);
      profileCreatedDate.setHours(0, 0, 0, 0);
      
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      
      const startDate = profileCreatedDate.toISOString().split('T')[0];
      const endDate = today.toISOString().split('T')[0];

      const healthData = await getHealthData(startDate, endDate);
      const dataMap = new Map<string, ActivityData>();

      // Group by date and sum up data from all sources
      healthData.forEach((entry) => {
        const existing = dataMap.get(entry.date);
        if (existing) {
          // Take the maximum values for each day (in case of multiple sources)
          dataMap.set(entry.date, {
            date: entry.date,
            steps: Math.max(existing.steps, entry.steps),
            distance: Math.max(existing.distance, entry.distance),
            elevation: existing.elevation, // Keep existing elevation
            calories: Math.max(existing.calories || 0, entry.calories || 0),
            activeMinutes: existing.activeMinutes, // Keep existing
          });
        } else {
          dataMap.set(entry.date, {
            date: entry.date,
            steps: entry.steps,
            distance: entry.distance,
            elevation: 0, // Default elevation
            calories: entry.calories || 0,
            activeMinutes: 0, // Default active minutes
          });
        }
      });

      return dataMap;
    } catch (error) {
      console.error('Error loading existing health data:', error);
      return new Map();
    }
  };

  // Load activity data from database
  const loadActivityDataFromDB = async (): Promise<ActivityData[]> => {
    // Get profile creation date
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not found');
    }
    
    const profileCreatedDate = new Date(user.created_at);
    profileCreatedDate.setHours(0, 0, 0, 0); // Start of day

    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    
    // Start from profile creation date, not just last 7 days
    const startDate = profileCreatedDate.toISOString().split('T')[0];
    const endDate = today.toISOString().split('T')[0];

    console.log('Loading health data from', startDate, 'to', endDate);
    const healthData = await getHealthData(startDate, endDate);
    console.log('Fetched health data:', healthData.length, 'records');
    console.log('Raw health data:', JSON.stringify(healthData, null, 2));
    
    const dataMap = new Map<string, ActivityData>();

    // Group by date and take max values (in case of multiple sources)
    healthData.forEach((entry) => {
      console.log('Processing entry:', {
        date: entry.date,
        steps: entry.steps,
        distance: entry.distance,
        elevation: entry.elevation,
        calories: entry.calories,
        source: entry.source
      });
      
      // Ensure date is in YYYY-MM-DD format (handle both DATE and TIMESTAMP formats)
      let dateKey: string;
      if (typeof entry.date === 'string') {
        dateKey = entry.date.split('T')[0].split(' ')[0]; // Handle both ISO and date strings
      } else {
        dateKey = entry.date;
      }
      
      // Ensure we have valid numbers (handle null/undefined)
      // Use nullish coalescing to preserve 0 values but convert null/undefined to 0
      const steps = entry.steps != null ? Number(entry.steps) : 0;
      const distance = entry.distance != null ? Number(entry.distance) : 0;
      const elevation = entry.elevation != null ? Number(entry.elevation) : 0;
      const calories = entry.calories != null ? Number(entry.calories) : 0;
      
      console.log('Converted values:', { steps, distance, elevation, calories, original: entry });
      
      const existing = dataMap.get(dateKey);
      if (existing) {
        dataMap.set(dateKey, {
          date: dateKey,
          steps: Math.max(existing.steps, steps),
          distance: Math.max(existing.distance, distance),
          elevation: Math.max(existing.elevation, elevation),
          calories: Math.max(existing.calories, calories),
          activeMinutes: existing.activeMinutes || 0,
        });
      } else {
        dataMap.set(dateKey, {
          date: dateKey,
          steps,
          distance,
          elevation,
          calories,
          activeMinutes: 0,
        });
      }
    });

    console.log('Data map size:', dataMap.size);
    console.log('Data map entries:', Array.from(dataMap.entries()));

    // Convert map to array - show ALL days that have ANY data in the database
    // Filter out only if ALL metrics are exactly 0 (meaning no data was recorded)
    const data: ActivityData[] = Array.from(dataMap.values()).filter((item) => {
      // Check if there's any activity - at least one metric should be > 0
      const hasAnyActivity = 
        (item.steps && item.steps > 0) || 
        (item.distance && item.distance > 0) || 
        (item.calories && item.calories > 0) || 
        (item.elevation && item.elevation > 0);
      
      console.log('Filtering item:', item.date, {
        hasAnyActivity,
        steps: item.steps,
        distance: item.distance,
        calories: item.calories,
        elevation: item.elevation,
        willShow: hasAnyActivity
      });
      
      return hasAnyActivity;
    });

    console.log('Final data array size:', data.length);
    console.log('Final data:', JSON.stringify(data, null, 2));
    
    // Sort by date descending (most recent first)
    return data.sort((a, b) => b.date.localeCompare(a.date));
  };

  // Generate incremental activity data (for refresh button)
  const generateIncrementalData = async (): Promise<ActivityData[]> => {
    const existingData = await loadExistingHealthData();
    const today = new Date();
    const data: ActivityData[] = [];

    // Get profile creation date to limit date range
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not found');
    }
    
    const profileCreatedDate = new Date(user.created_at);
    profileCreatedDate.setHours(0, 0, 0, 0);
    
    // Only generate data for today (most recent day)
    const dateString = today.toISOString().split('T')[0];
    
    const existing = existingData.get(dateString);
    
    // Increment from existing data (or start from 0 if no data)
    const currentSteps = existing?.steps || 0;
    const currentDistance = existing?.distance || 0;
    const currentElevation = existing?.elevation || 0;
    const currentCalories = existing?.calories || 0;
    const currentActiveMinutes = existing?.activeMinutes || 0;

    const stepIncrement = 500 + Math.random() * 1000; // 500-1500 steps
    const distanceIncrement = stepIncrement * 0.75; // ~0.75m per step
    const elevationIncrement = 10 + Math.random() * 30; // 10-40m
    const calorieIncrement = stepIncrement * 0.04; // ~0.04 calories per step
    const activeMinuteIncrement = 5 + Math.random() * 15; // 5-20 minutes

    data.push({
      date: dateString,
      steps: currentSteps + Math.round(stepIncrement),
      distance: currentDistance + Math.round(distanceIncrement),
      elevation: currentElevation + Math.round(elevationIncrement),
      calories: currentCalories + Math.round(calorieIncrement),
      activeMinutes: currentActiveMinutes + Math.round(activeMinuteIncrement),
    });

    return data;
  };

  const loadActivityData = useCallback(async (incremental = false, isRefresh = false) => {
    try {
      // Only show full-page loading on initial load, not on refresh
      if (!isRefresh) {
        setLoading(true);
      }
      
      let data: ActivityData[];
      
      if (incremental) {
        // Generate incremental data and sync to database
        data = await generateIncrementalData();
        
        // Sync health data to database
        const healthDataToSync = data.map((day) => ({
          date: day.date,
          steps: day.steps,
          distance: day.distance,
          elevation: day.elevation,
          calories: day.calories,
          source: 'manual' as const,
        }));
        
        await syncMultipleHealthData(healthDataToSync);
        
        // Update journey progress based on synced health data
        await syncJourneyProgressFromHealthData();
        
        // After syncing, reload all data from database to get updated values
        data = await loadActivityDataFromDB();
      } else {
        // Just load from database (no syncing)
        data = await loadActivityDataFromDB();
      }
      
      setActivityData(data);
    } catch (error) {
      console.error('Error loading activity data:', error);
      Alert.alert('Error', 'Failed to load activity data');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setRefreshingData(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadActivityData(false); // Load existing data from database
    }, [])
  );

  const handleRefresh = async () => {
    setRefreshingData(true);
    await loadActivityData(true, true); // Pass true for isRefresh to prevent full-page loading
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
  };

  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(2)} km`;
    }
    return `${meters.toFixed(0)} m`;
  };

  const getTotalStats = () => {
    return activityData.reduce(
      (acc, day) => ({
        steps: acc.steps + day.steps,
        distance: acc.distance + day.distance,
        elevation: acc.elevation + day.elevation,
        calories: acc.calories + day.calories,
        activeMinutes: acc.activeMinutes + day.activeMinutes,
      }),
      { steps: 0, distance: 0, elevation: 0, calories: 0, activeMinutes: 0 }
    );
  };

  const totals = getTotalStats();
  const dayCount = activityData.length || 1; // Avoid division by zero
  const averages = {
    steps: Math.round(totals.steps / dayCount),
    distance: totals.distance / dayCount,
    elevation: Math.round(totals.elevation / dayCount),
    calories: Math.round(totals.calories / dayCount),
    activeMinutes: Math.round(totals.activeMinutes / dayCount),
  };

  if (loading && activityData.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            loadActivityData(false); // Reload from database
          }}
        />
      }
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>My Activity</Text>
          <Text style={styles.subtitle}>
            {activityData.length > 0 
              ? `${activityData.length} day${activityData.length !== 1 ? 's' : ''} with activity`
              : 'No activity yet'}
          </Text>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <MaterialIcons name="directions-walk" size={32} color="#2563eb" />
            <Text style={styles.summaryValue}>{totals.steps.toLocaleString()}</Text>
            <Text style={styles.summaryLabel}>Total Steps</Text>
            <Text style={styles.summaryAverage}>Avg: {averages.steps.toLocaleString()}/day</Text>
          </View>

          <View style={styles.summaryCard}>
            <MaterialIcons name="straighten" size={32} color="#10b981" />
            <Text style={styles.summaryValue}>{formatDistance(totals.distance)}</Text>
            <Text style={styles.summaryLabel}>Total Distance</Text>
            <Text style={styles.summaryAverage}>Avg: {formatDistance(averages.distance)}/day</Text>
          </View>

          <View style={styles.summaryCard}>
            <MaterialIcons name="trending-up" size={32} color="#f59e0b" />
            <Text style={styles.summaryValue}>{totals.elevation.toLocaleString()}m</Text>
            <Text style={styles.summaryLabel}>Elevation</Text>
            <Text style={styles.summaryAverage}>Avg: {averages.elevation}m/day</Text>
          </View>

          <View style={styles.summaryCard}>
            <MaterialIcons name="local-fire-department" size={32} color="#ef4444" />
            <Text style={styles.summaryValue}>{totals.calories.toLocaleString()}</Text>
            <Text style={styles.summaryLabel}>Calories</Text>
            <Text style={styles.summaryAverage}>Avg: {averages.calories}/day</Text>
          </View>
        </View>

        {/* Refresh Button */}
        <TouchableOpacity
          style={[styles.refreshButton, refreshingData && styles.refreshButtonDisabled]}
          onPress={handleRefresh}
          disabled={refreshingData}
        >
          {refreshingData ? (
            <>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.refreshButtonText}>Refreshing...</Text>
            </>
          ) : (
            <>
              <MaterialIcons name="refresh" size={20} color="#fff" />
              <Text style={styles.refreshButtonText}>Refresh Data</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Daily Activity List */}
        <View style={styles.dailySection}>
          <Text style={styles.sectionTitle}>Daily Breakdown</Text>
          {activityData.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="fitness-center" size={48} color="#9ca3af" />
              <Text style={styles.emptyStateText}>No activity data yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Start tracking your activity to see your progress here
              </Text>
            </View>
          ) : (
            activityData.map((day, index) => (
            <View key={day.date} style={styles.dailyCard}>
              <View style={styles.dailyHeader}>
                <View>
                  <Text style={styles.dailyDate}>{formatDate(day.date)}</Text>
                  <Text style={styles.dailySubtext}>
                    {day.activeMinutes} min active
                  </Text>
                </View>
                <View style={styles.dailyStats}>
                  <View style={styles.dailyStatItem}>
                    <MaterialIcons name="directions-walk" size={16} color="#6b7280" />
                    <Text style={styles.dailyStatValue}>{day.steps.toLocaleString()}</Text>
                  </View>
                  <View style={styles.dailyStatItem}>
                    <MaterialIcons name="straighten" size={16} color="#6b7280" />
                    <Text style={styles.dailyStatValue}>{formatDistance(day.distance)}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.dailyDetails}>
                <View style={styles.dailyDetailItem}>
                  <Text style={styles.dailyDetailLabel}>Elevation</Text>
                  <Text style={styles.dailyDetailValue}>{day.elevation}m</Text>
                </View>
                <View style={styles.dailyDetailItem}>
                  <Text style={styles.dailyDetailLabel}>Calories</Text>
                  <Text style={styles.dailyDetailValue}>{day.calories}</Text>
                </View>
              </View>
            </View>
            ))
          )}
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
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    width: '47%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  summaryAverage: {
    fontSize: 12,
    color: '#9ca3af',
  },
  refreshButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  refreshButtonDisabled: {
    opacity: 0.6,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  dailySection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  dailyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  dailyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  dailyDate: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  dailySubtext: {
    fontSize: 14,
    color: '#6b7280',
  },
  dailyStats: {
    flexDirection: 'row',
    gap: 16,
  },
  dailyStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dailyStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  dailyDetails: {
    flexDirection: 'row',
    gap: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  dailyDetailItem: {
    flex: 1,
  },
  dailyDetailLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  dailyDetailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});

