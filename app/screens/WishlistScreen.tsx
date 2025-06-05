// app/screens/WishlistScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from '../styles/WishlistStyles';
import { ApiService } from '../services/api';
import { useToast } from '../utils/ToastContext';
import { sampleProducts } from '../data/productData';

// Define interfaces for our data
interface WishlistItem {
  _id: string;
  userID: string;
  productID: string;
  addedAt: string;
}

interface Product {
  code: string;
  product_name: string;
  brands: string;
  image_url: string;
  ingredients_text: string;
}

export default function WishlistScreen() {
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const { showToast } = useToast();
  const router = useRouter();

  // Get default emoji for product without image
  const getDefaultEmoji = (product: Product): string => {
    const name = (product.product_name || '').toLowerCase();
    const ingredients = (product.ingredients_text || '').toLowerCase();
    return '';
  };

  // Fetch wishlist data
  useEffect(() => {
    const fetchWishlist = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get wishlist items from API
        const wishlistItems = await ApiService.getWishlist();
        
        // Map product IDs from wishlist
        const productIDs = wishlistItems.map((item: WishlistItem) => item.productID);
        
        // Find corresponding products from sample data
        // In a real app, you might fetch these from your backend
        const products = sampleProducts.filter(product => 
          productIDs.includes(product.code)
        );
        
        setWishlistProducts(products);
        setFilteredProducts(products);
      } catch (error: any) {
        console.error('Error fetching wishlist:', error);
        setError(error.message || 'Failed to load wishlist');
        showToast('Failed to load wishlist', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchWishlist();
  }, []);

  const handleSearch = (text: string) => {
    setSearchText(text);
    if (text) {
      const filtered = wishlistProducts.filter(product => 
        product.product_name.toLowerCase().includes(text.toLowerCase()) ||
        product.brands.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(wishlistProducts);
    }
  };

  const handleProductPress = async (product: Product) => {
    try {
      // Store the selected product in AsyncStorage
      await AsyncStorage.setItem('selectedProduct', JSON.stringify(product));
      
      // Navigate to product detail screen
      router.push('/screens/ProductInfoScreen');
    } catch (error) {
      console.error('Error navigating to product:', error);
      showToast('Error opening product details', 'error');
    }
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      key={item.code}
      style={styles.productItem}
      onPress={() => handleProductPress(item)}
    >
      <View style={styles.productImageContainer}>
        {item.image_url ? (
          <Image
            source={{ uri: item.image_url }}
            style={styles.productImage}
            resizeMode="cover"
          />
        ) : (
          <Text style={styles.productEmoji}>{getDefaultEmoji(item)}</Text>
        )}
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.product_name}</Text>
        <Text style={styles.productBrand}>{item.brands}</Text>
      </View>
      <Text style={styles.arrowIcon}>›</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerText}>Wishlist</Text>
      
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          value={searchText}
          onChangeText={handleSearch}
        />
        {searchText ? (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => handleSearch('')}
          >
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => setLoading(true)} // This will trigger the useEffect again
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : filteredProducts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {searchText ? 'No products found matching your search' : 'Your wishlist is empty'}
          </Text>
          {searchText ? (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Text style={styles.clearSearchText}>Clear search</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.emptySubtext}>
              Products you add to your wishlist will appear here
            </Text>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProduct}
          keyExtractor={item => item.code}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
}