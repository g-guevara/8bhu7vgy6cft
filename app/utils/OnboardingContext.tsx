// app/utils/OnboardingContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OnboardingContextType {
  hasSeenOnboarding: boolean;
  setHasSeenOnboarding: (value: boolean) => void;
  resetOnboardingForTutorial: () => void; // Nueva función para tutorial manual
  loading: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const ONBOARDING_KEY = 'hasSeenOnboarding';

export const OnboardingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [hasSeenOnboarding, setHasSeenOnboardingState] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOnboardingStatus();
  }, []);

  const loadOnboardingStatus = async () => {
    try {
      const value = await AsyncStorage.getItem(ONBOARDING_KEY);
      setHasSeenOnboardingState(value === 'true');
    } catch (error) {
      console.error('Error loading onboarding status:', error);
    } finally {
      setLoading(false);
    }
  };

  const setHasSeenOnboarding = async (value: boolean) => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, value.toString());
      setHasSeenOnboardingState(value);
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  };

  // Función especial para resetear temporalmente para el tutorial
  const resetOnboardingForTutorial = () => {
    // Solo cambia el estado local, no el AsyncStorage
    // Esto permite mostrar el tutorial sin afectar el estado persistente
    setHasSeenOnboardingState(false);
  };

  return (
    <OnboardingContext.Provider value={{ 
      hasSeenOnboarding, 
      setHasSeenOnboarding, 
      resetOnboardingForTutorial,
      loading 
    }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};