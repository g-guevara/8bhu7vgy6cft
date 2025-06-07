// app/components/DeviceBlockedScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
} from 'react-native';

interface DeviceBlockedScreenProps {
  accountsCreated?: number;
}

export default function DeviceBlockedScreen({ accountsCreated = 0 }: DeviceBlockedScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Icono/Logo */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/images/icon.png')}
            style={styles.logo}
          />
        </View>

        {/* Icono de bloqueo */}
        <View style={styles.blockIcon}>
          <Text style={styles.blockEmoji}>🔒</Text>
        </View>

        {/* Título principal */}
        <Text style={styles.title}>Dispositivo Bloqueado</Text>

        {/* Mensaje explicativo */}
        <View style={styles.messageContainer}>
          <Text style={styles.message}>
            Se ha detectado un número inusual de cuentas creadas en este dispositivo
            {accountsCreated > 0 && ` (${accountsCreated} cuentas)`}.
          </Text>
          
          <Text style={styles.submessage}>
            Por motivos de seguridad, el registro y acceso han sido temporalmente suspendidos.
          </Text>
        </View>

        {/* Información de contacto */}
        <View style={styles.contactContainer}>
          <Text style={styles.contactTitle}>¿Necesitas ayuda?</Text>
          <Text style={styles.contactMessage}>
            Si crees que esto es un error o necesitas acceso urgente, 
            por favor comunícate con nuestro equipo de soporte técnico.
          </Text>
        </View>

        {/* Nota de seguridad */}
        <View style={styles.securityNote}>
          <Text style={styles.securityNoteText}>
            🛡️ Esta medida protege la integridad de nuestro servicio y la seguridad de todos los usuarios.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 30,
    overflow: 'hidden',
  },
  logo: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  blockIcon: {
    marginBottom: 20,
  },
  blockEmoji: {
    fontSize: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: 30,
  },
  messageContainer: {
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  message: {
    fontSize: 16,
    color: '#495057',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 15,
  },
  submessage: {
    fontSize: 15,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  contactContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 25,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    width: '100%',
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007bff',
    textAlign: 'center',
    marginBottom: 12,
  },
  contactMessage: {
    fontSize: 14,
    color: '#495057',
    textAlign: 'center',
    lineHeight: 20,
  },
  securityNote: {
    backgroundColor: '#e9f4ff',
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
    borderRadius: 8,
    padding: 15,
    width: '100%',
  },
  securityNoteText: {
    fontSize: 13,
    color: '#495057',
    textAlign: 'center',
    lineHeight: 18,
  },
});