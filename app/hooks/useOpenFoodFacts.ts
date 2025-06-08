// app/hooks/useOpenFoodFacts.ts
import { useEffect, useState } from 'react';
import { ApiService } from '../services/api';

interface OpenFoodFactsStats {
  searchCacheSize: number;
  productCacheSize: number;
  userProductsSize: number;
  rateLimitStatus: {
    searchRequests: number;
    productRequests: number;
  };
}

export const useOpenFoodFacts = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [stats, setStats] = useState<OpenFoodFactsStats | null>(null);

  useEffect(() => {
    initializeService();
  }, []);

  const initializeService = async () => {
    try {
      console.log('[useOpenFoodFacts] Inicializando servicio...');
      await ApiService.initialize();
      setIsInitialized(true);
      console.log('[useOpenFoodFacts] Servicio inicializado');
    } catch (error) {
      console.error('[useOpenFoodFacts] Error inicializando servicio:', error);
      // Marcar como inicializado de todos modos para que la app funcione
      setIsInitialized(true);
    }
  };

  const refreshStats = () => {
    try {
      const currentStats = ApiService.getOpenFoodFactsStats();
      setStats(currentStats);
    } catch (error) {
      console.error('[useOpenFoodFacts] Error obteniendo estadísticas:', error);
    }
  };

  const cleanCache = async () => {
    try {
      await ApiService.cleanOpenFoodFactsCache();
      refreshStats();
    } catch (error) {
      console.error('[useOpenFoodFacts] Error limpiando cache:', error);
    }
  };

  const resetCache = async () => {
    try {
      await ApiService.resetOpenFoodFactsCache();
      refreshStats();
    } catch (error) {
      console.error('[useOpenFoodFacts] Error reseteando cache:', error);
    }
  };

  return {
    isInitialized,
    stats,
    refreshStats,
    cleanCache,
    resetCache
  };
};
