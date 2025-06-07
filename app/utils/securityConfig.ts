// app/utils/securityConfig.ts
export const SECURITY_CONFIG = {
  // Feature flags
  ENABLE_ACCOUNT_LIMIT: true, // Cambiar a false para desactivar
  ENABLE_LOGIN_ATTEMPTS_LIMIT: true, // Cambiar a false para desactivar
  
  // Limits
  MAX_ACCOUNTS_PER_DEVICE: 10,
  MAX_LOGIN_ATTEMPTS: 3,
  LOGIN_BLOCK_DURATION_MINUTES: 45,
  
  // Storage keys
  STORAGE_KEYS: {
    ACCOUNTS_CREATED: 'device_accounts_created',
    LOGIN_ATTEMPTS: 'login_attempts_data',
    IS_DEVICE_BLOCKED: 'device_blocked'
  }
};

// Función para mapear errores técnicos a mensajes amigables
export const getUserFriendlyError = (error: any): string => {
  const errorMessage = error?.message || error || '';
  const errorCode = error?.status || error?.code;

  // Errores específicos por código
  if (errorCode) {
    switch (errorCode) {
      case 400:
        return 'Parece que hay un problema con la información enviada. Por favor, revisa los datos e intenta nuevamente.';
      case 401:
        return 'Las credenciales no son correctas. Verifica tu email y contraseña.';
      case 403:
        return 'No tienes permisos para realizar esta acción.';
      case 404:
        return 'El servicio podría estar temporalmente no disponible. Vuelva mas tarde';
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

  // Errores específicos por mensaje
  if (typeof errorMessage === 'string') {
    const message = errorMessage.toLowerCase();
    
    if (message.includes('network') || message.includes('connection') || message.includes('internet')) {
      return 'Problema de conexión. Verifica tu internet e intenta nuevamente.';
    }
    
    if (message.includes('timeout')) {
      return 'La conexión está tardando mucho. Por favor, intenta nuevamente.';
    }
    
    if (message.includes('email') && message.includes('exist')) {
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
  }

  // Error genérico amigable
  return 'Algo salió mal. Por favor, intenta nuevamente en unos momentos.';
};