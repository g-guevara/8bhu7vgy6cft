// app/components/ProductInfo/ProductReactions.tsx
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { styles } from '../../styles/ProductInfoStyles';
import { ApiService } from '../../services/api';
import { useToast } from '../../utils/ToastContext';
import { Product } from '../../data/productData';

interface ProductReactionsProps {
  selectedReaction: 'Critic' | 'Sensitive' | 'Safe' | null;
  setSelectedReaction: (reaction: 'Critic' | 'Sensitive' | 'Safe' | null) => void;
  product: Product; // Add product prop to access ingredients
}

const ProductReactions: React.FC<ProductReactionsProps> = ({
  selectedReaction,
  setSelectedReaction,
  product
}) => {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [savedReaction, setSavedReaction] = React.useState<string | null>(null);
  
  // Helper function to get the appropriate selected style for each reaction type
  const getSelectedStyle = (reactionType: 'Critic' | 'Sensitive' | 'Safe') => {
    if (selectedReaction !== reactionType) return {};
    
    switch (reactionType) {
      case 'Critic':
        return styles.selectedCriticButton;
      case 'Sensitive':
        return styles.selectedSensitiveButton;
      case 'Safe':
        return styles.selectedSafeButton;
      default:
        return {};
    }
  };
  
  // Fetch any existing reaction on component mount
  useEffect(() => {
    const fetchExistingReaction = async () => {
      try {
        // Assuming there's an endpoint to get reactions
        const reactions = await ApiService.getProductReactions();
        const existingReaction = reactions.find(
          (r: any) => r.productID === product.code
        );
        
        if (existingReaction) {
          setSelectedReaction(existingReaction.reaction as 'Critic' | 'Sensitive' | 'Safe');
          setSavedReaction(existingReaction.reaction);
        }
      } catch (error) {
        console.error('Error fetching reactions:', error);
      }
    };
    
    if (product?.code) {
      fetchExistingReaction();
    }
  }, [product.code]);

  const saveReaction = async (reaction: 'Critic' | 'Sensitive' | 'Safe') => {
    if (!product.code) {
      showToast('Product information is missing', 'error');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // 1. Save product reaction
      const response = await ApiService.saveProductReaction(product.code, reaction);
      
      // 2. Parse and save ingredient reactions
      if (product.ingredients_text) {
        // Simple ingredient parsing - in a real app, you'd want more sophisticated parsing
        const ingredients = product.ingredients_text
          .split(',')
          .map(i => i.trim())
          .filter(i => i.length > 0);
          
        // Save each ingredient with the same reaction
        for (const ingredient of ingredients) {
          await ApiService.saveIngredientReaction(ingredient, reaction);
        }
      }
      
      setSavedReaction(reaction);
      showToast('Reaction saved successfully', 'success');
    } catch (error: any) {
      console.error('Error saving reaction:', error);
      showToast(error.message || 'Failed to save reaction', 'error');
      // Revert selection if saving fails
      setSelectedReaction(savedReaction as 'Critic' | 'Sensitive' | 'Safe' | null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReactionSelect = async (reaction: 'Critic' | 'Sensitive' | 'Safe') => {
    if (isLoading) return;
    
    // Update UI immediately for better UX
    setSelectedReaction(reaction);
    
    // Save to database
    await saveReaction(reaction);
  };

  const handleClearReaction = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      if (savedReaction && product.code) {
        // Delete the reaction if it exists
        await ApiService.deleteProductReaction(product.code);
        
        // You might also want to delete ingredient reactions
        if (product.ingredients_text) {
          const ingredients = product.ingredients_text
            .split(',')
            .map(i => i.trim())
            .filter(i => i.length > 0);
            
          for (const ingredient of ingredients) {
            await ApiService.deleteIngredientReaction(ingredient);
          }
        }
      }
      
      setSelectedReaction(null);
      setSavedReaction(null);
      showToast('Reaction cleared', 'success');
    } catch (error: any) {
      console.error('Error clearing reaction:', error);
      showToast(error.message || 'Failed to clear reaction', 'error');
      // Revert selection if clearing fails
      setSelectedReaction(savedReaction as 'Critic' | 'Sensitive' | 'Safe' | null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Select Reaction</Text>
        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClearReaction}
          disabled={isLoading || !selectedReaction}
        >
          <Text style={styles.clearButtonText}>Clear</Text>
        </TouchableOpacity>
      </View>
      
      {isLoading ? (
        // Show loading state and hide reaction chips
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={{ marginTop: 8 }}>Saving reaction...</Text>
        </View>
      ) : (
        // Show reaction chips when not loading
        <View style={styles.reactionsContainer}>
          <TouchableOpacity
            style={[
              styles.reactionButton,
              getSelectedStyle('Critic')
            ]}
            onPress={() => handleReactionSelect('Critic')}
          >
            <View style={styles.reactionIcon}>
              <View style={[styles.reactionDot, styles.criticDot]} />
            </View>
            <Text style={styles.reactionText}>Critic</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.reactionButton,
              getSelectedStyle('Sensitive')
            ]}
            onPress={() => handleReactionSelect('Sensitive')}
          >
            <View style={styles.reactionIcon}>
              <View style={[styles.reactionDot, styles.sensitiveDot]} />
            </View>
            <Text style={styles.reactionText}>Sensitive</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.reactionButton,
              getSelectedStyle('Safe')
            ]}
            onPress={() => handleReactionSelect('Safe')}
          >
            <View style={styles.reactionIcon}>
              <View style={[styles.reactionDot, styles.safeDot]} />
            </View>
            <Text style={styles.reactionText}>Safe</Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  );
};

export default ProductReactions;