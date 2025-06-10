// app/components/ProductInfo/ProductActions.tsx
import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, ActivityIndicator, Alert } from 'react-native';
import { styles } from '../../styles/ProductInfoStyles';
import { Product } from '../../data/productData';
import { ApiService } from '../../services/api';
import { useToast } from '../../utils/ToastContext';

interface ProductActionsProps {
  product: Product;
}

const ProductActions: React.FC<ProductActionsProps> = ({ product }) => {
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [activeTest, setActiveTest] = useState<any>(null);
  const [wishlistItemId, setWishlistItemId] = useState<string | null>(null);
  const { showToast } = useToast();

  // Check if product is already in wishlist and if there's an active test on component mount
  useEffect(() => {
    const checkStatus = async () => {
      if (!product.code) return;
      
      try {
        setLoading(true);
        
        // Check wishlist status
        const wishlist = await ApiService.getWishlist();
        const wishlistItem = wishlist.find((item: any) => item.productID === product.code);
        if (wishlistItem) {
          setIsInWishlist(true);
          setWishlistItemId(wishlistItem._id);
        } else {
          setIsInWishlist(false);
          setWishlistItemId(null);
        }
        
        // Check if there's an active test for this product
        const tests = await ApiService.getTests();
        const currentTest = tests.find((test: any) => 
          test.itemID === product.code && !test.completed
        );
        
        if (currentTest) {
          setActiveTest(currentTest);
        }
      } catch (error: any) {
        console.error('Error checking status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, [product.code]);

  const handleAddToWishlist = async () => {
    if (!product.code) {
      showToast('Product code is missing', 'error');
      return;
    }

    setLoading(true);
    try {
      await ApiService.addToWishlist(product.code);
      setIsInWishlist(true);
      showToast('Product added to wishlist', 'success');
      
      // Refresh wishlist status to get the new item ID
      const wishlist = await ApiService.getWishlist();
      const wishlistItem = wishlist.find((item: any) => item.productID === product.code);
      if (wishlistItem) {
        setWishlistItemId(wishlistItem._id);
      }
    } catch (error: any) {
      console.error('Error adding to wishlist:', error);
      showToast(error.message || 'Failed to add to wishlist', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async () => {
    if (!wishlistItemId) {
      showToast('Wishlist item ID is missing', 'error');
      return;
    }

    setLoading(true);
    try {
      await ApiService.removeFromWishlist(wishlistItemId);
      setIsInWishlist(false);
      setWishlistItemId(null);
      showToast('Product removed from wishlist', 'success');
    } catch (error: any) {
      console.error('Error removing from wishlist:', error);
      showToast(error.message || 'Failed to remove from wishlist', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = async () => {
    if (!product.code) {
      showToast('Product code is missing', 'error');
      return;
    }

    setTestLoading(true);
    try {
      // Check if there's any active test (not just for this product)
      const tests = await ApiService.getTests();
      const anyActiveTest = tests.find((test: any) => !test.completed);
      
      if (anyActiveTest && anyActiveTest.itemID !== product.code) {
        // Show enhanced alert about one test at a time limitation
        Alert.alert(
          "Cannot Start Test",
          "You already have an active test in progress. Only one test can be performed at a time to ensure accurate results.",
          [{ text: "OK", onPress: () => console.log("OK Pressed") }]
        );
        return;
      }
      
      const test = await ApiService.startTest(product.code);
      setActiveTest(test);
      
      // Show an alert with instructions
      Alert.alert(
        "Test Started",
        "Your 3-day test for this product has been started successfully. Go to the Test tab to view details.",
        [{ text: "OK", onPress: () => console.log("OK Pressed") }]
      );
      
    } catch (error: any) {
      console.error('Error starting test:', error);
      
      if (error.message?.includes('Test already in progress')) {
        showToast('There is already an active test for this product', 'warning');
      } else {
        showToast(error.message || 'Failed to start test', 'error');
      }
    } finally {
      setTestLoading(false);
    }
  };

  const formatRemainingTime = (test: any) => {
    if (!test) return '';
    
    const now = new Date();
    const finishDate = new Date(test.finishDate);
    const diffTime = finishDate.getTime() - now.getTime();
    
    if (diffTime <= 0) return 'Test completed';
    
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return `${diffDays} days, ${diffHours} hours remaining`;
  };

  return (
    <View style={styles.chipButtonsContainer}>
      {/* Wishlist Chip Button */}
      <TouchableOpacity 
        style={[
          styles.chipButton,
          styles.wishlistChip,
          loading && styles.chipButtonDisabled,
          isInWishlist && styles.wishlistChipActive
        ]} 
        onPress={isInWishlist ? handleRemoveFromWishlist : handleAddToWishlist}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={[
            styles.chipButtonText,
            isInWishlist && styles.wishlistChipActiveText
          ]}>
            {isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
          </Text>
        )}
      </TouchableOpacity>
      
      {/* Test Chip Button */}
      <TouchableOpacity 
        style={[
          styles.chipButton,
          styles.testChip,
          testLoading && styles.chipButtonDisabled,
          activeTest && styles.testChipActive
        ]}
        onPress={handleStartTest}
        disabled={testLoading || !!activeTest}
      >
        {testLoading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : activeTest ? (
          <Text style={styles.chipButtonText}>
            {formatRemainingTime(activeTest)}
          </Text>
        ) : (
          <Text style={styles.chipButtonText}>Start Test</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default ProductActions;