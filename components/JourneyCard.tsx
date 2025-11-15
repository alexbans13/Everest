import { View, StyleSheet, Image } from 'react-native';
import { Card, Text, Button } from 'react-native-paper';
import { Journey } from '../types';

interface JourneyCardProps {
  journey: Journey;
  onStart: () => void;
  isActive?: boolean;
}

export default function JourneyCard({ journey, onStart, isActive }: JourneyCardProps) {
  const distanceKm = (journey.total_distance / 1000).toFixed(0);

  return (
    <Card style={styles.card} mode={isActive ? 'elevated' : 'outlined'}>
      {journey.image_url && (
        <Card.Cover source={{ uri: journey.image_url }} style={styles.cover} />
      )}
      <Card.Content style={styles.content}>
        <Text variant="titleLarge" style={styles.title}>
          {journey.name}
        </Text>
        <Text variant="bodyMedium" style={styles.description}>
          {journey.description}
        </Text>
        <View style={styles.details}>
          <Text variant="bodySmall" style={styles.distance}>
            Total Distance: {distanceKm} km
          </Text>
        </View>
        {isActive && (
          <View style={styles.activeBadge}>
            <Text variant="labelSmall" style={styles.activeText}>
              Active Journey
            </Text>
          </View>
        )}
      </Card.Content>
      <Card.Actions style={styles.actions}>
        <Button
          mode={isActive ? 'outlined' : 'contained'}
          onPress={onStart}
          disabled={isActive}
        >
          {isActive ? 'In Progress' : 'Start Journey'}
        </Button>
      </Card.Actions>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 16,
    marginBottom: 8,
  },
  cover: {
    height: 150,
  },
  content: {
    paddingTop: 12,
  },
  title: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  description: {
    marginBottom: 12,
    opacity: 0.7,
  },
  details: {
    marginTop: 8,
  },
  distance: {
    fontWeight: '600',
    color: '#6200ee',
  },
  activeBadge: {
    marginTop: 8,
    padding: 4,
    backgroundColor: '#e8f5e9',
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  activeText: {
    color: '#2e7d32',
    fontWeight: 'bold',
  },
  actions: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});

