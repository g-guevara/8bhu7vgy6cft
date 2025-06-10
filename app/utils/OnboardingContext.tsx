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
      console.log('📖 Onboarding status loaded:', value === 'true'); // Debug log
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
      console.log('💾 Onboarding status saved:', value); // Debug log
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  };

  // 🔥 FUNCIÓN CORREGIDA PARA RESETEAR TEMPORALMENTE EL ONBOARDING
  const resetOnboardingForTutorial = () => {
    console.log('🔄 resetOnboardingForTutorial called'); // Debug log
    console.log('📱 Current hasSeenOnboarding state:', hasSeenOnboarding); // Debug log
    
    // Cambia el estado local inmediatamente sin afectar AsyncStorage
    // Esto permite mostrar el tutorial sin perder el estado persistente
    setHasSeenOnboardingState(false);
    
    console.log('✅ hasSeenOnboarding state set to false'); // Debug log
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