// app/services/api.ts - Versión corregida con manejo de errores mejorado
import { getUserId } from '../lib/authUtils';
import { getUserFriendlyError } from '../utils/securityConfig';

const API_URL = "https://bhu8vgy7nht5.vercel.app/";
const DEBUG = true; // Cambiar a false en producción

// Clase de error personalizada para incluir información de respuesta
class APIError extends Error {
  public status: number;
  public statusText: string;
  public response: any;

  constructor(message: string, status: number, statusText: string, response?: any) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.statusText = statusText;
    this.response = response;
  }
}

export class ApiService {
  static async fetch(endpoint: string, options: RequestInit = {}) {
    try {
      const userId = await getUserId();
      
      if (DEBUG) {
        console.log(`[API] Calling ${endpoint}`, {
          userId: userId,
          method: options.method || 'GET',
          hasBody: !!options.body
        });
      }
      
      const config: RequestInit = {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(userId ? { 'User-ID': userId } : {}),
          ...options.headers,
        },
      };
      
      if (DEBUG) {
        console.log(`[API] Request headers:`, config.headers);
      }

      const response = await fetch(`${API_URL}${endpoint}`, config);
      
      if (DEBUG) {
        console.log(`[API] Response status: ${response.status} ${response.statusText}`);
      }
      
      // Check content type before attempting to parse JSON
      const contentType = response.headers.get('content-type');
      if (contentType && !contentType.includes('application/json')) {
        console.error(`[API] Server returned non-JSON content type: ${contentType}`);
        // Try to get text for debugging purposes
        const text = await response.text();
        console.error(`[API] Response starts with: ${text.substring(0, 100)}`);
        throw new APIError(
          'Server returned unexpected response format',
          response.status,
          response.statusText,
          { contentType, preview: text.substring(0, 100) }
        );
      }
      
      // Parse response JSON
      let responseData;
      try {
        responseData = await response.json();
      } catch (jsonError: unknown) {
        console.error('[API] JSON parse error:', jsonError);
        const errorMessage = jsonError instanceof Error ? jsonError.message : 'JSON parse failed';
        throw new APIError(
          'Invalid response format from server',
          response.status,
          response.statusText,
          { jsonError: errorMessage }
        );
      }
      
      // Check if response is not ok (status not in 200-299 range)
      if (!response.ok) {
        const errorMessage = responseData?.message || responseData?.error || response.statusText || 'Request failed';
        
        if (DEBUG) {
          console.log(`[API] Error response data:`, responseData);
        }
        
        // Create error with status information
        throw new APIError(
          errorMessage,
          response.status,
          response.statusText,
          responseData
        );
      }
      
      return responseData;
    } catch (error: unknown) {
      // If it's already our APIError, re-throw it
      if (error instanceof APIError) {
        if (DEBUG) {
          console.log('[API] APIError thrown:', {
            message: error.message,
            status: error.status,
            statusText: error.statusText
          });
        }
        throw error;
      }
      
      // Handle network errors and other fetch errors
      console.error('API Network Error:', error);
      
      // Get error message safely
      const errorMessage = error instanceof Error ? error.message : 'Network request failed';
      
      // Create a network error with special status
      throw new APIError(
        errorMessage,
        0, // Use 0 for network errors
        'Network Error',
        { originalError: errorMessage }
      );
    }
  }

  // Función de diagnóstico para identificar problemas
  static async diagnosticarProblemas() {
    console.log('============ DIAGNÓSTICO DE API ============');
    try {
      // 1. Verificar conexión básica
      console.log('Verificando conexión al servidor...');
      const conexion = await fetch(API_URL);
      console.log(`Conexión: ${conexion.status} ${conexion.statusText}`);
      
      // 2. Verificar datos de usuario
      console.log('Verificando ID de usuario...');
      const userId = await getUserId();
      console.log(`User ID: ${userId || 'No encontrado'}`);
      
      // 3. Probar endpoint público
      console.log('Probando endpoint público...');
      const respuestaPublica = await fetch(`${API_URL}/`);
      console.log(`Respuesta: ${respuestaPublica.status} ${respuestaPublica.statusText}`);
      
      // 4. Probar endpoint protegido con User-ID
      if (userId) {
        console.log('Probando endpoint protegido con User-ID...');
        const respuestaProtegida = await fetch(`${API_URL}/verify-token`, {
          headers: {
            'User-ID': userId
          }
        });
        console.log(`Respuesta: ${respuestaProtegida.status} ${respuestaProtegida.statusText}`);
      } else {
        console.log('No se puede probar endpoint protegido porque no hay User-ID');
      }
      
      console.log('============ FIN DIAGNÓSTICO ============');
    } catch (error: unknown) {
      console.error('Error durante el diagnóstico:', error);
    }
  }

  static async login(email: string, password: string) {
    const result = await this.fetch('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    // Si el login es exitoso, verificar que user y userID existan
    if (result.user) {
      // Asegurarse de que userID existe (algunas veces puede estar como _id)
      if (!result.user.userID && result.user._id) {
        console.log('Transformando _id a userID:', result.user._id);
        result.user.userID = result.user._id;
      }
    }
    
    return result;
  }

  static async googleLogin(googleData: {
    idToken: string;
    accessToken: string;
    email: string;
    name: string;
    googleId: string;
  }) {
    return this.fetch('/google-login', {
      method: 'POST',
      body: JSON.stringify(googleData),
    });
  }

  static async signup(userData: {
    name: string;
    email: string;
    password: string;
    language: string;
  }) {
    return this.fetch('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  static async getUsers() {
    return this.fetch('/users');
  }

  static async getArticles() {
    return this.fetch('/articles');
  }

  static async getHistory() {
    return this.fetch('/history');
  }

  static async addToWishlist(productID: string) {
    return this.fetch('/wishlist', {
      method: 'POST',
      body: JSON.stringify({ productID }),
    });
  }

  static async removeFromWishlist(wishlistItemId: string) {
    return this.fetch(`/wishlist/${wishlistItemId}`, {
      method: 'DELETE',
    });
  }

  static async getWishlist() {
    return this.fetch('/wishlist');
  }

  static async addProductNote(productID: string, note: string, rating?: number) {
    return this.fetch('/productnotes', {
      method: 'POST',
      body: JSON.stringify({ productID, note, rating }),
    });
  }

  static async getProductNotes() {
    return this.fetch('/productnotes');
  }

  static async getProfile() {
    return this.fetch('/profile');
  }

  static async changePassword(currentPassword: string, newPassword: string) {
    return this.fetch('/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  static async updateTrialPeriod(trialDays: number) {
    return this.fetch('/update-trial-period', {
      method: 'POST',
      body: JSON.stringify({ trialDays }),
    });
  }

  static async startTest(productID: string) {
    return this.fetch('/tests', {
      method: 'POST',
      body: JSON.stringify({ itemID: productID }),
    });
  }

  static async updateProductNote(noteId: string, note: string, rating?: number) {
    return this.fetch(`/productnotes/${noteId}`, {
      method: 'PUT',
      body: JSON.stringify({ note, rating }),
    });
  }

  // Save product reaction
  static async saveProductReaction(productID: string, reaction: string) {
    return this.fetch('/product-reactions', {
      method: 'POST',
      body: JSON.stringify({ 
        productID, 
        reaction 
      }),
    });
  }

  // Get product reactions
  static async getProductReactions() {
    return this.fetch('/product-reactions');
  }

  // Delete product reaction
  static async deleteProductReaction(productID: string) {
    return this.fetch(`/product-reactions/${productID}`, {
      method: 'DELETE',
    });
  }

  // Save ingredient reaction
  static async saveIngredientReaction(ingredientName: string, reaction: string) {
    return this.fetch('/ingredient-reactions', {
      method: 'POST',
      body: JSON.stringify({ 
        ingredientName, 
        reaction 
      }),
    });
  }

  // Delete ingredient reaction
  static async deleteIngredientReaction(ingredientName: string) {
    return this.fetch(`/ingredient-reactions/${encodeURIComponent(ingredientName)}`, {
      method: 'DELETE',
    });
  }

  // Get ingredient reactions
  static async getIngredientReactions() {
    console.log('[API] Fetching ingredient reactions...');
    
    try {
      // Add a timestamp to prevent caching issues
      const timestamp = new Date().getTime();
      const endpoint = `/ingredient-reactions?t=${timestamp}`;
      
      const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          'User-ID': await getUserId() || '',
          // Force accept JSON only
          'Accept': 'application/json'
        }
      });
      
      // Log the response details for debugging
      console.log(`[API] Response status: ${response.status}`);
      console.log(`[API] Response content-type: ${response.headers.get('content-type')}`);
      
      if (!response.ok) {
        throw new APIError(
          `Request failed with status ${response.status}`,
          response.status,
          response.statusText
        );
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error(`[API] Non-JSON response, content-type: ${contentType}`);
        // Try to get first part of text for debugging
        const text = await response.text();
        console.error(`[API] Response preview: ${text.substring(0, 100)}`);
        throw new APIError(
          'Server returned non-JSON response',
          response.status,
          response.statusText,
          { contentType, preview: text.substring(0, 100) }
        );
      }
      
      // Parse as JSON at this point
      const data = await response.json();
      console.log(`[API] Successfully fetched ${data.length} ingredient reactions`);
      return data;
    } catch (error: unknown) {
      console.error('[API] Error fetching ingredient reactions:', error);
      throw error;
    }
  }

  static async getTests() {
    return this.fetch('/tests');
  }

  static async completeTest(testId: string, result: 'Critic' | 'Sensitive' | 'Safe' | null) {
    return this.fetch(`/tests/${testId}`, {
      method: 'PUT',
      body: JSON.stringify({ result }),
    });
  }
}