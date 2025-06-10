// app/components/onboarding/OnboardingTutorialPage.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function OnboardingTutorialPage() {
  const [currentSubtitle, setCurrentSubtitle] = useState('');
  const [opacity, setOpacity] = useState(1);

  // Lista de subtítulos que se mostrarán secuencialmente
  const subtitles = [
    "Welcome to the tutorial, let's see an example of how the app works.",
    "First, let's search for a product.",
    "Here we have all the product information.",
    "To take a food test, we click on 'Test'.",
    "This redirects us to the test page, where the current test is located.",
    "To complete it, we click and record our reaction.",
    "This way, the test is recorded along with the reaction.",
    "And the more reactions you enter,",
    "The more accurate and useful the app will be.",
    "Saving ingredients that are hard to identify at first glance.",
    "And in this way,",
    "You can identify and discover food reactions easily and safely.",
  ];

  const [currentSubtitleIndex, setCurrentSubtitleIndex] = useState(0);

  useEffect(() => {
    setCurrentSubtitle(subtitles[0]);
    
    // Simular cambio de subtítulos cada 4 segundos
    const interval = setInterval(() => {
      setCurrentSubtitleIndex(prev => {
        const nextIndex = (prev + 1) % subtitles.length;
        
        // Animación de fade
        setOpacity(0.5);
        setTimeout(() => {
          setCurrentSubtitle(subtitles[nextIndex]);
          setOpacity(1);
        }, 250);
        
        return nextIndex;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        {/* Placeholder para el video */}
        <View style={styles.videoContainer}>
          <View style={styles.videoPlaceholder}>
            <Ionicons name="play-circle-outline" size={80} color="#666" />
            <Text style={styles.videoText}>Tutorial Video</Text>
            <Text style={styles.videoSubtext}>
              Interactive app demonstration
            </Text>
          </View>
        </View>

        {/* Área de subtítulos con altura fija */}
        <View style={styles.subtitleContainer}>
          <Text 
            style={[styles.subtitleText, { opacity }]}
          >
            {currentSubtitle}
          </Text>
        </View>
      </View>

      <View style={styles.instructionContainer}>
        <View style={styles.instructionRow}>
          <Text style={styles.instructionText}>Go to the app</Text>
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
    paddingVertical: 20,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  videoContainer: {
    width: Math.min(width - 40, 450),
    height: 300,
    marginBottom: 30,
  },
  videoPlaceholder: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(128, 128, 128, 0.3)',
  },
  videoText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginTop: 15,
  },
  videoSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  subtitleContainer: {
    width: '100%',
    minHeight: 100,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  subtitleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    lineHeight: 28,
  },
  instructionContainer: {
    paddingBottom: 20,
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