// app/utils/OnboardingContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OnboardingContextType {
  hasSeenOnboarding: boolean;
  setHasSeenOnboarding: (value: boolean) => void;
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

  return (
    <OnboardingContext.Provider value={{ hasSeenOnboarding, setHasSeenOnboarding, loading }}>
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