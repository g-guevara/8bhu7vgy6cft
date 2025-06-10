// app/components/onboarding/OnboardingPageFour.tsx
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default function OnboardingPageFour() {
  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        {/* Placeholder para la imagen de listas */}
        <View style={styles.imageContainer}>
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderText}>📋</Text>
            <Text style={styles.placeholderSubtext}>List Screen Preview</Text>
          </View>
        </View>

        <Text style={styles.title}>Save & Organize</Text>
        
        <Text style={styles.description}>
          Store your food history, categorize reactions, and access insights anytime 
          to improve your diet.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  imageContainer: {
    width: width - 40,
    height: 300,
    marginBottom: 40,
  },
  imagePlaceholder: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(128, 128, 128, 0.2)',
  },
  placeholderText: {
    fontSize: 60,
    marginBottom: 10,
  },
  placeholderSubtext: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 400,
  },
});