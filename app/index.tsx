// app/index.tsx - Updated with OpenFoodFacts initialization
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
import { User } from "./components/Login/User";
import TabNavigator from "./navigation/TabNavigator";
import { styles } from "./styles/IndexStyles";
import { getUser, removeUser } from "./lib/authUtils";
import { SecurityUtils } from "./utils/securityUtils";
import { ApiService } from "./services/api"; // 🔥 IMPORTANTE: Importar el ApiService actualizado

const API_URL = "https://bhu8vgy7nht5.vercel.app/";

export default function Index() {
  const [isLogin, setIsLogin] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Estados de seguridad
  const [isDeviceBlocked, setIsDeviceBlocked] = useState(false);
  const [accountsCreated, setAccountsCreated] = useState(0);
  const [securityChecked, setSecurityChecked] = useState(false);

  useEffect(() => {
    checkAuthenticationAndSecurity();
  }, []);

  const checkAuthenticationAndSecurity = async () => {
    try {
      // 🔥 NUEVO: Inicializar OpenFoodFacts Service
      console.log('[Index] Inicializando servicios...');
      await ApiService.initialize();
      
      // Verificar estado de seguridad
      await checkSecurityStatus();
      
      // Solo verificar autenticación si el dispositivo no está bloqueado
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
      
      if (deviceBlocked) {
        console.log(`Device blocked: ${accountsCount} accounts created`);
      } else {
        console.log(`Device OK: ${accountsCount} accounts created`);
      }
      
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
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleSuccessfulLogin = (userData: User) => {
    setUser(userData);
  };

  if (loading || !securityChecked) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={{ marginTop: 16, color: '#666' }}>
            Initializing services...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isDeviceBlocked) {
    return (
      <SafeAreaView style={styles.container}>
        <DeviceBlockedScreen accountsCreated={accountsCreated} />
      </SafeAreaView>
    );
  }

  if (user) {
    return <TabNavigator user={user} onLogout={handleLogout} />;
  }

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
