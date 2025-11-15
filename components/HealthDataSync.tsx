import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { connectHealthSource, getConnectedSources } from '@/lib/health';
import { HealthDataSource } from '@/types';

interface HealthDataSyncProps {
  onSync?: () => void;
}

export default function HealthDataSync({ onSync }: HealthDataSyncProps) {
  const [connectedSources, setConnectedSources] = useState<HealthDataSource[]>([]);
  const [loading, setLoading] = useState(false);

  const loadSources = async () => {
    try {
      const sources = await getConnectedSources();
      setConnectedSources(sources);
    } catch (error) {
      console.error('Error loading health sources:', error);
    }
  };

  const handleConnect = async (sourceType: HealthDataSource['source_type']) => {
    setLoading(true);
    try {
      await connectHealthSource(sourceType);
      Alert.alert('Success', `${sourceType} connected successfully!`);
      await loadSources();
      onSync?.();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to connect health source');
    } finally {
      setLoading(false);
    }
  };

  const getSourceName = (source: HealthDataSource['source_type']) => {
    const names: Record<HealthDataSource['source_type'], string> = {
      google_fit: 'Google Fit',
      samsung_health: 'Samsung Health',
      garmin: 'Garmin',
      apple_health: 'Apple Health',
    };
    return names[source];
  };

  const getSourceIcon = (source: HealthDataSource['source_type']) => {
    const icons: Record<HealthDataSource['source_type'], string> = {
      google_fit: 'fitness-center',
      samsung_health: 'watch',
      garmin: 'watch',
      apple_health: 'favorite',
    };
    return icons[source];
  };

  const sources: HealthDataSource['source_type'][] = [
    'google_fit',
    'samsung_health',
    'garmin',
    'apple_health',
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connect Health Data Sources</Text>
      <Text style={styles.subtitle}>
        Sync your activity data from your favorite health apps
      </Text>

      {sources.map((source) => {
        const isConnected = connectedSources.some((s) => s.source_type === source);
        return (
          <TouchableOpacity
            key={source}
            style={[styles.sourceCard, isConnected && styles.sourceCardConnected]}
            onPress={() => handleConnect(source)}
            disabled={loading || isConnected}
          >
            <MaterialIcons
              name={getSourceIcon(source) as any}
              size={32}
              color={isConnected ? '#10b981' : '#2563eb'}
            />
            <View style={styles.sourceInfo}>
              <Text style={styles.sourceName}>{getSourceName(source)}</Text>
              <Text style={styles.sourceStatus}>
                {isConnected ? 'Connected' : 'Tap to connect'}
              </Text>
            </View>
            {isConnected ? (
              <MaterialIcons name="check-circle" size={24} color="#10b981" />
            ) : (
              <MaterialIcons name="chevron-right" size={24} color="#6b7280" />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
  },
  sourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sourceCardConnected: {
    borderWidth: 2,
    borderColor: '#10b981',
  },
  sourceInfo: {
    flex: 1,
    marginLeft: 16,
  },
  sourceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  sourceStatus: {
    fontSize: 14,
    color: '#6b7280',
  },
});

