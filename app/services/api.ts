// app/services/api.ts - Versión completa con integración OpenFoodFacts y correcciones TypeScript
import { getUserId } from '../lib/authUtils';
import { getUserFriendlyError } from '../utils/securityConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = "https://bhu8vgy7nht5.vercel.app/";
const DEBUG = true; // Cambiar a false en producción

// =================== OPENFOODFACTS CONFIGURATION ===================
const OFF_CONFIG = {
  API_BASE: 'https://world.openfoodfacts.org/api/v0',
  USER_AGENT: 'SensitiveFoods/1.0 (contact@sensitivefods.com)',
  
  // Rate Limiting
  MAX_SEARCHES_PER_MINUTE: 8, // Margen de seguridad bajo el límite de 10
  MAX_PRODUCTS_PER_MINUTE: 90, // Margen bajo el límite de 100
  
  // Cache Configuration
  CACHE_DURATION: {
    SEARCH_RESULTS: 15 * 60 * 1000,      // 15 minutos
    PRODUCT_DETAILS: 60 * 60 * 1000,     // 1 hora
    USER_PRODUCTS: 7 * 24 * 60 * 60 * 1000, // 7 días
  },
  
  // Storage Keys
  STORAGE_KEYS: {
    SEARCH_CACHE: 'off_search_cache',
    PRODUCT_CACHE: 'off_product_cache',
    USER_PRODUCTS: 'off_user_products',
    RATE_LIMIT_DATA: 'off_rate_limits',
  }
};

// =================== INTERFACES ===================
interface CachedProduct {
  code: string;
  product_name: string;
  brands: string;
  ingredients_text: string;
  image_url?: string;
  ingredients?: any[];
  cachedAt: number;
  accessCount: number;
  lastAccessed: number;
}

interface SearchCacheEntry {
  query: string;
  results: CachedProduct[];
  cachedAt: number;
  isBarcode: boolean;
}

interface RateLimitData {
  searchRequests: { timestamp: number }[];
  productRequests: { timestamp: number }[];
}

// Interface para productos que llegan desde el exterior - CORREGIDA
interface ProductInput {
  code?: string | number; // Permitir tanto string como number
  product_name?: string;
  brands?: string;
  ingredients_text?: string;
  image_url?: string;
  ingredients?: any[];
}

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
  // =================== OPENFOODFACTS CACHE MANAGEMENT ===================
  private static searchCache = new Map<string, SearchCacheEntry>();
  private static productCache = new Map<string, CachedProduct>();
  private static userProducts = new Map<string, CachedProduct>();
  private static rateLimitData: RateLimitData = {
    searchRequests: [],
    productRequests: []
  };
  private static isInitialized = false;

  // =================== INITIALIZATION ===================
  static async initialize() {
    if (this.isInitialized) return;
    
    console.log('[API] Inicializando ApiService con OpenFoodFacts...');
    try {
      await this.loadCacheFromStorage();
      await this.loadRateLimitData();
      this.isInitialized = true;
      console.log('[API] Servicio inicializado correctamente');
    } catch (error) {
      console.error('[API] Error inicializando servicio:', error);
      this.isInitialized = true; // Marcar como inicializado de todos modos
    }
  }

  // =================== BACKEND API METHODS ===================
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
      
      // 5. Verificar estado de OpenFoodFacts
      console.log('Verificando cache de OpenFoodFacts...');
      const stats = this.getOpenFoodFactsStats();
      console.log('Estadísticas OFF:', stats);
      
      console.log('============ FIN DIAGNÓSTICO ============');
    } catch (error: unknown) {
      console.error('Error durante el diagnóstico:', error);
    }
  }

  // =================== USER AUTHENTICATION ===================
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

  // =================== USER MANAGEMENT ===================
  static async getUsers() {
    return this.fetch('/users');
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

  // =================== CONTENT MANAGEMENT ===================
  static async getArticles() {
    return this.fetch('/articles');
  }

  static async getHistory() {
    return this.fetch('/history');
  }

  // =================== WISHLIST MANAGEMENT ===================
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

  // =================== PRODUCT NOTES ===================
  static async addProductNote(productID: string, note: string, rating?: number) {
    return this.fetch('/productnotes', {
      method: 'POST',
      body: JSON.stringify({ productID, note, rating }),
    });
  }

  static async getProductNotes() {
    return this.fetch('/productnotes');
  }

  static async updateProductNote(noteId: string, note: string, rating?: number) {
    return this.fetch(`/productnotes/${noteId}`, {
      method: 'PUT',
      body: JSON.stringify({ note, rating }),
    });
  }

  // =================== TESTING MANAGEMENT ===================
  static async startTest(productID: string) {
    return this.fetch('/tests', {
      method: 'POST',
      body: JSON.stringify({ itemID: productID }),
    });
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

  // =================== PRODUCT REACTIONS ===================
  static async saveProductReaction(productID: string, reaction: string) {
    return this.fetch('/product-reactions', {
      method: 'POST',
      body: JSON.stringify({ 
        productID, 
        reaction 
      }),
    });
  }

  static async getProductReactions() {
    return this.fetch('/product-reactions');
  }

  static async deleteProductReaction(productID: string) {
    return this.fetch(`/product-reactions/${productID}`, {
      method: 'DELETE',
    });
  }

  // =================== INGREDIENT REACTIONS ===================
  static async saveIngredientReaction(ingredientName: string, reaction: string) {
    return this.fetch('/ingredient-reactions', {
      method: 'POST',
      body: JSON.stringify({ 
        ingredientName, 
        reaction 
      }),
    });
  }

  static async deleteIngredientReaction(ingredientName: string) {
    return this.fetch(`/ingredient-reactions/${encodeURIComponent(ingredientName)}`, {
      method: 'DELETE',
    });
  }

  static async getIngredientReactions() {
    console.log('[API] Fetching ingredient reactions...');
    
    try {
      // Add a timestamp to prevent caching issues
      const timestamp = new Date().getTime();
      const endpoint = `/ingredient-reactions?t=${timestamp}`;
      
      const userId = await getUserId();
      const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          'User-ID': userId || '',
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

  // =================== OPENFOODFACTS INTELLIGENT SEARCH ===================

  /**
   * Búsqueda inteligente de productos con cache híbrido
   */
  static async searchProducts(query: string): Promise<CachedProduct[]> {
    // Asegurar inicialización
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!query?.trim()) return [];
    
    const trimmedQuery = query.trim();
    const isBarcode = /^\d+$/.test(trimmedQuery);
    
    console.log(`[API] Búsqueda: "${trimmedQuery}" (${isBarcode ? 'código de barras' : 'texto'})`);
    
    try {
      // 1. CACHE: Buscar en cache de búsquedas
      const cachedResults = this.getCachedSearchResults(trimmedQuery);
      if (cachedResults.length > 0) {
        console.log(`[API] ✅ Cache hit: ${cachedResults.length} resultados`);
        return cachedResults;
      }

      // 2. LOCAL: Buscar en productos del usuario
      const userMatches = this.searchInUserProducts(trimmedQuery);
      if (userMatches.length > 0) {
        console.log(`[API] ✅ User products: ${userMatches.length} resultados`);
        // Si encuentra suficientes resultados locales, devolverlos
        if (userMatches.length >= 3 || isBarcode) {
          return userMatches;
        }
      }

      // 3. API: Solo si necesita más resultados
      if (isBarcode) {
        const product = await this.getProductByBarcodeFromAPI(trimmedQuery);
        const apiResults = product ? [product] : [];
        
        // Combinar resultados
        const combinedResults = [...userMatches, ...apiResults].slice(0, 20);
        this.cacheSearchResults(trimmedQuery, combinedResults, isBarcode);
        
        return combinedResults;
      } else {
        const apiResults = await this.searchProductsFromAPI(trimmedQuery);
        
        // Combinar y deduplicar
        const combinedResults = this.deduplicateResults([...userMatches, ...apiResults]);
        this.cacheSearchResults(trimmedQuery, combinedResults, isBarcode);
        
        return combinedResults.slice(0, 20);
      }
      
    } catch (error) {
      console.error('[API] Error en búsqueda:', error);
      
      // Fallback: devolver resultados locales si la API falla
      const userMatches = this.searchInUserProducts(trimmedQuery);
      if (userMatches.length > 0) {
        console.log(`[API] ⚠️ API falló, devolviendo ${userMatches.length} resultados locales`);
        return userMatches;
      }
      
      return [];
    }
  }

  /**
   * Obtener producto específico por código de barras
   */
  static async getProductByBarcode(barcode: string): Promise<CachedProduct | null> {
    // Asegurar inicialización
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!barcode) return null;
    
    console.log(`[API] Obteniendo producto: ${barcode}`);
    
    try {
      // 1. Buscar en cache de productos
      const cached = this.productCache.get(barcode);
      if (cached && !this.isCacheExpired(cached.cachedAt, OFF_CONFIG.CACHE_DURATION.PRODUCT_DETAILS)) {
        console.log('[API] ✅ Product cache hit');
        this.updateProductAccess(cached);
        return cached;
      }

      // 2. Buscar en productos del usuario
      const userProduct = this.userProducts.get(barcode);
      if (userProduct) {
        console.log('[API] ✅ User product hit');
        this.updateProductAccess(userProduct);
        return userProduct;
      }

      // 3. Obtener de API
      const product = await this.getProductByBarcodeFromAPI(barcode);
      if (product) {
        // Guardar en cache y persistir
        this.productCache.set(barcode, product);
        await this.saveCacheToStorage();
      }

      return product;
    } catch (error) {
      console.error('[API] Error obteniendo producto por código:', error);
      throw error;
    }
  }

  /**
   * Marcar producto como visitado/usado por el usuario - CORREGIDO
   */
  static async markProductAsUsed(product: ProductInput) {
    // Asegurar inicialización
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      if (!product?.code) {
        console.warn('[API] Producto sin código, no se puede marcar como usado');
        return;
      }

      // CORRECCIÓN: Asegurar que code sea string y no undefined
      const productCode = product.code ? String(product.code) : '';
      if (!productCode) {
        console.warn('[API] Código de producto vacío, no se puede marcar como usado');
        return;
      }

      // Convertir a formato de cache si es necesario
      const cacheProduct: CachedProduct = {
        code: productCode,
        product_name: product.product_name || 'Unknown Product',
        brands: product.brands || 'Unknown Brand',
        ingredients_text: product.ingredients_text || '',
        image_url: product.image_url || '',
        ingredients: product.ingredients || [],
        cachedAt: Date.now(),
        accessCount: (this.userProducts.get(productCode)?.accessCount || 0) + 1,
        lastAccessed: Date.now()
      };

      this.userProducts.set(productCode, cacheProduct);
      await this.saveUserProductsToStorage();
      console.log(`[API] Producto marcado como usado: ${product.product_name}`);
      
    } catch (error) {
      console.error('[API] Error marcando producto como usado:', error);
      // No lanzar error aquí, es una operación secundaria
    }
  }

  // =================== OPENFOODFACTS API CALLS ===================
  
  private static async searchProductsFromAPI(query: string): Promise<CachedProduct[]> {
    if (!await this.checkRateLimit('search')) {
      throw new Error('Rate limit excedido para búsquedas');
    }
    
    console.log(`[API] 🌐 API call: búsqueda "${query}"`);
    
    const url = `${OFF_CONFIG.API_BASE}/search.json?search_terms=${encodeURIComponent(query)}&page_size=50&search_simple=1&fields=code,product_name,brands,ingredients_text,image_url,ingredients`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': OFF_CONFIG.USER_AGENT,
        'Accept': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`OpenFoodFacts API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data || !Array.isArray(data.products)) {
      return [];
    }

    return data.products
      .map((product: any) => this.mapOpenFoodFactsProduct(product))
      .filter((product: CachedProduct | null): product is CachedProduct => product !== null)
      .filter((product: CachedProduct) => this.isRelevantResult(product, query));
  }

  private static async getProductByBarcodeFromAPI(barcode: string): Promise<CachedProduct | null> {
    if (!await this.checkRateLimit('product')) {
      throw new Error('Rate limit excedido para productos');
    }
    
    console.log(`[API] 🌐 API call: producto "${barcode}"`);
    
    const url = `${OFF_CONFIG.API_BASE}/product/${barcode}.json`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': OFF_CONFIG.USER_AGENT,
        'Accept': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`OpenFoodFacts API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data || data.status !== 1 || !data.product) {
      return null;
    }

    return this.mapOpenFoodFactsProduct(data.product);
  }

  // =================== RATE LIMITING ===================
  
  private static async checkRateLimit(type: 'search' | 'product'): Promise<boolean> {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    // Limpiar requests antiguos
    if (type === 'search') {
      this.rateLimitData.searchRequests = this.rateLimitData.searchRequests
        .filter(req => req.timestamp > oneMinuteAgo);
      
      if (this.rateLimitData.searchRequests.length >= OFF_CONFIG.MAX_SEARCHES_PER_MINUTE) {
        console.warn('[API] ⚠️ Rate limit excedido para búsquedas');
        return false;
      }
      
      this.rateLimitData.searchRequests.push({ timestamp: now });
    } else {
      this.rateLimitData.productRequests = this.rateLimitData.productRequests
        .filter(req => req.timestamp > oneMinuteAgo);
      
      if (this.rateLimitData.productRequests.length >= OFF_CONFIG.MAX_PRODUCTS_PER_MINUTE) {
        console.warn('[API] ⚠️ Rate limit excedido para productos');
        return false;
      }
      
      this.rateLimitData.productRequests.push({ timestamp: now });
    }
    
    await this.saveRateLimitData();
    return true;
  }

  // =================== CACHE MANAGEMENT ===================
  
  private static getCachedSearchResults(query: string): CachedProduct[] {
    const cached = this.searchCache.get(query.toLowerCase());
    
    if (!cached) return [];
    
    if (this.isCacheExpired(cached.cachedAt, OFF_CONFIG.CACHE_DURATION.SEARCH_RESULTS)) {
      this.searchCache.delete(query.toLowerCase());
      return [];
    }
    
    return cached.results;
  }

  private static cacheSearchResults(query: string, results: CachedProduct[], isBarcode: boolean) {
    const cacheEntry: SearchCacheEntry = {
      query: query.toLowerCase(),
      results,
      cachedAt: Date.now(),
      isBarcode
    };
    
    this.searchCache.set(query.toLowerCase(), cacheEntry);
    
    // Limitar tamaño del cache
    if (this.searchCache.size > 100) {
      const oldestKey = this.searchCache.keys().next().value;
      if (oldestKey) {
        this.searchCache.delete(oldestKey);
      }
    }
  }

  private static searchInUserProducts(query: string): CachedProduct[] {
    const queryLower = query.toLowerCase();
    const results: CachedProduct[] = [];
    
    for (const product of this.userProducts.values()) {
      if (this.isRelevantResult(product, query)) {
        results.push(product);
      }
    }
    
    // Ordenar por frecuencia de acceso y recencia
    return results.sort((a, b) => {
      const scoreA = a.accessCount * 0.7 + (Date.now() - a.lastAccessed) / 1000000 * 0.3;
      const scoreB = b.accessCount * 0.7 + (Date.now() - b.lastAccessed) / 1000000 * 0.3;
      return scoreB - scoreA;
    });
  }

  // =================== UTILITY METHODS ===================
  
  private static isRelevantResult(product: CachedProduct, query: string): boolean {
    const searchLower = query.toLowerCase();
    return (
      product.product_name.toLowerCase().includes(searchLower) ||
      product.brands.toLowerCase().includes(searchLower) ||
      product.ingredients_text.toLowerCase().includes(searchLower) ||
      product.code.includes(query)
    );
  }

  private static deduplicateResults(results: CachedProduct[]): CachedProduct[] {
    const seen = new Set<string>();
    return results.filter((product: CachedProduct) => {
      if (seen.has(product.code)) return false;
      seen.add(product.code);
      return true;
    });
  }

  private static updateProductAccess(product: CachedProduct) {
    product.accessCount = (product.accessCount || 0) + 1;
    product.lastAccessed = Date.now();
  }

  private static isCacheExpired(cachedAt: number, duration: number): boolean {
    return Date.now() - cachedAt > duration;
  }

  private static mapOpenFoodFactsProduct(product: any): CachedProduct | null {
    if (!product) return null;

    return {
      code: product.code || '',
      product_name: product.product_name || 'Unknown Product',
      brands: product.brands || 'Unknown Brand',
      ingredients_text: product.ingredients_text || 'No ingredients information',
      image_url: product.image_url || '',
      ingredients: product.ingredients || [],
      cachedAt: Date.now(),
      accessCount: 0,
      lastAccessed: Date.now()
    };
  }

  // =================== PERSISTENCE ===================
  
  private static async loadCacheFromStorage() {
    try {
      // Cargar user products
      const userProductsJson = await AsyncStorage.getItem(OFF_CONFIG.STORAGE_KEYS.USER_PRODUCTS);
      if (userProductsJson) {
        const userProductsArray = JSON.parse(userProductsJson);
        this.userProducts = new Map(userProductsArray);
        console.log(`[API] Cargados ${this.userProducts.size} productos del usuario`);
      }
      
      // Cargar product cache
      const productCacheJson = await AsyncStorage.getItem(OFF_CONFIG.STORAGE_KEYS.PRODUCT_CACHE);
      if (productCacheJson) {
        const productCacheArray = JSON.parse(productCacheJson);
        this.productCache = new Map(productCacheArray);
        console.log(`[API] Cargados ${this.productCache.size} productos en cache`);
      }
    } catch (error) {
      console.error('[API] Error cargando cache:', error);
    }
  }

  private static async saveCacheToStorage() {
    try {
      // Guardar solo product cache (no user products, esos se guardan por separado)
      const productCacheArray = Array.from(this.productCache.entries());
      await AsyncStorage.setItem(OFF_CONFIG.STORAGE_KEYS.PRODUCT_CACHE, JSON.stringify(productCacheArray));
    } catch (error) {
      console.error('[API] Error guardando cache:', error);
    }
  }

  private static async saveUserProductsToStorage() {
    try {
      // Guardar solo productos frecuentemente accedidos
      const frequentProducts = Array.from(this.userProducts.entries())
        .filter(([code, product]) => product.accessCount >= 1)
        .slice(0, 200); // Limitar a 200 productos más frecuentes
      
      await AsyncStorage.setItem(OFF_CONFIG.STORAGE_KEYS.USER_PRODUCTS, JSON.stringify(frequentProducts));
      console.log(`[API] Guardados ${frequentProducts.length} productos del usuario`);
    } catch (error) {
      console.error('[API] Error guardando productos del usuario:', error);
    }
  }

  private static async loadRateLimitData() {
    try {
      const data = await AsyncStorage.getItem(OFF_CONFIG.STORAGE_KEYS.RATE_LIMIT_DATA);
      if (data) {
        this.rateLimitData = JSON.parse(data);
      }
    } catch (error) {
      console.error('[API] Error cargando rate limit data:', error);
    }
  }

  private static async saveRateLimitData() {
    try {
      await AsyncStorage.setItem(OFF_CONFIG.STORAGE_KEYS.RATE_LIMIT_DATA, JSON.stringify(this.rateLimitData));
    } catch (error) {
      console.error('[API] Error guardando rate limit data:', error);
    }
  }

  // =================== CACHE MAINTENANCE ===================
  
  static async cleanOpenFoodFactsCache() {
    console.log('[API] Limpiando cache de OpenFoodFacts...');
    
    try {
      // Limpiar cache expirado
      const now = Date.now();
      
      // Limpiar search cache
      for (const [key, entry] of this.searchCache.entries()) {
        if (this.isCacheExpired(entry.cachedAt, OFF_CONFIG.CACHE_DURATION.SEARCH_RESULTS)) {
          this.searchCache.delete(key);
        }
      }
      
      // Limpiar product cache
      for (const [key, product] of this.productCache.entries()) {
        if (this.isCacheExpired(product.cachedAt, OFF_CONFIG.CACHE_DURATION.PRODUCT_DETAILS)) {
          this.productCache.delete(key);
        }
      }
      
      // Limpiar user products viejos (solo los que no han sido accedidos en 30 días)
      for (const [key, product] of this.userProducts.entries()) {
        if (this.isCacheExpired(product.lastAccessed, 30 * 24 * 60 * 60 * 1000)) {
          this.userProducts.delete(key);
        }
      }
      
      await this.saveCacheToStorage();
      await this.saveUserProductsToStorage();
      
      console.log('[API] Cache de OpenFoodFacts limpiado');
    } catch (error) {
      console.error('[API] Error limpiando cache:', error);
    }
  }

  static async resetOpenFoodFactsCache() {
    this.searchCache.clear();
    this.productCache.clear();
    this.userProducts.clear();
    this.rateLimitData = { searchRequests: [], productRequests: [] };
    
    await AsyncStorage.multiRemove([
      OFF_CONFIG.STORAGE_KEYS.SEARCH_CACHE,
      OFF_CONFIG.STORAGE_KEYS.PRODUCT_CACHE,
      OFF_CONFIG.STORAGE_KEYS.USER_PRODUCTS,
      OFF_CONFIG.STORAGE_KEYS.RATE_LIMIT_DATA,
    ]);
    
    console.log('[API] Cache de OpenFoodFacts reseteado completamente');
  }

  // =================== DEBUG AND STATS ===================
  
  static getOpenFoodFactsStats() {
    return {
      searchCacheSize: this.searchCache.size,
      productCacheSize: this.productCache.size,
      userProductsSize: this.userProducts.size,
      rateLimitStatus: {
        searchRequests: this.rateLimitData.searchRequests.length,
        productRequests: this.rateLimitData.productRequests.length
      },
      isInitialized: this.isInitialized
    };
  }

  // =================== LEGACY SUPPORT (DEPRECATED) ===================
  // Mantener por compatibilidad con código existente
  
  /** @deprecated Use searchProducts() instead */
  private static OPEN_FOOD_FACTS_API = 'https://world.openfoodfacts.org/api/v0';

  /** @deprecated Use the new intelligent search methods instead */
  private static mapOpenFoodFactsProductLegacy(product: any) {
    if (!product) return null;

    return {
      code: product.code || '',
      product_name: product.product_name || 'Unknown Product',
      brands: product.brands || 'Unknown Brand',
      ingredients_text: product.ingredients_text || 'No ingredients information',
      image_url: product.image_url || '',
      ingredients: product.ingredients || []
    };
  }
}