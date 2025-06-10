// app/screens/ProductInfoScreen.tsx
// Version: 2.0.0

import React, { useState, useEffect, useRef } from 'react';
import { 
  SafeAreaView, 
  ScrollView, 
  View, 
  ActivityIndicator,
  TouchableOpacity,
  Text,
  BackHandler
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '../data/productData';
import { styles } from '../styles/ProductInfoStyles';
import { ApiService } from '../services/api';
import { useToast } from '../utils/ToastContext';

// Import components
import ProductHeader from '../components/ProductInfo/ProductHeader';
import ProductDetails from '../components/ProductInfo/ProductDetails';
import ProductReactions from '../components/ProductInfo/ProductReactions';
import ProductNotes from '../components/ProductInfo/ProductNotes';
import ProductActions from '../components/ProductInfo/ProductActions';

// Constants
const AUTO_SAVE_DELAY = 3000; // 3 seconds
const NOTES_CHARACTER_LIMIT = 500; // Maximum characters for notes

export default function ProductInfoScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedReaction, setSelectedReaction] = useState<'Critic' | 'Sensitive' | 'Safe' | null>(null);
  const [notes, setNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [existingNote, setExistingNote] = useState<any>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  
  // References for auto-save functionality
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedNotesRef = useRef<string>('');
  const notesBeforeEditRef = useRef<string>('');
  
  // Load the product from AsyncStorage when the component mounts
  useEffect(() => {
    const loadProduct = async () => {
      try {
        const productJson = await AsyncStorage.getItem('selectedProduct');
        if (productJson) {
          const loadedProduct = JSON.parse(productJson);
          setProduct(loadedProduct);
          
          // After loading product, check if there are existing notes
          fetchExistingNotes(loadedProduct.code);
        }
      } catch (error) {
        console.error('Error loading product from AsyncStorage:', error);
        showToast('Failed to load product details', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
    
    // Set up back handler to save notes when user attempts to go back
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        saveNotesIfChanged();
        return false; // Don't prevent default back action
      }
    );
    
    return () => {
      // Clear auto-save timer when component unmounts
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      backHandler.remove();
      
      // Save notes if needed before unmounting
      saveNotesIfChanged();
    };
  }, []);
  
  // Effect for handling auto-save
  useEffect(() => {
    // Skip initial render
    if (loading) return;
    
    // Don't auto-save if notes haven't changed
    if (notes === lastSavedNotesRef.current) return;
    
    // Clear previous timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    
    // Set new timer for auto-save
    autoSaveTimerRef.current = setTimeout(() => {
      if (notes.trim() && notes !== lastSavedNotesRef.current) {
        saveNotes(notes, true);
      }
    }, AUTO_SAVE_DELAY);
    
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [notes, loading]);
  
  // Save notes when screen loses focus
  useFocusEffect(
    React.useCallback(() => {
      return () => {
        saveNotesIfChanged();
      };
    }, [notes])
  );
  
  // Check if notes need to be saved before leaving
  const saveNotesIfChanged = () => {
    if (notes.trim() && notes !== lastSavedNotesRef.current) {
      saveNotes(notes, true);
    }
  };
  
  // Fetch existing notes for this product
  const fetchExistingNotes = async (productID: string) => {
    try {
      const allNotes = await ApiService.getProductNotes();
      const productNote = allNotes.find((note: any) => note.productID === productID);
      
      if (productNote) {
        setExistingNote(productNote);
        setNotes(productNote.note);
        lastSavedNotesRef.current = productNote.note;
        notesBeforeEditRef.current = productNote.note;
      }
    } catch (error) {
      console.error('Error fetching product notes:', error);
      // We don't need to show an error toast here as it's not critical
    }
  };
  
  // Handle saving notes with optimistic updates
  const saveNotes = async (noteContent: string, isAutoSave = false) => {
    if (!product || !noteContent.trim()) {
      return;
    }
    
    // Prevent duplicate saves
    if (noteContent === lastSavedNotesRef.current) {
      return;
    }
    
    // Set optimistic UI updates
    if (!isAutoSave) {
      setIsSavingNotes(true);
    } else {
      setAutoSaveStatus('saving');
    }
    
    // Store the note content before making API call
    const noteToSave = noteContent.trim();
    
    // Optimistically update the UI
    notesBeforeEditRef.current = notes;
    
    try {
      let response;
      
      if (existingNote) {
        // Update existing note
        response = await ApiService.updateProductNote(existingNote._id, noteToSave);
      } else {
        // Create new note
        response = await ApiService.addProductNote(product.code, noteToSave);
      }
      
      // Update reference values on success
      lastSavedNotesRef.current = noteToSave;
      setExistingNote(response);
      
      if (!isAutoSave) {
        showToast('Notes saved successfully', 'success');
      } else {
        setAutoSaveStatus('saved');
        
        // Reset the status after a delay
        setTimeout(() => {
          setAutoSaveStatus('idle');
        }, 2000);
      }
    } catch (error: any) {
      console.error('Error saving notes:', error);
      
      // Revert to previous state on error
      setNotes(notesBeforeEditRef.current);
      
      if (!isAutoSave) {
        showToast(error.message || 'Failed to save notes', 'error');
      }
    } finally {
      if (!isAutoSave) {
        setIsSavingNotes(false);
      } else {
        setAutoSaveStatus('idle');
      }
    }
  };
  
  // Handle manual save button press
  const handleSaveNotes = () => {
    saveNotes(notes);
  };

  const handleBack = () => {
    // Save notes if needed before navigating back
    saveNotesIfChanged();
    
    // Clean up AsyncStorage and go back
    AsyncStorage.removeItem('selectedProduct').then(() => {
      router.back();
    });
  };

  // Show loading indicator while fetching the product
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#000" />
            <Text style={styles.backText}>Home</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Information</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaView>
    );
  }

  // If no product found, show an error
  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#000" />
            <Text style={styles.backText}>Home</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Information</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Product not found</Text>
          <TouchableOpacity onPress={handleBack} style={styles.errorButton}>
            <Text style={styles.errorButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#000" />
          <Text style={styles.backText}>Home</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Information</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.productInfoContainer}>
          {/* Component 1: Product Header (Image and Name) */}
          <ProductHeader product={product} />
          
          <View style={styles.divider} />
          
          {/* Component 2: Product Details (Brand and Ingredients) */}
          <ProductDetails product={product} />
          
          <View style={styles.divider} />
                    {/* Component 5: Product Actions (Wishlist and Test buttons) */}
          <ProductActions product={product} />
                    <View style={styles.divider} />
          {/* Component 3: Product Reactions */}
          <ProductReactions 
            selectedReaction={selectedReaction} 
            setSelectedReaction={setSelectedReaction} 
            product={product} 
          />
          
          <View style={styles.divider} />
          
          {/* Component 4: Product Notes with character limit */}
          <ProductNotes 
            notes={notes} 
            setNotes={setNotes}
            onSaveNotes={handleSaveNotes}
            isSaving={isSavingNotes}
            autoSaveStatus={autoSaveStatus}
            characterLimit={NOTES_CHARACTER_LIMIT}
          />
          
          {/* Component 5: Product Actions (Wishlist and Test buttons) */}
          {/* <ProductActions product={product} /> */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}