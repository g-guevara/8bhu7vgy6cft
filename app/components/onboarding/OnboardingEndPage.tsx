// app/components/onboarding/OnboardingEndPage.tsx
import React, { useEffect } from 'react';
import { View } from 'react-native';
import { useOnboarding } from '../../utils/OnboardingContext';

interface OnboardingEndPageProps {
  currentPage: number;
}

export default function OnboardingEndPage({ currentPage }: OnboardingEndPageProps) {
  const { setHasSeenOnboarding } = useOnboarding();

  useEffect(() => {
    // Solo marcar como completado si realmente estamos en la página final (página 5)
    // y hemos llegado aquí por navegación normal
    if (currentPage === 5) {
      const timer = setTimeout(() => {
        setHasSeenOnboarding(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [setHasSeenOnboarding, currentPage]);

  return <View style={{ flex: 1, backgroundColor: 'transparent' }} />;
}