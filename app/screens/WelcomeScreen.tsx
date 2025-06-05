import React from "react";
import { 
  Text, 
  View, 
  TouchableOpacity 
} from "react-native";
import { User } from "../components/Login/User";
import { styles } from "../styles/WelcomeScreenStyles";

interface WelcomeScreenProps {
  user: User;
  onLogout: () => void;
}

export default function WelcomeScreen({ user, onLogout }: WelcomeScreenProps) {
  return (
    <View style={styles.welcomeContainer}>
      <Text style={styles.welcomeTitle}>¡Bienvenido, {user.name}!</Text>
      <Text style={styles.welcomeSubtitle}>Email: {user.email}</Text>
      <Text style={styles.welcomeSubtitle}>Idioma: {user.language}</Text>
      <Text style={styles.welcomeSubtitle}>Días de prueba: {user.trialPeriodDays}</Text>
      
      <TouchableOpacity 
        style={[styles.button, styles.logoutButton]} 
        onPress={onLogout}
      >
        <Text style={styles.buttonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}