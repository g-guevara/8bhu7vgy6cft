// app/components/onboarding/OnboardingView.tsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Dimensions, 
  StatusBar,
  SafeAreaView,
  ScrollView,
  Animated
} from 'react-native';
import { useOnboarding } from '../../utils/OnboardingContext';

// Import páginas
import OnboardingPageOne from './OnboardingPageOne';
import OnboardingPageTwo from './OnboardingPageTwo';
import OnboardingPageThree from './OnboardingPageThree';
import OnboardingPageFour from './OnboardingPageFour';
import OnboardingTutorialPage from './OnboardingTutorialPage';
import OnboardingEndPage from './OnboardingEndPage';

const { width } = Dimensions.get('window');

export default function OnboardingView() {
  const [currentPage, setCurrentPage] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const totalPages = 6;
  const { hasSeenOnboarding } = useOnboarding();

  // Resetear a la primera página cuando se reinicia el onboarding
  useEffect(() => {
    if (!hasSeenOnboarding) {
      setCurrentPage(0);
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ x: 0, animated: false });
      }
    }
  }, [hasSeenOnboarding]);

  const handleScroll = (event: any) => {
    const { contentOffset } = event.nativeEvent;
    const pageIndex = Math.round(contentOffset.x / width);
    setCurrentPage(pageIndex);
  };

  const progressValue = currentPage / (totalPages - 1);

  const pages = [
    <OnboardingPageOne key="0" isTablet={width > 600} />,
    <OnboardingPageTwo key="1" />,
    <OnboardingPageThree key="2" />,
    <OnboardingPageFour key="3" />,
    <OnboardingTutorialPage key="4" />,
    <OnboardingEndPage key="5" currentPage={currentPage} />
  ];

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <SafeAreaView style={styles.container}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          style={styles.scrollView}
          scrollEventThrottle={16}
        >
          {pages.map((page, index) => (
            <View key={index} style={[styles.page, { width }]}>
              {page}
            </View>
          ))}
        </ScrollView>

        {/* Barra de progreso */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View 
              style={[
                styles.progressFill, 
                { width: `${progressValue * 100}%` }
              ]} 
            />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E5E5',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#666666',
    borderRadius: 2,
  },
});