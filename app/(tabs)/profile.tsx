import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { getCurrentUser, updateProfile, signOut } from '@/lib/auth';
import { uploadProfileImage } from '@/lib/storage';
import { resetAllUserData } from '@/lib/reset';
import { User } from '@/types';
import { MaterialIcons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [unitPreference, setUnitPreference] = useState<'metric' | 'imperial'>('metric');
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
      setFullName(userData?.full_name || '');
      setUnitPreference(userData?.unit_preference || 'metric');
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateProfile({ 
        full_name: fullName,
        unit_preference: unitPreference 
      });
      setUser(updated);
      setEditing(false);
      Alert.alert('Success', 'Profile updated');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePickImage = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to upload a profile picture.');
        return;
      }

      // Launch image picker
      // Note: mediaTypes parameter removed as it causes issues on Android
      // The picker defaults to images when not specified
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0] && user) {
        setUploadingImage(true);
        const imageUri = result.assets[0].uri;
        
        // Upload image to Supabase Storage
        const avatarUrl = await uploadProfileImage(imageUri, user.id);
        
        // Update profile with new avatar URL
        const updated = await updateProfile({ avatar_url: avatarUrl });
        setUser(updated);
        Alert.alert('Success', 'Profile picture updated!');
      }
    } catch (error: any) {
      console.error('Error picking/uploading image:', error);
      Alert.alert('Error', error.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
            router.replace('/(auth)/login');
          } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to sign out');
          }
        },
      },
    ]);
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset All Data',
      'This will permanently delete all your health data and journey progress. This action cannot be undone. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            setResetting(true);
            try {
              await resetAllUserData();
              
              // Wait a moment to ensure database changes are committed
              await new Promise(resolve => setTimeout(resolve, 300));
              
              // Navigate to home and force refresh
              router.replace('/(tabs)/home');
              
              // Show success after navigation
              setTimeout(() => {
                Alert.alert('Success', 'All data has been reset successfully.');
              }, 500);
            } catch (error: any) {
              console.error('Reset error:', error);
              Alert.alert('Error', error.message || 'Failed to reset data');
            } finally {
              setResetting(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={handlePickImage}
            disabled={uploadingImage}
          >
            {user?.avatar_url ? (
              <Image source={{ uri: user.avatar_url }} style={styles.avatarImage} />
            ) : (
              <MaterialIcons name="person" size={48} color="#2563eb" />
            )}
            {uploadingImage && (
              <View style={styles.avatarOverlay}>
                <ActivityIndicator size="small" color="#fff" />
              </View>
            )}
            {!uploadingImage && (
              <View style={styles.avatarEditBadge}>
                <MaterialIcons name="camera-alt" size={20} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity onPress={handlePickImage} disabled={uploadingImage}>
            <Text style={styles.changePhotoText}>
              {uploadingImage ? 'Uploading...' : 'Change Photo'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{user?.email}</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Full Name</Text>
            {editing ? (
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter your name"
                autoFocus
              />
            ) : (
              <Text style={styles.value}>{user?.full_name || 'Not set'}</Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Unit Preference</Text>
            {editing ? (
              <View style={styles.unitSelector}>
                <TouchableOpacity
                  style={[
                    styles.unitOption,
                    unitPreference === 'metric' && styles.unitOptionActive
                  ]}
                  onPress={() => setUnitPreference('metric')}
                >
                  <Text style={[
                    styles.unitOptionText,
                    unitPreference === 'metric' && styles.unitOptionTextActive
                  ]}>
                    Metric
                  </Text>
                  {unitPreference === 'metric' && (
                    <MaterialIcons name="check" size={20} color="#2563eb" />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.unitOption,
                    unitPreference === 'imperial' && styles.unitOptionActive
                  ]}
                  onPress={() => setUnitPreference('imperial')}
                >
                  <Text style={[
                    styles.unitOptionText,
                    unitPreference === 'imperial' && styles.unitOptionTextActive
                  ]}>
                    Imperial
                  </Text>
                  {unitPreference === 'imperial' && (
                    <MaterialIcons name="check" size={20} color="#2563eb" />
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.value}>
                {user?.unit_preference === 'imperial' ? 'Imperial' : 'Metric'}
              </Text>
            )}
          </View>

          {editing ? (
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setEditing(false);
                  setFullName(user?.full_name || '');
                  setUnitPreference(user?.unit_preference || 'metric');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.button}
              onPress={() => setEditing(true)}
            >
              <MaterialIcons name="edit" size={20} color="#fff" />
              <Text style={styles.buttonText}>Edit Profile</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health Data Sources</Text>
          <TouchableOpacity
            style={styles.sourceCard}
            onPress={() => Alert.alert('Coming Soon', 'Health data source connection coming soon!')}
          >
            <MaterialIcons name="fitness-center" size={24} color="#2563eb" />
            <View style={styles.sourceInfo}>
              <Text style={styles.sourceName}>Connect Health Data</Text>
              <Text style={styles.sourceDescription}>
                Connect Google Fit, Samsung Health, Garmin, and more
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danger Zone</Text>
          <TouchableOpacity
            style={[styles.resetButton, resetting && styles.resetButtonDisabled]}
            onPress={handleResetData}
            disabled={resetting}
          >
            {resetting ? (
              <>
                <ActivityIndicator size="small" color="#ef4444" />
                <Text style={styles.resetText}>Resetting...</Text>
              </>
            ) : (
              <>
                <MaterialIcons name="delete-forever" size={20} color="#ef4444" />
                <Text style={styles.resetText}>Reset All Data</Text>
              </>
            )}
          </TouchableOpacity>
          <Text style={styles.resetDescription}>
            This will delete all your health data and journey progress. This action cannot be undone.
          </Text>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <MaterialIcons name="logout" size={20} color="#ef4444" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
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
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  changePhotoText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
    marginTop: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  section: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    fontWeight: '500',
  },
  value: {
    fontSize: 16,
    color: '#1f2937',
  },
  input: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  saveButton: {
    flex: 1,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButtonText: {
    color: '#1f2937',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
  },
  sourceInfo: {
    flex: 1,
    marginLeft: 12,
  },
  sourceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  sourceDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fee2e2',
    backgroundColor: '#fef2f2',
    gap: 8,
  },
  signOutText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
    gap: 8,
    marginBottom: 12,
  },
  resetButtonDisabled: {
    opacity: 0.6,
  },
  resetText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
  resetDescription: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 16,
  },
  unitSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  unitOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  unitOptionActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  unitOptionText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  unitOptionTextActive: {
    color: '#2563eb',
    fontWeight: '600',
  },
});

