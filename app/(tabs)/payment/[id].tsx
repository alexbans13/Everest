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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getJourneyById } from '@/lib/journeys';
import { Journey } from '@/types';
import { MaterialIcons } from '@expo/vector-icons';

export default function PaymentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [journey, setJourney] = useState<Journey | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const insets = useSafeAreaInsets();
  const price = 3.00; // 3 euros

  useEffect(() => {
    loadJourney();
  }, [id]);

  const loadJourney = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await getJourneyById(id);
      setJourney(data);
    } catch (error) {
      console.error('Error loading journey:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    setProcessing(true);
    // TODO: Implement actual payment processing
    // For now, just simulate processing
    setTimeout(() => {
      setProcessing(false);
      // In a real implementation, after successful payment, start the journey
      // For now, we'll just show a message
      router.back();
    }, 2000);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!journey) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Journey not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.content, { paddingTop: Math.max(insets.top + 20, 40) }]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="#1f2937" />
          </TouchableOpacity>
        </View>

        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <MaterialIcons name="lock" size={48} color="#2563eb" />
          </View>
        </View>

        <Text style={styles.title}>Unlock Premium Journey</Text>
        <Text style={styles.subtitle}>{journey.name}</Text>

        <View style={styles.journeyCard}>
          <Text style={styles.journeyName}>{journey.name}</Text>
          <Text style={styles.journeyDescription}>{journey.description}</Text>
          
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <MaterialIcons name="check-circle" size={20} color="#10b981" />
              <Text style={styles.featureText}>Full journey access</Text>
            </View>
            <View style={styles.featureItem}>
              <MaterialIcons name="check-circle" size={20} color="#10b981" />
              <Text style={styles.featureText}>Progress tracking</Text>
            </View>
            <View style={styles.featureItem}>
              <MaterialIcons name="check-circle" size={20} color="#10b981" />
              <Text style={styles.featureText}>Milestone achievements</Text>
            </View>
            <View style={styles.featureItem}>
              <MaterialIcons name="check-circle" size={20} color="#10b981" />
              <Text style={styles.featureText}>Lifetime access</Text>
            </View>
          </View>
        </View>

        <View style={styles.pricingCard}>
          <Text style={styles.pricingLabel}>Price</Text>
          <Text style={styles.pricingAmount}>€{price.toFixed(2)}</Text>
        </View>

        <GradientButton
          onPress={handlePurchase}
          title={`Purchase for €${price.toFixed(2)}`}
          icon="payment"
          disabled={processing}
          loading={processing}
          variant="secondary"
        />

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={processing}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <View style={styles.noteCard}>
          <MaterialIcons name="info" size={20} color="#6b7280" />
          <Text style={styles.noteText}>
            Payment processing is not implemented yet. This is a demo screen.
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
    paddingBottom: 100,
  },
  header: {
    marginBottom: 20,
  },
  backButton: {
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
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  journeyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
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
    marginBottom: 20,
    lineHeight: 24,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#1f2937',
  },
  pricingCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  pricingLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  pricingAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  cancelButton: {
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '500',
  },
  noteCard: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 20,
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
  backButtonText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '600',
  },
});

