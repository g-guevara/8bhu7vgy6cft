// app/lib/authUtils.ts - Versión mejorada para depuración
import * as SecureStore from 'expo-secure-store';

const USER_KEY = 'current_user';
const DEBUG = true; // Cambiar a false en producción

// Función para logs de depuración
const log = (message: string, data?: any) => {
  if (DEBUG) {
    console.log(`[Auth] ${message}`, data || '');
  }
};

export const saveUser = async (userData: any) => {
  try {
    if (!userData) {
      log('Error: Intentando guardar userData null o undefined');
      return;
    }
    
    if (!userData.userID) {
      // Asegurarse que userID existe
      log('Advertencia: userData no tiene userID', userData);
      // Si tu backend devuelve _id en lugar de userID, asignarlo aquí
      if (userData._id) {
        userData.userID = userData._id;
        log('Asignado _id a userID', userData);
      }
    }
    
    // Guardar como JSON string
    const jsonValue = JSON.stringify(userData);
    log('Guardando usuario:', userData);
    await SecureStore.setItemAsync(USER_KEY, jsonValue);
  } catch (error) {
    console.error('Error guardando datos de usuario:', error);
  }
};

export const getUser = async () => {
  try {
    const userData = await SecureStore.getItemAsync(USER_KEY);
    const parsedData = userData ? JSON.parse(userData) : null;
    log('Datos de usuario recuperados:', parsedData);
    return parsedData;
  } catch (error) {
    console.error('Error obteniendo datos de usuario:', error);
    return null;
  }
};

export const removeUser = async () => {
  try {
    log('Eliminando datos de usuario');
    await SecureStore.deleteItemAsync(USER_KEY);
  } catch (error) {
    console.error('Error eliminando datos de usuario:', error);
  }
};

export const getUserId = async (): Promise<string | null> => {
  try {
    const userData = await getUser();
    
    // Si no hay datos, retornar null
    if (!userData) {
      log('No hay datos de usuario para obtener ID');
      return null;
    }
    
    // Verificar si userID existe
    if (userData.userID) {
      log('ID de usuario obtenido:', userData.userID);
      return userData.userID;
    }
    
    // Verificar si hay un _id que podemos usar
    if (userData._id) {
      log('Usando _id como userID:', userData._id);
      return userData._id;
    }
    
    // Si llegamos aquí, no hay ID
    log('No se encontró userID ni _id en los datos de usuario', userData);
    return null;
  } catch (error) {
    console.error('Error obteniendo ID de usuario:', error);
    return null;
  }
};