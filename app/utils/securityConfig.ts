// app/utils/securityConfig.ts
export const SECURITY_CONFIG = {
  // 🎛️ FEATURE FLAGS - Cambiar estos valores para activar/desactivar funcionalidades
  ENABLE_ACCOUNT_LIMIT: 1,        // 1 = ACTIVADO | 0 = DESACTIVADO - Límite de 10 cuentas por dispositivo
  ENABLE_LOGIN_ATTEMPTS_LIMIT: 0, // 1 = ACTIVADO | 0 = DESACTIVADO - Límite de 3 intentos de login
  
  // ⚙️ CONFIGURACIÓN DE LÍMITES (solo aplican si están activados arriba)
  MAX_ACCOUNTS_PER_DEVICE: 5,          // Máximo número de cuentas por dispositivo
  MAX_LOGIN_ATTEMPTS: 5,                // Máximo número de intentos fallidos
  LOGIN_BLOCK_DURATION_MINUTES: 45,     // Minutos de bloqueo después de exceder intentos
  
  // 🔑 CLAVES DE ALMACENAMIENTO (no cambiar)
  STORAGE_KEYS: {
    ACCOUNTS_CREATED: 'device_accounts_created',
    LOGIN_ATTEMPTS: 'login_attempts_data',
    IS_DEVICE_BLOCKED: 'device_blocked'
  }
};

// 🔄 HELPER FUNCTIONS para convertir 1/0 a boolean
const isFeatureEnabled = (flag: number): boolean => flag === 1;

// 📤 EXPORTS con conversión automática
export const FEATURES = {
  ACCOUNT_LIMIT_ENABLED: isFeatureEnabled(SECURITY_CONFIG.ENABLE_ACCOUNT_LIMIT),
  LOGIN_ATTEMPTS_ENABLED: isFeatureEnabled(SECURITY_CONFIG.ENABLE_LOGIN_ATTEMPTS_LIMIT)
};

// Función para mapear errores técnicos a mensajes amigables
export const getUserFriendlyError = (error: any): string => {
  const errorMessage = error?.message || error || '';
  const errorCode = error?.status || error?.code;

  console.log('[DEBUG] getUserFriendlyError - Error completo:', error);
  console.log('[DEBUG] getUserFriendlyError - errorMessage:', errorMessage);
  console.log('[DEBUG] getUserFriendlyError - errorCode:', errorCode);

  // Manejo especial para nuestra clase APIError personalizada
  if (error?.name === 'APIError') {
    console.log('[DEBUG] APIError detected with status:', error.status);
    
    switch (error.status) {
      case 0:
        return 'Problema de conexión. Verifica tu internet e intenta nuevamente.';
      case 400:
        return 'Parece que hay un problema con la información enviada. Por favor, revisa los datos e intenta nuevamente.';
      case 401:
        return 'Las credenciales no son correctas. Verifica tu email y contraseña.';
      case 403:
        return 'No tienes permisos para realizar esta acción.';
      case 404:
        return 'No pudimos encontrar lo que buscas. El servicio podría estar temporalmente no disponible.';
      case 409:
        console.log('[DEBUG] Email duplicate error (409) detected');
        return 'Este email ya está registrado. ¿Ya tienes una cuenta?';
      case 429:
        return 'Has hecho demasiadas solicitudes. Por favor, espera unos minutos antes de intentar nuevamente.';
      case 500:
      case 502:
      case 503:
        return 'Tenemos problemas técnicos temporales. Por favor, intenta en unos minutos.';
      default:
        // Si es un APIError pero no reconocemos el código, usar el mensaje del servidor
        if (error.response?.message) {
          return error.response.message;
        }
        return 'Algo salió mal. Por favor, intenta nuevamente en unos momentos.';
    }
  }

  // Errores específicos por código (para compatibilidad con errores antiguos)
  if (errorCode) {
    switch (errorCode) {
      case 400:
        return 'Parece que hay un problema con la información enviada. Por favor, revisa los datos e intenta nuevamente.';
      case 401:
        return 'Las credenciales no son correctas. Verifica tu email y contraseña.';
      case 403:
        return 'No tienes permisos para realizar esta acción.';
      case 404:
        return 'No pudimos encontrar lo que buscas. El servicio podría estar temporalmente no disponible.';
      case 409:
        return 'Este email ya está registrado. ¿Ya tienes una cuenta?';
      case 429:
        return 'Has hecho demasiadas solicitudes. Por favor, espera unos minutos antes de intentar nuevamente.';
      case 500:
      case 502:
      case 503:
        return 'Tenemos problemas técnicos temporales. Por favor, intenta en unos minutos.';
      case 'NETWORK_ERROR':
      case 'NetworkError':
        return 'Parece que hay un problema de conexión. Verifica tu internet e intenta nuevamente.';
    }
  }

  // Detectar 409 en el mensaje si no viene en el código
  if (typeof errorMessage === 'string') {
    const message = errorMessage.toLowerCase();
    
    // Buscar específicamente el status 409 en el mensaje
    if (message.includes('409') || message.includes('failed with status 409')) {
      console.log('[DEBUG] 409 detected in message');
      return 'Este email ya está registrado. ¿Ya tienes una cuenta?';
    }
    
    // Otros patrones de detección
    if (message.includes('network') || message.includes('connection') || message.includes('internet')) {
      return 'Problema de conexión. Verifica tu internet e intenta nuevamente.';
    }
    
    if (message.includes('timeout')) {
      return 'La conexión está tardando mucho. Por favor, intenta nuevamente.';
    }
    
    if (message.includes('email') && (message.includes('exist') || message.includes('already') || message.includes('registrado'))) {
      return 'Este email ya está registrado. ¿Ya tienes una cuenta?';
    }
    
    if (message.includes('credencial') || message.includes('password') || message.includes('incorrect')) {
      return 'Email o contraseña incorrectos. Revisa tus datos e intenta nuevamente.';
    }
    
    if (message.includes('required') || message.includes('missing')) {
      return 'Por favor, completa todos los campos requeridos.';
    }
    
    if (message.includes('invalid') && message.includes('email')) {
      return 'El formato del email no es válido. Por favor, verifica e intenta nuevamente.';
    }

    // Detectar otros códigos de estado en el mensaje
    if (message.includes('400') || message.includes('failed with status 400')) {
      return 'Parece que hay un problema con la información enviada. Por favor, revisa los datos e intenta nuevamente.';
    }
    
    if (message.includes('401') || message.includes('failed with status 401')) {
      return 'Las credenciales no son correctas. Verifica tu email y contraseña.';
    }
    
    if (message.includes('500') || message.includes('failed with status 500')) {
      return 'Tenemos problemas técnicos temporales. Por favor, intenta en unos minutos.';
    }
  }

  // Error genérico amigable
  return 'Algo salió mal. Por favor, intenta nuevamente en unos momentos.';
};