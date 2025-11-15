import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { getAvailableJourneys, startJourney } from '@/lib/journeys';
import { Journey } from '@/types';
import { MaterialIcons } from '@expo/vector-icons';
import { Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

type JourneyWithStatus = Journey & { user_journey_id?: string; is_active?: boolean };
type FilterType = 'all' | 'free' | 'premium';

export default function JourneysScreen() {
  const [journeys, setJourneys] = useState<JourneyWithStatus[]>([]);
  const [filteredJourneys, setFilteredJourneys] = useState<JourneyWithStatus[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [startingJourney, setStartingJourney] = useState<string | null>(null);

  const loadJourneys = async () => {
    try {
      const data = await getAvailableJourneys();
      setJourneys(data);
      applyFilter(data, filter);
    } catch (error) {
      console.error('Error loading journeys:', error);
      Alert.alert('Error', 'Failed to load journeys');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFilter = useCallback((journeyList: JourneyWithStatus[], filterType: FilterType) => {
    let filtered: JourneyWithStatus[];
    switch (filterType) {
      case 'premium':
        filtered = journeyList.filter(j => j.is_premium === true);
        break;
      case 'free':
        filtered = journeyList.filter(j => !j.is_premium || j.is_premium === false);
        break;
      default:
        filtered = journeyList;
    }
    setFilteredJourneys(filtered);
  }, []);

  useEffect(() => {
    applyFilter(journeys, filter);
  }, [filter, journeys, applyFilter]);

  useEffect(() => {
    loadJourneys();
  }, []);

  // Reload when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadJourneys();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadJourneys();
  };

  const handleStartJourney = async (journeyId: string, userJourneyId?: string, isPremium?: boolean) => {
    // If premium, navigate to payment screen
    if (isPremium) {
      router.push(`/(tabs)/payment/${journeyId}`);
      return;
    }

    setStartingJourney(journeyId);
    try {
      const userJourney = await startJourney(journeyId);
      // Reload journeys to update status
      await loadJourneys();
      // Navigate directly to progress page
      if (userJourney.id) {
        router.push(`/(tabs)/progress/${userJourney.id}`);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to start journey');
    } finally {
      setStartingJourney(null);
    }
  };

  const handleJourneyPress = (journey: JourneyWithStatus) => {
    if (journey.is_active && journey.user_journey_id) {
      // If active, go to progress page
      router.push(`/(tabs)/progress/${journey.user_journey_id}`);
    } else {
      // If not active, go to journey detail page
      router.push(`/(tabs)/journey/${journey.id}`);
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

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Available Journeys</Text>
        <Text style={styles.subtitle}>Choose your next adventure</Text>

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterButtonText, filter === 'all' && styles.filterButtonTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'free' && styles.filterButtonActive]}
            onPress={() => setFilter('free')}
          >
            <Text style={[styles.filterButtonText, filter === 'free' && styles.filterButtonTextActive]}>
              Free
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'premium' && styles.filterButtonActive]}
            onPress={() => setFilter('premium')}
          >
            <MaterialIcons 
              name="star" 
              size={16} 
              color={filter === 'premium' ? '#fff' : '#6b7280'} 
            />
            <Text style={[styles.filterButtonText, filter === 'premium' && styles.filterButtonTextActive]}>
              Premium
            </Text>
          </TouchableOpacity>
        </View>

        {filteredJourneys.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="explore-off" size={64} color="#9ca3af" />
            <Text style={styles.emptyText}>No journeys available</Text>
          </View>
        ) : (
          filteredJourneys.map((journey) => (
            <TouchableOpacity
              key={journey.id}
              style={styles.journeyCard}
              onPress={() => handleJourneyPress(journey)}
            >
              {journey.image_url && (
                <Image
                  source={{ uri: journey.image_url }}
                  style={styles.journeyImage}
                  resizeMode="cover"
                />
              )}
              <View style={styles.journeyHeader}>
                <View style={styles.journeyInfo}>
                  <View style={styles.journeyNameRow}>
                    <Text style={styles.journeyName}>{journey.name}</Text>
                    {journey.is_premium && (
                      <View style={styles.premiumBadge}>
                        <MaterialIcons name="star" size={14} color="#fbbf24" />
                        <Text style={styles.premiumBadgeText}>Premium</Text>
                      </View>
                    )}
                    {journey.is_active && (
                      <View style={styles.activeBadge}>
                        <Text style={styles.activeBadgeText}>In Progress</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.journeyMeta}>
                    <View
                      style={[
                        styles.difficultyBadge,
                        { backgroundColor: getDifficultyColor(journey.difficulty) },
                      ]}
                    >
                      <Text style={styles.difficultyText}>
                        {journey.difficulty.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.distance}>{formatDistance(journey.total_distance)}</Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#6b7280" />
              </View>
              <Text style={styles.journeyDescription} numberOfLines={2}>
                {journey.description}
              </Text>
              <View style={styles.routeInfo}>
                <MaterialIcons name="place" size={16} color="#6b7280" />
                <Text style={styles.routeText}>
                  {journey.start_location} → {journey.end_location}
                </Text>
              </View>
              {!journey.is_active && (
                <TouchableOpacity
                  style={[
                    styles.startButton,
                    startingJourney === journey.id && styles.startButtonDisabled,
                  ]}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleStartJourney(journey.id, journey.user_journey_id, journey.is_premium);
                  }}
                  disabled={startingJourney === journey.id}
                >
                  {startingJourney === journey.id ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Text style={styles.startButtonText}>Start Journey</Text>
                      <MaterialIcons name="play-arrow" size={20} color="#fff" />
                    </>
                  )}
                </TouchableOpacity>
              )}
              {journey.is_active && (
                <TouchableOpacity
                  style={styles.viewProgressButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    if (journey.user_journey_id) {
                      router.push(`/(tabs)/progress/${journey.user_journey_id}`);
                    }
                  }}
                >
                  <Text style={styles.viewProgressButtonText}>View Progress</Text>
                  <MaterialIcons name="arrow-forward" size={20} color="#2563eb" />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          ))
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
    marginBottom: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 6,
  },
  filterButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  journeyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  journeyImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#e5e7eb',
  },
  journeyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  journeyInfo: {
    flex: 1,
  },
  journeyNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  journeyName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  premiumBadgeText: {
    color: '#92400e',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  activeBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  activeBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  journeyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  difficultyText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  distance: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
  journeyDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  routeText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },
  startButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  startButtonDisabled: {
    opacity: 0.6,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  viewProgressButton: {
    backgroundColor: '#e0e7ff',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  viewProgressButtonText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 16,
  },
});

