// app/components/ProductInfo/ProductDetails.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Product } from '../../data/productData';
import { styles } from '../../styles/ProductInfoStyles';
import { ApiService } from '../../services/api';

interface ProductDetailsProps {
  product: Product;
}

interface IngredientReaction {
  _id: string;
  userID: string;
  ingredientName: string;
  reaction: 'Critic' | 'Sensitive' | 'Safe';
  createdAt: string;
  updatedAt: string;
}

interface ProcessedIngredient {
  name: string;
  reaction: 'Critic' | 'Sensitive' | 'Safe' | null;
  lastUpdated?: string;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ product }) => {
  const [ingredientReactions, setIngredientReactions] = useState<IngredientReaction[]>([]);
  const [processedIngredients, setProcessedIngredients] = useState<ProcessedIngredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLegend, setShowLegend] = useState(false);

  useEffect(() => {
    fetchIngredientReactions();
  }, []);

  useEffect(() => {
    if (ingredientReactions.length >= 0 && product.ingredients_text) {
      processIngredients();
    }
  }, [ingredientReactions, product.ingredients_text]);

  const fetchIngredientReactions = async () => {
    try {
      const reactions = await ApiService.getIngredientReactions();
      setIngredientReactions(reactions);
    } catch (error) {
      console.error('Error fetching ingredient reactions:', error);
      setIngredientReactions([]);
    } finally {
      setLoading(false);
    }
  };

  const processIngredients = () => {
    // Parse ingredients from the product
    const rawIngredients = product.ingredients_text
      .split(',')
      .map(ingredient => ingredient.trim().toLowerCase())
      .filter(ingredient => ingredient.length > 0);

    const processed: ProcessedIngredient[] = rawIngredients.map(ingredientName => {
      // Find all reactions for this ingredient (case-insensitive)
      const relatedReactions = ingredientReactions.filter(reaction => 
        reaction.ingredientName.toLowerCase() === ingredientName
      );

      if (relatedReactions.length === 0) {
        return {
          name: ingredientName,
          reaction: null
        };
      }

      // Sort by updatedAt (most recent first)
      relatedReactions.sort((a, b) => 
        new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
      );

      // Take the most recent reaction
      const mostRecentReaction = relatedReactions[0];

      return {
        name: ingredientName,
        reaction: mostRecentReaction.reaction,
        lastUpdated: mostRecentReaction.updatedAt || mostRecentReaction.createdAt
      };
    });

    setProcessedIngredients(processed);
  };

  const getIngredientTextStyle = (reaction: 'Critic' | 'Sensitive' | 'Safe' | null) => {
    switch (reaction) {
      case 'Critic':
        return styles.ingredientTextCritic;
      case 'Sensitive':
        return styles.ingredientTextSensitive;
      case 'Safe':
        return styles.ingredientTextSafe;
      default:
        return styles.ingredientTextNeutral;
    }
  };

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  return (
    <>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Brand:</Text>
        <Text style={styles.infoValue}>{product.brands}</Text>
      </View>

      <View style={styles.divider} />

      <View>
        <View style={styles.ingredientsHeaderRow}>
          <Text style={styles.infoLabel}>Ingredients:</Text>
          <TouchableOpacity 
            style={styles.infoButton}
            onPress={() => setShowLegend(!showLegend)}
          >
            <Text style={styles.infoButtonText}>ⓘ</Text>
          </TouchableOpacity>
        </View>
        
        {loading ? (
          <View style={styles.ingredientsLoadingContainer}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.loadingText}>Analyzing ingredients...</Text>
          </View>
        ) : (
          <Text style={[styles.infoValue, styles.ingredientsText]}>
            {processedIngredients.map((ingredient, index) => (
              <React.Fragment key={ingredient.name}>
                <Text style={getIngredientTextStyle(ingredient.reaction)}>
                  {capitalizeFirstLetter(ingredient.name)}
                </Text>
                {index < processedIngredients.length - 1 && ', '}
              </React.Fragment>
            ))}
          </Text>
        )}

        {/* Legend - only show when button is pressed */}
        {showLegend && (
          <View style={styles.legendContainer}>
            <Text style={styles.legendTitle}>Ingredient colors:</Text>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, styles.legendColorCritic]} />
                <Text style={styles.legendText}>Critic reaction</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, styles.legendColorSensitive]} />
                <Text style={styles.legendText}>Sensitive reaction</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, styles.legendColorSafe]} />
                <Text style={styles.legendText}>Safe reaction</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, styles.legendColorNeutral]} />
                <Text style={styles.legendText}>Not tested</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </>
  );
};

export default ProductDetails;