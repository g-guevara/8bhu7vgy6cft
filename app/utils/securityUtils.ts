// app/utils/securityUtils.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SECURITY_CONFIG, FEATURES } from './securityConfig';

interface LoginAttempt {
  timestamp: number;
  email: string;
}

interface LoginAttemptsData {
  attempts: LoginAttempt[];
  isBlocked: boolean;
  blockUntil?: number;
}

export class SecurityUtils {
  
  // =================== ACCOUNT LIMIT MANAGEMENT ===================
  
  /**
   * Incrementa el contador de cuentas creadas en este dispositivo
   */
  static async incrementAccountsCreated(): Promise<void> {
    if (!FEATURES.ACCOUNT_LIMIT_ENABLED) return;
    
    try {
      const currentCount = await this.getAccountsCreatedCount();
      const newCount = currentCount + 1;
      await AsyncStorage.setItem(
        SECURITY_CONFIG.STORAGE_KEYS.ACCOUNTS_CREATED, 
        newCount.toString()
      );
      
      // Si excede el límite, marcar dispositivo como bloqueado
      if (newCount >= SECURITY_CONFIG.MAX_ACCOUNTS_PER_DEVICE) {
        await AsyncStorage.setItem(
          SECURITY_CONFIG.STORAGE_KEYS.IS_DEVICE_BLOCKED, 
          'true'
        );
      }
    } catch (error) {
      console.error('Error incrementing accounts created:', error);
    }
  }
  
  /**
   * Obtiene el número de cuentas creadas en este dispositivo
   */
  static async getAccountsCreatedCount(): Promise<number> {
    if (!FEATURES.ACCOUNT_LIMIT_ENABLED) return 0;
    
    try {
      const count = await AsyncStorage.getItem(SECURITY_CONFIG.STORAGE_KEYS.ACCOUNTS_CREATED);
      return count ? parseInt(count, 10) : 0;
    } catch (error) {
      console.error('Error getting accounts created count:', error);
      return 0;
    }
  }
  
  /**
   * Verifica si el dispositivo está bloqueado por crear demasiadas cuentas
   */
  static async isDeviceBlocked(): Promise<boolean> {
    if (!FEATURES.ACCOUNT_LIMIT_ENABLED) return false;
    
    try {
      const isBlocked = await AsyncStorage.getItem(SECURITY_CONFIG.STORAGE_KEYS.IS_DEVICE_BLOCKED);
      const accountsCount = await this.getAccountsCreatedCount();
      
      return isBlocked === 'true' || accountsCount >= SECURITY_CONFIG.MAX_ACCOUNTS_PER_DEVICE;
    } catch (error) {
      console.error('Error checking if device is blocked:', error);
      return false;
    }
  }
  
  // =================== LOGIN ATTEMPTS MANAGEMENT ===================
  
  /**
   * Registra un intento de login fallido
   */
  static async recordFailedLoginAttempt(email: string): Promise<void> {
    if (!FEATURES.LOGIN_ATTEMPTS_ENABLED) return;
    
    try {
      const attemptsData = await this.getLoginAttemptsData();
      const now = Date.now();
      
      // Agregar nuevo intento
      attemptsData.attempts.push({
        timestamp: now,
        email: email.toLowerCase()
      });
      
      // Limpiar intentos antiguos (más de 45 minutos)
      const cutoffTime = now - (SECURITY_CONFIG.LOGIN_BLOCK_DURATION_MINUTES * 60 * 1000);
      attemptsData.attempts = attemptsData.attempts.filter(
        attempt => attempt.timestamp > cutoffTime
      );
      
      // Verificar si debe bloquearse
      if (attemptsData.attempts.length >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS) {
        attemptsData.isBlocked = true;
        attemptsData.blockUntil = now + (SECURITY_CONFIG.LOGIN_BLOCK_DURATION_MINUTES * 60 * 1000);
      }
      
      await this.saveLoginAttemptsData(attemptsData);
    } catch (error) {
      console.error('Error recording failed login attempt:', error);
    }
  }
  
  /**
   * Limpia los intentos de login después de un login exitoso
   */
  static async clearLoginAttempts(): Promise<void> {
    if (!FEATURES.LOGIN_ATTEMPTS_ENABLED) return;
    
    try {
      await AsyncStorage.removeItem(SECURITY_CONFIG.STORAGE_KEYS.LOGIN_ATTEMPTS);
    } catch (error) {
      console.error('Error clearing login attempts:', error);
    }
  }
  
  /**
   * Verifica si el login está bloqueado y devuelve información del bloqueo
   */
  static async getLoginBlockStatus(): Promise<{
    isBlocked: boolean;
    minutesRemaining: number;
    attemptsCount: number;
  }> {
    if (!FEATURES.LOGIN_ATTEMPTS_ENABLED) {
      return { isBlocked: false, minutesRemaining: 0, attemptsCount: 0 };
    }
    
    try {
      const attemptsData = await this.getLoginAttemptsData();
      const now = Date.now();
      
      // Limpiar intentos antiguos
      const cutoffTime = now - (SECURITY_CONFIG.LOGIN_BLOCK_DURATION_MINUTES * 60 * 1000);
      attemptsData.attempts = attemptsData.attempts.filter(
        attempt => attempt.timestamp > cutoffTime
      );
      
      // Verificar si el bloqueo ya expiró
      if (attemptsData.isBlocked && attemptsData.blockUntil && now > attemptsData.blockUntil) {
        attemptsData.isBlocked = false;
        attemptsData.blockUntil = undefined;
        attemptsData.attempts = [];
        await this.saveLoginAttemptsData(attemptsData);
      }
      
      const minutesRemaining = attemptsData.blockUntil ? 
        Math.max(0, Math.ceil((attemptsData.blockUntil - now) / (60 * 1000))) : 0;
      
      return {
        isBlocked: attemptsData.isBlocked,
        minutesRemaining,
        attemptsCount: attemptsData.attempts.length
      };
    } catch (error) {
      console.error('Error getting login block status:', error);
      return { isBlocked: false, minutesRemaining: 0, attemptsCount: 0 };
    }
  }
  
  /**
   * Obtiene los datos de intentos de login
   */
  private static async getLoginAttemptsData(): Promise<LoginAttemptsData> {
    try {
      const data = await AsyncStorage.getItem(SECURITY_CONFIG.STORAGE_KEYS.LOGIN_ATTEMPTS);
      
      if (data) {
        return JSON.parse(data);
      }
      
      return {
        attempts: [],
        isBlocked: false
      };
    } catch (error) {
      console.error('Error getting login attempts data:', error);
      return {
        attempts: [],
        isBlocked: false
      };
    }
  }
  
  /**
   * Guarda los datos de intentos de login
   */
  private static async saveLoginAttemptsData(data: LoginAttemptsData): Promise<void> {
    try {
      await AsyncStorage.setItem(
        SECURITY_CONFIG.STORAGE_KEYS.LOGIN_ATTEMPTS,
        JSON.stringify(data)
      );
    } catch (error) {
      console.error('Error saving login attempts data:', error);
    }
  }
  
  // =================== UTILITY METHODS ===================
  
  /**
   * Método para resetear todos los límites de seguridad (solo para desarrollo/testing)
   */
  static async resetAllSecurityLimits(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        SECURITY_CONFIG.STORAGE_KEYS.ACCOUNTS_CREATED,
        SECURITY_CONFIG.STORAGE_KEYS.LOGIN_ATTEMPTS,
        SECURITY_CONFIG.STORAGE_KEYS.IS_DEVICE_BLOCKED
      ]);
      console.log('All security limits reset');
    } catch (error) {
      console.error('Error resetting security limits:', error);
    }
  }
  
  /**
   * Obtiene el estado completo de seguridad para debugging
   */
  static async getSecurityStatus(): Promise<{
    accountsCreated: number;
    isDeviceBlocked: boolean;
    loginBlockStatus: any;
    configEnabled: {
      accountLimit: boolean;
      loginLimit: boolean;
    };
  }> {
    const accountsCreated = await this.getAccountsCreatedCount();
    const isDeviceBlocked = await this.isDeviceBlocked();
    const loginBlockStatus = await this.getLoginBlockStatus();
    
    return {
      accountsCreated,
      isDeviceBlocked,
      loginBlockStatus,
      configEnabled: {
        accountLimit: FEATURES.ACCOUNT_LIMIT_ENABLED,  // Ya es boolean
        loginLimit: FEATURES.LOGIN_ATTEMPTS_ENABLED    // Ya es boolean
      }
    };
  }
}