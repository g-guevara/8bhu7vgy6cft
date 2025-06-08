// app/services/openFoodFactsService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

// =================== CONFIGURACIÓN ===================
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

// =================== MAIN SERVICE CLASS ===================
export class OpenFoodFactsService {
  private static searchCache = new Map<string, SearchCacheEntry>();
  private static productCache = new Map<string, CachedProduct>();
  private static userProducts = new Map<string, CachedProduct>();
  private static rateLimitData: RateLimitData = {
    searchRequests: [],
    productRequests: []
  };
  
  // =================== INITIALIZATION ===================
  static async initialize() {
    console.log('[OFF] Inicializando OpenFoodFacts Service...');
    try {
      await this.loadCacheFromStorage();
      await this.loadRateLimitData();
      console.log('[OFF] Servicio inicializado correctamente');
    } catch (error) {
      console.error('[OFF] Error inicializando servicio:', error);
    }
  }

  // =================== PUBLIC SEARCH METHODS ===================
  
  /**
   * Búsqueda inteligente híbrida
   */
  static async searchProducts(query: string): Promise<CachedProduct[]> {
    if (!query?.trim()) return [];
    
    const trimmedQuery = query.trim();
    const isBarcode = /^\d+$/.test(trimmedQuery);
    
    console.log(`[OFF] Búsqueda: "${trimmedQuery}" (${isBarcode ? 'código de barras' : 'texto'})`);
    
    try {
      // 1. CACHE: Buscar en cache de búsquedas
      const cachedResults = this.getCachedSearchResults(trimmedQuery);
      if (cachedResults.length > 0) {
        console.log(`[OFF] ✅ Cache hit: ${cachedResults.length} resultados`);
        return cachedResults;
      }

      // 2. LOCAL: Buscar en productos del usuario
      const userMatches = this.searchInUserProducts(trimmedQuery);
      if (userMatches.length > 0) {
        console.log(`[OFF] ✅ User products: ${userMatches.length} resultados`);
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
      console.error('[OFF] Error en búsqueda:', error);
      
      // Fallback: devolver resultados locales si la API falla
      const userMatches = this.searchInUserProducts(trimmedQuery);
      if (userMatches.length > 0) {
        console.log(`[OFF] ⚠️ API falló, devolviendo ${userMatches.length} resultados locales`);
        return userMatches;
      }
      
      return [];
    }
  }

  /**
   * Obtener producto específico (con cache inteligente)
   */
  static async getProduct(code: string): Promise<CachedProduct | null> {
    if (!code) return null;
    
    console.log(`[OFF] Obteniendo producto: ${code}`);
    
    try {
      // 1. Buscar en cache de productos
      const cached = this.productCache.get(code);
      if (cached && !this.isCacheExpired(cached.cachedAt, OFF_CONFIG.CACHE_DURATION.PRODUCT_DETAILS)) {
        console.log('[OFF] ✅ Product cache hit');
        this.updateProductAccess(cached);
        return cached;
      }

      // 2. Buscar en productos del usuario
      const userProduct = this.userProducts.get(code);
      if (userProduct) {
        console.log('[OFF] ✅ User product hit');
        this.updateProductAccess(userProduct);
        return userProduct;
      }

      // 3. Obtener de API
      const product = await this.getProductByBarcodeFromAPI(code);
      if (product) {
        // Guardar en cache y persistir
        this.productCache.set(code, product);
        await this.saveCacheToStorage();
      }

      return product;
    } catch (error) {
      console.error('[OFF] Error obteniendo producto:', error);
      return null;
    }
  }

  /**
   * Guardar producto como visitado por el usuario
   */
  static async saveUserProduct(product: CachedProduct) {
    console.log(`[OFF] Guardando producto del usuario: ${product.product_name}`);
    
    const userProduct: CachedProduct = {
      ...product,
      accessCount: (this.userProducts.get(product.code)?.accessCount || 0) + 1,
      lastAccessed: Date.now(),
      cachedAt: Date.now()
    };
    
    this.userProducts.set(product.code, userProduct);
    await this.saveUserProductsToStorage();
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
        console.warn('[OFF] ⚠️ Rate limit excedido para búsquedas');
        return false;
      }
      
      this.rateLimitData.searchRequests.push({ timestamp: now });
    } else {
      this.rateLimitData.productRequests = this.rateLimitData.productRequests
        .filter(req => req.timestamp > oneMinuteAgo);
      
      if (this.rateLimitData.productRequests.length >= OFF_CONFIG.MAX_PRODUCTS_PER_MINUTE) {
        console.warn('[OFF] ⚠️ Rate limit excedido para productos');
        return false;
      }
      
      this.rateLimitData.productRequests.push({ timestamp: now });
    }
    
    await this.saveRateLimitData();
    return true;
  }

  // =================== API CALLS ===================
  
  private static async searchProductsFromAPI(query: string): Promise<CachedProduct[]> {
    if (!await this.checkRateLimit('search')) {
      throw new Error('Rate limit excedido para búsquedas');
    }
    
    console.log(`[OFF] 🌐 API call: búsqueda "${query}"`);
    
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
      .map(this.mapOpenFoodFactsProduct)
      .filter(product => product !== null)
      .filter(product => this.isRelevantResult(product, query));
  }

  private static async getProductByBarcodeFromAPI(barcode: string): Promise<CachedProduct | null> {
    if (!await this.checkRateLimit('product')) {
      throw new Error('Rate limit excedido para productos');
    }
    
    console.log(`[OFF] 🌐 API call: producto "${barcode}"`);
    
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
      this.searchCache.delete(oldestKey);
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
    return results.filter(product => {
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
        console.log(`[OFF] Cargados ${this.userProducts.size} productos del usuario`);
      }
      
      // Cargar product cache
      const productCacheJson = await AsyncStorage.getItem(OFF_CONFIG.STORAGE_KEYS.PRODUCT_CACHE);
      if (productCacheJson) {
        const productCacheArray = JSON.parse(productCacheJson);
        this.productCache = new Map(productCacheArray);
        console.log(`[OFF] Cargados ${this.productCache.size} productos en cache`);
      }
    } catch (error) {
      console.error('[OFF] Error cargando cache:', error);
    }
  }

  private static async saveCacheToStorage() {
    try {
      // Guardar solo product cache (no user products, esos se guardan por separado)
      const productCacheArray = Array.from(this.productCache.entries());
      await AsyncStorage.setItem(OFF_CONFIG.STORAGE_KEYS.PRODUCT_CACHE, JSON.stringify(productCacheArray));
    } catch (error) {
      console.error('[OFF] Error guardando cache:', error);
    }
  }

  private static async saveUserProductsToStorage() {
    try {
      // Guardar solo productos frecuentemente accedidos
      const frequentProducts = Array.from(this.userProducts.entries())
        .filter(([code, product]) => product.accessCount >= 1)
        .slice(0, 200); // Limitar a 200 productos más frecuentes
      
      await AsyncStorage.setItem(OFF_CONFIG.STORAGE_KEYS.USER_PRODUCTS, JSON.stringify(frequentProducts));
      console.log(`[OFF] Guardados ${frequentProducts.length} productos del usuario`);
    } catch (error) {
      console.error('[OFF] Error guardando productos del usuario:', error);
    }
  }

  private static async loadRateLimitData() {
    try {
      const data = await AsyncStorage.getItem(OFF_CONFIG.STORAGE_KEYS.RATE_LIMIT_DATA);
      if (data) {
        this.rateLimitData = JSON.parse(data);
      }
    } catch (error) {
      console.error('[OFF] Error cargando rate limit data:', error);
    }
  }

  private static async saveRateLimitData() {
    try {
      await AsyncStorage.setItem(OFF_CONFIG.STORAGE_KEYS.RATE_LIMIT_DATA, JSON.stringify(this.rateLimitData));
    } catch (error) {
      console.error('[OFF] Error guardando rate limit data:', error);
    }
  }

  // =================== CACHE MAINTENANCE ===================
  
  static async cleanupCache() {
    console.log('[OFF] Limpiando cache...');
    
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
      
      console.log('[OFF] Cache limpiado');
    } catch (error) {
      console.error('[OFF] Error limpiando cache:', error);
    }
  }

  // =================== DEBUG METHODS ===================
  
  static getStats() {
    return {
      searchCacheSize: this.searchCache.size,
      productCacheSize: this.productCache.size,
      userProductsSize: this.userProducts.size,
      rateLimitStatus: {
        searchRequests: this.rateLimitData.searchRequests.length,
        productRequests: this.rateLimitData.productRequests.length
      }
    };
  }

  static async clearAllCache() {
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
    
    console.log('[OFF] Todo el cache eliminado');
  }
}