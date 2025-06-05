// app/utils/resetAuth.ts
// Script de emergencia para reiniciar la autenticación completamente

import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Función para reiniciar completamente el estado de autenticación
 * Usar solo en caso de emergencia cuando hay problemas persistentes
 */
export const resetearAutenticacion = async () => {
  try {
    console.log('Iniciando reinicio completo de autenticación...');
    
    // 1. Limpiar datos de autenticación en SecureStore
    await SecureStore.deleteItemAsync('current_user');
    console.log('✓ SecureStore: current_user eliminado');
    
    // 2. Limpiar cualquier producto seleccionado
    await AsyncStorage.removeItem('selectedProduct');
    console.log('✓ AsyncStorage: selectedProduct eliminado');
    
    // 3. Opcional: Limpiar cualquier otro dato que pueda estar relacionado
    const allKeys = await AsyncStorage.getAllKeys();
    console.log('Todas las claves en AsyncStorage:', allKeys);
    
    // 4. Mostrar mensaje de éxito
    console.log('Autenticación reiniciada exitosamente. Por favor, reinicia la aplicación.');
    
    // 5. En desarrollo, intentar recargar la app (solo funciona en algunos casos)
    if (__DEV__) {
      console.log('Intentando recargar la aplicación...');
      // @ts-ignore
      if (typeof global.HermesInternal !== 'undefined') {
        // @ts-ignore
        global.HermesInternal.reload();
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error al reiniciar autenticación:', error);
    return false;
  }
};

/**
 * Función para verificar el estado actual de la autenticación
 * Útil para diagnosticar problemas
 */
export const verificarEstadoAutenticacion = async () => {
  try {
    console.log('Verificando estado de autenticación...');
    
    // 1. Verificar SecureStore
    const userData = await SecureStore.getItemAsync('current_user');
    console.log('SecureStore - current_user:', userData ? 'Existe' : 'No existe');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        console.log('User ID:', parsedUser.userID || parsedUser._id || 'No encontrado');
        console.log('Email:', parsedUser.email || 'No encontrado');
      } catch (e) {
        console.error('Error parseando userData:', e);
      }
    }
    
    // 2. Verificar AsyncStorage
    const productData = await AsyncStorage.getItem('selectedProduct');
    console.log('AsyncStorage - selectedProduct:', productData ? 'Existe' : 'No existe');
    
    // 3. Devolver estado
    return {
      tieneUsuario: !!userData,
      tieneProducto: !!productData,
      datosUsuario: userData ? JSON.parse(userData) : null
    };
  } catch (error) {
    console.error('Error verificando autenticación:', error);
    return { error: 'Error verificando autenticación' };
  }
};