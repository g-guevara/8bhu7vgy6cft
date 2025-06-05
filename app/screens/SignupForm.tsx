// app/screens/SignupForm.tsx
import React, { useState, useEffect } from "react";
import { 
  Text, 
  View, 
  TextInput,
  TouchableOpacity, 
  ActivityIndicator,
  Image,
  ViewStyle,
  TextStyle,
} from "react-native";
import { useToast } from '../utils/ToastContext';
import { styles } from "../styles/SignupFormStyles";
import { ApiService } from "../services/api";

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
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    color: '#e74c3c',
    width: 0,
    label: 'Very Weak'
  });
  const { showToast } = useToast();

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
        color = '#e74c3c';  // Red
        width = 20;
        label = 'Very Weak';
        break;
      case 2:
        color = '#e67e22';  // Orange
        width = 40;
        label = 'Weak';
        break;
      case 3:
        color = '#f39c12';  // Yellow
        width = 60;
        label = 'Fair';
        break;
      case 4:
        color = '#2ecc71';  // Green
        width = 80;
        label = 'Good';
        break;
      case 5:
      case 6:
        color = '#27ae60';  // Dark Green
        width = 100;
        label = 'Strong';
        break;
      default:
        color = '#e74c3c';
        width = 0;
        label = 'Very Weak';
    }
    
    setPasswordStrength({ score, color, width, label });
  };

  useEffect(() => {
    calculatePasswordStrength(signupPassword);
  }, [signupPassword]);

  const validatePassword = (password: string): boolean => {
    // Check if password has at least 8 characters
    if (password.length < 8) {
      showToast('Password must be at least 8 characters long', 'error');
      return false;
    }
    
    // Check if password has at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
      showToast('Password must contain at least one uppercase letter', 'error');
      return false;
    }
    
    return true;
  };

  const handleSignup = async () => {
    if (!signupName || !signupEmail || !signupPassword || !confirmPassword) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    // Check if passwords match
    if (signupPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error');
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
        language: 'en'  // Always inject English
      });

      showToast('Account created successfully!', 'success');
      
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
        label: 'Very Weak'
      });
    } catch (error: any) {
      console.error("Error en registro:", error);
      
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        showToast('Please check your internet connection', 'error');
      } else {
        showToast(error.message || 'Failed to create account', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.formContainer}>
      {/* Logo Container */}
      <View style={styles.logoContainer}>
        <Image 
          source={require('../../assets/images/icon.png')}
          style={styles.logo}
        />
      </View>
      
      <Text style={styles.title}>Sign Up</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={signupName}
        onChangeText={setSignupName}
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
          placeholder="Password"
          value={signupPassword}
          onChangeText={setSignupPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity 
          style={styles.showPasswordButton}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Text style={styles.showPasswordText}>
            {showPassword ? 'Hide' : 'Show'}
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
            {passwordStrength.label}
          </Text>
        </View>
      )}
      
      <View style={styles.passwordRequirements}>
        <Text style={[
          styles.requirementText, 
          signupPassword.length >= 8 ? styles.requirementMet : styles.requirementNotMet
        ]}>
          • At least 8 characters
        </Text>
        <Text style={[
          styles.requirementText, 
          /[A-Z]/.test(signupPassword) ? styles.requirementMet : styles.requirementNotMet
        ]}>
          • One uppercase letter
        </Text>
        <Text style={[
          styles.requirementText, 
          /[0-9]/.test(signupPassword) ? styles.requirementMet : styles.requirementNotMet
        ]}>
          • One number (recommended)
        </Text>
        <Text style={[
          styles.requirementText, 
          /[!@#$%^&*(),.?":{}|<>]/.test(signupPassword) ? styles.requirementMet : styles.requirementNotMet
        ]}>
          • One special character (recommended)
        </Text>
      </View>
      
      {/* Confirm Password Field */}
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirmPassword}
        />
        <TouchableOpacity 
          style={styles.showPasswordButton}
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          <Text style={styles.showPasswordText}>
            {showConfirmPassword ? 'Hide' : 'Show'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Password Match Indicator */}
      {confirmPassword.length > 0 && (
        <Text style={[
          styles.passwordMatchText,
          signupPassword === confirmPassword ? styles.passwordMatch : styles.passwordNoMatch
        ]}>
          {signupPassword === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
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
          <Text style={styles.buttonText}>Create Account</Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.switchButton} 
        onPress={onSwitchToLogin}
      >
        <Text style={styles.switchButtonText}>
          Already have an account? Sign in
        </Text>
      </TouchableOpacity>
    </View>
  );
}