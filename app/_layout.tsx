// app/_layout.tsx
import { Stack } from "expo-router";
import { ToastProvider } from './utils/ToastContext';
import { AuthProvider } from './utils/authContext';
import { OnboardingProvider } from './utils/OnboardingContext';

export default function RootLayout() {
  return (
    <OnboardingProvider>
      <AuthProvider>
        <ToastProvider>
          <Stack
            screenOptions={{
              headerShown: false,  // Esto ocultará el header en todas las pantallas
            }}
          />
        </ToastProvider>
      </AuthProvider>
    </OnboardingProvider>
  );
}