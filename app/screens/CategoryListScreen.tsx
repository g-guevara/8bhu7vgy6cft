// app/screens/CategoryListScreen.tsx
import React, { useEffect, useState } from 'react';
import { 
  SafeAreaView, 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  FlatList,
  ActivityIndicator
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sampleProducts } from '../data/productData';
import { styles } from '../styles/CategoryListStyles';

// Define the Product interface if not imported
interface Product {
  code: string;
  product_name: string;
  brands: string;
  ingredients_text: string;
  image_url: string;
}

export default function CategoryListScreen() {
  const router = useRouter();
  const { category, brand } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const loadProducts = () => {
      setLoading(true);
      try {
        // Filter products that start with "SSS" and match the brand
        const filteredProducts = sampleProducts.filter(product => 
          product.code.startsWith('SSS') && 
          product.brands.toLowerCase() === (brand?.toString().toLowerCase() || '')
        );
        
        setProducts(filteredProducts);
      } catch (error) {
        console.error('Error filtering products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [brand]);

  const handleProductPress = async (product: Product) => {
    try {
      // Store the selected product in AsyncStorage
      await AsyncStorage.setItem('selectedProduct', JSON.stringify(product));
      
      // Navigate to product detail screen
      router.push('/screens/ProductInfoScreen');
    } catch (error) {
      console.error('Error storing product in AsyncStorage:', error);
    }
  };

  const getDefaultEmoji = (product: Product): string => {
    const name = product.product_name.toLowerCase();
    const ingredients = product.ingredients_text.toLowerCase();

    if (name.includes('Null') || ingredients.includes('hafer')) return '';

    return '🍽️';
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#007AFF" />
            <Text style={styles.backText}>Home</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{category} Products</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#007AFF" />
          <Text style={styles.backText}>Home</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{category} Products</Text>
      </View>

      {products.length > 0 ? (
        <FlatList
          data={products}
          keyExtractor={(item) => item.code}
          renderItem={({ item }) => (
            <TouchableOpacity
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
          )}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No organic {category?.toString()} products found</Text>
        </View>
      )}
    </SafeAreaView>
  );
}