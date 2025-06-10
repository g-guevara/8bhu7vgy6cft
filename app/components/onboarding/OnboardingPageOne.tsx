// app/components/onboarding/OnboardingPageOne.tsx
import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

interface OnboardingPageOneProps {
  isTablet?: boolean;
}

export default function OnboardingPageOne({ isTablet = false }: OnboardingPageOneProps) {
  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        {/* Placeholder para las imágenes principales */}
        <View style={[styles.imageContainer, { width: isTablet ? 300 : 280 }]}>
          <View style={[styles.imagePlaceholder, styles.topImage]}>
            <Text style={styles.placeholderText}>App Logo/Image</Text>
          </View>
        </View>

        <View style={[styles.imageContainer, { width: isTablet ? 300 : 280 }]}>
          <View style={[styles.imagePlaceholder, styles.bottomImage]}>
            <Text style={styles.placeholderText}>Welcome Image</Text>
          </View>
        </View>
      </View>

      <View style={styles.instructionContainer}>
        <View style={styles.instructionRow}>
          <Text style={styles.instructionText}>Swipe left to continue</Text>
          <Text style={styles.chevron}>›</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  imageContainer: {
    marginBottom: 20,
  },
  imagePlaceholder: {
    backgroundColor: '#F0F0F0',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(128, 128, 128, 0.3)',
  },
  topImage: {
    height: 200,
  },
  bottomImage: {
    height: 200,
  },
  placeholderText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  instructionContainer: {
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  instructionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionText: {
    color: '#666',
    fontSize: 16,
    marginRight: 8,
  },
  chevron: {
    color: '#666',
    fontSize: 18,
    fontWeight: '600',
  },
});