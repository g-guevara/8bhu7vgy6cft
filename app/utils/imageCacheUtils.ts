// app/utils/imageCacheUtils.ts - Utilidades para gestionar el cache de imágenes

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

const IMAGE_CACHE_KEY = 'product_images_cache';
const OPENFOODFACTS_API = 'https://world.openfoodfacts.org/api/v0/product';

export interface ImageCacheUtils {
  // Obtener imagen desde cache o API
  getProductImage: (productCode: string) => Promise<string | null>;
  
  // Limpiar cache completo
  clearImageCache: () => Promise<void>;
  
  // Limpiar imagen específica
  clearProductImage: (productCode: string) => Promise<void>;
  
  // Obtener tamaño del cache
  getCacheSize: () => Promise<number>;
  
  // Obtener estadísticas del cache
  getCacheStats: () => Promise<{
    totalImages: number;
    totalSizeBytes: number;
    totalSizeMB: number;
  }>;
}

class ImageCacheManager {
  private static instance: ImageCacheManager;
  private cache: Record<string, string> = {};
  private isInitialized = false;

  static getInstance(): ImageCacheManager {
    if (!ImageCacheManager.instance) {
      ImageCacheManager.instance = new ImageCacheManager();
    }
    return ImageCacheManager.instance;
  }

  private async initializeCache(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      const cacheJson = await AsyncStorage.getItem(IMAGE_CACHE_KEY);
      if (cacheJson) {
        this.cache = JSON.parse(cacheJson);
      }
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing image cache:', error);
      this.cache = {};
      this.isInitialized = true;
    }
  }

  private async saveCache(): Promise<void> {
    try {
      await AsyncStorage.setItem(IMAGE_CACHE_KEY, JSON.stringify(this.cache));
    } catch (error) {
      console.error('Error saving image cache:', error);
    }
  }

  // Buscar producto en OpenFoodFacts API
  private async fetchFromOpenFoodFacts(productCode: string): Promise<string | null> {
    try {
      console.log(`🔍 Searching OpenFoodFacts for product: ${productCode}`);
      
      const response = await fetch(`${OPENFOODFACTS_API}/${productCode}.json`);
      
      if (!response.ok) {
        console.log(`❌ Product ${productCode} not found in OpenFoodFacts (${response.status})`);
        return null;
      }
      
      const data = await response.json();
      
      if (data.status === 1 && data.product) {
        // Buscar la mejor imagen disponible
        const imageUrl = data.product.image_front_url || 
                        data.product.image_url || 
                        data.product.image_front_small_url ||
                        data.product.image_small_url;
        
        if (imageUrl) {
          console.log(`✅ Found image for product ${productCode}`);
          return imageUrl;
        }
      }
      
      console.log(`📷 No image available for product ${productCode}`);
      return null;
    } catch (error) {
      console.error(`❌ Error fetching product ${productCode} from OpenFoodFacts:`, error);
      return null;
    }
  }

  // Descargar y guardar imagen localmente
  private async downloadAndSaveImage(imageUrl: string, productCode: string): Promise<string | null> {
    try {
      const filename = `product_${productCode}.jpg`;
      const fileUri = `${FileSystem.documentDirectory}${filename}`;
      
      // Verificar si ya existe
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (fileInfo.exists) {
        console.log(`📁 Image already cached for product ${productCode}`);
        return fileUri;
      }
      
      console.log(`⬇️ Downloading image for product ${productCode}...`);
      const downloadResult = await FileSystem.downloadAsync(imageUrl, fileUri);
      
      if (downloadResult.status === 200) {
        console.log(`✅ Image downloaded and cached for product ${productCode}`);
        return downloadResult.uri;
      }
      
      console.log(`❌ Failed to download image for product ${productCode}`);
      return null;
    } catch (error) {
      console.error(`❌ Error downloading image for product ${productCode}:`, error);
      return null;
    }
  }

  // Método principal para obtener imagen
  async getProductImage(productCode: string): Promise<string | null> {
    await this.initializeCache();
    
    // Verificar cache primero
    if (this.cache[productCode]) {
      const cachedUri = this.cache[productCode];
      
      // Verificar que el archivo aún existe
      const fileInfo = await FileSystem.getInfoAsync(cachedUri);
      if (fileInfo.exists) {
        console.log(`💾 Using cached image for product ${productCode}`);
        return cachedUri;
      } else {
        // Archivo no existe, remover del cache
        delete this.cache[productCode];
        await this.saveCache();
      }
    }
    
    // Buscar en OpenFoodFacts API
    const imageUrl = await this.fetchFromOpenFoodFacts(productCode);
    if (!imageUrl) {
      return null;
    }
    
    // Descargar y cachear imagen
    const localUri = await this.downloadAndSaveImage(imageUrl, productCode);
    if (localUri) {
      this.cache[productCode] = localUri;
      await this.saveCache();
      return localUri;
    }
    
    return null;
  }

  // Limpiar cache completo
  async clearImageCache(): Promise<void> {
    await this.initializeCache();
    
    try {
      console.log('🧹 Clearing image cache...');
      
      // Eliminar archivos físicos
      for (const productCode in this.cache) {
        const fileUri = this.cache[productCode];
        try {
          const fileInfo = await FileSystem.getInfoAsync(fileUri);
          if (fileInfo.exists) {
            await FileSystem.deleteAsync(fileUri);
          }
        } catch (error) {
          console.error(`Error deleting file ${fileUri}:`, error);
        }
      }
      
      // Limpiar cache en memoria y AsyncStorage
      this.cache = {};
      await AsyncStorage.removeItem(IMAGE_CACHE_KEY);
      
      console.log('✅ Image cache cleared successfully');
    } catch (error) {
      console.error('❌ Error clearing image cache:', error);
    }
  }

  // Limpiar imagen específica
  async clearProductImage(productCode: string): Promise<void> {
    await this.initializeCache();
    
    if (this.cache[productCode]) {
      try {
        const fileUri = this.cache[productCode];
        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        if (fileInfo.exists) {
          await FileSystem.deleteAsync(fileUri);
        }
        
        delete this.cache[productCode];
        await this.saveCache();
        
        console.log(`✅ Cleared image for product ${productCode}`);
      } catch (error) {
        console.error(`❌ Error clearing image for product ${productCode}:`, error);
      }
    }
  }

  // Obtener estadísticas del cache
  async getCacheStats(): Promise<{
    totalImages: number;
    totalSizeBytes: number;
    totalSizeMB: number;
  }> {
    await this.initializeCache();
    
    let totalSizeBytes = 0;
    let validImages = 0;
    
    for (const productCode in this.cache) {
      try {
        const fileUri = this.cache[productCode];
        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        if (fileInfo.exists) {
          totalSizeBytes += fileInfo.size || 0;
          validImages++;
        }
      } catch (error) {
        console.error(`Error checking file for product ${productCode}:`, error);
      }
    }
    
    return {
      totalImages: validImages,
      totalSizeBytes,
      totalSizeMB: Math.round((totalSizeBytes / (1024 * 1024)) * 100) / 100
    };
  }
}

// Exportar instancia singleton
export const imageCacheUtils = ImageCacheManager.getInstance();

// Funciones de utilidad públicas
export const ImageCacheAPI = {
  /**
   * Obtener imagen de producto desde cache o API de OpenFoodFacts
   */
  getProductImage: (productCode: string) => imageCacheUtils.getProductImage(productCode),
  
  /**
   * Limpiar todo el cache de imágenes
   */
  clearImageCache: () => imageCacheUtils.clearImageCache(),
  
  /**
   * Limpiar imagen específica del cache
   */
  clearProductImage: (productCode: string) => imageCacheUtils.clearProductImage(productCode),
  
  /**
   * Obtener estadísticas del cache
   */
  getCacheStats: () => imageCacheUtils.getCacheStats(),
  
  /**
   * Precargar imágenes para una lista de productos
   */
  preloadImages: async (productCodes: string[]) => {
    console.log(`🚀 Preloading images for ${productCodes.length} products...`);
    const promises = productCodes.map(code => imageCacheUtils.getProductImage(code));
    const results = await Promise.allSettled(promises);
    
    const successful = results.filter(result => result.status === 'fulfilled' && result.value).length;
    console.log(`✅ Preloaded ${successful}/${productCodes.length} images successfully`);
    
    return results;
  }
};