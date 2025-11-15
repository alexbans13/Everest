import { View, StyleSheet } from 'react-native';
import { Card, Text, IconButton } from 'react-native-paper';
import { Milestone } from '../types';

interface MilestoneCardProps {
  milestone: Milestone;
  achieved?: boolean;
  isNext?: boolean;
  onPress?: () => void;
}

export default function MilestoneCard({ milestone, achieved, isNext, onPress }: MilestoneCardProps) {
  const distanceKm = (milestone.distance_from_start / 1000).toFixed(1);

  return (
    <Card
      style={[
        styles.card,
        achieved ? styles.achievedCard : null,
        isNext ? styles.nextCard : null,
      ]}
      mode={achieved ? 'elevated' : 'outlined'}
      onPress={onPress}
    >
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text variant="titleMedium" style={styles.title}>
              {milestone.name}
            </Text>
            {achieved && (
              <IconButton
                icon="check-circle"
                iconColor="#4caf50"
                size={20}
                style={styles.checkIcon}
              />
            )}
            {isNext && !achieved && (
              <View style={styles.nextBadge}>
                <Text variant="labelSmall" style={styles.nextText}>
                  Next
                </Text>
              </View>
            )}
          </View>
        </View>
        <Text variant="bodyMedium" style={styles.description}>
          {milestone.description}
        </Text>
        <View style={styles.details}>
          <Text variant="bodySmall" style={styles.distance}>
            {distanceKm} km from start
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 12,
    marginBottom: 8,
  },
  achievedCard: {
    backgroundColor: '#e8f5e9',
    borderColor: '#4caf50',
  },
  nextCard: {
    borderColor: '#6200ee',
    borderWidth: 2,
  },
  header: {
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    flex: 1,
    fontWeight: 'bold',
  },
  checkIcon: {
    margin: 0,
  },
  nextBadge: {
    backgroundColor: '#6200ee',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  nextText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  description: {
    marginBottom: 8,
    opacity: 0.8,
  },
  details: {
    marginTop: 4,
  },
  distance: {
    fontWeight: '600',
    color: '#6200ee',
  },
});

