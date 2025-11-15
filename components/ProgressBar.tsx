import { View, StyleSheet } from 'react-native';
import { ProgressBar as PaperProgressBar, Text } from 'react-native-paper';

interface ProgressBarProps {
  progress: number; // 0 to 1
  label?: string;
  showPercentage?: boolean;
}

export default function ProgressBar({ progress, label, showPercentage = true }: ProgressBarProps) {
  const percentage = Math.min(Math.max(progress * 100, 0), 100);

  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.labelContainer}>
          <Text variant="bodyMedium" style={styles.label}>
            {label}
          </Text>
          {showPercentage && (
            <Text variant="bodyMedium" style={styles.percentage}>
              {percentage.toFixed(1)}%
            </Text>
          )}
        </View>
      )}
      <PaperProgressBar
        progress={progress}
        color="#6200ee"
        style={styles.progressBar}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontWeight: '600',
  },
  percentage: {
    fontWeight: 'bold',
    color: '#6200ee',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
});

