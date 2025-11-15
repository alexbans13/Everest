import { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, RadioButton, Button, Text, Divider } from 'react-native-paper';
import { useHealthStore } from '../store/healthStore';
import { useAuthStore } from '../store/authStore';
import { HealthSource } from '../types';
import { requestHealthPermissions } from '../lib/health-api';

export default function HealthSourceSelector() {
  const { healthSources, activeSource, fetchHealthSources, setActiveSource, connectHealthSource } = useHealthStore();
  const { user } = useAuthStore();
  const [selectedSource, setSelectedSource] = useState<HealthSource['source_type'] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeSource) {
      setSelectedSource(activeSource.source_type);
    }
  }, [activeSource]);

  const handleConnect = async (sourceType: HealthSource['source_type']) => {
    setLoading(true);
    try {
      // Request permissions first
      const hasPermission = await requestHealthPermissions(sourceType);
      if (!hasPermission) {
        // Handle permission denial
        return;
      }

      // Check if source already exists
      const existingSource = healthSources.find(s => s.source_type === sourceType);
      
      if (existingSource) {
        await setActiveSource(existingSource);
      } else {
        if (!user?.id) {
          throw new Error('User not authenticated');
        }

        await connectHealthSource(user.id, sourceType);
      }
      
      setSelectedSource(sourceType);
    } catch (error) {
      console.error('Error connecting health source:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (sourceType: HealthSource['source_type']) => {
    const source = healthSources.find(s => s.source_type === sourceType);
    if (source) {
      await setActiveSource(source);
      setSelectedSource(sourceType);
    } else {
      await handleConnect(sourceType);
    }
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.title}>
          Select Health Data Source
        </Text>
        <Text variant="bodySmall" style={styles.subtitle}>
          Choose where to pull your step and distance data from
        </Text>

        <View style={styles.options}>
          <RadioButton.Group
            onValueChange={(value) => handleSelect(value as HealthSource['source_type'])}
            value={selectedSource ?? undefined}
          >
            <View style={styles.option}>
              <RadioButton value="google_fit" />
              <View style={styles.optionContent}>
                <Text variant="bodyLarge">Google Fit</Text>
                <Text variant="bodySmall" style={styles.optionDescription}>
                  Connect your Google Fit account
                </Text>
              </View>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.option}>
              <RadioButton value="samsung_health" />
              <View style={styles.optionContent}>
                <Text variant="bodyLarge">Samsung Health</Text>
                <Text variant="bodySmall" style={styles.optionDescription}>
                  Connect your Samsung Health account
                </Text>
              </View>
            </View>

            <Divider style={styles.divider} />

            {require('react-native').Platform.OS === 'ios' && (
              <>
                <View style={styles.option}>
                  <RadioButton value="apple_health" />
                  <View style={styles.optionContent}>
                    <Text variant="bodyLarge">Apple Health</Text>
                    <Text variant="bodySmall" style={styles.optionDescription}>
                      Use your Apple Health data
                    </Text>
                  </View>
                </View>
                <Divider style={styles.divider} />
              </>
            )}
          </RadioButton.Group>
        </View>

        {activeSource && (
          <View style={styles.activeSource}>
            <Text variant="bodySmall" style={styles.activeText}>
              Active: {activeSource.source_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 16,
  },
  title: {
    marginBottom: 4,
  },
  subtitle: {
    marginBottom: 16,
    opacity: 0.7,
  },
  options: {
    marginTop: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  optionContent: {
    flex: 1,
    marginLeft: 8,
  },
  optionDescription: {
    opacity: 0.7,
    marginTop: 2,
  },
  divider: {
    marginVertical: 4,
  },
  activeSource: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  activeText: {
    fontWeight: 'bold',
    color: '#6200ee',
  },
});

