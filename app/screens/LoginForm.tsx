// app/screens/LoginForm.tsx
import React, { useState, useEffect } from "react";
import { 
  Text, 
  View, 
  TextInput,
  TouchableOpacity, 
  ActivityIndicator,
  Platform,
  Image,
} from "react-native";
import { useToast } from '../utils/ToastContext';
import { User } from "../components/Login/User";
import { styles } from "../styles/LoginFormStyles";
import { ApiService } from "../services/api";
import { saveUser } from "../lib/authUtils";
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

interface LoginFormProps {
  onLogin: (user: User) => void;
  onSwitchToSignup: () => void;
  apiUrl: string;
}

export default function LoginForm({ onLogin, onSwitchToSignup, apiUrl }: LoginFormProps) {
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const { showToast } = useToast();

  // Configuración de Google OAuth
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: '421431845569-3gi5bflt29es9fo1ovrpc9tprmd6tj3s.apps.googleusercontent.com',
  });

  useEffect(() => {
    handleGoogleResponse();
  }, [response]);

  const handleGoogleResponse = async () => {
    if (response?.type === 'success') {
      setGoogleLoading(true);
      try {
        const { params } = response;
        const { id_token } = params;
        
        // Decode the ID token to get user info
        const decodedToken = JSON.parse(atob(id_token.split('.')[1]));
        
        // Send Google token to your backend
        const loginResponse = await ApiService.googleLogin({
          idToken: id_token,
          accessToken: '', // ID token flow doesn't provide access token
          email: decodedToken.email,
          name: decodedToken.name,
          googleId: decodedToken.sub
        });
        
        if (loginResponse.user) {
          // Save user data in SecureStore
          await saveUser(loginResponse.user);
          onLogin(loginResponse.user);
          showToast('Signed in with Google', 'success');
        }
      } catch (error: any) {
        console.error("Google login error: ", error);
        showToast('Failed to sign in with Google', 'error');
      } finally {
        setGoogleLoading(false);
      }
    }
  };

// Modificación para app/screens/LoginForm.tsx
// Encuentra la función handleLogin y reemplázala por esta versión

const handleLogin = async () => {
  if (!loginEmail || !loginPassword) {
    showToast('Please fill in all fields', 'error');
    return;
  }

  setLoading(true);
  try {
    // Muestra información sobre la solicitud que se está haciendo
    console.log('[Login] Intentando login con email:', loginEmail);
    
    const response = await ApiService.login(loginEmail, loginPassword);
    
    // Información de diagnóstico para la depuración
    console.log('[Login] Respuesta completa:', JSON.stringify(response));
    
    // Verificar la estructura de la respuesta
    if (!response.user) {
      console.error('[Login] Error: La respuesta no contiene datos de usuario');
      throw new Error('Respuesta de login inválida');
    }
    
    // Verificar si el usuario tiene ID
    if (!response.user.userID && !response.user._id) {
      console.error('[Login] Error: El usuario no tiene ID', response.user);
      throw new Error('El usuario no tiene ID');
    }
    
    // Save user data in SecureStore
    console.log('[Login] Guardando usuario:', response.user);
    await saveUser(response.user);
    
    // Ejecutar diagnóstico si está disponible
    if (typeof ApiService.diagnosticarProblemas === 'function') {
      console.log('[Login] Ejecutando diagnóstico...');
      try {
        await ApiService.diagnosticarProblemas();
      } catch (diagError) {
        console.error('[Login] Error en diagnóstico:', diagError);
      }
    }
    
    onLogin(response.user);
    showToast('Logged in', 'success');
  } catch (error: any) {
    console.error("[Login] Error detallado: ", error);
    
    if (error.message === 'Sesión expirada') {
      showToast('Your session has expired, please log in again', 'error');
    } else if (error.message && error.message.includes('Credenciales inválidas')) {
      showToast('Invalid email or password', 'error');
    } else if (error instanceof TypeError && error.message.includes('Network request failed')) {
      showToast('Please check your internet connection', 'error');
    } else {
      showToast(error.message || 'Login failed', 'error');
    }
    
    // Intentar ejecutar diagnóstico en caso de error, si está disponible
    if (typeof ApiService.diagnosticarProblemas === 'function') {
      console.log('[Login] Error en login, ejecutando diagnóstico...');
      try {
        await ApiService.diagnosticarProblemas();
      } catch (diagError) {
        console.error('[Login] Error en diagnóstico:', diagError);
      }
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <View style={styles.formContainer}>
      <View style={styles.logoContainer}>
        <Image 
          source={require('../../assets/images/icon.png')}
          style={styles.logo}
        />
      </View>
      <Text style={styles.title}>Sign In</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={loginEmail}
        onChangeText={setLoginEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={loginPassword}
        onChangeText={setLoginPassword}
        secureTextEntry
      />
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sign In</Text>
        )}
      </TouchableOpacity>

      {/* Google Sign-In Button */}
      <TouchableOpacity 
        style={[styles.googleButton, (googleLoading || !request) && styles.googleButtonDisabled]} 
        onPress={() => promptAsync()}
        disabled={!request || googleLoading}
      >
        {googleLoading ? (
          <ActivityIndicator color="#555" />
        ) : (
          <>
            <Image 
              source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/768px-Google_%22G%22_logo.svg.png' }}
              style={styles.googleLogo}
              resizeMode="contain"
            />
            <Text style={styles.googleButtonText}>
              Continue with Google
            </Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.forgotPasswordButton} 
        onPress={() => {}}
      >
        <Text style={styles.forgotPasswordText}>
          Forgot password?
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.switchButton} 
        onPress={onSwitchToSignup}
      >
        <Text style={styles.switchButtonText}>
          Don't have an account? Sign up
        </Text>
      </TouchableOpacity>
    </View>
  );
}