// app/components/Home/SearchComponent.tsx - ACTUALIZADO CON API DE OPENFOODFACTS
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
// Temporal: usar los datos actuales hasta crear el nuevo archivo


import { sampleProducts, Product } from '../../data/productData';


import { searchStyles } from '../../styles/HomeComponentStyles';

// La interfaz Product ya está definida en productData.ts con exactamente 3 campos
// No necesitamos redefinirla aquí

interface SearchComponentProps {
  onFocusChange: (focused: boolean) => void;
}

interface HistoryItem {
  code: string;
  viewedAt: string;
}

// Extender Product para incluir campos adicionales para el cache de imágenes
interface ProductWithImage extends Product {
  image_url?: string; // Campo opcional para la imagen cacheada
  imageLoading?: boolean; // Campo opcional para el estado de carga
}

const HISTORY_KEY = 'product_history';
const IMAGE_CACHE_KEY = 'product_images_cache';
const MAX_HISTORY_ITEMS = 2;
const RESULTS_PER_PAGE = 15;

// OpenFoodFacts API URL
const OPENFOODFACTS_API = 'https://world.openfoodfacts.org/api/v0/product';

export default function SearchComponent({ onFocusChange }: SearchComponentProps) {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [allSearchResults, setAllSearchResults] = useState<ProductWithImage[]>([]);
  const [displayedResults, setDisplayedResults] = useState<ProductWithImage[]>([]);
  const [historyItems, setHistoryItems] = useState<ProductWithImage[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [imageCache, setImageCache] = useState<Record<string, string>>({});
  
  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    loadHistoryFromStorage();
    loadImageCache();
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

  // Cargar cache de imágenes
  const loadImageCache = async () => {
    try {
      const cacheJson = await AsyncStorage.getItem(IMAGE_CACHE_KEY);
      if (cacheJson) {
        setImageCache(JSON.parse(cacheJson));
      }
    } catch (error) {
      console.error('Error loading image cache:', error);
    }
  };

  // Guardar cache de imágenes
  const saveImageCache = async (cache: Record<string, string>) => {
    try {
      await AsyncStorage.setItem(IMAGE_CACHE_KEY, JSON.stringify(cache));
      setImageCache(cache);
    } catch (error) {
      console.error('Error saving image cache:', error);
    }
  };

  // Buscar imagen en OpenFoodFacts API
  const fetchProductImage = async (productCode: string): Promise<string | null> => {
    try {
      console.log(`Fetching image for product ${productCode} from OpenFoodFacts...`);
      
      const response = await fetch(`${OPENFOODFACTS_API}/${productCode}.json`);
      
      if (!response.ok) {
        console.log(`Product ${productCode} not found in OpenFoodFacts API`);
        return null;
      }
      
      const data = await response.json();
      
      if (data.status === 1 && data.product && data.product.image_url) {
        return data.product.image_url;
      }
      
      console.log(`No image found for product ${productCode} in OpenFoodFacts`);
      return null;
    } catch (error) {
      console.error(`Error fetching image for product ${productCode}:`, error);
      return null;
    }
  };

  // Descargar y cachear imagen localmente
  const downloadAndCacheImage = async (imageUrl: string, productCode: string): Promise<string | null> => {
    try {
      const filename = `product_${productCode}.jpg`;
      const fileUri = `${FileSystem.documentDirectory}${filename}`;
      
      // Verificar si ya existe el archivo
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (fileInfo.exists) {
        return fileUri;
      }
      
      // Descargar imagen
      console.log(`Downloading image for product ${productCode}...`);
      const downloadResult = await FileSystem.downloadAsync(imageUrl, fileUri);
      
      if (downloadResult.status === 200) {
        return downloadResult.uri;
      }
      
      console.log(`Failed to download image for product ${productCode}`);
      return null;
    } catch (error) {
      console.error(`Error downloading image for product ${productCode}:`, error);
      return null;
    }
  };

  // Obtener imagen del producto (cache o API)
  const getProductImage = async (product: ProductWithImage): Promise<string | null> => {
    const productCode = product.code;
    
    // Verificar cache primero
    if (imageCache[productCode]) {
      return imageCache[productCode];
    }
    
    // Buscar en OpenFoodFacts API
    const imageUrl = await fetchProductImage(productCode);
    if (!imageUrl) {
      return null;
    }
    
    // Descargar y cachear imagen
    const localUri = await downloadAndCacheImage(imageUrl, productCode);
    if (localUri) {
      const newCache = { ...imageCache, [productCode]: localUri };
      await saveImageCache(newCache);
      return localUri;
    }
    
    return null;
  };

  // Cargar imágenes para productos
  const loadImagesForProducts = async (products: ProductWithImage[]): Promise<void> => {
    const productsWithImages = [...products];
    
    for (let i = 0; i < productsWithImages.length; i++) {
      const product = productsWithImages[i];
      
      if (!product.image_url && !product.imageLoading) {
        // Marcar como cargando
        productsWithImages[i] = { ...product, imageLoading: true };
        setAllSearchResults([...productsWithImages]);
        
        // Obtener imagen
        const imageUri = await getProductImage(product);
        
        // Actualizar con la imagen obtenida
        productsWithImages[i] = { 
          ...product, 
          image_url: imageUri || undefined,
          imageLoading: false 
        };
        setAllSearchResults([...productsWithImages]);
      }
    }
  };

  const updateDisplayedResults = (page: number, results: ProductWithImage[]) => {
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
          .slice(0, MAX_HISTORY_ITEMS) as ProductWithImage[];

        setHistoryItems(historyProducts);
        
        // Cargar imágenes para el historial
        if (historyProducts.length > 0) {
          loadImagesForProducts(historyProducts);
        }
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
      // Buscar solo por product_name y brands (exactamente como solicitaste)
      const filtered = sampleProducts.filter(product =>
        product.product_name.toLowerCase().includes(text.toLowerCase()) ||
        product.brands.toLowerCase().includes(text.toLowerCase())
      ) as ProductWithImage[];

      setAllSearchResults(filtered);
      setCurrentPage(1);
      
      // Cargar imágenes para los resultados de búsqueda
      if (filtered.length > 0) {
        loadImagesForProducts(filtered);
      }
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

  const getDefaultEmoji = (product: ProductWithImage): string => {
    const name = product.product_name.toLowerCase();
    const brands = product.brands.toLowerCase();

    if (name.includes('fruit') || name.includes('pomme') || name.includes('banane')) return '🍎';
    if (name.includes('chocolate') || name.includes('chocolat')) return '🍫';
    if (name.includes('lait') || name.includes('milk') || name.includes('yaourt')) return '🥛';
    if (name.includes('fromage') || name.includes('cheese') || name.includes('mozzarella')) return '🧀';
    if (name.includes('pain') || name.includes('bread') || name.includes('céréales')) return '🍞';
    if (name.includes('poulet') || name.includes('chicken') || name.includes('jambon')) return '🍗';
    if (name.includes('poisson') || name.includes('fish') || name.includes('saumon')) return '🐟';
    if (name.includes('légume') || name.includes('vegetable') || name.includes('tomate') || name.includes('salade')) return '🥗';
    if (name.includes('boisson') || name.includes('drink') || name.includes('soda') || name.includes('jus')) return '🥤';
    if (name.includes('eau') || name.includes('water')) return '💧';

    return '🍽️';
  };

  const handleProductPress = async (product: ProductWithImage) => {
    try {
      await AsyncStorage.setItem('selectedProduct', JSON.stringify(product));
      await saveToHistory(product.code);
      router.push('/screens/ProductInfoScreen');
    } catch (error) {
      console.error('Error storing product:', error);
    }
  };

  const renderProductItem = (product: ProductWithImage) => (
    <TouchableOpacity
      key={product.code}
      style={searchStyles.productItem}
      onPress={() => handleProductPress(product)}
    >
      <View style={searchStyles.productImageContainer}>
        {product.imageLoading ? (
          <ActivityIndicator size="small" color="#666" />
        ) : product.image_url ? (
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
          {product.brands || 'Sin marca'}
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
          placeholder="Search products..."
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
              <Text style={{ color: '#666', fontSize: 14 }}>Clear</Text>
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