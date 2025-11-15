import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

interface GradientButtonProps {
  onPress: () => void;
  title: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const gradientColors = {
  primary: ['#3b82f6', '#2563eb', '#1d4ed8'],
  secondary: ['#8b5cf6', '#7c3aed', '#6d28d9'],
  success: ['#10b981', '#059669', '#047857'],
  danger: ['#ef4444', '#dc2626', '#b91c1c'],
};

export default function GradientButton({
  onPress,
  title,
  icon,
  disabled = false,
  loading = false,
  variant = 'primary',
  style,
  textStyle,
}: GradientButtonProps) {
  const colors = gradientColors[variant];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.container, style, (disabled || loading) && styles.disabled]}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            {icon && <MaterialIcons name={icon} size={20} color="#fff" style={styles.icon} />}
            <Text style={[styles.text, textStyle]}>{title}</Text>
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  gradient: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  icon: {
    marginRight: 0,
  },
  disabled: {
    opacity: 0.6,
    shadowOpacity: 0.1,
  },
});

