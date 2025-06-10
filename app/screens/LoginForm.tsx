// app/screens/LoginForm.tsx - Updated with new Google OAuth credentials
import React, { useState, useEffect } from "react";
import { 
  Text, 
  View, 
  TextInput,
  TouchableOpacity, 
  ActivityIndicator,
  Platform,
  Image,
  Alert,
} from "react-native";
import { useToast } from '../utils/ToastContext';
import { User } from "../components/Login/User";
import { styles } from "../styles/LoginFormStyles";
import { ApiService } from "../services/api";
import { saveUser } from "../lib/authUtils";
import { SecurityUtils } from "../utils/securityUtils";
import { getUserFriendlyError } from "../utils/securityConfig";
import { GOOGLE_CLIENT_ID } from "../config/googleOAuth";
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

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
  const [showPassword, setShowPassword] = useState(false);
  
  // Estados de seguridad
  const [isDeviceBlocked, setIsDeviceBlocked] = useState(false);
  const [loginBlockStatus, setLoginBlockStatus] = useState({
    isBlocked: false,
    minutesRemaining: 0,
    attemptsCount: 0
  });
  
  const { showToast } = useToast();

  // Configuración de Google OAuth con las nuevas credenciales
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: GOOGLE_CLIENT_ID,
  });

  // Verificar estado de seguridad al montar el componente
  useEffect(() => {
    checkSecurityStatus();
  }, []);

  // Manejar respuesta de Google
  useEffect(() => {
    handleGoogleResponse();
  }, [response]);

  // Timer para actualizar el estado de bloqueo de login cada minuto
  useEffect(() => {
    if (loginBlockStatus.isBlocked && loginBlockStatus.minutesRemaining > 0) {
      const interval = setInterval(() => {
        checkLoginBlockStatus();
      }, 60000); // Cada minuto
      
      return () => clearInterval(interval);
    }
  }, [loginBlockStatus.isBlocked]);

  const checkSecurityStatus = async () => {
    try {
      // Verificar si el dispositivo está bloqueado
      const deviceBlocked = await SecurityUtils.isDeviceBlocked();
      setIsDeviceBlocked(deviceBlocked);
      
      // Verificar estado de intentos de login
      if (!deviceBlocked) {
        await checkLoginBlockStatus();
      }
    } catch (error) {
      console.error('Error checking security status:', error);
    }
  };

  const checkLoginBlockStatus = async () => {
    try {
      const blockStatus = await SecurityUtils.getLoginBlockStatus();
      setLoginBlockStatus(blockStatus);
    } catch (error) {
      console.error('Error checking login block status:', error);
    }
  };

  const handleGoogleResponse = async () => {
    if (response?.type === 'success') {
      // Verificar bloqueos antes de proceder
      if (isDeviceBlocked) {
        showToast('Dispositivo bloqueado por seguridad', 'error');
        return;
      }

      if (loginBlockStatus.isBlocked) {
        showToast(`Intentos excedidos. Espera ${loginBlockStatus.minutesRemaining} minutos`, 'error');
        return;
      }

      setGoogleLoading(true);
      let decodedToken: any = null;
      
      try {
        const { params } = response;
        const { id_token } = params;
        
        // Decode the ID token to get user info
        decodedToken = JSON.parse(atob(id_token.split('.')[1]));
        
        console.log('[Google Login] Decoded token:', {
          email: decodedToken.email,
          name: decodedToken.name,
          sub: decodedToken.sub
        });
        
        // Send Google token to your backend
        const loginResponse = await ApiService.googleLogin({
          idToken: id_token,
          accessToken: '',
          email: decodedToken.email,
          name: decodedToken.name,
          googleId: decodedToken.sub
        });
        
        if (loginResponse.user) {
          // Limpiar intentos de login después del éxito
          await SecurityUtils.clearLoginAttempts();
          
          // Save user data in SecureStore
          await saveUser(loginResponse.user);
          onLogin(loginResponse.user);
          showToast('Acceso exitoso con Google', 'success');
        }
      } catch (error: any) {
        console.error("Google login error: ", error);
        
        // Registrar intento fallido si es un error de credenciales
        if (decodedToken?.email) {
          await SecurityUtils.recordFailedLoginAttempt(decodedToken.email);
          await checkLoginBlockStatus();
        }
        
        const friendlyError = getUserFriendlyError(error);
        showToast(friendlyError, 'error');
      } finally {
        setGoogleLoading(false);
      }
    } else if (response?.type === 'error') {
      console.error('Google OAuth error:', response.error);
      showToast('Error al iniciar sesión con Google', 'error');
    }
  };

  const handleLogin = async () => {
    // Validaciones básicas
    if (!loginEmail || !loginPassword) {
      showToast('Por favor, completa todos los campos', 'error');
      return;
    }

    // Verificar si el dispositivo está bloqueado
    if (isDeviceBlocked) {
      showToast('Dispositivo bloqueado por motivos de seguridad', 'error');
      return;
    }

    // Verificar si los intentos de login están bloqueados
    if (loginBlockStatus.isBlocked) {
      const timeText = loginBlockStatus.minutesRemaining === 1 
        ? '1 minuto' 
        : `${loginBlockStatus.minutesRemaining} minutos`;
      showToast(`Demasiados intentos fallidos. Intenta en ${timeText}`, 'error');
      return;
    }

    setLoading(true);
    try {
      console.log('[Login] Intentando login con email:', loginEmail);
      
      const response = await ApiService.login(loginEmail, loginPassword);
      
      if (!response.user) {
        throw new Error('Respuesta de login inválida');
      }
      
      if (!response.user.userID && !response.user._id) {
        throw new Error('El usuario no tiene ID válido');
      }
      
      // Login exitoso - limpiar intentos fallidos
      await SecurityUtils.clearLoginAttempts();
      
      // Save user data in SecureStore
      await saveUser(response.user);
      onLogin(response.user);
      showToast('¡Bienvenido!', 'success');
      
    } catch (error: any) {
      console.error("[Login] Error:", error);
      
      // Registrar intento fallido
      await SecurityUtils.recordFailedLoginAttempt(loginEmail);
      
      // Actualizar estado de bloqueo
      await checkLoginBlockStatus();
      
      // Mostrar mensaje amigable
      const friendlyError = getUserFriendlyError(error);
      showToast(friendlyError, 'error');
      
    } finally {
      setLoading(false);
    }
  };

  const getRemainingAttemptsText = () => {
    if (!loginBlockStatus.isBlocked) {
      const remaining = 3 - loginBlockStatus.attemptsCount;
      if (loginBlockStatus.attemptsCount > 0 && remaining > 0) {
        return `${remaining} intento${remaining !== 1 ? 's' : ''} restante${remaining !== 1 ? 's' : ''}`;
      }
    }
    return null;
  };

  const getBlockedTimeText = () => {
    if (loginBlockStatus.isBlocked && loginBlockStatus.minutesRemaining > 0) {
      const minutes = loginBlockStatus.minutesRemaining;
      return `Intenta en ${minutes} minuto${minutes !== 1 ? 's' : ''}`;
    }
    return null;
  };

  // Si el dispositivo está bloqueado, no mostrar el formulario
  if (isDeviceBlocked) {
    return null; // El componente padre debería manejar esto
  }

  return (
    <View style={styles.formContainer}>
      <View style={styles.logoContainer}>
        <Image 
          source={require('../../assets/images/icon.png')}
          style={styles.logo}
        />
      </View>
      <Text style={styles.title}>Iniciar Sesión</Text>
      
      {/* Mostrar advertencia de intentos restantes */}
      {getRemainingAttemptsText() && (
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>
            ⚠️ {getRemainingAttemptsText()}
          </Text>
        </View>
      )}
      
      {/* Mostrar tiempo de bloqueo */}
      {getBlockedTimeText() && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            🔒 {getBlockedTimeText()}
          </Text>
        </View>
      )}
      
      <TextInput
        style={[
          styles.input,
          loginBlockStatus.isBlocked && styles.inputDisabled
        ]}
        placeholder="Email"
        value={loginEmail}
        onChangeText={setLoginEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!loginBlockStatus.isBlocked}
      />
      
      {/* Container para contraseña con botón de mostrar/ocultar */}
      <View style={styles.passwordContainer}>
        <TextInput
          style={[
            styles.passwordInput,
            loginBlockStatus.isBlocked && styles.inputDisabled
          ]}
          placeholder="Contraseña"
          value={loginPassword}
          onChangeText={setLoginPassword}
          secureTextEntry={!showPassword}
          editable={!loginBlockStatus.isBlocked}
        />
        <TouchableOpacity 
          style={styles.showPasswordButton}
          onPress={() => setShowPassword(!showPassword)}
          disabled={loginBlockStatus.isBlocked}
        >
          <Text style={[
            styles.showPasswordText,
            loginBlockStatus.isBlocked && styles.showPasswordTextDisabled
          ]}>
            {showPassword ? 'Ocultar' : 'Mostrar'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={[
          styles.button, 
          (loading || loginBlockStatus.isBlocked) && styles.buttonDisabled
        ]} 
        onPress={handleLogin}
        disabled={loading || loginBlockStatus.isBlocked}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Iniciar Sesión</Text>
        )}
      </TouchableOpacity>

      {/* Google Sign-In Button */}
      <TouchableOpacity 
        style={[
          styles.googleButton, 
          (googleLoading || !request || loginBlockStatus.isBlocked) && styles.googleButtonDisabled
        ]} 
        onPress={() => {
          console.log('[Google] Attempting Google sign in...');
          promptAsync();
        }}
        disabled={!request || googleLoading || loginBlockStatus.isBlocked}
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
            <Text style={[
              styles.googleButtonText,
              loginBlockStatus.isBlocked && styles.googleButtonTextDisabled
            ]}>
              Continuar con Google
            </Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.forgotPasswordButton} 
        onPress={() => {
          Alert.alert(
            'Recuperar Contraseña',
            'Funcionalidad próximamente disponible',
            [{ text: 'OK' }]
          );
        }}
        disabled={loginBlockStatus.isBlocked}
      >
        <Text style={[
          styles.forgotPasswordText,
          loginBlockStatus.isBlocked && styles.forgotPasswordTextDisabled
        ]}>
          ¿Olvidaste tu contraseña?
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.switchButton} 
        onPress={onSwitchToSignup}
        disabled={loginBlockStatus.isBlocked}
      >
        <Text style={[
          styles.switchButtonText,
          loginBlockStatus.isBlocked && styles.switchButtonTextDisabled
        ]}>
          ¿No tienes una cuenta? Regístrate
        </Text>
      </TouchableOpacity>
    </View>
  );
}