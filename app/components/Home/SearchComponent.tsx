// app/components/Home/SearchComponent.tsx - VERSIÓN SIMPLIFICADA Y CORREGIDA
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { searchStyles } from '../../styles/HomeComponentStyles';

interface SearchComponentProps {
  onFocusChange: (focused: boolean) => void;
}

interface HistoryItem {
  code: string;
  viewedAt: string;
}

interface Product {
  code: string;
  product_name: string;
  brands: string;
  ingredients_text: string;
  image_url?: string;
}

const HISTORY_KEY = 'product_history';
const MAX_HISTORY_ITEMS = 2;
const RESULTS_PER_PAGE = 15;

// Configuración simplificada para OpenFoodFacts
const OFF_CONFIG = {
  API_BASE: 'https://world.openfoodfacts.org/api/v0',
  USER_AGENT: 'SensitiveFoods/1.0 (contact@sensitivefods.com)',
};

export default function SearchComponent({ onFocusChange }: SearchComponentProps) {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [allSearchResults, setAllSearchResults] = useState<Product[]>([]);
  const [displayedResults, setDisplayedResults] = useState<Product[]>([]);
  const [historyItems, setHistoryItems] = useState<Product[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  
  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    loadHistoryFromStorage();
  }, []);

  useEffect(() => {
    if (allSearchResults.length > 0) {
      const total = Math.ceil(allSearchResults.length / RESULTS_PER_PAGE);
      setTotalPages(total);
      setTotalResults(allSearchResults.length);
      
      if (currentPage > total) {
        setCurrentPage(1);
      }
      
      updateDisplayedResults(currentPage, allSearchResults);
    } else {
      setTotalPages(0);
      setTotalResults(0);
      setDisplayedResults([]);
    }
  }, [allSearchResults, currentPage]);

  const updateDisplayedResults = (page: number, results: Product[]) => {
    const startIndex = (page - 1) * RESULTS_PER_PAGE;
    const endIndex = startIndex + RESULTS_PER_PAGE;
    const pageResults = results.slice(startIndex, endIndex);
    setDisplayedResults(pageResults);
  };

  const loadHistoryFromStorage = async () => {
    setLoadingHistory(true);
    try {
      const historyJson = await AsyncStorage.getItem(HISTORY_KEY);
      if (historyJson) {
        const historyData: HistoryItem[] = JSON.parse(historyJson);
        const sortedHistory = historyData.sort((a, b) =>
          new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime()
        );

        // Para el historial, cargar productos individuales
        const historyProducts: Product[] = [];
        
        for (const historyItem of sortedHistory.slice(0, MAX_HISTORY_ITEMS)) {
          try {
            const product = await getProductByBarcode(historyItem.code);
            if (product) {
              historyProducts.push(product);
            }
          } catch (error) {
            console.log(`No se pudo cargar producto del historial: ${historyItem.code}`);
          }
        }

        setHistoryItems(historyProducts);
      } else {
        setHistoryItems([]);
      }
    } catch (error) {
      console.error('Error loading history:', error);
      setHistoryItems([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  // =================== BÚSQUEDA SIMPLIFICADA DIRECTA A OPENFOODFACTS ===================
  const searchProductsDirectly = async (query: string): Promise<Product[]> => {
    if (!query?.trim()) return [];
    
    const trimmedQuery = query.trim();
    const isBarcode = /^\d+$/.test(trimmedQuery);
    
    console.log(`[Search] Buscando directamente en OpenFoodFacts: "${trimmedQuery}"`);
    
    try {
      if (isBarcode) {
        // Búsqueda por código de barras
        const url = `${OFF_CONFIG.API_BASE}/product/${trimmedQuery}.json`;
        
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
          return [];
        }

        const product = mapOpenFoodFactsProduct(data.product);
        return product ? [product] : [];
      } else {
        // Búsqueda por texto - SIMPLIFICADA Y DIRECTA
        const url = `${OFF_CONFIG.API_BASE}/search.json?search_terms=${encodeURIComponent(trimmedQuery)}&page_size=100&search_simple=1&fields=code,product_name,brands,ingredients_text,image_url`;
        
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

        // Mapear y filtrar productos - SIN filtros restrictivos
        return data.products
          .map((product: any) => mapOpenFoodFactsProduct(product))
.filter((product: Product | null): product is Product => {
    if (product !== null &&
        product.product_name &&
        product.product_name.trim() !== '' &&
        product.product_name.toLowerCase() !== 'unknown product') {
        return true;
    }
    return false;
})


          .slice(0, 50); // Limitar a 50 resultados máximo
      }
      
    } catch (error) {
      console.error('[Search] Error en búsqueda directa:', error);
      return [];
    }
  };

  // Función para mapear productos de OpenFoodFacts a nuestro formato
  const mapOpenFoodFactsProduct = (product: any): Product | null => {
    if (!product || !product.code) return null;

    return {
      code: product.code || '',
      product_name: product.product_name || 'Unknown Product',
      brands: product.brands || 'Unknown Brand',
      ingredients_text: product.ingredients_text || 'No ingredients information',
      image_url: product.image_url || '',
    };
  };

  // Función para obtener producto por código de barras (para historial)
  const getProductByBarcode = async (barcode: string): Promise<Product | null> => {
    try {
      const url = `${OFF_CONFIG.API_BASE}/product/${barcode}.json`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': OFF_CONFIG.USER_AGENT,
          'Accept': 'application/json',
        }
      });
      
      if (!response.ok) return null;
      
      const data = await response.json();
      
      if (!data || data.status !== 1 || !data.product) return null;

      return mapOpenFoodFactsProduct(data.product);
    } catch (error) {
      return null;
    }
  };

  const saveToHistory = async (productCode: string) => {
    try {
      const historyJson = await AsyncStorage.getItem(HISTORY_KEY);
      let historyData: HistoryItem[] = historyJson ? JSON.parse(historyJson) : [];

      historyData = historyData.filter(item => item.code !== productCode);

      const newHistoryItem: HistoryItem = {
        code: productCode,
        viewedAt: new Date().toISOString(),
      };
      historyData.unshift(newHistoryItem);

      historyData = historyData.slice(0, MAX_HISTORY_ITEMS);

      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(historyData));
      await loadHistoryFromStorage();
    } catch (error) {
      console.error('Error saving to history:', error);
    }
  };

  const clearHistory = async () => {
    try {
      await AsyncStorage.removeItem(HISTORY_KEY);
      setHistoryItems([]);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  // =================== NUEVA LÓGICA DE BÚSQUEDA SIMPLIFICADA ===================
  const handleSearch = async (text: string) => {
    setSearchText(text);

    if (text.trim() === '') {
      setAllSearchResults([]);
      setCurrentPage(1);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setCurrentPage(1);

    try {
      console.log(`[Search] Iniciando búsqueda simplificada: "${text}"`);
      
      // Búsqueda directa en OpenFoodFacts sin cache ni filtros complejos
      const results = await searchProductsDirectly(text);
      
      console.log(`[Search] Resultados encontrados: ${results.length}`);
      setAllSearchResults(results);
      
    } catch (error) {
      console.error('[Search] Error en búsqueda:', error);
      setAllSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      updateDisplayedResults(newPage, allSearchResults);
    }
  };

  const handlePreviousPage = () => {
    handlePageChange(currentPage - 1);
  };

  const handleNextPage = () => {
    handlePageChange(currentPage + 1);
  };

  const getDefaultEmoji = (product: Product): string => {
    const name = product.product_name.toLowerCase();
    const ingredients = product.ingredients_text.toLowerCase();

    if (name.includes('coca') || name.includes('cola')) return '🥤';
    if (name.includes('peanut') || ingredients.includes('peanut')) return '🥜';
    if (name.includes('hafer') || ingredients.includes('hafer')) return '🌾';
    if (name.includes('milk') || name.includes('dairy')) return '🥛';
    if (name.includes('fruit') || name.includes('apple')) return '🍎';
    if (name.includes('vegetable') || name.includes('carrot')) return '🥦';

    return '🍽️';
  };

  const handleProductPress = async (product: Product) => {
    try {
      // Guardar en AsyncStorage para la pantalla de detalles
      await AsyncStorage.setItem('selectedProduct', JSON.stringify(product));
      
      // Guardar en historial
      await saveToHistory(product.code);
      
      // Navegar a detalles
      router.push('/screens/ProductInfoScreen');
    } catch (error) {
      console.error('Error storing product:', error);
    }
  };

  const renderProductItem = (product: Product) => (
    <TouchableOpacity
      key={product.code}
      style={searchStyles.productItem}
      onPress={() => handleProductPress(product)}
    >
      <View style={searchStyles.productImageContainer}>
        {product.image_url ? (
          <Image
            source={{ uri: product.image_url }}
            style={searchStyles.productImage}
            resizeMode="cover"
          />
        ) : (
          <Text style={searchStyles.productEmoji}>{getDefaultEmoji(product)}</Text>
        )}
      </View>
      <View style={searchStyles.productInfo}>
        <Text style={searchStyles.productName} numberOfLines={1} ellipsizeMode="tail">
          {product.product_name}
        </Text>
        <Text style={searchStyles.productBrand} numberOfLines={1} ellipsizeMode="tail">
          {product.brands}
        </Text>
      </View>
      <Text style={searchStyles.arrowIcon}>›</Text>
    </TouchableOpacity>
  );

  const renderPaginationControls = () => {
    if (!searchText || totalPages <= 1) return null;

    return (
      <View style={searchStyles.paginationContainer}>
        <View style={searchStyles.paginationInfo}>
          <Text style={searchStyles.paginationInfoText}>
            {totalResults} resultado{totalResults !== 1 ? 's' : ''} encontrado{totalResults !== 1 ? 's' : ''}
          </Text>
          <Text style={searchStyles.paginationInfoText}>
            Página {currentPage} de {totalPages}
          </Text>
        </View>

        <View style={searchStyles.paginationControls}>
          <TouchableOpacity
            style={[
              searchStyles.paginationButton,
              currentPage === 1 && searchStyles.paginationButtonDisabled
            ]}
            onPress={handlePreviousPage}
            disabled={currentPage === 1}
          >
            <Text style={[
              searchStyles.paginationButtonText,
              currentPage === 1 && searchStyles.paginationButtonTextDisabled
            ]}>
              ←
            </Text>
          </TouchableOpacity>

          <View style={searchStyles.paginationPageNumbers}>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNumber;
              if (totalPages <= 5) {
                pageNumber = i + 1;
              } else if (currentPage <= 3) {
                pageNumber = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNumber = totalPages - 4 + i;
              } else {
                pageNumber = currentPage - 2 + i;
              }

              return (
                <TouchableOpacity
                  key={pageNumber}
                  style={[
                    searchStyles.paginationPageButton,
                    currentPage === pageNumber && searchStyles.paginationPageButtonActive
                  ]}
                  onPress={() => handlePageChange(pageNumber)}
                >
                  <Text style={[
                    searchStyles.paginationPageButtonText,
                    currentPage === pageNumber && searchStyles.paginationPageButtonTextActive
                  ]}>
                    {pageNumber}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={[
              searchStyles.paginationButton,
              currentPage === totalPages && searchStyles.paginationButtonDisabled
            ]}
            onPress={handleNextPage}
            disabled={currentPage === totalPages}
          >
            <Text style={[
              searchStyles.paginationButtonText,
              currentPage === totalPages && searchStyles.paginationButtonTextDisabled
            ]}>
              →
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <>
      <View style={searchStyles.searchContainer}>
        <TextInput
          style={searchStyles.searchInput}
          placeholder="Search"
          value={searchText}
          onChangeText={handleSearch}
          onFocus={() => onFocusChange(true)}
          onBlur={() => {
            if (!searchText) {
              onFocusChange(false);
            }
          }}
        />
{!!searchText ? (
          <TouchableOpacity
            style={searchStyles.clearButton}
            onPress={() => {
              handleSearch('');
              onFocusChange(false);
            }}
          >
            <Text style={searchStyles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={searchStyles.resultsContainer}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={searchStyles.sectionTitle}>
            {searchText ? 'Search Results' : 'Recent'}
          </Text>
          {!searchText && historyItems.length > 0 && (
            <TouchableOpacity onPress={clearHistory} style={{ padding: 8 }}>
              <Text style={{ color: '#666', fontSize: 14 }}></Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Loading indicator para búsquedas */}
        {isSearching && (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <ActivityIndicator size="small" color="#000000" />
            <Text style={{ marginTop: 8, color: '#666', fontSize: 14 }}>
              Searching OpenFoodFacts...
            </Text>
          </View>
        )}

        {/* Resultados de búsqueda */}
        {searchText && !isSearching && displayedResults.length > 0 ? (
          <>
            {displayedResults.map(product => renderProductItem(product))}
            {renderPaginationControls()}
          </>
        ) : searchText && !isSearching && allSearchResults.length === 0 ? (
          <View style={searchStyles.noResultsContainer}>
            <Text style={searchStyles.noResultsText}>No products found for "{searchText}"</Text>
            <Text style={searchStyles.noResultsSubtext}>Try a different search term</Text>
          </View>
        ) : !searchText && loadingHistory ? (
          <View style={searchStyles.noResultsContainer}>
            <ActivityIndicator size="small" color="#000000" />
          </View>
        ) : !searchText && historyItems.length > 0 ? (
          <>
            {historyItems.map(product => renderProductItem(product))}
          </>
        ) : !searchText ? (
          <View style={searchStyles.noResultsContainer}>
            <Text style={searchStyles.noResultsText}>No recent products</Text>
            <Text style={searchStyles.noResultsSubtext}>Products you view will appear here</Text>
          </View>
        ) : null}
      </View>
    </>
  );
}