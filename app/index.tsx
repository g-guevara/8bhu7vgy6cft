// app/index.tsx - Updated with corrected onboarding and authentication logic
import React, { useState, useEffect } from "react";
import { 
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
  View,
  TouchableOpacity,
  Text
} from "react-native";
import LoginForm from "./screens/LoginForm";
import SignupForm from "./screens/SignupForm";
import DeviceBlockedScreen from "./components/DeviceBlockedScreen";
import OnboardingView from "./components/onboarding/OnboardingView";
import { User } from "./components/Login/User";
import TabNavigator from "./navigation/TabNavigator";
import { styles } from "./styles/IndexStyles";
import { getUser, removeUser } from "./lib/authUtils";
import { SecurityUtils } from "./utils/securityUtils";
import { useOnboarding } from "./utils/OnboardingContext";

// URL de tu API
const API_URL = "https://bhu8vgy7nht5.vercel.app/";

export default function Index() {
  const [isLogin, setIsLogin] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Estados de seguridad
  const [isDeviceBlocked, setIsDeviceBlocked] = useState(false);
  const [accountsCreated, setAccountsCreated] = useState(0);
  const [securityChecked, setSecurityChecked] = useState(false);

  // Estados de onboarding
  const { hasSeenOnboarding, loading: onboardingLoading } = useOnboarding();

  // Verificar autenticación y seguridad al iniciar la app
  useEffect(() => {
    checkAuthenticationAndSecurity();
  }, []);

  const checkAuthenticationAndSecurity = async () => {
    try {
      // 1. Verificar estado de seguridad primero
      await checkSecurityStatus();
      
      // 2. Solo verificar autenticación si el dispositivo no está bloqueado
      if (!isDeviceBlocked) {
        const userData = await getUser();
        if (userData) {
          setUser(userData);
        }
      }
    } catch (error) {
      console.error('Error checking authentication and security:', error);
      await removeUser();
    } finally {
      setLoading(false);
    }
  };

  const checkSecurityStatus = async () => {
    try {
      const deviceBlocked = await SecurityUtils.isDeviceBlocked();
      const accountsCount = await SecurityUtils.getAccountsCreatedCount();
      
      setIsDeviceBlocked(deviceBlocked);
      setAccountsCreated(accountsCount);
      setSecurityChecked(true);
      
      // Log para debugging
      if (deviceBlocked) {
        console.log(`Device blocked: ${accountsCount} accounts created`);
      } else {
        console.log(`Device OK: ${accountsCount} accounts created`);
      }
      
      // Mostrar información de seguridad en desarrollo
      if (__DEV__) {
        const securityStatus = await SecurityUtils.getSecurityStatus();
        console.log('Security Status:', securityStatus);
      }
    } catch (error) {
      console.error('Error checking security status:', error);
      setSecurityChecked(true);
    }
  };

  const handleLogout = async () => {
    try {
      await removeUser();
      setUser(null);
      // NO resetear hasSeenOnboarding aquí - el usuario ya vio el tutorial
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleSuccessfulLogin = (userData: User) => {
    setUser(userData);
  };

  // Mostrar pantalla de carga mientras se verifica la seguridad, autenticación y onboarding
  if (loading || !securityChecked || onboardingLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#007bff" />
        </View>
      </SafeAreaView>
    );
  }

  // Si el dispositivo está bloqueado, mostrar pantalla de bloqueo
  if (isDeviceBlocked) {
    return (
      <SafeAreaView style={styles.container}>
        <DeviceBlockedScreen accountsCreated={accountsCreated} />
      </SafeAreaView>
    );
  }

  // Si el usuario está logueado, mostramos el tab navigator
  if (user) {
    return <TabNavigator user={user} onLogout={handleLogout} />;
  }

  // LÓGICA CORREGIDA: Solo mostrar onboarding si NUNCA lo ha visto
  // Una vez visto, siempre mostrar login (incluso después de logout)
  if (!hasSeenOnboarding) {
    return <OnboardingView />;
  }

  // Si no está logueado pero ya vio el onboarding, mostrar login/signup
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {isLogin ? (
            <LoginForm 
              onLogin={handleSuccessfulLogin}
              onSwitchToSignup={() => setIsLogin(false)}
              apiUrl={API_URL}
            />
          ) : (
            <SignupForm 
              onSwitchToLogin={() => setIsLogin(true)}
              apiUrl={API_URL}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}