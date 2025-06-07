// app/screens/SignupForm.tsx - Updated with security features
import React, { useState, useEffect } from "react";
import { 
  Text, 
  View, 
  TextInput,
  TouchableOpacity, 
  ActivityIndicator,
  Image,
} from "react-native";
import { useToast } from '../utils/ToastContext';
import { styles } from "../styles/SignupFormStyles";
import { ApiService } from "../services/api";
import { SecurityUtils } from "../utils/securityUtils";
import { getUserFriendlyError } from "../utils/securityConfig";

interface SignupFormProps {
  onSwitchToLogin: () => void;
  apiUrl: string;
}

interface PasswordStrength {
  score: number;
  color: string;
  width: number;
  label: string;
}

export default function SignupForm({ onSwitchToLogin, apiUrl }: SignupFormProps) {
  const [loading, setLoading] = useState(false);
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Estados de seguridad
  const [isDeviceBlocked, setIsDeviceBlocked] = useState(false);
  const [accountsCreated, setAccountsCreated] = useState(0);
  
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    color: '#e74c3c',
    width: 0,
    label: 'Muy Débil'
  });
  
  const { showToast } = useToast();

  // Verificar estado de seguridad al montar el componente
  useEffect(() => {
    checkSecurityStatus();
  }, []);

  const checkSecurityStatus = async () => {
    try {
      const deviceBlocked = await SecurityUtils.isDeviceBlocked();
      const accountsCount = await SecurityUtils.getAccountsCreatedCount();
      
      setIsDeviceBlocked(deviceBlocked);
      setAccountsCreated(accountsCount);
      
      if (deviceBlocked) {
        console.log('Device blocked for signup');
      }
    } catch (error) {
      console.error('Error checking security status:', error);
    }
  };

  const calculatePasswordStrength = (password: string) => {
    let score = 0;
    
    // Length check (at least 8 characters)
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    
    // Uppercase letter check
    if (/[A-Z]/.test(password)) score += 1;
    
    // Lowercase letter check
    if (/[a-z]/.test(password)) score += 1;
    
    // Number check
    if (/[0-9]/.test(password)) score += 1;
    
    // Special character check
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
    
    // Set color and label based on score
    let color, width, label;
    switch (score) {
      case 0:
      case 1:
        color = '#e74c3c';
        width = 20;
        label = 'Muy Débil';
        break;
      case 2:
        color = '#e67e22';
        width = 40;
        label = 'Débil';
        break;
      case 3:
        color = '#f39c12';
        width = 60;
        label = 'Aceptable';
        break;
      case 4:
        color = '#2ecc71';
        width = 80;
        label = 'Buena';
        break;
      case 5:
      case 6:
        color = '#27ae60';
        width = 100;
        label = 'Excelente';
        break;
      default:
        color = '#e74c3c';
        width = 0;
        label = 'Muy Débil';
    }
    
    setPasswordStrength({ score, color, width, label });
  };

  useEffect(() => {
    calculatePasswordStrength(signupPassword);
  }, [signupPassword]);

  const validatePassword = (password: string): boolean => {
    // Check if password has at least 8 characters
    if (password.length < 8) {
      showToast('La contraseña debe tener al menos 8 caracteres', 'error');
      return false;
    }
    
    // Check if password has at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
      showToast('La contraseña debe contener al menos una letra mayúscula', 'error');
      return false;
    }
    
    return true;
  };

  const handleSignup = async () => {
    // Verificar si el dispositivo está bloqueado
    if (isDeviceBlocked) {
      showToast('Dispositivo bloqueado por motivos de seguridad', 'error');
      return;
    }

    // Validaciones básicas
    if (!signupName || !signupEmail || !signupPassword || !confirmPassword) {
      showToast('Por favor, completa todos los campos', 'error');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signupEmail)) {
      showToast('Por favor, ingresa un email válido', 'error');
      return;
    }

    // Check if passwords match
    if (signupPassword !== confirmPassword) {
      showToast('Las contraseñas no coinciden', 'error');
      return;
    }

    // Validate password before proceeding
    if (!validatePassword(signupPassword)) {
      return;
    }

    setLoading(true);
    try {
      await ApiService.signup({
        name: signupName,
        email: signupEmail,
        password: signupPassword,
        language: 'es'
      });

      // Incrementar contador de cuentas creadas en este dispositivo
      await SecurityUtils.incrementAccountsCreated();
      
      // Verificar si el dispositivo se bloqueó después de crear esta cuenta
      const newDeviceBlocked = await SecurityUtils.isDeviceBlocked();
      if (newDeviceBlocked) {
        setIsDeviceBlocked(true);
        showToast('Cuenta creada exitosamente. Dispositivo alcanzó límite de seguridad.', 'warning');
      } else {
        showToast('¡Cuenta creada exitosamente!', 'success');
      }
      
      // Wait a moment before switching to login
      setTimeout(() => {
        onSwitchToLogin();
      }, 1500);

      // Clear signup fields
      setSignupName("");
      setSignupEmail("");
      setSignupPassword("");
      setConfirmPassword("");
      setPasswordStrength({
        score: 0,
        color: '#e74c3c',
        width: 0,
        label: 'Muy Débil'
      });
      
    } catch (error: any) {
      console.error("Error en registro:", error);
      
      // Usar mensajes de error amigables
      const friendlyError = getUserFriendlyError(error);
      showToast(friendlyError, 'error');
      
    } finally {
      setLoading(false);
    }
  };

  const getAccountLimitWarning = () => {
    if (accountsCreated >= 7 && accountsCreated < 10) {
      const remaining = 10 - accountsCreated;
      return `Se pueden crear ${remaining} cuenta${remaining !== 1 ? 's' : ''} más en este dispositivo`;
    }
    return null;
  };

  // Si el dispositivo está bloqueado, no mostrar el formulario
  if (isDeviceBlocked) {
    return null; // El componente padre debería manejar esto
  }

  return (
    <View style={styles.formContainer}>
      {/* Logo Container */}
      <View style={styles.logoContainer}>
        <Image 
          source={require('../../assets/images/icon.png')}
          style={styles.logo}
        />
      </View>
      
      <Text style={styles.title}>Crear Cuenta</Text>
      
      {/* Mostrar advertencia de límite de cuentas */}
      {getAccountLimitWarning() && (
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>
            ⚠️ {getAccountLimitWarning()}
          </Text>
        </View>
      )}
      
      <TextInput
        style={styles.input}
        placeholder="Nombre completo"
        value={signupName}
        onChangeText={setSignupName}
        autoCapitalize="words"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={signupEmail}
        onChangeText={setSignupEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Contraseña"
          value={signupPassword}
          onChangeText={setSignupPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity 
          style={styles.showPasswordButton}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Text style={styles.showPasswordText}>
            {showPassword ? 'Ocultar' : 'Mostrar'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Password Strength Indicator */}
      {signupPassword.length > 0 && (
        <View style={styles.passwordStrengthContainer}>
          <View style={styles.passwordStrengthBar}>
            <View 
              style={[
                styles.passwordStrengthProgress, 
                { 
                  width: `${passwordStrength.width}%`,
                  backgroundColor: passwordStrength.color
                }
              ]} 
            />
          </View>
          <Text style={[styles.passwordStrengthLabel, { color: passwordStrength.color }]}>
            Seguridad: {passwordStrength.label}
          </Text>
        </View>
      )}
      
      <View style={styles.passwordRequirements}>
        <Text style={[
          styles.requirementText, 
          signupPassword.length >= 8 ? styles.requirementMet : styles.requirementNotMet
        ]}>
          • Al menos 8 caracteres
        </Text>
        <Text style={[
          styles.requirementText, 
          /[A-Z]/.test(signupPassword) ? styles.requirementMet : styles.requirementNotMet
        ]}>
          • Una letra mayúscula
        </Text>
        <Text style={[
          styles.requirementText, 
          /[0-9]/.test(signupPassword) ? styles.requirementMet : styles.requirementNotMet
        ]}>
          • Un número (recomendado)
        </Text>
        <Text style={[
          styles.requirementText, 
          /[!@#$%^&*(),.?":{}|<>]/.test(signupPassword) ? styles.requirementMet : styles.requirementNotMet
        ]}>
          • Un carácter especial (recomendado)
        </Text>
      </View>
      
      {/* Confirm Password Field */}
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Confirmar contraseña"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirmPassword}
        />
        <TouchableOpacity 
          style={styles.showPasswordButton}
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          <Text style={styles.showPasswordText}>
            {showConfirmPassword ? 'Ocultar' : 'Mostrar'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Password Match Indicator */}
      {confirmPassword.length > 0 && (
        <Text style={[
          styles.passwordMatchText,
          signupPassword === confirmPassword ? styles.passwordMatch : styles.passwordNoMatch
        ]}>
          {signupPassword === confirmPassword ? '✓ Las contraseñas coinciden' : '✗ Las contraseñas no coinciden'}
        </Text>
      )}
      
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleSignup}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Crear Cuenta</Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.switchButton} 
        onPress={onSwitchToLogin}
      >
        <Text style={styles.switchButtonText}>
          ¿Ya tienes una cuenta? Inicia sesión
        </Text>
      </TouchableOpacity>
    </View>
  );
}