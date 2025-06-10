// app/components/onboarding/OnboardingPageTwo.tsx
import React from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';

const { width } = Dimensions.get('window');

export default function OnboardingPageTwo() {
  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.imageContainer}>
          <Image 
            source={require('../../../assets/images/onboarding/fullsc.png')}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Discover & Identify</Text>
        
        <Text style={styles.description}>
          Track your reactions to identify problem foods, avoid negative health effects, 
          and make smarter food choices by recognizing ingredient patterns.
        </Text>
      </View>
    </View>
  );
}

export const styles = StyleSheet.create({
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
    width: width ,
    height: 400,
    marginBottom: 40,
            borderWidth: 2,
    borderColor: 'rgba(128, 128, 128, 0.2)',
  },
  image: {
    width: '100%',
    height: '150%',
        borderWidth: 2,
    borderColor: 'rgba(128, 128, 128, 0.2)',
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