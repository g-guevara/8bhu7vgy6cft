// Updated SearchComponent.tsx - Historial Local con Paginación
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sampleProducts } from '../../data/productData';
import { searchStyles } from '../../styles/HomeComponentStyles';

interface SearchComponentProps {
  onFocusChange: (focused: boolean) => void;
}

interface HistoryItem {
  code: string;
  viewedAt: string; // ISO string de cuando se vio
}

const HISTORY_KEY = 'product_history';
const MAX_HISTORY_ITEMS = 2; // Máximo número de elementos en el historial
const RESULTS_PER_PAGE = 15; // Resultados por página

export default function SearchComponent({ onFocusChange }: SearchComponentProps) {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [allSearchResults, setAllSearchResults] = useState<typeof sampleProducts>([]);
  const [displayedResults, setDisplayedResults] = useState<typeof sampleProducts>([]);
  const [historyItems, setHistoryItems] = useState<typeof sampleProducts>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  
  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    loadHistoryFromStorage();
  }, []);

  // Efecto para actualizar la paginación cuando cambian los resultados
  useEffect(() => {
    if (allSearchResults.length > 0) {
      const total = Math.ceil(allSearchResults.length / RESULTS_PER_PAGE);
      setTotalPages(total);
      setTotalResults(allSearchResults.length);
      
      // Si estamos en una página que ya no existe, volver a la primera
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

  const updateDisplayedResults = (page: number, results: typeof sampleProducts) => {
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

        const historyProducts = sortedHistory
          .map(historyItem => sampleProducts.find(product => product.code === historyItem.code))
          .filter(product => product !== undefined)
          .slice(0, MAX_HISTORY_ITEMS);

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

  const handleSearch = (text: string) => {
    setSearchText(text);

    if (text.trim() === '') {
      setAllSearchResults([]);
      setCurrentPage(1);
    } else {
      const filtered = sampleProducts.filter(product =>
        product.product_name.toLowerCase().includes(text.toLowerCase()) ||
        product.brands.toLowerCase().includes(text.toLowerCase()) ||
        product.ingredients_text.toLowerCase().includes(text.toLowerCase())
      );

      setAllSearchResults(filtered);
      setCurrentPage(1); // Resetear a la primera página cuando se hace una nueva búsqueda
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

  const getDefaultEmoji = (product: typeof sampleProducts[0]): string => {
    const name = product.product_name.toLowerCase();
    const ingredients = product.ingredients_text.toLowerCase();

    if (name.includes('peanut') || ingredients.includes('peanut')) return '🥜';
    if (name.includes('hafer') || ingredients.includes('hafer')) return '🌾';
    if (name.includes('milk') || name.includes('dairy')) return '🥛';
    if (name.includes('fruit') || name.includes('apple')) return '🍎';
    if (name.includes('vegetable') || name.includes('carrot')) return '🥦';

    return '🍽️';
  };

  const handleProductPress = async (product: typeof sampleProducts[0]) => {
    try {
      await AsyncStorage.setItem('selectedProduct', JSON.stringify(product));
      await saveToHistory(product.code);
      router.push('/screens/ProductInfoScreen');
    } catch (error) {
      console.error('Error storing product:', error);
    }
  };

  const renderProductItem = (product: typeof sampleProducts[0]) => (
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
        {/* Información de resultados */}
        <View style={searchStyles.paginationInfo}>
          <Text style={searchStyles.paginationInfoText}>
            {totalResults} resultado{totalResults !== 1 ? 's' : ''} encontrado{totalResults !== 1 ? 's' : ''}
          </Text>
          <Text style={searchStyles.paginationInfoText}>
            Página {currentPage} de {totalPages}
          </Text>
        </View>

        {/* Controles de navegación */}
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
              ← Anterior
            </Text>
          </TouchableOpacity>

          <View style={searchStyles.paginationPageNumbers}>
            {/* Mostrar algunas páginas alrededor de la actual */}
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
        {searchText ? (
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

        {searchText && displayedResults.length > 0 ? (
          <>
            {displayedResults.map(product => renderProductItem(product))}
            {renderPaginationControls()}
          </>
        ) : searchText && allSearchResults.length === 0 ? (
          <View style={searchStyles.noResultsContainer}>
            <Text style={searchStyles.noResultsText}>No products found for "{searchText}"</Text>
            <Text style={searchStyles.noResultsSubtext}>Try a different search term</Text>
          </View>
        ) : loadingHistory ? (
          <View style={searchStyles.noResultsContainer}>
            <ActivityIndicator size="small" color="#000000" />
          </View>
        ) : historyItems.length > 0 ? (
          <>
            {historyItems.map(product => renderProductItem(product))}
          </>
        ) : (
          <View style={searchStyles.noResultsContainer}>
            <Text style={searchStyles.noResultsText}>No recent products</Text>
            <Text style={searchStyles.noResultsSubtext}>Products you view will appear here</Text>
          </View>
        )}
      </View>
    </>
  );
}